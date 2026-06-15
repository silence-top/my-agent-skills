# Reference: Database, Transactions, Async & Migrations

## SQLAlchemy 2.0 Async — Full Pattern

### Engine & Session Factory

```python
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

engine = create_async_engine(str(settings.DATABASE_URL), pool_pre_ping=True)
SessionFactory = async_sessionmaker(engine, expire_on_commit=False)

async def get_db() -> AsyncSession:
    async with SessionFactory() as session:
        yield session
```

### Naming Conventions

```python
from sqlalchemy import MetaData

POSTGRES_INDEXES_NAMING_CONVENTION = {
    "ix": "%(column_0_label)s_idx",
    "uq": "%(table_name)s_%(column_0_name)s_key",
    "ck": "%(table_name)s_%(constraint_name)s_check",
    "fk": "%(table_name)s_%(column_0_name)s_fkey",
    "pk": "%(table_name)s_pkey",
}
metadata = MetaData(naming_convention=POSTGRES_INDEXES_NAMING_CONVENTION)
```

### Table Conventions
- `lower_case_snake` for columns and tables.
- Singular table names: `post`, `user`, `post_like`.
- Consistent FK names across schema.
- Use naming conventions for indexes and constraints.

### SQL-first vs Pydantic-second
- Prefer doing joins, aggregation, and JSON shaping in SQL for performance.
- For complex shaping where readability matters, do it in the service layer and document trade-offs.

---

## Transactions (Unit of Work) — Full Pattern

### Basic: `session.begin()`

```python
async with session.begin():
    await repo.insert(...)
    await repo.update(...)
```

Place transaction boundaries in the Service or UoW layer — never in Router or Repository.

### Unit of Work Class

```python
class UnitOfWork:
    def __init__(self, session_factory):
        self.session_factory = session_factory

    async def __aenter__(self):
        self.session = self.session_factory()
        await self.session.begin()
        return self

    async def __aexit__(self, exc_type, exc, tb):
        if exc:
            await self.session.rollback()
        else:
            await self.session.commit()
        await self.session.close()
```

### Usage

```python
async with UnitOfWork(SessionFactory) as uow:
    repo = OrderRepository(uow.session)
    await repo.insert(order)
    await repo.deduct_stock(items)
# auto-commit on success, auto-rollback on exception
```

### Distributed Transactions
For distributed systems, prefer compensating actions or Saga patterns over 2PC.

---

## Async Rules — Deep Dive

### Decision Table

| Route does this | Use |
|---|---|
| `await`-able non-blocking I/O | `async def` |
| Blocking I/O (no async client exists) | `def` (sync, runs in threadpool) |
| Mix of both | `async def` + `run_in_threadpool` for the blocking part |
| Long CPU-bound work | Offload to worker (Celery/Arq/RQ) or dedicated process pool |

### Common Mistakes

```python
# BAD: blocking library in async def
@router.get("/data")
async def get_data():
    resp = requests.get("https://api.example.com")  # BLOCKS event loop!
    return resp.json()

# GOOD: use async client
@router.get("/data")
async def get_data():
    resp = await app.state.http_client.get("https://api.example.com")
    return resp.json()

# GOOD: run_in_threadpool for sync-only libs
from starlette.concurrency import run_in_threadpool

@router.get("/data")
async def get_data():
    result = await run_in_threadpool(sync_heavy_function, arg1, arg2)
    return result
```

### Notes
- Do not hard-code threadpool size as an immutable rule — treat as implementation detail.
- `BackgroundTasks` run after response is sent, in the same worker. If worker dies, task is lost. No retry.

---

## Background Jobs — Selection Guide

### Criteria (not purely time-based)

| Tool | When to Use |
|---|---|
| `BackgroundTasks` | In-process, best-effort, short tasks without retry/durability (e.g., non-critical emails, light logging) |
| Task queue (Celery/Arq/RQ) | Retries, durability, scheduling, long-running or CPU-bound tasks, visibility |

### Experience Thresholds (guidance only)
- >100–500 ms: begin monitoring for impact.
- >1–2 s: consider moving to background queue or worker.
- >5 s: strongly prefer external worker.

### BackgroundTasks Example

```python
from fastapi import BackgroundTasks

@router.post("/signup")
async def signup(data: SignupIn, bg: BackgroundTasks):
    user = await service.create_user(data)
    bg.add_task(send_welcome_email, user.email)  # fire-and-forget
    return user
```

**Caveat**: If the worker dies before task runs, task is lost. No retry mechanism.

---

## Migrations (Alembic)

### Setup
Use async template:
```bash
alembic init -t async migrations
```

### Conventions
- Migrations must be static and reversible.
- Use descriptive filenames.
- Run migration checks in CI.

### `alembic.ini` snippet
```ini
file_template = %(year)d-%(month).2d-%(day).2d_%(slug)s
```

### Migration Example
```python
def upgrade() -> None:
    op.create_table(
        "user",
        sa.Column("id", sa.Uuid, primary_key=True),
        sa.Column("email", sa.String(255), unique=True, nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )

def downgrade() -> None:
    op.drop_table("user")
```

---

## Testing — Full Pattern

### Async Client Fixture

```python
import pytest
from httpx import AsyncClient, ASGITransport
from src.main import app

@pytest.fixture
async def client():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac
```

### Dependency Overrides

```python
from src.auth.dependencies import parse_jwt_data
from src.main import app

def fake_user():
    return {"user_id": "00000000-0000-0000-0000-000000000001"}

@pytest.fixture(autouse=True)
def _override_auth():
    app.dependency_overrides[parse_jwt_data] = fake_user
    yield
    app.dependency_overrides.clear()
```

### Integration Testing
- Prefer real DBs (testcontainers, ephemeral schema) over mocks.
- Mock/production divergence eventually causes production failures.
- Do NOT use unmaintained test clients (e.g., `async_asgi_testclient`).
