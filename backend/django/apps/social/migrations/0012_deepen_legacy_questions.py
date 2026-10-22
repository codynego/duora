from django.db import migrations


REWRITE_MARKERS = (
    'What would your honest answer reveal about what you need from love?',
    'What would your honest answer reveal about the kind of friend you are?',
    'What might your honest answer reveal about what you are still learning?',
    'Where would you draw the ethical line, and why?',
    'Why do you think you see it that way?',
    'What does your honest answer say about how you move through everyday life?',
    'Which side do you honestly choose, and why?',
)

SUFFIXES = {
    'Relationships': 'Would your answer change if you were the person being hurt? Why?',
    'Friendship': 'What would you do if protecting yourself meant abandoning someone you love?',
    'Personal growth': 'What are you afraid your answer says about you?',
    'Business & ambition': 'What would you sacrifice to prove you are serious, and where would you stop?',
    'Deep conversations': 'What would have to happen for you to change your mind?',
    'Fun & everyday life': 'Who is being unreasonable here, and what would make you admit it?',
    'All thoughts': 'What would you choose if nobody could praise or punish you?',
}

DEPTHS = {
    'Relationships': 'challenging',
    'Friendship': 'challenging',
    'Personal growth': 'vulnerable',
    'Business & ambition': 'challenging',
    'Deep conversations': 'vulnerable',
    'Fun & everyday life': 'surface',
    'All thoughts': 'challenging',
}


def deepen_questions(apps, schema_editor):
    Question = apps.get_model('social', 'Question')
    used_texts = set(Question.objects.exclude(status='archived').values_list('text', flat=True))
    legacy = Question.objects.filter(status='published')
    for question in legacy:
        if not any(marker in question.text for marker in REWRITE_MARKERS):
            continue
        base = question.text.split('?', 1)[0].strip()[:175] + '?'
        candidate = f'{base} {SUFFIXES.get(question.category, SUFFIXES["All thoughts"])}'
        attempt = 2
        while candidate in used_texts:
            candidate = f'{base} {SUFFIXES.get(question.category, SUFFIXES["All thoughts"])} (perspective {attempt})'
            attempt += 1
        question.text = candidate
        question.depth = DEPTHS.get(question.category, 'challenging')
        question.save(update_fields=('text', 'depth'))
        used_texts.add(candidate)


class Migration(migrations.Migration):
    dependencies = [('social', '0011_rewrite_legacy_questions')]
    operations = [migrations.RunPython(deepen_questions, migrations.RunPython.noop)]
