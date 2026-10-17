from rest_framework.routers import SimpleRouter
from .views import CreatePrivateRoomView, CreatePublicRoomView, RoomViewSet
from .invites import AcceptInviteView, CreateInviteView, InvitePreviewView
from django.urls import path

router = SimpleRouter()
router.register('', RoomViewSet, basename='room')
urlpatterns = [
    path('private/', CreatePrivateRoomView.as_view()),
    path('public/', CreatePublicRoomView.as_view()),
    path('<uuid:room_id>/invites/', CreateInviteView.as_view()),
    path('invites/<uuid:token>/', InvitePreviewView.as_view()),
    path('invites/<uuid:token>/accept/', AcceptInviteView.as_view()),
]
urlpatterns += router.urls
