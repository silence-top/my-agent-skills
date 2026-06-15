# Anti-Pattern Matrix for AI Agent Code Review

Before outputting or approving any FastAPI code, check every diff against this table. Each entry is a real failure mode observed in agent-generated code.

---

## Severity Definitions

| Severity | Meaning |
|---|---|
| **CRITICAL** | Causes data loss, security breach, or production outage |
| **HIGH** | Causes runtime errors, deadlocks, or silent incorrect behavior |
| **MEDIUM** | Maintenance burden, tech debt, or unreliable under edge cases |
| **LOW** | Style/deprecation concern; no immediate runtime impact |

---

## Anti-Pattern Table

| # | Anti-pattern | Severity | Why it's wrong | Required fix |
|---|---|---|---|---|
| 1 | `requests.get(...)` inside `async def` | **CRITICAL** | `requests` is sync; blocks the entire event loop. All concurrent requests stall. | Use `httpx.AsyncClient` or `await run_in_threadpool(requests.get, ...)`. |
| 2 | `time.sleep()` inside `async def` | **CRITICAL** | Halts all concurrent event loops in the worker. | Replace with `await asyncio.sleep(...)`. |
| 3 | Sync DB driver (`psycopg2`, `sqlite3`) inside `async def` | **CRITICAL** | Blocks the loop; may deadlock the connection pool under load. | Use `AsyncSession` with `asyncpg` or `aiosqlite`. |
| 4 | `db.commit()` inside `router.py` | **HIGH** | Breaks transaction boundary discipline. Routers should not manage DB state. | Move to Service layer using `async with session.begin()`. |
| 5 | Broad `except Exception:` around route body | **HIGH** | Hides `SyntaxError`, `NameError`, and turns 500s into silent 200s. | Catch specific exceptions; let global handler format unknown errors. |
| 6 | `Field(ge=18, default=None)` | **HIGH** | Constraint `ge=18` contradicts `default=None`. Pydantic raises on validation. | Make field required (`Field(ge=18)`) or optional (`Field(default=None)` without constraint). |
| 7 | `from jose import jwt` | **MEDIUM** | `python-jose` maintenance status is uncertain; known CVE history. | Prefer `PyJWT` for new projects: `import jwt`. Evaluate before replacing in existing code. |
| 8 | `from async_asgi_testclient import TestClient` | **MEDIUM** | Unmaintained library; incompatible with newer FastAPI versions. | Use `httpx.AsyncClient` + `ASGITransport`. |
| 9 | `model_config = ConfigDict(json_encoders={...})` | **LOW** | Deprecated in Pydantic v2. Ignored silently. | Use `@field_serializer` or `Annotated[T, PlainSerializer(...)]`. |
| 10 | `def get_user(id: int = Depends(...))` (default-arg form) | **LOW** | Legacy syntax; default-value gotchas when Depends returns falsy. | Prefer `Annotated[User, Depends(...)]`. |
| 11 | `BackgroundTasks` for critical/retry-needed work | **HIGH** | No retry, no durability. Task is lost if worker dies before execution. | Use Celery/Arq/RQ for anything you'd page on. |
| 12 | Returning Pydantic model AND setting `response_model=` | **LOW** | Model may be constructed twice (validate + serialize). Negligible for most apps. | Return `dict`/ORM row and let `response_model` validate, or drop `response_model`. |
| 13 | Importing across domains via deep paths | **MEDIUM** | Tight coupling; hard to refactor. Breaks domain encapsulation. | Use module-level imports: `from src.auth import service as auth_service`. |
| 14 | One `BaseSettings` for the whole app | **MEDIUM** | Every domain reads every env var. Hard to reason about config boundaries. | One `BaseSettings` per domain (`AuthSettings`, `DBSettings`, etc.). |
| 15 | Mocking the DB in integration tests | **MEDIUM** | Mock/prod schema divergence eventually causes production failures. | Use real DB: testcontainers, ephemeral schema, `dependency_overrides`. |
| 16 | Breaking change in existing API version | **CRITICAL** | Clients relying on v1 break silently. No warning, no migration path. | Create `/api/v2/` endpoint. Mark v1 `deprecated=True`. |
| 17 | Duplicating logic across API versions | **HIGH** | Bug fixes must be applied in N places. Easy to miss one. | Put shared logic in `logic/` or `service/`, not in router. |
| 18 | `open()` (sync file I/O) inside `async def` | **HIGH** | Blocks the event loop during disk read/write. | Use `aiofiles` for async file I/O. |
| 19 | Mutable default `Field(default=[])` | **HIGH** | State leakage across concurrent requests in long-lived processes. | Use `Field(default_factory=list)`. |
| 20 | Creating `AsyncClient` per request | **MEDIUM** | Connection pool not reused. High latency and resource exhaustion under load. | Create once in `lifespan`; store on `app.state`. |

---

## Self-Correction Checklist

Before finalizing any FastAPI code output, run through this checklist:

- [ ] No sync libraries (`requests`, `time`, `open`, sync DB drivers) inside `async def`?
- [ ] Transaction boundaries in Service/UoW layer, not in Router?
- [ ] Specific exception catches, no broad `except Exception:`?
- [ ] `Annotated[T, Depends(...)]` used for new DI code?
- [ ] `PyJWT` used instead of `python-jose`?
- [ ] No breaking changes to existing API versions?
- [ ] Shared logic placed in `service/` or `logic/`, not duplicated?
- [ ] `BackgroundTasks` only for non-critical, short-lived tasks?
- [ ] One `BaseSettings` per domain, not one global settings class?
- [ ] Tests use real DB or `ASGITransport`, not deprecated test clients?
