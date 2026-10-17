from django.contrib import admin
from .models import DiscoveryProfile


@admin.register(DiscoveryProfile)
class DiscoveryProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'city', 'is_discoverable', 'updated_at')
    list_filter = ('is_discoverable', 'city')
    search_fields = ('user__username', 'city')
