from django.urls import path

from .views import DailyQuestionView, DiscussionReplyCreateView, ExploreView, MySocialSummaryView, QuestionListView, ThoughtConnectionRequestView, ThoughtCreateView, ThoughtDetailView, ThoughtReactionView, ThoughtSaveView

urlpatterns = [
    path('questions/', QuestionListView.as_view()),
    path('questions/daily/', DailyQuestionView.as_view()),
    path('me/summary/', MySocialSummaryView.as_view()),
    path('explore/', ExploreView.as_view()),
    path('thoughts/', ThoughtCreateView.as_view()),
    path('thoughts/<uuid:thought_id>/', ThoughtDetailView.as_view()),
    path('thoughts/<uuid:thought_id>/relate/', ThoughtReactionView.as_view()),
    path('thoughts/<uuid:thought_id>/save/', ThoughtSaveView.as_view()),
    path('thoughts/<uuid:thought_id>/replies/', DiscussionReplyCreateView.as_view()),
    path('thoughts/<uuid:thought_id>/connect/', ThoughtConnectionRequestView.as_view()),
]
