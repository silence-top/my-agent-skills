# Reference: Advanced Topics

## Redis

### Setup in Lifespan

```python
import redis.asyncio as redis

@asynccontextmanager
async def lifespan(app: FastAPI):
    app.state.redis = redis.Redis(host="localhost", port=6379, decode_responses=True)
    yield
    await app.state.redis.close()
```

### Use Cases
- **Caching**: cache-aside pattern with TTLs; plan invalidation strategy.
- **Distributed locks**: prevent concurrent processing across workers.
- **Rate limiting**: sliding window counters.
- **Pub/Sub**: real-time event distribution.
- **Session storage**: shared sessions across workers.

### Design Notes
- Monitor memory usage and slow commands (`SLOWLOG GET`).
- Use key namespacing: `app:domain:entity:id`.
- Set TTLs on all cache keys to prevent unbounded growth.

---

## WebSocket

### Connection Manager

```python
class ConnectionManager:
    def __init__(self):
        self.active: dict[str, WebSocket] = {}

    async def connect(self, websocket: WebSocket, client_id: str):
        await websocket.accept()
        self.active[client_id] = websocket

    async def disconnect(self, client_id: str):
        self.active.pop(client_id, None)

    async def send_personal(self, client_id: str, data: dict):
        if ws := self.active.get(client_id):
            await ws.send_json(data)

    async def broadcast(self, data: dict):
        for ws in self.active.values():
            await ws.send_json(data)
```

### Guidelines
- Implement heartbeat and timeout to avoid stale connections and memory leaks.
- Clean up on disconnect (including unexpected disconnects).
- Use `try/finally` in WebSocket handlers to guarantee cleanup.

```python
@router.websocket("/ws/{client_id}")
async def websocket_endpoint(websocket: WebSocket, client_id: str):
    await manager.connect(websocket, client_id)
    try:
        while True:
            data = await websocket.receive_json()
            await manager.broadcast(data)
    except WebSocketDisconnect:
        pass
    finally:
        await manager.disconnect(client_id)
```

---

## Pagination

### Cursor-based (preferred for large datasets)

```python
@router.get("/items")
async def list_items(
    cursor: str | None = None,
    limit: int = Query(default=20, le=100),
):
    items = await repo.list(cursor=cursor, limit=limit + 1)
    has_more = len(items) > limit
    return {
        "items": items[:limit],
        "next_cursor": items[-1].id if has_more else None,
    }
```

### Guidelines
- Prefer cursor-based over offset-based for large datasets (avoids OFFSET performance degradation).
- Provide sensible `limit` defaults and maximums.
- Implement pagination at the SQL layer for performance.
- Offset-based is acceptable for small, admin-facing datasets.

---

## File Upload

### Streaming Upload (memory-safe)

```python
from fastapi import UploadFile

@router.post("/upload")
async def upload_file(file: UploadFile):
    async with aiofiles.open(f"uploads/{file.filename}", "wb") as f:
        while chunk := await file.read(8192):
            await f.write(chunk)
    return {"filename": file.filename}
```

### Guidelines
- Enforce upload size limits at ingress (nginx/ingress controller) AND application layers.
- For large files (>10MB), use direct-to-object-storage uploads with **presigned URLs** (S3, GCS).
- Use streaming (`UploadFile.read(chunk_size)`) to avoid loading entire files into memory.
- Validate file types and extensions server-side.

---

## StreamingResponse

### File Download

```python
from fastapi.responses import StreamingResponse

async def iter_file(path: str):
    async with aiofiles.open(path, "rb") as f:
        while chunk := await f.read(8192):
            yield chunk

@router.get("/download/{filename}")
async def download(filename: str):
    path = f"uploads/{filename}"
    return StreamingResponse(
        iter_file(path),
        media_type="application/octet-stream",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )
```

### Server-Sent Events (SSE)

```python
async def event_stream():
    for i in range(10):
        yield f"data: {json.dumps({'event': 'update', 'id': i})}\n\n"
        await asyncio.sleep(1)

@router.get("/events")
async def events():
    return StreamingResponse(event_stream(), media_type="text/event-stream")
```

### Use Cases
- File downloads, SSE, streaming LLM outputs, large CSV exports.

---

## API Documentation

### Hide Docs Outside Selected Environments

```python
from fastapi import FastAPI
from src.config import settings

SHOW_DOCS_IN = {"local", "staging"}
app_kwargs = {"title": "My API"}
if settings.ENVIRONMENT not in SHOW_DOCS_IN:
    app_kwargs["openapi_url"] = None  # disables /docs and /redoc

app = FastAPI(**app_kwargs)
```

### Document Endpoints Fully

```python
@router.post(
    "/items",
    response_model=ItemResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create an item",
    description="Creates a new item with the given payload. Requires authentication.",
    responses={
        401: {"description": "Unauthorized"},
        409: {"description": "Item with same name already exists"},
    },
)
async def create_item(payload: ItemCreate):
    ...
```

---

## Error Handling (RFC 9457) — Full Pattern

### Standard Error Response

```json
{
  "type": "https://example.com/probs/out-of-credit",
  "title": "You do not have enough credit.",
  "status": 403,
  "detail": "Your current balance is 30, but that costs 50.",
  "instance": "/account/12345/msgs/abc"
}
```

### Custom Exception Hierarchy

```python
class APIError(Exception):
    def __init__(self, type_: str, title: str, status_code: int = 400, detail: str | None = None):
        self.type = type_
        self.title = title
        self.status_code = status_code
        self.detail = detail

class NotFoundError(APIError):
    def __init__(self, resource: str, id: str):
        super().__init__(
            type_="https://errors.example.com/not-found",
            title=f"{resource} not found",
            status_code=404,
            detail=f"{resource} with id {id} does not exist",
        )

class ConflictError(APIError):
    def __init__(self, detail: str):
        super().__init__(
            type_="https://errors.example.com/conflict",
            title="Resource conflict",
            status_code=409,
            detail=detail,
        )
```

### Global Handler

```python
from fastapi.responses import JSONResponse

@app.exception_handler(APIError)
async def api_error_handler(request: Request, exc: APIError):
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "type": exc.type,
            "title": exc.title,
            "status": exc.status_code,
            "detail": exc.detail,
            "instance": str(request.url),
        },
    )
```

### Guidelines
- Catch specific exceptions rather than `Exception`.
- Classify external dependency errors and log context for debugging.
- Use structured error codes for client-side handling.

---

## Logging — Full Pattern

### Structured Logging with Request ID

```python
import logging
import structlog
from uuid import uuid4

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

### Guidelines
- Never use `print()` in production code.
- Include `request_id`, `user_id`, and relevant context in every log line.
- Integrate with Sentry, Datadog, or ELK for error and performance monitoring.
- Use appropriate log levels: `DEBUG`, `INFO`, `WARNING`, `ERROR`, `CRITICAL`.
