---
name: fastapi-project-layout
description: >-
  Progressive FastAPI project directory structure and API versioning boundaries.
  Use when scaffolding a new FastAPI project, reorganizing an existing project structure,
  discussing directory layout, or planning API version migration (v1 to v2).
  Works with fastapi-architecture (code rules) and fastapi-anti-patterns (review).
---

# FastAPI Project Layout — Progressive Evolution

Structure grows with project size. Do NOT start with 15 empty top-level directories.

## Small (1–5 domains, <20 tables)

```
src/
├── api/
│   └── v1/
│       ├── auth.py          # router
│       └── orders.py
├── services/
│   ├── auth_service.py
│   └── order_service.py
├── repositories/
│   ├── user_repo.py
│   └── order_repo.py
├── schemas/
│   ├── auth.py
│   └── order.py
├── models.py                # single file is fine
├── exceptions.py            # single file is fine
├── dependencies.py
├── core/
│   ├── config.py
│   ├── db.py
│   └── security.py
├── middlewares/
│   └── request_id.py
├── database.py
└── main.py
```

## Medium+ (5+ domains, 20+ tables)

When any directory exceeds ~10 files, split by domain subdirectory:

```
src/
├── api/
│   ├── v1/
│   │   ├── auth.py
│   │   └── identity.py
│   └── v2/
│       └── auth.py
├── services/
│   ├── auth/
│   │   └── auth_service.py
│   └── identity/
│       └── permission_service.py
├── repositories/
│   ├── auth/
│   │   ├── user_repo.py
│   │   └── role_repo.py
│   └── identity/
│       └── permission_repo.py
├── models/
│   ├── base.py
│   ├── auth/
│   │   ├── user.py
│   │   └── role.py
│   └── identity/
│       └── permission.py
├── schemas/
│   ├── auth/
│   │   ├── user.py
│   │   └── token.py
│   └── identity/
│       └── permission.py
├── exceptions/
│   ├── base.py
│   ├── auth.py
│   └── identity.py
├── core/
│   ├── config.py
│   ├── db.py
│   ├── security.py
│   ├── cache.py             # Redis abstraction
│   └── logger.py
├── middlewares/
│   ├── request_id.py
│   └── logging.py
├── dependencies.py
├── database.py
└── main.py
```

## API Version Boundary

When multiple API versions coexist:

```
  Must version          Version on demand        Never version
  ──────────           ──────────────           ─────────────
  Router               Logic (only changed      Repository
  Schema                parts)                  Models
                                               Dependencies
                                               Service (shared entry point)
```

When v2 needs different business logic, choose by degree of change:

| Logic change degree | Pattern | Example |
|---|---|---|
| Small (add a step) | Method addition on shared Service | `create_order()` for v1, `create_order_v2()` for v2 |
| Medium (different calculation) | Strategy injection via DI | Service accepts `PricingStrategy`; v1 injects `NoDiscount`, v2 injects `PercentDiscount` |
| Large (entire flow differs) | Versioned `services/` submodule | `services/auth/v2/registration.py`; Service delegates by version |

**Red line**: Never copy the entire Service/Repository per version. Isolate only the part that changed.

## What NOT to Create

| Anti-pattern | Why |
|---|---|
| Top-level `utils/` | Becomes a junk drawer. Put pure functions close to their usage site. |
| Top-level `constants/` | Enums and constants belong to their domain, not a centralized dump. |
| Top-level `cache/` | Caching is a Service-layer concern. Use `core/cache.py` as a thin helper. |
| Top-level `seed/` | Seeds are scripts. Put under `scripts/seed/`. |
| Empty directories on day 1 | Create directories when you have files to put in them, not in anticipation. |
