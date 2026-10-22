from django.urls import path

from .views import DiscussionReplyCreateView, ExploreView, QuestionListView, ThoughtConnectionRequestView, ThoughtCreateView, ThoughtDetailView, ThoughtReactionView

urlpatterns = [
    path('questions/', QuestionListView.as_view()),
    path('explore/', ExploreView.as_view()),
    path('thoughts/', ThoughtCreateView.as_view()),
    path('thoughts/<uuid:thought_id>/', ThoughtDetailView.as_view()),
    path('thoughts/<uuid:thought_id>/relate/', ThoughtReactionView.as_view()),
    path('thoughts/<uuid:thought_id>/replies/', DiscussionReplyCreateView.as_view()),
    path('thoughts/<uuid:thought_id>/connect/', ThoughtConnectionRequestView.as_view()),
]
