# Deploying the Duora API on Vercel

Deploy `backend/django` as its own Vercel project. Vercel detects `manage.py` and serves the Django WSGI application without a custom `vercel.json`.

Set these production environment variables:

- `DJANGO_SECRET_KEY`: a unique secret of at least 32 characters.
- `DJANGO_DEBUG=false`
- `DATABASE_URL`: a managed PostgreSQL connection string. Do not use SQLite in production.
- `DJANGO_ALLOWED_HOSTS`: your API domain and `.vercel.app`.
- `DUORA_CORS_ORIGINS`: the exact URL of the deployed frontend, for example `https://duora.vercel.app`.
- `DJANGO_SECURE_SSL_REDIRECT=true`

Run `python manage.py migrate --noinput` against the production Postgres database before directing production traffic to a new release. Keep preview deployments on a separate database branch or make them read-only; they must not share production data.

The room experience deliberately uses REST requests and four-second polling. No WebSocket server, Channels layer, Redis layer, or persistent process is required.
