# 使用手册

AI Agent Skill 库，为 Cursor、Windsurf、Cline、Qoder 等智能编码工具提供领域专精的架构约束、代码审查和调试能力。

## Skills 一览

### FastAPI 系列

| Skill | 触发场景 | 核心内容 | Token |
|---|---|---|---|
| [fastapi-architecture](skills/fastapi-architecture/SKILL.md) | 编写/修改/重构 FastAPI 代码 | 三层架构规则、异步决策表、异常治理、黄金示例代码 | ~1,940 |
| [fastapi-project-layout](skills/fastapi-project-layout/SKILL.md) | 新建项目、讨论目录结构 | 渐进式目录结构（Small/Enterprise）、域间 ORM 解耦、API 版本边界、反目录模式 | ~2,050 |
| [fastapi-anti-patterns](skills/fastapi-anti-patterns/SKILL.md) | Code Review、审计代码 | 28 条反模式（CRITICAL/HIGH/MEDIUM/LOW）+ 自检清单 | ~1,600 |

三个 skill 可独立加载，也可组合使用。`fastapi-architecture` 的 `description` 字段包含对另外两个的交叉引用。

### 通用工具

| Skill | 触发场景 | 核心内容 | SKILL.md |
|---|---|---|---|
| [git-auto-commit](skills/git-auto-commit/SKILL.md) | 编码任务完成、用户说"提交"/"commit"/"push" | 自动安全审计 + 中文 Conventional Commits + git add/commit/push 全自动 | 46 行 |

### Vue.js 系列

| Skill | 触发场景 | 核心内容 | SKILL.md |
|---|---|---|---|
| [vue-best-practices](skills/vue-best-practices/SKILL.md) | 编写/修改/重构 Vue.js 代码 | Composition API + `<script setup>` + TypeScript 标准工作流，含 4 个必读 reference（reactivity、SFC、data-flow、composables） | 155 行 |
| [vue-debug-guides](skills/vue-debug-guides/SKILL.md) | 排查 Vue 运行时问题 | 按症状索引的 80+ 调试指南，覆盖 reactivity/computed/watcher/component/template/form/lifecycle/SSR/TypeScript 等全部领域 | 203 行 |
| [vue-jsx-best-practices](skills/vue-jsx-best-practices/SKILL.md) | Vue 中使用 JSX | Vue JSX 与 React JSX 的差异（class vs className、插件配置） | 13 行 |
| [vue-options-api-best-practices](skills/vue-options-api-best-practices/SKILL.md) | 项目明确使用 Options API | Options API 的 TypeScript 集成、methods 上下文绑定、生命周期注意事项 | 24 行 |
| [vue-pinia-best-practices](skills/vue-pinia-best-practices/SKILL.md) | Pinia 状态管理 | Store 初始化、解构丢失响应性、setup store 规范、state 持久化 | 22 行 |
| [vue-router-best-practices](skills/vue-router-best-practices/SKILL.md) | Vue Router 路由 | 导航守卫（next() 已废弃）、路由参数变化检测、组件卸载清理 | 24 行 |
| [vue-testing-best-practices](skills/vue-testing-best-practices/SKILL.md) | Vue 测试 | Vitest + Vue Test Utils 单元测试、Playwright E2E、composable 测试、异步组件测试 | 30 行 |

Vue 系列 skill 之间有自动关联：`vue-best-practices` 在检测到 Options API 项目时自动加载 `vue-options-api-best-practices`，检测到 JSX 时自动加载 `vue-jsx-best-practices`。

`git-auto-commit` 是跨项目通用工具，任何技术栈均可使用。

## 快速开始

### 安装

将本仓库克隆到你的 AI 编码工具的 skill 目录中。不同工具的路径不同：

| 工具 | Skill 路径 |
|---|---|
| Qoder | `.qoder/skills/` 或 `~/.qoder/skills/` |
| Cursor | `.cursor/skills/` |
| Cline | `.clinerules/` |

也可直接将 `skills/` 目录下的子文件夹复制到对应工具的 skill/rules 目录中。

工具会根据 SKILL.md 的 `description` 字段自动匹配触发时机。

### FastAPI 使用场景

#### 场景 1：写 FastAPI 代码（最频繁）

只需 `fastapi-architecture` 自动加载即可。它会提供：
- Router / Service / Repository 三层边界约束
- 异步 `async def` vs `def` 决策表
- 异常治理规则（Service 抛领域异常，全局 handler 转 HTTP）
- 黄金示例代码（完整的 schemas → repo → service → router 链路）

#### 场景 2：搭建新项目

`fastapi-project-layout` 会提供：
- Small（1-5 域）和 Enterprise（5+ 域）两套目录结构
- Enterprise 结构包含 `core/`、`common/`、`middleware/`、`integrations/`（ACL 防腐层）、`domains/`、`tasks/` 六大层次
- 何时该从 Small 升级为 Enterprise（阈值：~10 文件）
- 域间 ORM 解耦规则（禁止跨域 `relationship`，用逻辑 FK + Service 互调）
- 不该创建的目录（顶层 `utils/`、跨域 ORM 关联、空目录预建）

#### 场景 3：API 版本迁移

`fastapi-project-layout` 中的版本边界规则：
- 必须版本化：Router + Schema
- 按需版本化：Logic（仅变化部分）
- 永不版本化：Repository / Models / Dependencies / Service
- 逻辑变化的三级应对：方法新增 → 策略注入 → 版本化 logic 子模块

#### 场景 4：Code Review

`fastapi-anti-patterns` 提供 26 条反模式审查表，按严重度分级：
- **CRITICAL**（4 条）：`requests` 阻塞事件循环、sync DB 死锁、API 版本破坏性变更
- **HIGH**（11 条）：`GenericRepository`、Service 中 `HTTPException`、ORM 泄漏到 Router、`db.commit()` 在 Router
- **MEDIUM**（7 条）：`python-jose`、ABC 滥用、全局 Settings、Mock DB
- **LOW**（4 条）：Pydantic v1 语法、`json_encoders`、旧式 `Depends`

#### 场景 5：查完整模式

`fastapi-architecture` 按需加载 `reference/reference.md`（~2,500 token），包含：
- DI 完整链路（多层依赖注入）
- SQLAlchemy Naming Convention
- Unit of Work 事务模式
- httpx 测试 fixture + dependency override
- RFC 9457 异常层级
- `@field_serializer` 用法
- Redis / WebSocket / 分页 / 文件上传 / SSE / structlog 等带陷阱模式

### Git 自动提交

`git-auto-commit` 在编码任务完成或用户说"提交"/"commit"/"push"时自动触发：
1. **安全审计**：扫描 diff 中的密钥/Token/硬编码路径，发现则中止并警告
2. **代码清理**：自动移除 `console.log`、`print()` 等调试残留
3. **中文 Conventional Commits**：自动生成 `feat(ui): 新增大图金字塔层级平滑放大滑动条` 格式
4. **自动执行**：`git add .` → `git commit` → `git push`，无需确认
5. **异常处理**：冲突/鉴权失败时给出明确方案，不盲目重试

### Vue.js 使用场景

#### 场景 1：写 Vue 代码（最频繁）

`vue-best-practices` 自动加载，提供五步工作流：
1. 确认架构（默认 Composition API + `<script setup lang="ts">`）
2. 加载 4 个必读 reference（reactivity / SFC / data-flow / composables）
3. 规划组件边界（拆分条件、功能文件夹布局）
4. 按需加载可选功能（slots / KeepAlive / Teleport / Transition 等 12 个 reference）
5. 功能完成后做性能优化（大列表虚拟化 / v-once / v-memo 等）

#### 场景 2：排查 Vue Bug

`vue-debug-guides` 按症状索引，覆盖 80+ 常见问题：
- **响应性**：ref 不更新、reactive 解构丢失、proxy 身份比较
- **计算属性**：computed 有副作用、条件依赖丢失、数组排序破坏原状态
- **侦听器**：异步竞态、watchEffect 依赖丢失、deep watcher 新旧值相同
- **组件**：子组件未注册、click 不响应、defineExpose 访问
- **模板**：v-if/v-for 优先级、key 属性、动态参数限制
- **表单**：v-model IME 输入法问题、number 修饰符行为、checkbox 提交
- **SSR**：hydration 不匹配、跨请求状态泄漏、平台 API 崩溃
- **TypeScript**：defineProps 类型限制、reactive 泛型、模板 ref null

#### 场景 3：Pinia 状态管理

`vue-pinia-best-practices` 覆盖：
- "getActivePinia was called" 启动错误
- Store 解构破坏响应性（`storeToRefs` 用法）
- Setup Store 必须返回所有 state
- 短时效 filter 用 URL 而非 Pinia

#### 场景 4：Vue Router 路由

`vue-router-best-practices` 覆盖：
- `beforeRouteEnter` 无 `this` 访问（用 `next(vm => ...)`)
- 同路由不同参数不触发 `beforeEnter`（用 watch）
- `next()` 已废弃（直接 return / redirect）
- 导航守卫无限循环

#### 场景 5：Vue 测试

`vue-testing-best-practices` 覆盖：
- Vitest + Vue Test Utils 单测配置
- 黑盒测试（测行为不测实现）
- Composable 测试（helper wrapper 模式）
- 异步组件 + Suspense 测试
- Playwright E2E 推荐

## 设计原则

1. **渐进式披露**：SKILL.md 只放核心规则和索引（<500 行），reference 文件按需加载
2. **防呆 > 教学**：聚焦 agent 不知道的约束和反模式，不教基础 API
3. **刚性 + 务实**：红线不可违反（如"永不阻塞事件循环"），灰线给条件指导
4. **按场景拆分**：写代码、建项目、做审查、排查 Bug 是不同的工作模式，分别对应不同 skill
