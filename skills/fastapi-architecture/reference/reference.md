# Reference: Full Patterns

Patterns that SKILL.md references but does not inline. Read only when you need the full implementation of a specific pattern.

---

## Cross-Domain Service Call — Correct Pattern

When one domain needs data from another domain, NEVER import the other domain's models or repository. Inject the other domain's Service via DI and call it:

```python
# domains/identity/dependencies.py
from typing import Annotated
from fastapi import Depends
from src.database import get_db
from .repository import IdentityRepository
from .service import IdentityService
from domains.users.dependencies import get_user_service
from domains.users.service import UserService

def get_identity_service(
    db: Annotated[AsyncSession, Depends(get_db)],
    user_service: Annotated[UserService, Depends(get_user_service)],
) -> IdentityService:
    repo = IdentityRepository(db)
    return IdentityService(repo, user_service)
```

```python
# domains/identity/service.py
class IdentityService:
    def __init__(self, repo: IdentityRepository, user_service: UserService):
        self.repo = repo
        self.user_service = user_service  # other domain's Service, not its Repo or Model

    async def get_role_users(self, role_id: int) -> list[UserBriefResponse]:
        user_ids = await self.repo.get_user_ids_by_role(role_id)  # only gets IDs
        return await self.user_service.get_brief_by_ids(user_ids)  # Service-to-Service
```

**Rule**: Domain boundaries are Service-to-Service only. Repository and Model never cross domain lines.

---

## Anti-Corruption Layer — Full Integration Pattern

External systems are accessed through abstract contracts + concrete drivers. Domain code never knows which driver is active.

```python
# integrations/storage/base.py
from abc import ABC, abstractmethod

class StorageClient(ABC):
    @abstractmethod
    async def upload(self, key: str, data: bytes, content_type: str = "application/octet-stream") -> str:
        """Returns the public URL or key of the uploaded object."""
        ...

    @abstractmethod
    async def delete(self, key: str) -> None: ...

    @abstractmethod
    async def get_presigned_url(self, key: str, expires_in: int = 3600) -> str: ...

# integrations/storage/minio.py
from minio import Minio
from .base import StorageClient

class MinIOClient(StorageClient):
    def __init__(self, endpoint: str, access_key: str, secret_key: str, bucket: str, secure: bool = True):
        self.client = Minio(endpoint, access_key, secret_key, secure=secure)
        self.bucket = bucket

    async def upload(self, key: str, data: bytes, content_type: str = "application/octet-stream") -> str:
        from io import BytesIO
        self.client.put_object(self.bucket, key, BytesIO(data), len(data), content_type=content_type)
        return key

    async def delete(self, key: str) -> None:
        self.client.remove_object(self.bucket, key)

    async def get_presigned_url(self, key: str, expires_in: int = 3600) -> str:
        from datetime import timedelta
        return self.client.presigned_get_object(self.bucket, key, expires=timedelta(seconds=expires_in))
```

```python
# integrations/storage/dependencies.py
from typing import Annotated
from fastapi import Depends
from src.core.config import get_settings
from .base import StorageClient
from .minio import MinIOClient

def get_storage_client() -> StorageClient:
    s = get_settings()
    return MinIOClient(s.MINIO_ENDPOINT, s.MINIO_ACCESS_KEY, s.MINIO_SECRET_KEY, s.MINIO_BUCKET)

StorageDep = Annotated[StorageClient, Depends(get_storage_client)]
```

```python
# domains/storage/service.py — Domain uses the abstraction, never the concrete driver
from integrations.storage.base import StorageClient

class FileService:
    def __init__(self, repo: FileRepository, storage: StorageClient):
        self.repo = repo
        self.storage = storage

    async def upload_file(self, file_in: FileCreate, data: bytes) -> FileResponse:
        key = await self.storage.upload(f"{file_in.domain}/{file_in.filename}", data)
        metadata = await self.repo.create(file_in, storage_key=key)
        return FileResponse.model_validate(metadata)
```

---

## Dependency Injection — Full Chain

Agent frequently gets multi-layer DI chains wrong. This is the correct pattern:

```python
from typing import Annotated
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from src.database import get_db
from .service import OrderService
from .repository import OrderRepository

router = APIRouter(prefix="/orders", tags=["Orders"])
DBDep = Annotated[AsyncSession, Depends(get_db)]

def get_order_repo(db: DBDep) -> OrderRepository:
    return OrderRepository(db)

def get_order_service(repo: Annotated[OrderRepository, Depends(get_order_repo)]) -> OrderService:
    return OrderService(repo)

OrderServiceDep = Annotated[OrderService, Depends(get_order_service)]

@router.post("/", response_model=OrderOut, status_code=201)
async def create_order(dto: OrderCreate, service: OrderServiceDep):
    return await service.create_order(dto)
```

**Notes**: Dependencies are cached per request. Prefer `async def` deps to avoid threadpool overhead.

---

## Database Naming Conventions

Agent won't guess this project-specific convention:

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

**Table conventions**: `lower_case_snake`, singular names (`user`, `post_like`), consistent FK names.

---

## Transactions (Unit of Work)

```python
# Basic — in Service layer
async with session.begin():
    await repo.insert(...)
    await repo.update(...)

# UoW class — for complex transaction management
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

**Rule**: Transaction boundaries in Service/UoW only — never in Router or Repository. For distributed transactions, prefer Saga over 2PC.

---

## Testing

Agent defaults to `TestClient`. Use this instead:

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

### Dependency Override

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

**Rules**: Prefer real DB (testcontainers) over mocks. Do NOT use `async_asgi_testclient`.

---

## Background Jobs — Thresholds

| Latency | Action |
|---|---|
| >100–500ms | Monitor for impact |
| >1–2s | Consider background queue |
| >5s | Strongly prefer external worker |

`BackgroundTasks` die with the worker. No retry. No durability. Only for fire-and-forget.

---

## Error Handling — RFC 9457 Exception Hierarchy

```python
class APIError(Exception):
    def __init__(self, type_: str, title: str, status_code: int = 400, detail: str | None = None):
        self.type = type_
        self.title = title
        self.status_code = status_code
        self.detail = detail

class NotFoundError(APIError):
    def __init__(self, resource: str, id: str):
        super().__init__(type_="not-found", title=f"{resource} not found",
                         status_code=404, detail=f"{resource} with id {id} does not exist")

@app.exception_handler(APIError)
async def api_error_handler(request: Request, exc: APIError):
    return JSONResponse(status_code=exc.status_code, content={
        "type": exc.type, "title": exc.title, "status": exc.status_code,
        "detail": exc.detail, "instance": str(request.url),
    })
```

---

## Pydantic v2 — field_serializer

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

```python
@router.get("/user/{id}", response_model=UserOut)
async def get_user(id: UUID):
    row = await repo.fetch_user_row(id)
    return dict(row)  # single serialization pass
```

---

## Redis

```python
import redis.asyncio as redis

# In lifespan:
app.state.redis = redis.Redis(host="localhost", port=6379, decode_responses=True)
```

**Use cases**: caching (cache-aside + TTL), distributed locks, rate limiting, pub/sub, session storage. Use key namespacing (`app:domain:entity:id`). Monitor with `SLOWLOG GET`.

---

## WebSocket

```python
class ConnectionManager:
    def __init__(self):
        self.active: dict[str, WebSocket] = {}

    async def connect(self, ws: WebSocket, client_id: str):
        await ws.accept()
        self.active[client_id] = ws

    async def disconnect(self, client_id: str):
        self.active.pop(client_id, None)

@router.websocket("/ws/{client_id}")
async def ws_endpoint(ws: WebSocket, client_id: str):
    await manager.connect(ws, client_id)
    try:
        while True:
            data = await ws.receive_json()
    except WebSocketDisconnect:
        pass
    finally:
        await manager.disconnect(client_id)
```

**Rule**: Implement heartbeat + timeout. Always use `try/finally` for cleanup.

---

## Pagination — Cursor-based

```python
@router.get("/items")
async def list_items(cursor: str | None = None, limit: int = Query(default=20, le=100)):
    items = await repo.list(cursor=cursor, limit=limit + 1)
    has_more = len(items) > limit
    return {"items": items[:limit], "next_cursor": items[-1].id if has_more else None}
```

**Rule**: Prefer cursor-based over offset-based for large datasets. Implement at SQL layer.

---

## File Upload & StreamingResponse

```python
# Upload (streaming, memory-safe)
@router.post("/upload")
async def upload(file: UploadFile):
    async with aiofiles.open(f"uploads/{file.filename}", "wb") as f:
        while chunk := await file.read(8192):
            await f.write(chunk)
    return {"filename": file.filename}

# Download
async def iter_file(path: str):
    async with aiofiles.open(path, "rb") as f:
        while chunk := await f.read(8192):
            yield chunk

@router.get("/download/{filename}")
async def download(filename: str):
    return StreamingResponse(iter_file(f"uploads/{filename}"), media_type="application/octet-stream")
```

**Rules**: Enforce size limits at ingress + app layer. Large files → presigned URLs (S3/GCS).

---

## Logging — structlog + request_id

```python
import structlog

logger = structlog.get_logger()

@app.middleware("http")
async def add_request_id(request: Request, call_next):
    request_id = str(uuid4())
    request.state.request_id = request_id
    structlog.contextvars.bind_contextvars(request_id=request_id)
    response = await call_next(request)
    response.headers["X-Request-Id"] = request_id
    return response
```

**Rules**: Never `print()`. Include `request_id` + `user_id` in every line. Integrate with Sentry/Datadog/ELK.

---

## API Documentation — Hide in Production

```python
SHOW_DOCS_IN = {"local", "staging"}
app_kwargs = {"title": "My API"}
if settings.ENVIRONMENT not in SHOW_DOCS_IN:
    app_kwargs["openapi_url"] = None

app = FastAPI(**app_kwargs)
```

---

## Migrations (Alembic)

```bash
alembic init -t async migrations
```

```ini
# alembic.ini
file_template = %(year)d-%(month).2d-%(day).2d_%(slug)s
```

**Rules**: Migrations must be static and reversible. Run checks in CI.
