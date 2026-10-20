from django.contrib import admin
from .models import AutoMatchQueue, DiscoveryProfile


@admin.register(DiscoveryProfile)
class DiscoveryProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'city', 'is_discoverable', 'updated_at')
    list_filter = ('is_discoverable', 'city')
    search_fields = ('user__username', 'city')


@admin.register(AutoMatchQueue)
class AutoMatchQueueAdmin(admin.ModelAdmin):
    list_display = ('user', 'room', 'intent', 'created_at', 'expires_at')
    list_filter = ('intent',)
    search_fields = ('user__username', 'room__code')
