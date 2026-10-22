from django.db import migrations


FOLLOW_UPS = {
    "Relationships": (
        " Would your answer change if you were the person on the other side of it?",
        "challenging",
    ),
    "Friendship": (
        " What would you do if the honest choice cost you the friendship?",
        "challenging",
    ),
    "Personal growth": (
        " What are you avoiding admitting to yourself?",
        "vulnerable",
    ),
    "Business & ambition": (
        " What would you refuse to sacrifice, even for success?",
        "challenging",
    ),
    "Deep conversations": (
        " What evidence would genuinely change your mind?",
        "challenging",
    ),
    "Fun & everyday life": (
        " What would make you admit your first reaction was wrong?",
        "reflective",
    ),
    "All thoughts": (
        " What would make you question your first answer?",
        "challenging",
    ),
}


REPEATED_FOLLOW_UPS = (
    "Would your answer change if you were the person being hurt? Why?",
    "What would you sacrifice to prove you are serious, and where would you stop?",
    "What are you afraid your answer says about you?",
    "What would have to happen for you to change your mind?",
    "Who is being unreasonable here, and what would make you admit it?",
    "What would your honest answer reveal about what you need from love?",
    "What would your honest answer reveal about the kind of friend you are?",
    "What might your honest answer reveal about what you are still learning?",
    "Where would you draw the ethical line, and why?",
    "Why do you think you see it that way?",
    "What does your honest answer say about how you move through everyday life?",
    "Which side do you honestly choose, and why?",
)


def refine_repeated_followups(apps, schema_editor):
    Question = apps.get_model("social", "Question")

    for question in Question.objects.filter(status="published"):
        old_follow_up = next(
            (
                follow_up
                for follow_up in REPEATED_FOLLOW_UPS
                if question.text.endswith(follow_up)
            ),
            None,
        )
        if old_follow_up is None:
            continue

        new_follow_up, depth = FOLLOW_UPS.get(
            question.category,
            FOLLOW_UPS["All thoughts"],
        )
        base = question.text[: -len(old_follow_up)].rstrip()
        candidate = f"{base}{new_follow_up}"
        if len(candidate) > 300:
            candidate = f"{base[: 300 - len(new_follow_up)]}{new_follow_up}".strip()

        if Question.objects.filter(text=candidate).exclude(pk=question.pk).exists():
            continue

        question.text = candidate
        question.depth = depth
        question.save(update_fields=("text", "depth"))


class Migration(migrations.Migration):
    dependencies = [("social", "0013_refine_perspective_questions")]
    operations = [
        migrations.RunPython(
            refine_repeated_followups,
            migrations.RunPython.noop,
        ),
    ]
