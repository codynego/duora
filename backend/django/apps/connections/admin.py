from django.contrib import admin
from .models import ConnectionRequest, ConnectionThread, ThreadMessage


@admin.register(ConnectionRequest)
class ConnectionRequestAdmin(admin.ModelAdmin):
    list_display = ('requester', 'recipient', 'status', 'source', 'last_experience', 'created_at')
    list_filter = ('status', 'source')
    search_fields = ('requester__username', 'recipient__username', 'last_experience')
    readonly_fields = ('id', 'created_at', 'responded_at')


@admin.register(ConnectionThread)
class ConnectionThreadAdmin(admin.ModelAdmin):
    list_display = ('user_one', 'user_two', 'room', 'last_message_at', 'created_at')
    autocomplete_fields = ('user_one', 'user_two', 'room')
    search_fields = ('user_one__username', 'user_two__username', 'room__title')


@admin.register(ThreadMessage)
class ThreadMessageAdmin(admin.ModelAdmin):
    list_display = ('thread', 'sender', 'created_at')
    search_fields = ('body', 'sender__username')
    autocomplete_fields = ('thread', 'sender')
