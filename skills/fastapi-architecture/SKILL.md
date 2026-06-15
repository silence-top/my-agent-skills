---
name: fastapi-best-practices
version: 2026.2.0
description: >-
  Production-grade FastAPI architecture guidelines for AI coding agents.
  Covers Python 3.12, FastAPI 0.115+, Pydantic 2.11+, SQLAlchemy 2.0+.
  Use when creating, modifying, reviewing, or refactoring FastAPI projects,
  REST APIs, async Python web services, or when reviewing agent-generated
  FastAPI code for anti-patterns.
activation_triggers:
  files: ["*.py", "alembic.ini", "pyproject.toml"]
  dependencies: ["fastapi", "sqlalchemy"]
---

# FastAPI Best Practices for AI Agents (2026 Edition)

You are an expert FastAPI architect. When creating, modifying, or reviewing FastAPI code, enforce the patterns below. Prefer conditional guidance over absolutes — document exceptions when deviating.

## Compatibility Matrix

| Dependency | Minimum | Notes |
|---|---:|---|
| **Python** | **3.12** | Use `X \| Y` unions, `list[T]`, PEP 695 generics |
| **FastAPI** | **0.115** | `lifespan`, `Annotated`, modern docs |
| **Pydantic** | **2.11** | `field_serializer`, `PlainSerializer`, `pydantic-settings` |
| **SQLAlchemy** | **2.0** | Async: `AsyncSession`, `async_sessionmaker` |
| **httpx** | **0.27** | `AsyncClient` + `ASGITransport` for tests |
| **Alembic** | **1.13** | Async-aware migrations |
| **PyJWT** | Recommended | `import jwt`; avoid `python-jose` |
| **ruff** | Recommended | Linter + formatter |

## Core Principles

1. **Separation of concerns**: Router → Service → Repository → Database. Keep routers thin.
2. **Domain-first organization** for medium/large projects; layer-first acceptable for small projects.
3. **Observability by default**: structured JSON logs, `request_id`, metrics, tracing.
4. **Test against real infrastructure**: use testcontainers or ephemeral databases for integration tests.
5. **Document deviations**: add rationale in PR when deviating from these guidelines.

## Project Structure

```
src/
├── api/
│   ├── v1/
│   └── v2/
├── auth/                  # Domain package (example)
│   ├── router.py          # HTTP mapping only — SLIM
│   ├── schemas.py         # Pydantic I/O contracts
│   ├── models.py          # SQLAlchemy ORM
│   ├── service.py         # Business logic & transactions
│   ├── repository.py      # SQL generation & persistence
│   └── dependencies.py    # DI providers
├── posts/                 # Another domain
├── config/
│   └── settings.py
├── database.py            # Session factory
├── main.py                # App bootstrap & lifespan
└── tests/
```

**Rules**: Use explicit module imports (`from src.auth import service as auth_service`). Keep domain packages self-contained.

## Lifespan (Resource Management)

Use `lifespan` (`asynccontextmanager`) for global resources; store singletons on `app.state`.

```python
from contextlib import asynccontextmanager
from fastapi import FastAPI
from httpx import AsyncClient

@asynccontextmanager
async def lifespan(app: FastAPI):
    app.state.http_client = AsyncClient(timeout=10.0)
    yield
    await app.state.http_client.aclose()

app = FastAPI(lifespan=lifespan)
```

## Settings

Split by domain using `pydantic-settings`; expose via cached getter.

```python
from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict

class AuthSettings(BaseSettings):
    model_config = SettingsConfigDict(env_prefix="AUTH_", extra="ignore")
    JWT_SECRET: str
    JWT_ALG: str = "HS256"
    JWT_EXP_MINUTES: int = 5

@lru_cache()
def get_auth_settings() -> AuthSettings:
    return AuthSettings()
```

## API Versioning

URL path versioning: `/api/v1/`, `/api/v2/`. Breaking changes → new version. Shared logic → `service/` or `logic/`.

```python
# api/v1/__init__.py
from fastapi import APIRouter
from api.v1.users import users_router

v1_router = APIRouter()
v1_router.include_router(users_router, prefix="/users", tags=["Users v1"])

# main.py
app.include_router(v1_router, prefix="/api/v1")
app.include_router(v2_router, prefix="/api/v2")
```

Deprecation: `APIRouter(deprecated=True)` + optional `Deprecation`/`Sunset` headers.

## Router

Router handles request/response, validation, and DI **only**. Move business logic to Service.

```python
from fastapi import APIRouter, status
from .schemas import ItemCreate, ItemResponse

router = APIRouter()

@router.post(
    "/items",
    response_model=ItemResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create an item",
)
async def create_item(payload: ItemCreate):
    return await service.create_item(payload)
```

## Dependency Injection

Prefer `Annotated[T, Depends(...)]` for clarity.

```python
from typing import Annotated
from fastapi import Depends

PostDep = Annotated[dict, Depends(valid_post_id)]

@router.get("/posts/{post_id}")
async def get_post(post: PostDep):
    return post
```

## Service Layer

Encapsulate business logic, transactions, idempotency. Do NOT handle HTTP concerns.

```python
class UserService:
    def __init__(self, repo: UserRepository):
        self.repo = repo

    async def create_user(self, data: UserCreate) -> User:
        return await self.repo.insert(data)
```

## Repository Layer

Data access only: queries, inserts, updates, deletes.

```python
class UserRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def fetch_user_row(self, user_id: UUID) -> dict:
        result = await self.session.execute(select(User).where(User.id == user_id))
        return result.scalar_one_or_none()
```

## Database (SQLAlchemy 2.0 Async)

```python
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

engine = create_async_engine(str(settings.DATABASE_URL), pool_pre_ping=True)
SessionFactory = async_sessionmaker(engine, expire_on_commit=False)

async def get_db() -> AsyncSession:
    async with SessionFactory() as session:
        yield session
```

Naming: `lower_case_snake`, singular table names, consistent FK names.

## Transactions (Unit of Work)

Place transaction boundaries in Service or UoW layer:

```python
async with session.begin():
    await repo.insert(...)
    await repo.update(...)
```

## Async Rules

| Scenario | Use |
|---|---|
| `await`-able non-blocking I/O | `async def` |
| Blocking I/O (no async client) | `def` (threadpool) |
| Mix of both | `async def` + `run_in_threadpool` |
| CPU-bound work | Offload to worker (Celery/Arq) |

Never call blocking libs (`requests`, `time.sleep`, sync DB drivers) inside `async def`.

## Authentication (JWT)

```python
import jwt
from jwt.exceptions import InvalidTokenError

def decode_token(token: str) -> dict:
    try:
        return jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALG])
    except InvalidTokenError as exc:
        raise InvalidCredentials() from exc
```

## HTTP Client

Create ONE `AsyncClient` in `lifespan`; reuse across requests. Never create per-request clients.

```python
client = app.state.http_client
resp = await client.get("https://api.example.com")
```

## Background Jobs

| Type | When |
|---|---|
| `BackgroundTasks` | Short, fire-and-forget, non-critical (<1s) |
| Celery/Arq/RQ | Retries, durability, scheduling, critical tasks |

## Error Handling (RFC 9457)

```python
class APIError(Exception):
    def __init__(self, type_: str, title: str, status_code: int = 400, detail: str | None = None):
        self.type = type_
        self.title = title
        self.status_code = status_code
        self.detail = detail

@app.exception_handler(APIError)
async def api_error_handler(request: Request, exc: APIError):
    return JSONResponse(
        status_code=exc.status_code,
        content={"type": exc.type, "title": exc.title, "status": exc.status_code,
                 "detail": exc.detail, "instance": str(request.url)},
    )
```

## Logging

Structured JSON logs with `request_id`. Add middleware:

```python
@app.middleware("http")
async def add_request_id(request: Request, call_next):
    request_id = str(uuid4())
    request.state.request_id = request_id
    response = await call_next(request)
    response.headers["X-Request-Id"] = request_id
    return response
```

## Testing

```python
# src/tests/conftest.py
import pytest
from typing import AsyncGenerator
from testcontainers.postgres import PostgresContainer
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from src.database import Base

@pytest.fixture(scope="session")
def anyio_backend() -> str: return "asyncio"

@pytest.fixture(scope="session")
async def test_db_engine():
    with PostgresContainer("postgres:16-alpine") as postgres:
        dsn = postgres.get_connection_url().replace("postgresql://", "postgresql+asyncpg://")
        engine = create_async_engine(dsn, echo=False)
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        yield engine
        await engine.dispose()

@pytest.fixture(scope="function")
async def db_session(test_db_engine) -> AsyncGenerator[AsyncSession, None]:
    async_session = async_sessionmaker(test_db_engine, expire_on_commit=False, class_=AsyncSession)
    async with async_session() as session:
        yield session
        await session.rollback()
```

Use `app.dependency_overrides` for fakes. Prefer real DBs (testcontainers) over mocks.

## Linting

`ruff check --fix` + `ruff format` in pre-commit and CI. Type checking with `mypy` or `pyright`.

## Anti-Pattern Quick Check

Before outputting code, verify against this list:

| Anti-pattern | Fix |
|---|---|
| `requests.get()` in `async def` | Use `httpx.AsyncClient` |
| `time.sleep` in `async def` | Use `asyncio.sleep` |
| `from jose import jwt` | Use `PyJWT` (`import jwt`) |
| `async_asgi_testclient` | Use `httpx.AsyncClient` + `ASGITransport` |
| `ConfigDict(json_encoders=...)` | Use `@field_serializer` |
| `Field(ge=18, default=None)` | Make required or optional explicitly |
| Broad `except Exception:` | Catch specific exceptions |
| `BackgroundTasks` for critical work | Use Celery/Arq/RQ |
| Sync ORM in `async def` | Use `AsyncSession` |
| Breaking change in existing version | Fork to `/api/v2/` |

For the complete anti-pattern table with severity and impact, see [anti-patterns.md](reference/anti-patterns.md).

## Quick Reference

| Scenario | Solution |
|---|---|
| Non-blocking I/O | `async def` + `await` |
| Blocking I/O | `def` (threadpool) |
| Sync lib in async route | `await run_in_threadpool(fn, *args)` |
| CPU-intensive | Celery/Arq worker |
| Request validation vs DB | Dependency that loads + validates |
| DI modern style | `Annotated[T, Depends(...)]` |
| Per-domain config | One `BaseSettings` per domain |
| Custom datetime serialization | `@field_serializer` |
| Fire-and-forget task | `BackgroundTasks` |
| Reliable/heavy task | Celery/Arq/RQ |
| JWT decode | `PyJWT` |
| Async DB | SQLAlchemy 2.0 `AsyncSession` |
| Test client | `httpx.AsyncClient` + `ASGITransport` |
| Swap dep in tests | `app.dependency_overrides[dep] = fake` |
| API versioning | URL path (`/api/v1/`, `/api/v2/`) |
| Shared logic across versions | `logic/` or `service/` |

## Additional Resources

- For detailed architecture patterns (lifespan, settings, DI, service/repository layers), see [architecture.md](reference/architecture.md)
- For database patterns, transactions, async rules, and migrations, see [database.md](reference/database.md)
- For advanced topics (Redis, WebSocket, pagination, file upload, streaming, docs hiding), see [advanced.md](reference/advanced.md)
- For the complete anti-pattern matrix with severity and code fixes, see [anti-patterns.md](reference/anti-patterns.md)
