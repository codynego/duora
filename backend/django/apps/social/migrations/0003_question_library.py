from django.db import migrations
from django.utils import timezone


QUESTION_LIBRARY = {
    'Relationships': [
        'Can you love someone and still know they are wrong for you?',
        'What do you need before you can trust someone?',
        'Is honesty always kind?',
        'What makes you stay when a relationship gets hard?',
        'What is a red flag people ignore because they like someone?',
        'Can two good people want very different lives?',
        'Do you want to be chosen or understood?',
        'What kind of apology feels real to you?',
        'What do you wish you had said sooner?',
        'Should love feel easy?',
        'What makes you feel safe with someone?',
        'What should never be used as a joke in a relationship?',
    ],
    'Friendship': [
        'What makes a friendship last?',
        'Can friends grow apart without anyone doing wrong?',
        'What do you bring to your friendships?',
        'What kind of friend do you need right now?',
        'Is it better to have many friends or a few close ones?',
        'When do you know a friendship is over?',
        'What is hard for you to ask from friends?',
        'Can you be close to someone you disagree with?',
        'What small act makes you feel remembered?',
        'Do adult friendships need more effort?',
        'What do people misunderstand about quiet friends?',
        'Who gets to define loyalty?',
    ],
    'Business & ambition': [
        'What would you try if failure was private?',
        'What are you building quietly?',
        'Is success worth losing your peace?',
        'What does a good life mean to you?',
        'What are you good at but do not enjoy?',
        'Would you choose more money or more time?',
        'What kind of work makes you forget time?',
        'Who are you trying to prove yourself to?',
        'What goal feels too big to say out loud?',
        'Can ambition be a form of fear?',
        'What would you do with a free year?',
        'Is a stable life underrated?',
    ],
    'Personal growth': [
        'What are you learning to forgive yourself for?',
        'What part of you are you outgrowing?',
        'What do you pretend not to care about?',
        'When did you last surprise yourself?',
        'What advice do you no longer believe?',
        'What are you afraid people will notice?',
        'What boundary changed your life?',
        'What does healing look like for you today?',
        'What are you still waiting to hear?',
        'What makes change feel possible?',
        'What habit are you ready to leave behind?',
        'Do people really change?',
    ],
    'Deep conversations': [
        'What truth took you the longest to accept?',
        'Is a peaceful lie better than a painful truth?',
        'What makes a person good?',
        'Are people shaped more by choice or circumstance?',
        'What do we owe strangers?',
        'Is being understood more important than being loved?',
        'What does freedom mean to you?',
        'Can two people remember the same event differently?',
        'What should everyone question?',
        'Do people want truth or comfort?',
        'What makes a life meaningful?',
        'What opinion would you defend even if it was unpopular?',
    ],
    'Fun & everyday life': [
        'What is a small hill you will die on?',
        'What ordinary thing brings you joy?',
        'What would your perfect lazy day include?',
        'Which version of you appears around close friends?',
        'What is your most harmless unpopular opinion?',
        'What song knows you too well?',
        'If your week had a title, what would it be?',
        'What food could you eat forever?',
        'What do you notice that other people miss?',
        'What silly thing makes you feel old?',
        'What is something you want to learn just for fun?',
        'What is your best bad habit?',
    ],
}


def seed_question_library(apps, schema_editor):
    Question = apps.get_model('social', 'Question')
    now = timezone.now()
    for category, prompts in QUESTION_LIBRARY.items():
        for text in prompts:
            Question.objects.get_or_create(
                text=text,
                category=category,
                defaults={'status': 'published', 'published_at': now},
            )


class Migration(migrations.Migration):
    dependencies = [
        ('social', '0002_savedthought'),
    ]

    operations = [
        migrations.RunPython(seed_question_library, migrations.RunPython.noop),
    ]
