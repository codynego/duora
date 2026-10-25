import os
import tempfile

import cv2
import numpy as np
from django.core.files import File
from django.utils.text import slugify
from PIL import Image, ImageColor, ImageDraw, ImageFont


FPS = 24


def _dimensions(aspect_ratio):
    return {'9:16': (720, 1280), '1:1': (900, 900)}.get(aspect_ratio, (1280, 720))


def _color(value, fallback):
    try:
        return ImageColor.getrgb(value)
    except (TypeError, ValueError):
        return fallback


def _font(size):
    try:
        return ImageFont.truetype('DejaVuSans-Bold.ttf', size)
    except OSError:
        return ImageFont.load_default()


def _wrapped_lines(draw, copy, font, max_width):
    words, lines, line = copy.split(), [], ''
    for word in words:
        candidate = f'{line} {word}'.strip()
        if line and draw.textbbox((0, 0), candidate, font=font)[2] > max_width:
            lines.append(line)
            line = word
        else:
            line = candidate
    return lines + ([line] if line else [])


def _asset_image(project, scene, width, height):
    asset_ids = {str(item) for item in scene.get('asset_ids', [])}
    assets = project.assets.filter(kind='screenshot')
    asset = next((item for item in assets if str(item.id) in asset_ids), None) or assets.first()
    if not asset:
        return None
    try:
        with Image.open(asset.file.path) as source:
            image = source.convert('RGB')
            image.thumbnail((width, height), Image.Resampling.LANCZOS)
            return image.copy()
    except (FileNotFoundError, OSError):
        return None


def render_project_video(project):
    """Create a compact MP4 from a project's first-cut storyboard."""
    width, height = _dimensions(project.aspect_ratio)
    storyboard = project.storyboard or [{'type': 'hook', 'duration': 4, 'text': project.title}]
    primary = _color(getattr(project.brand_kit, 'primary_color', None), (16, 33, 38))
    accent = _color(getattr(project.brand_kit, 'accent_color', None), (255, 107, 74))
    title_font = _font(max(42, width // 15))
    small_font = _font(max(20, width // 42))

    descriptor, output_path = tempfile.mkstemp(suffix='.mp4')
    os.close(descriptor)
    writer = cv2.VideoWriter(output_path, cv2.VideoWriter_fourcc(*'mp4v'), FPS, (width, height))
    if not writer.isOpened():
        raise RuntimeError('The MP4 encoder is not available on this server.')

    try:
        for scene_index, scene in enumerate(storyboard):
            duration = max(2, min(int(scene.get('duration', 4)), 12))
            copy = str(scene.get('text') or project.title)
            screenshot = _asset_image(project, scene, int(width * .44), int(height * .55))
            for frame_index in range(duration * FPS):
                progress = frame_index / max(duration * FPS - 1, 1)
                image = Image.new('RGB', (width, height), primary)
                draw = ImageDraw.Draw(image)
                offset = int((progress - .5) * width * .12)
                draw.rectangle((offset, 0, offset + int(width * .2), height), fill=accent)
                draw.rectangle((0, int(height * .12), width, int(height * .13)), fill=(255, 255, 255))
                draw.text((int(width * .08), int(height * .18)), f'DORAH / {scene_index + 1:02d}', font=small_font, fill=(255, 255, 255))

                text_x, text_y = int(width * .08), int(height * .35)
                line_height = int(title_font.size * 1.05)
                for index, line in enumerate(_wrapped_lines(draw, copy, title_font, int(width * (.46 if screenshot else .8)))):
                    draw.text((text_x, text_y + index * line_height), line, font=title_font, fill=(255, 255, 255))

                if screenshot:
                    panel_x = int(width * .52)
                    panel_y = int(height * .23)
                    panel_w = int(width * .4)
                    panel_h = int(height * .57)
                    draw.rectangle((panel_x - 12, panel_y - 12, panel_x + panel_w + 12, panel_y + panel_h + 12), fill=(255, 255, 255))
                    image.paste(screenshot, (panel_x + (panel_w - screenshot.width) // 2, panel_y + (panel_h - screenshot.height) // 2))

                frame = cv2.cvtColor(np.asarray(image), cv2.COLOR_RGB2BGR)
                writer.write(frame)
    finally:
        writer.release()

    filename = f'{slugify(project.title)[:48] or "launch"}-{project.id}.mp4'
    try:
        if project.video_file:
            project.video_file.delete(save=False)
        with open(output_path, 'rb') as video:
            project.video_file.save(filename, File(video), save=False)
        project.status = project.Status.READY
        project.save(update_fields=('video_file', 'status', 'updated_at'))
    finally:
        os.unlink(output_path)
    return project
