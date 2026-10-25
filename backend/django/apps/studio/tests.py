import shutil
from pathlib import Path

from django.conf import settings
from django.contrib.auth import get_user_model
from django.test import TestCase, override_settings

from .models import BrandKit, StudioProject
from .rendering import render_project_video


class StudioRenderTests(TestCase):
    def setUp(self):
        self.media_root = Path(settings.MEDIA_ROOT) / 'test_studio_media'
        shutil.rmtree(self.media_root, ignore_errors=True)
        self.media_root.mkdir(parents=True, exist_ok=True)
        self.settings = override_settings(MEDIA_ROOT=self.media_root)
        self.settings.enable()

    def tearDown(self):
        self.settings.disable()
        shutil.rmtree(self.media_root, ignore_errors=True)

    def test_storyboard_renders_a_downloadable_mp4(self):
        user = get_user_model().objects.create_user(username='render', email='render@example.com', password='safe-test-password')
        kit = BrandKit.objects.create(user=user, name='Render Co')
        project = StudioProject.objects.create(
            user=user,
            brand_kit=kit,
            title='A launch',
            summary='A short launch video.',
            storyboard=[{'type': 'hook', 'duration': 2, 'text': 'A short launch video.'}],
        )

        render_project_video(project)
        project.refresh_from_db()

        self.assertEqual(project.status, StudioProject.Status.READY)
        self.assertTrue(project.video_file.name.endswith('.mp4'))
        self.assertGreater(project.video_file.size, 0)
