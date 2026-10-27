from pathlib import Path
import math

import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFont


ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / 'public' / 'demo-assets' / 'invoiceflow'
OUT = ASSETS / 'invoiceflow-launch-demo.mp4'
WIDTH, HEIGHT, FPS = 1280, 720, 30
INK, CREAM, CORAL, MINT, LIME = '#102126', '#F7F3EB', '#FF6B4A', '#C9E9DD', '#A7D477'


def font(size, bold=True):
    name = 'arialbd.ttf' if bold else 'arial.ttf'
    return ImageFont.truetype(f'C:/Windows/Fonts/{name}', size)


def ease(value):
    value = max(0, min(1, value))
    return 1 - (1 - value) ** 3


def color(value):
    value = value.lstrip('#')
    return tuple(int(value[index:index + 2], 16) for index in (0, 2, 4))


def contain(image, bounds):
    width, height = bounds
    ratio = min(width / image.width, height / image.height)
    resized = image.resize((int(image.width * ratio), int(image.height * ratio)), Image.Resampling.LANCZOS)
    return resized


def draw_wordmark(draw, xy, inverse=False):
    x, y = xy
    draw.rounded_rectangle((x, y, x + 13, y + 28), radius=5, fill=color(MINT))
    draw.rounded_rectangle((x + 16, y + 9, x + 29, y + 28), radius=5, fill=color(LIME))
    draw.text((x + 44, y - 4), 'InvoiceFlow', font=font(26), fill='white' if inverse else color(INK))


def browser(canvas, source, frame, section_start, scale=.76):
    enter = ease((frame - section_start) / 20)
    card_w, card_h = 925, 585
    card_x = (WIDTH - card_w) // 2
    card_y = 82 + int((1 - enter) * 62)
    shadow = Image.new('RGBA', canvas.size, (0, 0, 0, 0))
    shadow_draw = ImageDraw.Draw(shadow)
    shadow_draw.rounded_rectangle((card_x + 10, card_y + 18, card_x + card_w + 10, card_y + card_h + 18), radius=20, fill=(16, 33, 38, 55))
    canvas.alpha_composite(shadow)
    draw = ImageDraw.Draw(canvas)
    draw.rounded_rectangle((card_x, card_y, card_x + card_w, card_y + card_h), radius=20, fill='white')
    draw.rounded_rectangle((card_x, card_y, card_x + card_w, card_y + 36), radius=20, fill=(243, 240, 233))
    draw.rectangle((card_x, card_y + 20, card_x + card_w, card_y + 36), fill=(243, 240, 233))
    for index, dot in enumerate((CORAL, '#D8D4CB', '#D8D4CB')):
        draw.ellipse((card_x + 16 + index * 16, card_y + 13, card_x + 26 + index * 16, card_y + 23), fill=color(dot))
    content = contain(source, (card_w, card_h - 36))
    canvas.alpha_composite(content.convert('RGBA'), (card_x + (card_w - content.width) // 2, card_y + 36 + (card_h - 36 - content.height) // 2))


def caption(canvas, eyebrow, title, body, progress, x=72, y=490, wide=530):
    draw = ImageDraw.Draw(canvas)
    shift = int((1 - ease(progress)) * -30)
    alpha = int(ease(progress) * 255)
    layer = Image.new('RGBA', canvas.size, (0, 0, 0, 0))
    words = ImageDraw.Draw(layer)
    words.text((x + shift, y), eyebrow.upper(), font=font(15), fill=(*color(CORAL), alpha))
    title_font = font(47)
    lines, current = [], ''
    for word in title.split():
        probe = f'{current} {word}'.strip()
        if current and words.textbbox((0, 0), probe, font=title_font)[2] > wide:
            lines.append(current); current = word
        else:
            current = probe
    lines.append(current)
    for index, line in enumerate(lines):
        words.text((x + shift, y + 28 + index * 47), line, font=title_font, fill=(*color(INK), alpha))
    words.text((x + shift, y + 34 + len(lines) * 47), body, font=font(20, False), fill=(64, 85, 86, alpha))
    canvas.alpha_composite(layer)


def scene(frame, index, source):
    base = Image.new('RGBA', (WIDTH, HEIGHT), color(CREAM) + (255,))
    draw = ImageDraw.Draw(base)
    draw.ellipse((-160, -250, 430, 340), fill=color(MINT) + (100,))
    draw.ellipse((950, 420, 1450, 930), fill=color(CORAL) + (45,))
    draw_wordmark(draw, (54, 43))
    draw.text((950, 48), 'SMART INVOICE REMINDERS', font=font(13), fill=(99, 113, 116))
    starts = (0, 120, 240)
    browser(base, source, frame, starts[index])
    if index == 0:
        p = ease((frame - 32) / 20)
        draw.rounded_rectangle((997, 170, 1178, 248), radius=16, fill=color(CORAL) + (int(p * 255),))
        draw.text((1019, 184), 'PAST DUE', font=font(13), fill='white')
        draw.text((1019, 204), '$18,420', font=font(26), fill='white')
        caption(base, 'The problem', 'Stop chasing invoices.', 'Your cash flow should not depend on another follow-up email.', (frame - 10) / 24)
    elif index == 1:
        p = ease((frame - 158) / 20)
        panel = Image.new('RGBA', base.size, (0, 0, 0, 0)); panel_draw = ImageDraw.Draw(panel)
        panel_draw.rounded_rectangle((76, 164, 363, 218), radius=28, fill=color(INK) + (int(p * 255),))
        panel_draw.ellipse((98, 183, 112, 197), fill=color(LIME) + (int(p * 255),))
        panel_draw.text((128, 176), 'Automatic reminders: on', font=font(16), fill=(255, 255, 255, int(p * 255)))
        base.alpha_composite(panel)
        caption(base, 'The product moment', 'The right nudge, on time.', 'Set your schedule once. InvoiceFlow follows up before payments slip.', (frame - 130) / 24)
    else:
        p = ease((frame - 253) / 30)
        for number in range(18):
            angle = number * math.pi * 2 / 18
            cx, cy = 755 + math.cos(angle) * p * 260, 330 + math.sin(angle) * p * 190
            draw.rounded_rectangle((cx - 4, cy - 12, cx + 4, cy + 12), radius=3, fill=color(LIME if number % 3 else CORAL))
        caption(base, 'The payoff', 'Payments keep moving.', 'Less admin. Fewer awkward chases. More time back for your team.', (frame - 250) / 24)
    return base


def closing(frame):
    base = Image.new('RGBA', (WIDTH, HEIGHT), color(INK) + (255,))
    draw = ImageDraw.Draw(base)
    draw.ellipse((350, -150, 950, 440), fill=color(LIME) + (85,))
    draw_wordmark(draw, (545, 148), inverse=True)
    p = ease((frame - 342) / 22)
    layer = Image.new('RGBA', base.size, (0, 0, 0, 0)); text = ImageDraw.Draw(layer)
    text.multiline_text((260, 240 + int((1 - p) * 38)), 'Let invoices\ntake care of themselves.', font=font(65), fill=(255, 255, 255, int(p * 255)), align='center', anchor='ma', spacing=-2)
    text.rounded_rectangle((487, 466, 793, 526), radius=10, fill=color(CORAL) + (int(p * 255),))
    text.text((640, 482), 'Try automatic reminders', font=font(18), fill=(255, 255, 255, int(p * 255)), anchor='ma')
    base.alpha_composite(layer)
    return base


def main():
    images = [Image.open(ASSETS / name).convert('RGB') for name in ('invoice-list.png', 'automatic-reminders.png', 'payment-received.png')]
    writer = cv2.VideoWriter(str(OUT), cv2.VideoWriter_fourcc(*'mp4v'), FPS, (WIDTH, HEIGHT))
    if not writer.isOpened():
        raise RuntimeError('MP4 encoder is unavailable.')
    for frame in range(390):
        image = closing(frame) if frame >= 330 else scene(frame, min(frame // 120, 2), images[min(frame // 120, 2)])
        draw = ImageDraw.Draw(image)
        draw.rectangle((0, HEIGHT - 4, int(WIDTH * frame / 390), HEIGHT), fill=color(CORAL))
        writer.write(cv2.cvtColor(np.asarray(image.convert('RGB')), cv2.COLOR_RGB2BGR))
    writer.release()
    print(OUT)


if __name__ == '__main__':
    main()
