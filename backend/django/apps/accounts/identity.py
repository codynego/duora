import secrets

from django.db import IntegrityError, transaction

from .models import AnonymousIdentity


ADJECTIVES = ('quiet', 'gentle', 'hidden', 'kind', 'soft', 'curious', 'open', 'still', 'bright', 'warm')
NOUNS = ('moon', 'orbit', 'sunrise', 'horizon', 'harbor', 'wildflower', 'echo', 'river', 'comet', 'morning')
AVATAR_VARIANT_COUNT = 20


def create_anonymous_identity(user):
    existing = AnonymousIdentity.objects.filter(user=user).first()
    if existing:
        return existing
    for _ in range(20):
        adjective = secrets.choice(ADJECTIVES)
        noun = secrets.choice(NOUNS)
        username = f'{adjective}{noun}{secrets.randbelow(900) + 100}'
        if not AnonymousIdentity.objects.filter(username=username).exists():
            try:
                with transaction.atomic():
                    return AnonymousIdentity.objects.create(user=user, username=username, display_name=f'{adjective.title()} {noun.title()}', avatar_variant=secrets.randbelow(AVATAR_VARIANT_COUNT))
            except IntegrityError:
                # A concurrent signup may have claimed the generated handle.
                continue
    raise RuntimeError('Could not create a unique Duorah identity.')


def regenerate_anonymous_avatar(user):
    identity = get_or_create_anonymous_identity(user)
    identity.avatar_variant = secrets.randbelow(AVATAR_VARIANT_COUNT)
    identity.save(update_fields=('avatar_variant', 'updated_at'))
    return identity


def get_or_create_anonymous_identity(user):
    return create_anonymous_identity(user)


def regenerate_anonymous_identity(user):
    identity = get_or_create_anonymous_identity(user)
    identity.user_id = user.id
    for _ in range(20):
        adjective = secrets.choice(ADJECTIVES)
        noun = secrets.choice(NOUNS)
        username = f'{adjective}{noun}{secrets.randbelow(900) + 100}'
        if AnonymousIdentity.objects.filter(username=username).exclude(pk=identity.pk).exists():
            continue
        try:
            with transaction.atomic():
                identity.username = username
                identity.display_name = f'{adjective.title()} {noun.title()}'
                identity.save(update_fields=('username', 'display_name', 'updated_at'))
                return identity
        except IntegrityError:
            continue
    raise RuntimeError('Could not create a unique Duorah identity.')
