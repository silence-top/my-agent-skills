---
name: fastapi-architecture
description: >-
  Pragmatic FastAPI architecture guardrails for AI coding agents.
  Covers Python 3.12, FastAPI 0.115+, Pydantic 2.11+, SQLAlchemy 2.0+.
  Use when creating, modifying, reviewing, or refactoring FastAPI projects,
  REST APIs, async Python services, or reviewing agent-generated code for anti-patterns.
---

# FastAPI 实用主义架构守护者

You are a pragmatic Python architect. Enforce the rules below when creating, modifying, or reviewing FastAPI code. Prefer conditional guidance over absolutes — but the **red lines are non-negotiable**.

## Version Pin

| Dependency | Minimum | Must-use API |
|---|---:|---|
| **Python** | **3.12** | `X \| Y` unions, `list[T]`, PEP 695 |
| **FastAPI** | **0.115** | `lifespan`, `Annotated` DI |
| **Pydantic** | **2.11** | `field_serializer`, `ConfigDict`, `pydantic-settings` |
| **SQLAlchemy** | **2.0** | `AsyncSession`, `async_sessionmaker` |
| **httpx** | **0.27** | `AsyncClient` + `ASGITransport` |
| **Alembic** | **1.13** | Async template |
| **PyJWT** | Recommended | `import jwt` — avoid `python-jose` |

## Core Principles

1. **Separation of concerns**: Router → Service → Repository. Routers are thin.
2. **Async-first, but not async-only**: use the decision table below.
3. **Guard clauses over nesting**: early `raise` / `return`; happy path stays at outer scope.
4. **No over-abstraction**: no ABC/Interface for the sake of mocking, no GenericRepository.
5. **Domain exceptions + global handler**: Service throws domain errors; `app.exception_handler` converts to HTTP.
6. **ORM never leaks past Service**: SQLAlchemy models stop at Service boundary; Pydantic schemas are the public contract.
7. **One `BaseSettings` per domain**: no god-config class.

## Three-Layer Architecture

```
[Router: HTTP/DTO only] → [Service: Business logic] → [Repository: DB/IO only]
```

### Router — "Convey, don't think"

- **Only**: path definition, Pydantic validation, call Service, declare `response_model` + `status_code`.
- **Red line**: NO SQL, NO `db.session`, NO business `if-else`, NO `try/except` on domain errors (let global handler catch them).
- **DI style**: `Annotated[UserService, Depends(get_user_service)]`.

### Service — "The business brain"

- **Only**: business logic, compose Repos, throw domain exceptions, own transaction boundaries (`async with session.begin()`).
- **Red line**: NO `HTTPException`, NO `Request`/`Response` objects, NO SQLAlchemy model in return types.
- **Mocking**: use `unittest.mock` or `dependency_overrides`. **Never** write an ABC just for mocking.
- **Simple CRUD**: if a method is pure pass-through with zero logic, the Service layer is still the correct place — but keep it a one-liner. Do NOT bypass Service from Router.

### Repository — "The only I/O gate"

- **Only**: SQLAlchemy async queries. Return ORM models or primitive types.
- **Red line**: NO `GenericRepository[T]`. Each entity gets a concrete class with business-specific methods (e.g. `get_active_by_email`, not `filter_by(**kwargs)`).
- **After `session.add()`**: always `await session.flush()` before returning, so auto-generated IDs are populated.

## Async Decision Table

| Scenario | Use |
|---|---|
| `await`-able non-blocking I/O | `async def` |
| Blocking I/O (no async client exists) | `def` (FastAPI runs in threadpool) |
| Mix of both | `async def` + `run_in_threadpool` for blocking part |
| CPU-bound (>100ms) | Offload to worker (Celery/Arq) |

**Red line**: Never call `requests`, `time.sleep`, sync DB drivers, or `open()` inside `async def`.

## Settings

One `pydantic-settings` `BaseSettings` per domain, exposed via `@lru_cache()` getter. Never import-time instantiation.

```python
class AuthSettings(BaseSettings):
    model_config = SettingsConfigDict(env_prefix="AUTH_", extra="ignore")
    JWT_SECRET: str
    JWT_ALG: str = "HS256"

@lru_cache()
def get_auth_settings() -> AuthSettings:
    return AuthSettings()
```

## Error Handling

Service throws domain exceptions; global handler converts to RFC 9457 JSON:

```python
# exceptions.py — domain errors, no HTTP knowledge
class DomainError(Exception): ...
class UserNotFoundError(DomainError): ...
class UserAlreadyExistsError(DomainError): ...

# main.py — global handler
@app.exception_handler(DomainError)
async def domain_error_handler(request: Request, exc: DomainError):
    return JSONResponse(status_code=exc.status_code, content={...})
```

**Red line**: NO `HTTPException` in Service layer. NO broad `except Exception:` in Router.

## Background Jobs

| Tool | When |
|---|---|
| `BackgroundTasks` | Fire-and-forget, <1s, non-critical (e.g. welcome email) |
| Celery/Arq/RQ | Retries, durability, scheduling, or any task you'd page on |

## Testing

- Use `httpx.AsyncClient` + `ASGITransport` — NOT `TestClient` or `async_asgi_testclient`.
- Use `app.dependency_overrides[dep] = fake` for auth/external swaps.
- Prefer real DB (testcontainers) over mocks for integration tests.

## Anti-Pattern Red Lines

Before outputting code, verify NONE of these exist:

| Anti-pattern | Fix |
|---|---|
| `requests.get()` in `async def` | `httpx.AsyncClient` |
| `time.sleep` / `open()` / sync DB in `async def` | `asyncio.sleep` / `aiofiles` / `AsyncSession` |
| `from jose import jwt` | `PyJWT` (`import jwt`) |
| `ConfigDict(json_encoders=...)` | `@field_serializer` |
| `Field(ge=18, default=None)` | Required or optional — pick one |
| Broad `except Exception:` | Catch specific exceptions |
| `GenericRepository[T]` | Concrete repo with business methods |
| ABC for mocking | `unittest.mock` or `dependency_overrides` |
| `HTTPException` in Service | Domain exception + global handler |
| ORM model in Router return | Convert to Pydantic schema at Service boundary |
| `BackgroundTasks` for critical work | Celery/Arq/RQ |
| Breaking change in existing API version | Fork to `/api/v2/` |
| `db.commit()` in Router | `session.begin()` in Service |
| One global `BaseSettings` | Per-domain settings class |
| `class Config:` (Pydantic v1) | `model_config = ConfigDict(...)` |

For the complete anti-pattern matrix with severity levels, see [anti-patterns.md](reference/anti-patterns.md).

## Golden Master Code

When generating CRUD or business flow, strictly follow this structure:

```python
# --- schemas.py ---
from pydantic import BaseModel, ConfigDict, EmailStr

class UserCreate(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: int
    email: EmailStr
    model_config = ConfigDict(from_attributes=True)

# --- exceptions.py ---
class DomainError(Exception):
    status_code: int = 400

class UserAlreadyExistsError(DomainError):
    status_code: int = 409

# --- repositories.py ---
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from .models import User
from .schemas import UserCreate

class UserRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_by_email(self, email: str) -> User | None:
        result = await self.session.execute(select(User).where(User.email == email))
        return result.scalars().first()

    async def create(self, user_in: UserCreate, hashed_pw: str) -> User:
        user = User(email=user_in.email, hashed_password=hashed_pw)
        self.session.add(user)
        await self.session.flush()        # populate auto-generated id
        return user

# --- services.py ---
from .repositories import UserRepository
from .schemas import UserCreate, UserResponse
from .exceptions import UserAlreadyExistsError

class UserService:
    def __init__(self, repo: UserRepository):
        self.repo = repo

    async def register(self, user_in: UserCreate) -> UserResponse:
        if await self.repo.get_by_email(user_in.email):    # guard clause
            raise UserAlreadyExistsError("Email already registered")
        user = await self.repo.create(user_in, hash_pw(user_in.password))
        return UserResponse.model_validate(user)            # ORM → schema at boundary

# --- routers.py ---
from typing import Annotated
from fastapi import APIRouter, Depends, status
from .schemas import UserCreate, UserResponse
from .services import UserService
from .dependencies import get_user_service

router = APIRouter(prefix="/users", tags=["Users"])

@router.post("/", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def create_user(
    user_in: UserCreate,
    service: Annotated[UserService, Depends(get_user_service)],
):
    return await service.register(user_in)     # no try/except — global handler catches it
```

## Additional Resources

- For full patterns (lifespan, settings, DI, DB session, testing, versioning, Redis, WebSocket, pagination, etc.), see [reference.md](reference/reference.md)
- For the complete anti-pattern matrix with severity, see [anti-patterns.md](reference/anti-patterns.md)
