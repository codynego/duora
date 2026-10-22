from django.db import migrations


CONTEXTUAL_FOLLOW_UPS = {
    "Relationships": " If someone you loved made the same choice, what would you want to understand before judging them?",
    "Friendship": " If a close friend made this choice, what would you need from them before trusting them again?",
    "Personal growth": " What part of this answer feels hardest to admit, and what makes it difficult?",
    "Business & ambition": " If reaching this goal required giving up something important, where would you draw the line?",
    "Deep conversations": " If someone challenged this view with a different lived experience, what would you need to hear before reconsidering it?",
    "Fun & everyday life": " If your first reaction turned out to be wrong, what would help you see the situation differently?",
    "All thoughts": " After hearing another honest perspective, what could make you see this situation differently?",
}


CONTEXTLESS_FOLLOW_UPS = (
    " Would your answer change if you were the person on the other side of it?",
    " What would you do if the honest choice cost you the friendship?",
    " What are you avoiding admitting to yourself?",
    " What would you refuse to sacrifice, even for success?",
    " What evidence would genuinely change your mind?",
    " What would make you admit your first reaction was wrong?",
    " What would make you question your first answer?",
    " What would have to happen for you to change your mind?",
    " What are you afraid your answer says about you?",
    " What would you sacrifice to prove you are serious, and where would you stop?",
    " Would your answer change if you were the person being hurt? Why?",
    " Who is being unreasonable here, and what would make you admit it?",
    " What would your honest answer reveal about what you need from love?",
    " What would your honest answer reveal about the kind of friend you are?",
    " What might your honest answer reveal about what you are still learning?",
    " Where would you draw the ethical line, and why?",
    " Why do you think you see it that way?",
    " What does your honest answer say about how you move through everyday life?",
    " Which side do you honestly choose, and why?",
)


def add_context(apps, schema_editor):
    Question = apps.get_model("social", "Question")

    for question in Question.objects.filter(status="published"):
        old_follow_up = next(
            (
                follow_up
                for follow_up in CONTEXTLESS_FOLLOW_UPS
                if question.text.endswith(follow_up)
            ),
            None,
        )
        if old_follow_up is None:
            continue

        follow_up = CONTEXTUAL_FOLLOW_UPS.get(
            question.category,
            CONTEXTUAL_FOLLOW_UPS["All thoughts"],
        )
        base = question.text[: -len(old_follow_up)].rstrip()
        candidate = f"{base}{follow_up}"
        if len(candidate) > 300:
            candidate = f"{base[: 300 - len(follow_up)]}{follow_up}".strip()

        if Question.objects.filter(text=candidate).exclude(pk=question.pk).exists():
            continue

        question.text = candidate
        question.save(update_fields=("text",))


class Migration(migrations.Migration):
    dependencies = [("social", "0014_refine_repeated_question_followups")]
    operations = [
        migrations.RunPython(add_context, migrations.RunPython.noop),
    ]
