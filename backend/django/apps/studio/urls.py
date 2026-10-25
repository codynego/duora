from django.urls import path
from .views import AssetListView, BrandKitView, ProjectDetailView, ProjectListView, RenderJobView, StoryboardView

urlpatterns = [
    path('brand-kit/', BrandKitView.as_view()), path('projects/', ProjectListView.as_view()), path('projects/<uuid:project_id>/', ProjectDetailView.as_view()),
    path('projects/<uuid:project_id>/storyboard/', StoryboardView.as_view()), path('projects/<uuid:project_id>/render/', RenderJobView.as_view()), path('assets/', AssetListView.as_view()),
]
