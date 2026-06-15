# Anti-Pattern Matrix

Check every diff against this table before outputting code. Each entry is a real failure mode observed in agent-generated FastAPI code.

## Severity

| Level | Meaning |
|---|---|
| **CRITICAL** | Data loss, security breach, or production outage |
| **HIGH** | Runtime errors, deadlocks, or silent incorrect behavior |
| **MEDIUM** | Maintenance burden, tech debt, or edge-case fragility |
| **LOW** | Style/deprecation; no immediate runtime impact |

## Table

| # | Anti-pattern | Severity | Why | Fix |
|---|---|---|---|---|
| 1 | `requests.get()` in `async def` | **CRITICAL** | `requests` is sync; blocks entire event loop | `httpx.AsyncClient` or `run_in_threadpool` |
| 2 | `time.sleep()` in `async def` | **CRITICAL** | Halts all concurrent connections | `await asyncio.sleep()` |
| 3 | Sync DB driver in `async def` | **CRITICAL** | Blocks loop; may deadlock pool under load | `AsyncSession` + `asyncpg`/`aiosqlite` |
| 4 | Breaking change in existing API version | **CRITICAL** | Clients break silently with no migration path | Fork to `/api/v2/`, mark v1 `deprecated=True` |
| 5 | `db.commit()` in Router | **HIGH** | Breaks transaction boundary discipline | `session.begin()` in Service |
| 6 | Broad `except Exception:` | **HIGH** | Hides bugs, turns 500s into silent 200s | Catch specific exceptions |
| 7 | `Field(ge=18, default=None)` | **HIGH** | Constraint contradicts default | Make required or optional — pick one |
| 8 | `HTTPException` in Service layer | **HIGH** | Couples domain logic to HTTP transport | Domain exception + global handler |
| 9 | ORM model leaked to Router | **HIGH** | Breaks layer boundary; tight coupling | Convert to Pydantic schema at Service exit |
| 10 | `GenericRepository[T]` | **HIGH** | Collapses under complex queries; hides business intent | Concrete repo with business methods |
| 11 | `BackgroundTasks` for critical work | **HIGH** | No retry, no durability, dies with worker | Celery/Arq/RQ |
| 12 | `open()` (sync I/O) in `async def` | **HIGH** | Blocks event loop | `aiofiles` |
| 13 | Mutable default `Field(default=[])` | **HIGH** | State leakage across concurrent requests | `Field(default_factory=list)` |
| 14 | Duplicating logic across API versions | **HIGH** | Bug fixes applied N times; easy to miss one | Shared logic in `service/` or `logic/` |
| 15 | `from jose import jwt` | **MEDIUM** | Unmaintained; CVE history | `PyJWT` (`import jwt`) |
| 16 | `async_asgi_testclient` | **MEDIUM** | Unmaintained, incompatible with newer FastAPI | `httpx.AsyncClient` + `ASGITransport` |
| 17 | ABC/Interface for mocking | **MEDIUM** | Over-abstraction in a dynamic language | `unittest.mock` or `dependency_overrides` |
| 18 | Cross-domain deep-path imports | **MEDIUM** | Tight coupling; hard to refactor | `from src.auth import service as auth_service` |
| 19 | One `BaseSettings` for whole app | **MEDIUM** | Every domain reads every var | One per domain |
| 20 | Mocking DB in integration tests | **MEDIUM** | Schema drift fires in prod | Real DB (testcontainers) + `dependency_overrides` |
| 21 | `AsyncClient` created per request | **MEDIUM** | Pool not reused; resource exhaustion | Create in `lifespan`; store on `app.state` |
| 22 | `class Config:` (Pydantic v1) | **LOW** | Deprecated in v2 | `model_config = ConfigDict(...)` |
| 23 | `ConfigDict(json_encoders=...)` | **LOW** | Deprecated in v2 | `@field_serializer` or `PlainSerializer` |
| 24 | `def get_user(id: int = Depends(...))` | **LOW** | Legacy; default-value gotchas | `Annotated[User, Depends(...)]` |
| 25 | Pydantic model + `response_model=` | **LOW** | Double construction (usually negligible) | Return `dict`/ORM row, or drop `response_model` |

## Self-Correction Checklist

- [ ] No sync libs (`requests`, `time`, `open`, sync DB) inside `async def`?
- [ ] Transaction boundaries in Service, not Router?
- [ ] Domain exceptions only in Service; no `HTTPException` there?
- [ ] ORM models never pass Service boundary?
- [ ] No `GenericRepository` — concrete repos with business methods?
- [ ] No ABC written solely for mocking?
- [ ] `Annotated[T, Depends(...)]` for all new DI code?
- [ ] Pydantic v2 syntax (`ConfigDict`, `field_serializer`) throughout?
- [ ] No breaking changes to existing API versions?
- [ ] One `BaseSettings` per domain?
- [ ] Tests use `httpx.AsyncClient` + `ASGITransport`, not deprecated clients?
