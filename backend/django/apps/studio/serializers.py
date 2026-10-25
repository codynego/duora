from rest_framework import serializers

from .models import BrandKit, RenderJob, StudioAsset, StudioProject


class BrandKitSerializer(serializers.ModelSerializer):
    logo_url = serializers.SerializerMethodField()
    class Meta:
        model = BrandKit
        fields = ('id', 'name', 'website', 'primary_color', 'accent_color', 'default_cta', 'logo_url', 'updated_at')
    def get_logo_url(self, obj):
        request = self.context.get('request')
        return request.build_absolute_uri(obj.logo.url) if obj.logo and request else None


class AssetSerializer(serializers.ModelSerializer):
    url = serializers.SerializerMethodField()
    class Meta:
        model = StudioAsset
        fields = ('id', 'project', 'kind', 'url', 'created_at')
    def get_url(self, obj):
        request = self.context.get('request')
        return request.build_absolute_uri(obj.file.url) if request else obj.file.url


class ProjectSerializer(serializers.ModelSerializer):
    asset_count = serializers.IntegerField(source='assets.count', read_only=True)
    video_url = serializers.SerializerMethodField()
    class Meta:
        model = StudioProject
        fields = ('id', 'title', 'summary', 'status', 'aspect_ratio', 'storyboard', 'asset_count', 'video_file', 'video_url', 'created_at', 'updated_at')
        read_only_fields = ('id', 'status', 'storyboard', 'video_file', 'created_at', 'updated_at')
    def get_video_url(self, obj):
        request = self.context.get('request')
        return request.build_absolute_uri(obj.video_file.url) if obj.video_file and request else None


class RenderJobSerializer(serializers.ModelSerializer):
    class Meta:
        model = RenderJob
        fields = ('id', 'status', 'error_message', 'created_at', 'updated_at')
