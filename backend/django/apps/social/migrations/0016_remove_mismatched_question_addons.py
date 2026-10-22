from django.db import migrations


GENERATED_ADDONS = (
    " If someone you loved made the same choice, what would you want to understand before judging them?",
    " If a close friend made this choice, what would you need from them before trusting them again?",
    " What part of this answer feels hardest to admit, and what makes it difficult?",
    " If reaching this goal required giving up something important, where would you draw the line?",
    " If someone challenged this view with a different lived experience, what would you need to hear before reconsidering it?",
    " If your first reaction turned out to be wrong, what would help you see the situation differently?",
    " After hearing another honest perspective, what could make you see this situation differently?",
)


def remove_mismatched_addons(apps, schema_editor):
    Question = apps.get_model("social", "Question")
    existing = set(
        Question.objects.filter(status="published").values_list("text", flat=True)
    )

    for question in Question.objects.filter(status="published"):
        addon = next(
            (addon for addon in GENERATED_ADDONS if question.text.endswith(addon)),
            None,
        )
        if addon is None:
            continue

        standalone = question.text[: -len(addon)].rstrip()
        if standalone in existing:
            continue

        existing.discard(question.text)
        question.text = standalone
        question.save(update_fields=("text",))
        existing.add(standalone)


class Migration(migrations.Migration):
    dependencies = [("social", "0015_add_context_to_question_followups")]
    operations = [
        migrations.RunPython(
            remove_mismatched_addons,
            migrations.RunPython.noop,
        ),
    ]
