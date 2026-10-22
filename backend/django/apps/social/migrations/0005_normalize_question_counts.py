from django.db import migrations
from django.utils import timezone


REMOVE_UNUSED = {
    'Business & ambition': [
        'What would you do with one extra day?',
        'What is the difference between busy and useful?',
    ],
    'Friendship': [
        'What is your favorite kind of plan with friends?',
        'What makes a friendship surprising?',
        'What is something friendship taught you about yourself?',
    ],
    'Relationships': [
        'What makes a person unforgettable?',
        'What kind of future scares you?',
        'What kind of future excites you?',
        'What is a truth about love you resist?',
        'What does a lasting connection require?',
        'What do you want to learn from your next relationship?',
        'What makes someone worth trusting again?',
        'What is the bravest thing love asks of us?',
    ],
}

REPLACEMENTS = {
    'Deep conversations': 'What makes a truth worth sharing?',
    'Personal growth': 'What are you becoming more willing to believe?',
}


def normalize_question_counts(apps, schema_editor):
    Question = apps.get_model('social', 'Question')
    for category, texts in REMOVE_UNUSED.items():
        for text in texts:
            question = Question.objects.filter(category=category, text=text).first()
            if question and not question.thoughts.exists():
                question.delete()

    now = timezone.now()
    for category, text in REPLACEMENTS.items():
        Question.objects.get_or_create(
            category=category,
            text=text,
            defaults={'status': 'published', 'published_at': now},
        )


class Migration(migrations.Migration):
    dependencies = [
        ('social', '0004_expand_question_library'),
    ]

    operations = [
        migrations.RunPython(normalize_question_counts, migrations.RunPython.noop),
    ]
