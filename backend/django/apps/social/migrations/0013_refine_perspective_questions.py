from django.db import migrations
from django.utils import timezone


REPLACEMENT = {
    "old": "What changed your mind about something? Who is being unreasonable here, and what would make you admit it?",
    "new": "What's something you once felt certain about—but no longer believe? What changed?",
}


QUESTIONS = [
    "What belief have you changed your mind about, and what finally got through to you?",
    "Have you ever defended a position you no longer believe? What made it hard to let go?",
    "What would someone have to say to make you admit you were wrong in an argument?",
    "Have you ever realized you were the unreasonable one in a disagreement? What happened?",
    "What is something you used to judge people for until you understood it better?",
    "What opinion do you hold that you are still willing to question?",
    "What is the hardest truth you have had to accept about your own behavior?",
    "When has changing your mind cost you a relationship, opportunity, or sense of pride?",
    "What would count as enough evidence for you to change a belief you care about?",
    "What is something you once called a fact that you now see as only your perspective?",
]


def refine_questions(apps, schema_editor):
    Question = apps.get_model("social", "Question")
    now = timezone.now()

    Question.objects.filter(text=REPLACEMENT["old"]).update(
        text=REPLACEMENT["new"],
        category="Deep conversations",
        depth="challenging",
        styles=["beliefs", "self-reflection", "changing-minds"],
        status="published",
        published_at=now,
    )

    for text in QUESTIONS:
        question = Question.objects.filter(text=text).first()
        if question is None:
            Question.objects.create(
                text=text,
                category="Deep conversations",
                depth="challenging",
                styles=["beliefs", "self-reflection", "changing-minds"],
                status="published",
                published_at=now,
            )
        else:
            question.category = "Deep conversations"
            question.depth = "challenging"
            question.styles = ["beliefs", "self-reflection", "changing-minds"]
            question.status = "published"
            question.published_at = question.published_at or now
            question.save(
                update_fields=(
                    "category",
                    "depth",
                    "styles",
                    "status",
                    "published_at",
                )
            )


class Migration(migrations.Migration):
    dependencies = [("social", "0012_deepen_legacy_questions")]
    operations = [
        migrations.RunPython(refine_questions, migrations.RunPython.noop),
    ]
