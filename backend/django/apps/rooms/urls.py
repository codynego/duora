from rest_framework.routers import SimpleRouter
from .views import CreatePrivateRoomView, CreatePublicRoomView, MomentsView, RoomActivityView, RoomAnswerView, RoomNextStepView, RoomParticipantsView, RoomRevealView, RoomViewSet
from .invites import AcceptInviteView, CreateInviteView, InvitePreviewView
from django.urls import path

router = SimpleRouter()
router.register('', RoomViewSet, basename='room')
urlpatterns = [
    path('private/', CreatePrivateRoomView.as_view()),
    path('public/', CreatePublicRoomView.as_view()),
    path('moments/', MomentsView.as_view()),
    path('<uuid:room_id>/invites/', CreateInviteView.as_view()),
    path('<uuid:room_id>/answers/', RoomAnswerView.as_view()),
    path('<uuid:room_id>/participants/', RoomParticipantsView.as_view()),
    path('<uuid:room_id>/activity/', RoomActivityView.as_view()),
    path('<uuid:room_id>/reveal/', RoomRevealView.as_view()),
    path('<uuid:room_id>/next-steps/', RoomNextStepView.as_view()),
    path('invites/<uuid:token>/', InvitePreviewView.as_view()),
    path('invites/<uuid:token>/accept/', AcceptInviteView.as_view()),
]
urlpatterns += router.urls
