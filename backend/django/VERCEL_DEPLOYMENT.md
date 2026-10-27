# Deploying the Duora API on Vercel

Deploy `backend/django` as its own Vercel project. Vercel detects `manage.py` and serves the Django WSGI application without a custom `vercel.json`.

Set these production environment variables:

- `DJANGO_SECRET_KEY`: a unique secret of at least 32 characters.
- `DJANGO_DEBUG=false`
- `DATABASE_URL`: a managed PostgreSQL connection string. Do not use SQLite in production.
- `DJANGO_ALLOWED_HOSTS`: your API domain and `.vercel.app`.
- `DUORA_CORS_ORIGINS`: the exact URL of the deployed frontend, for example `https://duora.vercel.app`.
- `DJANGO_SECURE_SSL_REDIRECT=true`

The backend build runs `python manage.py migrate --noinput` before serving requests. Keep preview deployments on a separate database branch; do not point preview builds at production data.

The frontend project must define `NEXT_PUBLIC_DUORA_API_URL` as the base URL of this backend deployment. The API allows the production frontend origin through `DUORA_CORS_ORIGINS` and uses HttpOnly JWT cookies for browser sessions.
