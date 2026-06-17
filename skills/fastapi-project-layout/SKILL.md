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

## Enterprise (5+ domains, 20+ tables)

When any directory exceeds ~10 files, evolve to domain-isolated structure:

```
src/
│
├── main.py                          # FastAPI 启动入口（挂载 lifespan + 全局异常 Handler）
│
├── core/                            # 全局基础设施（纯技术驱动，无业务逻辑）
│   ├── config.py                    # Settings 按域拆分（Db/Auth/App）+ Pydantic-Settings
│   ├── db.py                        # SQLAlchemy 2.0 AsyncEngine + async_sessionmaker
│   ├── redis.py                     # Redis 异步连接池初始化与生命周期
│   ├── security.py                  # PyJWT 签名/解密 + Argon2id 密码哈希
│   ├── lifespan.py                  # 启动预热 + 关闭销毁
│   └── logging.py                   # 统一日志（Trace ID 全链路追踪）
│
├── common/                          # 全域共享能力下沉（⭐ 禁止向上引用 domains）
│   ├── exceptions/                  # 全局异常基类
│   │   ├── base.py                  #   DomainError 根异常
│   │   └── business.py              #   通用业务异常（40000 参数错误、50000 系统崩溃）
│   ├── responses/                   # 统一响应契约
│   │   ├── response_model.py        #   对齐前端状态码的统一泛型 JSON 包装
│   │   └── pagination.py            #   高并发分页元数据包装器
│   ├── constants/                   # 全局静态常量（如 TRACE_ID_HEADER）
│   ├── enums/                       # 全局通用底层枚举（如 StatusEnum: ENABLE/DISABLE）
│   ├── utils/                       # 纯工具函数（时间格式化、雪花算法 ID 生成）
│   └── types.py                     # 全局类型定义/别名
│
├── middleware/                      # 全局 HTTP 中间件流水线
│   ├── trace.py                     # Trace ID 全链路注入
│   ├── request_log.py               # 请求入参采样与耗时监控
│   └── access_log.py                # 安全审计与访问日志
│
├── integrations/                    # 外部系统集成（防腐层 ACL，面向接口编程）
│   ├── storage/                     # 存储抽象层
│   │   ├── base.py                  #   StorageClient 抽象基类（upload/delete 契约）
│   │   ├── minio.py                 #   MinIO 驱动实现
│   │   └── oss.py                   #   阿里云 OSS 驱动实现
│   ├── message/                     # 消息/通知抽象层
│   │   ├── base.py                  #   NotificationClient 抽象基类
│   │   ├── email.py                 #   邮件发送实现
│   │   └── sms.py                   #   短信网关实现
│   ├── kafka/                       # Kafka 异步事件发布器封装
│   ├── elasticsearch/               # ES 全文检索客户端封装
│   └── llm/                         # 统一大模型调用客户端封装
│
├── domains/                         # 核心业务领域层（横向严格物理隔离）
│   │
│   ├── auth/                        # 认证域
│   │   ├── router.py
│   │   ├── dependencies.py
│   │   ├── models.py
│   │   ├── schemas.py
│   │   ├── repository.py
│   │   ├── service.py
│   │   ├── exceptions.py
│   │   └── constants.py
│   │
│   ├── identity/                    # 身份与权限域
│   │   ├── router.py
│   │   ├── dependencies.py
│   │   ├── models.py
│   │   ├── schemas.py
│   │   ├── repository.py
│   │   ├── service.py
│   │   ├── exceptions.py
│   │   └── constants.py
│   │
│   ├── users/                       # 用户主数据域
│   │   ├── router.py
│   │   ├── dependencies.py
│   │   ├── models.py
│   │   ├── schemas.py
│   │   ├── repository.py
│   │   └── service.py
│   │
│   └── ...                          # 更多域
│
├── tasks/                           # 异步与后台任务体系（与 domains 平级）
│   ├── scheduler/                   # 定时任务 (如 APScheduler)
│   ├── celery/                      # Celery Worker 异步任务定义
│   └── consumers/                   # Kafka/RabbitMQ 消息流消费者
│
├── scripts/                         # 运维与初始化脚本
│   ├── seed_data.py                 # 幂等种子数据（Lifespan 阶段自动触发）
│   └── init_admin.py                # 初始化超级管理员脚本
│
├── migrations/                      # Alembic 异步迁移空间
│   ├── env.py
│   └── versions/
│
├── tests/                           # 自动化测试（全线覆盖，Mock 掉外部网络）
│   ├── conftest.py                  # httpx.AsyncClient 测试脚手架
│   ├── auth/
│   ├── identity/
│   └── ...
│
├── pyproject.toml
├── alembic.ini
├── Dockerfile                       # 多阶段构建（严禁带 --reload）
└── .env                             # 本地调试变量（生产环境由 CI/CD 注入）
```

### Enterprise 结构关键规则

| 层 | 职责 | 禁令 |
|---|---|---|
| `core/` | 纯技术基础设施 | 禁止引用 `domains/` 任何代码 |
| `common/` | 全域共享能力下沉 | 禁止向上引用 `domains/` 任何代码 |
| `middleware/` | 全局 HTTP 流水线 | 禁止包含业务逻辑 |
| `integrations/` | 外部系统防腐层（ACL） | 必须面向接口编程，有 `base.py` 抽象 |
| `domains/` | 核心业务领域 | 域间仅允许 Service 互调，禁止 ORM 级关联 |
| `tasks/` | 异步/后台任务 | 向下注入 `domain.service`，不含业务逻辑 |

## Domain Isolation — 跨域 ORM 解耦

**红线：禁止不同 domain 之间做 ORM 级别的 `relationship` 强关联。**

### 痛点

矩阵式 RBAC 中，`identity` 和 `users` 强相关。贪图方便在 `identity/models.py` 里写：

```python
# ❌ 灾难 — ORM 级跨域关联
from domains.users.models import User

class Role(Base):
    users = relationship("User", secondary="role_user")  # 循环依赖，切不开
```

后果：ORM 模型层循环引用，未来拆微服务时根本切不开。

### 正确做法

联合关联表只记录 `user_id` (Integer) 作为逻辑外键，查询时通过 Service 调用换取用户信息：

```python
# ✅ identity/models.py — 只记录逻辑外键
class RoleUser(Base):
    __tablename__ = "role_user"
    role_id: Mapped[int] = mapped_column(ForeignKey("role.id"))
    user_id: Mapped[int] = mapped_column(ForeignKey("user.id"))  # 逻辑外键，无 relationship

# ✅ identity/service.py — 通过 Service 调用获取用户信息
class IdentityService:
    def __init__(self, repo: IdentityRepo, user_service: UserService):
        self.repo = repo
        self.user_service = user_service

    async def get_role_users(self, role_id: int) -> list[UserBrief]:
        user_ids = await self.repo.get_user_ids_by_role(role_id)
        return await self.user_service.get_brief_by_ids(user_ids)  # Service 互调
```

### 域间通信规则

| 通信方式 | 适用场景 | 示例 |
|---|---|---|
| Service 互调（本地） | 同进程、低延迟 | `identity_service` 调 `user_service.get_brief_by_ids()` |
| RPC/gRPC | 跨进程、需强类型 | 拆微服务后的域间调用 |
| 事件驱动（Kafka） | 最终一致性、解耦 | 用户创建 → 发布事件 → identity 监听建权限 |

**原则**：模型层绝对孤立是微服务演进的前提。

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
| Top-level `utils/` | Becomes a junk drawer. Put pure functions in `common/utils/` or close to usage site. |
| Top-level `constants/` | Enums and constants belong to their domain. Global ones go in `common/`. |
| Top-level `cache/` | Caching is a Service-layer concern. Use `core/redis.py` as thin helper. |
| Top-level `seed/` | Seeds are scripts. Put under `scripts/`. |
| Cross-domain ORM `relationship` | Creates circular import; prevents microservice extraction. Use logical FK + Service call. |
| Empty directories on day 1 | Create directories when you have files to put in them, not in anticipation. |
