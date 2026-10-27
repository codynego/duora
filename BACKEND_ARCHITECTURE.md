# Dorah financial controller backend

The Django API is the source of truth for business profiles and recorded financial activity. The Next.js frontend uses the versioned API; the dashboard only labels illustrative sample data when a saved record does not exist yet.

## Modules

```text
backend/django
├── config/       Django settings, URL routing, and Vercel WSGI entrypoint
└── apps/
    ├── accounts/ account registration, cookie JWT authentication, and profile
    └── finance/  business workspace, transactions, and overview calculations
```

## API

- `GET /api/v1/auth/me/` returns the signed-in account.
- `GET /api/v1/finance/businesses/` lists the current user’s businesses.
- `POST /api/v1/finance/businesses/` creates the initial business workspace.
- `GET /api/v1/finance/businesses/:id/overview/` returns saved transactions and derived cash/monthly totals.
- `GET|POST /api/v1/finance/businesses/:id/transactions/` lists or records activity owned by that business.

Browser sessions use the existing HttpOnly JWT cookies and explicit CORS origin allowlist. Every finance query is scoped to the authenticated account. Free workspaces are limited to one business and 100 transactions created per month.

## Data

Vercel Postgres stores accounts, businesses, and transactions. Business setup saves country, currency, industry, record-keeping preference, and the user’s optional setup choice. Transactions store a positive amount, income/expense kind, description, category, counterparty, and date. Cash position is derived from opening balance plus income less expenses.

## Retired modules

Room, matching, social, moderation, studio, subscription-catalogue, and anonymous-identity tables were retired when the product changed direction. The finance migration removes those legacy tables from the connected Vercel database. Django account records and authentication tables remain.

## Deployment

Deploy `backend/django` as the backend Vercel project and configure `DATABASE_URL`, `DJANGO_SECRET_KEY`, `DJANGO_DEBUG=false`, `DJANGO_ALLOWED_HOSTS`, and `DUORA_CORS_ORIGINS`. The project build runs Django migrations before serving the API. The frontend’s `NEXT_PUBLIC_DUORA_API_URL` must point to this API deployment.
