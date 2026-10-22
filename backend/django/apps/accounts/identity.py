import secrets

from django.db import IntegrityError, transaction

from .models import AnonymousIdentity


ADJECTIVES = ('quiet', 'gentle', 'hidden', 'kind', 'soft', 'curious', 'open', 'still', 'bright', 'warm')
NOUNS = ('moon', 'orbit', 'sunrise', 'horizon', 'harbor', 'wildflower', 'echo', 'river', 'comet', 'morning')


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
                    return AnonymousIdentity.objects.create(user=user, username=username, display_name=f'{adjective.title()} {noun.title()}')
            except IntegrityError:
                # A concurrent signup may have claimed the generated handle.
                continue
    raise RuntimeError('Could not create a unique Duora identity.')


def get_or_create_anonymous_identity(user):
    return create_anonymous_identity(user)
