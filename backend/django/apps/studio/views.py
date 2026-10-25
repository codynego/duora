from rest_framework import status
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from django.http import FileResponse
from django.utils.text import slugify

from .models import BrandKit, RenderJob, StudioAsset, StudioProject
from .rendering import render_project_video
from .serializers import AssetSerializer, BrandKitSerializer, ProjectSerializer, RenderJobSerializer
from .services import make_storyboard


class BrandKitView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        kit, _ = BrandKit.objects.get_or_create(user=request.user)
        return Response({'data': BrandKitSerializer(kit, context={'request': request}).data})
    def put(self, request):
        kit, _ = BrandKit.objects.get_or_create(user=request.user)
        serializer = BrandKitSerializer(kit, data=request.data, partial=True, context={'request': request})
        serializer.is_valid(raise_exception=True); serializer.save()
        return Response({'data': serializer.data})


class ProjectListView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        return Response({'data': ProjectSerializer(StudioProject.objects.filter(user=request.user), many=True, context={'request': request}).data})
    def post(self, request):
        kit, _ = BrandKit.objects.get_or_create(user=request.user)
        serializer = ProjectSerializer(data=request.data); serializer.is_valid(raise_exception=True)
        project = serializer.save(user=request.user, brand_kit=kit)
        return Response({'data': ProjectSerializer(project, context={'request': request}).data}, status=status.HTTP_201_CREATED)


class ProjectDetailView(APIView):
    permission_classes = [IsAuthenticated]
    def get_object(self, request, project_id): return StudioProject.objects.filter(id=project_id, user=request.user).first()
    def get(self, request, project_id):
        project = self.get_object(request, project_id)
        return Response({'detail': 'Project not found.'}, status=404) if not project else Response({'data': ProjectSerializer(project, context={'request': request}).data})
    def patch(self, request, project_id):
        project = self.get_object(request, project_id)
        if not project: return Response({'detail': 'Project not found.'}, status=404)
        serializer = ProjectSerializer(project, data=request.data, partial=True); serializer.is_valid(raise_exception=True); serializer.save()
        return Response({'data': ProjectSerializer(project, context={'request': request}).data})


class AssetListView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = (MultiPartParser, FormParser)
    def get(self, request): return Response({'data': AssetSerializer(StudioAsset.objects.filter(user=request.user), many=True, context={'request': request}).data})
    def post(self, request):
        file = request.FILES.get('file')
        if not file: return Response({'detail': 'A file is required.'}, status=400)
        project = StudioProject.objects.filter(id=request.data.get('project_id'), user=request.user).first() if request.data.get('project_id') else None
        kind = StudioAsset.Kind.RECORDING if file.content_type.startswith('video/') else StudioAsset.Kind.SCREENSHOT
        asset = StudioAsset.objects.create(user=request.user, project=project, file=file, kind=kind)
        return Response({'data': AssetSerializer(asset, context={'request': request}).data}, status=201)


class StoryboardView(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request, project_id):
        project = StudioProject.objects.filter(id=project_id, user=request.user).select_related('brand_kit').first()
        if not project: return Response({'detail': 'Project not found.'}, status=404)
        project.storyboard = make_storyboard(project, list(project.assets.all())); project.save(update_fields=('storyboard', 'updated_at'))
        return Response({'data': ProjectSerializer(project, context={'request': request}).data})


class RenderJobView(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request, project_id):
        project = StudioProject.objects.filter(id=project_id, user=request.user).first()
        if not project: return Response({'detail': 'Project not found.'}, status=404)
        job = RenderJob.objects.create(project=project, status=RenderJob.Status.RUNNING)
        project.status = StudioProject.Status.RENDERING; project.save(update_fields=('status', 'updated_at'))
        try:
            project = render_project_video(project)
            job.status = RenderJob.Status.READY; job.save(update_fields=('status', 'updated_at'))
        except Exception as error:
            job.status = RenderJob.Status.FAILED; job.error_message = str(error)[:300]; job.save(update_fields=('status', 'error_message', 'updated_at'))
            project.status = StudioProject.Status.FAILED; project.save(update_fields=('status', 'updated_at'))
            return Response({'detail': 'The video could not be rendered.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        return Response({'data': {'job': RenderJobSerializer(job).data, 'project': ProjectSerializer(project, context={'request': request}).data}})


class ProjectDownloadView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request, project_id):
        project = StudioProject.objects.filter(id=project_id, user=request.user).first()
        if not project or not project.video_file:
            return Response({'detail': 'A rendered video is not available yet.'}, status=404)
        return FileResponse(project.video_file.open('rb'), as_attachment=True, filename=f'{slugify(project.title) or "launch"}.mp4', content_type='video/mp4')
