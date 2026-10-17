from django.contrib import admin
from .models import Report, SafetyExclusion


@admin.register(SafetyExclusion)
class SafetyExclusionAdmin(admin.ModelAdmin):
    list_display = ('user', 'excluded_user', 'reason', 'created_at')
    list_filter = ('reason',)
    search_fields = ('user__username', 'excluded_user__username')


@admin.register(Report)
class ReportAdmin(admin.ModelAdmin):
    list_display = ('reporter', 'reported_user', 'reason', 'status', 'created_at')
    list_filter = ('status', 'reason')
    search_fields = ('reporter__username', 'reported_user__username', 'details')
    readonly_fields = ('created_at',)
