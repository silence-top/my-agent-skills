# Reference: Architecture Patterns

## Lifespan — Full Pattern

```python
from contextlib import asynccontextmanager
from fastapi import FastAPI
from httpx import AsyncClient

@asynccontextmanager
async def lifespan(app: FastAPI):
    app.state.http_client = AsyncClient(timeout=10.0)
    # app.state.redis = await create_redis()
    yield
    await app.state.http_client.aclose()
    # await app.state.redis.close()

def create_app() -> FastAPI:
    app = FastAPI(lifespan=lifespan)
    # include routers and middleware
    return app
```

**Why**: Centralizes resource lifecycle. Ensures consistent behavior between tests and production. Preferred over scattered `@app.on_event("startup")` handlers.

---

## Settings — Full Pattern

```python
from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict

class AppSettings(BaseSettings):
    model_config = SettingsConfigDict(env_prefix="APP_", extra="ignore")
    DATABASE_URL: str
    JWT_SECRET: str

class AuthSettings(BaseSettings):
    model_config = SettingsConfigDict(env_prefix="AUTH_", extra="ignore")
    JWT_SECRET: str
    JWT_ALG: str = "HS256"
    JWT_EXP_MINUTES: int = 5

@lru_cache()
def get_settings() -> AppSettings:
    return AppSettings()

@lru_cache()
def get_auth_settings() -> AuthSettings:
    return AuthSettings()
```

**Guidelines**:
- Avoid instantiating settings at import time in modules used by tests.
- Use secret managers for production (Vault, AWS Secrets Manager, Azure Key Vault).
- One `BaseSettings` per domain — don't reuse one for the whole app.

---

## Dependency Injection — Deep Dive

### Modern Annotated Style

```python
from typing import Annotated
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from src.database import get_db

router = APIRouter(prefix="/orders", tags=["Orders"])
DBDep = Annotated[AsyncSession, Depends(get_db)]

@router.post("/", response_model=OrderOut, status_code=201)
async def create_order(dto: OrderCreate, db: DBDep):
    repo = OrderRepository(db)
    service = OrderService(db, repo)
    return await service.create_order(dto)
```

### Chainable Dependencies

```python
PostDep = Annotated[dict, Depends(valid_post_id)]

@router.get("/posts/{post_id}")
async def get_post(post: PostDep):
    return post
```

### Rules
- Dependencies are cached per request — same `Depends(x)` runs once per request.
- Prefer `async def` dependencies to avoid threadpool overhead.
- Use chainable dependencies to reuse validation logic across routes.
- `param: Type = Depends(...)` remains supported and acceptable.

---

## Service Layer — Deep Dive

### Responsibilities
- Encapsulate business logic, transaction boundaries, idempotency, retry strategies.
- Expose testable coroutine/function APIs.
- Do NOT handle HTTP concerns (status codes, headers, request objects).

### Example

```python
class OrderService:
    def __init__(self, session: AsyncSession, repo: OrderRepository) -> None:
        self.session = session
        self.repo = repo

    async def create_order(self, dto: OrderCreate):
        # business validation
        if dto.total <= 0:
            raise DomainError("Order total must be positive")
        # transaction boundary at service layer
        async with self.session.begin():
            order = await self.repo.insert(dto)
            await self.repo.deduct_stock(order.items)
            return order
```

---

## Repository Layer — Deep Dive

### Responsibilities
- Data access only: queries, inserts, updates, deletes.
- Provide clear interfaces (`fetch_by_id`, `list`, `insert`, `update`, `delete`).
- Prefer SQL-first aggregation and pagination for heavy queries.
- Use service layer for complex shaping when readability matters.

### Example

```python
class UserRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def fetch_by_id(self, user_id: UUID) -> User | None:
        result = await self.session.execute(
            select(User).where(User.id == user_id)
        )
        return result.scalar_one_or_none()

    async def list_users(self, limit: int = 20, cursor: UUID | None = None) -> list[User]:
        stmt = select(User).order_by(User.id).limit(limit)
        if cursor:
            stmt = stmt.where(User.id > cursor)
        result = await self.session.execute(stmt)
        return list(result.scalars().all())

    async def insert(self, data: UserCreate) -> User:
        user = User(**data.model_dump())
        self.session.add(user)
        await self.session.flush()
        return user
```

---

## Pydantic v2 — Patterns

### Custom Serializer

```python
from pydantic import BaseModel, ConfigDict, field_serializer
from datetime import datetime, timezone

class CustomModel(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    @field_serializer("*", when_used="json", check_fields=False)
    def _serialize_datetimes(self, value):
        if isinstance(value, datetime):
            return value.astimezone(timezone.utc).isoformat()
        return value
```

### Performance-sensitive `response_model`

In high-throughput endpoints, avoid double construction:

```python
@router.get("/user/{id}", response_model=UserOut)
async def get_user(id: UUID):
    row = await repo.fetch_user_row(id)
    return dict(row)  # let FastAPI do a single serialization pass
```

### Guidelines
- Use `field_serializer`, `PlainSerializer`, `ConfigDict` (Pydantic v2 APIs).
- Avoid contradictory fields: `Field(ge=18, default=None)` — choose required or optional explicitly.
- `response_model` overhead is usually negligible; optimize only when measured.

---

## API Versioning — Full Guide

### Directory Layout

```
src/
├── api/
│   ├── v1/
│   │   ├── __init__.py    # v1_router aggregation
│   │   ├── users.py
│   │   └── posts.py
│   └── v2/
│       ├── __init__.py    # v2_router aggregation
│       └── users.py
```

### Rules
- **New endpoint**: add to the latest version.
- **Non-breaking change**: same version (add optional field, new query param).
- **Breaking change**: new version (rename field, change type, remove endpoint).
- **Shared logic**: place in `service/` or `logic/`, not duplicated across versions.
- **Deprecation**: `APIRouter(deprecated=True)` + `Deprecation`/`Sunset` headers.
