from django.contrib import admin
from .models import Moment, Room, RoomActivity, RoomAnswer, RoomInvite, RoomMembership, RoomNextStep


class RoomMembershipInline(admin.TabularInline):
    model = RoomMembership
    extra = 0
    readonly_fields = ('joined_at',)
    autocomplete_fields = ('user',)


@admin.register(Room)
class RoomAdmin(admin.ModelAdmin):
    list_display = ('title', 'code', 'intent', 'city', 'tone', 'status', 'starts_at', 'member_count', 'max_members', 'duration_minutes')
    list_filter = ('status', 'intent', 'tone', 'is_discovery_room')
    search_fields = ('title', 'code', 'description')
    readonly_fields = ('created_at',)
    date_hierarchy = 'starts_at'
    inlines = (RoomMembershipInline,)

    @admin.display(description='Members')
    def member_count(self, room: Room) -> int:
        return room.memberships.filter(disposition=RoomMembership.Disposition.PRESENT).count()


@admin.register(RoomMembership)
class RoomMembershipAdmin(admin.ModelAdmin):
    list_display = ('room', 'user', 'disposition', 'joined_at')
    list_filter = ('disposition',)
    search_fields = ('room__title', 'room__code', 'user__username')
    autocomplete_fields = ('room', 'user')
    readonly_fields = ('joined_at',)


@admin.register(RoomInvite)
class RoomInviteAdmin(admin.ModelAdmin):
    list_display = ('room', 'created_by', 'token', 'expires_at', 'accepted_by', 'accepted_at', 'revoked_at')
    search_fields = ('room__title', 'created_by__username', 'token')
    readonly_fields = ('token', 'accepted_at')


@admin.register(RoomActivity)
class RoomActivityAdmin(admin.ModelAdmin):
    list_display = ('event', 'room', 'actor', 'created_at')
    list_filter = ('event',)
    search_fields = ('room__title', 'room__code', 'actor__username')
    autocomplete_fields = ('room', 'actor')
    readonly_fields = ('created_at',)


@admin.register(RoomAnswer)
class RoomAnswerAdmin(admin.ModelAdmin):
    list_display = ('room', 'user', 'prompt_key', 'revealed_at', 'updated_at')
    search_fields = ('room__code', 'user__username', 'body')
    autocomplete_fields = ('room', 'user')


@admin.register(RoomNextStep)
class RoomNextStepAdmin(admin.ModelAdmin):
    list_display = ('room', 'user', 'participant', 'choice', 'created_at')
    list_filter = ('choice',)
    autocomplete_fields = ('room', 'user', 'participant')


@admin.register(Moment)
class MomentAdmin(admin.ModelAdmin):
    list_display = ('title', 'owner', 'room', 'kind', 'created_at')
    search_fields = ('title', 'owner__username', 'room__code')
    autocomplete_fields = ('owner', 'room')
