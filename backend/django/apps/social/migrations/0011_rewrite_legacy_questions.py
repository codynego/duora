from django.db import migrations


SUFFIXES = {
    'Relationships': 'What would your honest answer reveal about what you need from love?',
    'Friendship': 'What would your honest answer reveal about the kind of friend you are?',
    'Personal growth': 'What might your honest answer reveal about what you are still learning?',
    'Business & ambition': 'Where would you draw the ethical line, and why?',
    'Deep conversations': 'Why do you think you see it that way?',
    'Fun & everyday life': 'What does your honest answer say about how you move through everyday life?',
    'All thoughts': 'Which side do you honestly choose, and why?',
}

DEPTHS = {
    'Relationships': ('challenging', ['relationships', 'values']),
    'Friendship': ('challenging', ['friendship', 'loyalty']),
    'Personal growth': ('reflective', ['self-reflection', 'growth']),
    'Business & ambition': ('challenging', ['ambition', 'ethics']),
    'Deep conversations': ('vulnerable', ['meaning', 'human-nature']),
    'Fun & everyday life': ('surface', ['everyday', 'social-norms']),
    'All thoughts': ('challenging', ['beliefs', 'moral-dilemma']),
}


def rewrite_questions(apps, schema_editor):
    Question = apps.get_model('social', 'Question')
    used_texts = set(Question.objects.filter(status='published').values_list('text', flat=True))
    legacy = Question.objects.filter(status='archived').order_by('created_at', 'id')
    for question in legacy:
        base = question.text.strip().rstrip('?').strip()[:220]
        suffix = SUFFIXES.get(question.category, SUFFIXES['All thoughts'])
        candidate = f'{base}? {suffix}'
        attempt = 2
        while candidate in used_texts:
            candidate = f'{base}? {suffix} (perspective {attempt})'
            attempt += 1
        depth, styles = DEPTHS.get(question.category, DEPTHS['All thoughts'])
        question.text = candidate
        question.depth = depth
        question.styles = styles
        question.status = 'published'
        question.save(update_fields=('text', 'depth', 'styles', 'status'))
        used_texts.add(candidate)


class Migration(migrations.Migration):
    dependencies = [('social', '0010_controversial_question_library')]
    operations = [migrations.RunPython(rewrite_questions, migrations.RunPython.noop)]
