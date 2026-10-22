from django.contrib import admin

from .models import DiscussionReply, IdentityConsent, Question, SavedThought, Thought, ThoughtReaction


@admin.register(Question)
class QuestionAdmin(admin.ModelAdmin):
    list_display = ('text', 'category', 'status', 'published_at')
    list_filter = ('status', 'category')
    search_fields = ('text',)


@admin.register(Thought)
class ThoughtAdmin(admin.ModelAdmin):
    list_display = ('question', 'author', 'moderation_status', 'published_at')
    list_filter = ('moderation_status',)
    search_fields = ('body',)


admin.site.register((ThoughtReaction, SavedThought, DiscussionReply, IdentityConsent))
