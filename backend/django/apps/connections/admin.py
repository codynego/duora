from django.contrib import admin
from .models import ConnectionRequest


@admin.register(ConnectionRequest)
class ConnectionRequestAdmin(admin.ModelAdmin):
    list_display = ('requester', 'recipient', 'status', 'source', 'last_experience', 'created_at')
    list_filter = ('status', 'source')
    search_fields = ('requester__username', 'recipient__username', 'last_experience')
    readonly_fields = ('id', 'created_at', 'responded_at')
