# Duora backend architecture

## Purpose

The Django backend supports three separate clients without duplicating business rules:

| Client | Responsibility | Access path |
| --- | --- | --- |
| Web app | Browse, join, and participate in rooms | Versioned HTTP API + Socket.IO |
| Mobile app | Same member experiences with native UI | Same versioned HTTP API + Socket.IO |
| Admin/support app | Moderation, reports, room operations | Separate admin API surface, role-gated |

Clients are presentation layers. Room state, eligibility, matching, consent, and safety rules stay on the server.

## Module boundaries

```text
backend/django
├── config/       Django settings, URLs, ASGI/WSGI entrypoints
└── apps/
    ├── accounts/     identity and account policy
    ├── rooms/        room lifecycle, membership, and HTTP API
    ├── matching/     interest/intent matching policy
    ├── connections/  post-room mutual connection policy
    └── moderation/   reports, blocks, and safety operations
```

New product areas follow the same shape: `matches/`, `connections/`, `profiles/`, and `moderation/` each own their business rules and expose small API/realtime adapters. They must not reach into another module’s internal storage directly.

## Public contract

- HTTP endpoints are versioned under `/api/v1`.
- All protected HTTP endpoints expect `Authorization: Bearer <JWT>`.
- Django REST Framework validates JWTs for web and mobile clients using the same authentication class.
- Realtime will use Django Channels and the same authenticated user context when live rooms are added.
- Error payloads use `{ error: { code, message } }`; clients should branch on `code`, not prose.

The current protected endpoints are `GET /api/v1/rooms/`, `GET /api/v1/rooms/:code/`, and `POST /api/v1/rooms/:code/join/`. They are the pattern for all future member data.

## Security baseline already applied

- Explicit CORS allowlist; wildcards are rejected in production.
- Django REST Framework JWT authentication and route-level permissions.
- Explicit CORS allowlist, security headers, secure-cookie flags, and Django's production secret-key check.
- Global HTTP throttling plus a stricter throttle for room joins.
- Transactional capacity checks prevent two people from taking the last room place at once.
- No room data is returned to unauthenticated callers.
- `backend/django/.env.example` records required deployment values without storing a secret.

## Before production

1. Replace in-memory room storage with Postgres for durable rooms, consent decisions, and audit records.
2. Add an identity provider or auth service that issues the configured JWT claims.
3. Add a Redis-backed rate limiter and Socket.IO adapter for multi-instance realtime scaling.
4. Create a separate admin router with role checks, moderation actions, audit log writes, and stricter rate limits.
5. Validate every event payload at the realtime boundary and add integration tests for authorization and room membership.
6. Add observability: structured logs, error reporting, room lifecycle metrics, and security-event alerts.

## Deployment model

Use Postgres for durable relational data and Redis for presence, queues, and cross-instance realtime coordination. Django + DRF is the API source of truth; Django Channels will own authenticated realtime rooms. Background work such as notifications, room-expiry cleanup, and moderation review belongs in Celery workers—not request handlers.

## Legacy note

`backend/src` is the earlier Node/Socket.IO prototype and is retained only for reference during migration. New backend work belongs in `backend/django`; it is the path to production.
