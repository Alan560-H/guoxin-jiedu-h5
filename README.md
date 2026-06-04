# 国心解读 H5

基于 uni-app 3 + Vue 3 + uView-Pro 的微信公众号 H5 应用（国心解读 V1 雏形）。

## 快速开始

```bash
pnpm install
pnpm dev        # http://localhost:9999
pnpm build:h5
```

## 功能概览（V1）

- **首页**：开始解读、档案入口、上次解读、字号调节、充值
- **心语档案**：列表、创建（Chip + 下拉表单）
- **解读流程**：选方向 → 模拟整理（~10s）→ 完成概览 → 详情报告
- **解读记录**：按档案查看历史
- **解读权益**：三档套餐 + 微信支付（失败时 mock 演示）
- **数据**：Pinia + `localStorage` 持久化（前端闭环，无后端依赖）

## V1 边界说明

### 当前不做

- 真实 AI / 后端档案与解读 API（见 [`src/api/guoxin.ts`](src/api/guoxin.ts) V2 预留）
- 档案编辑、删除
- 强制登录门禁（国心业务不依赖 `userInfoStore`，OAuth 仅静默换 token）

### 次数与支付

- **扣次时机**：整理完成（`completeJiedu`）时扣 1 次；整理中途离开**不扣次**
- **微信支付**：微信内支付成功才加次；用户**取消支付不加次**
- **演示兜底**：非微信环境或支付接口失败时，弹窗模拟加次（便于本地调试）

### 微信 OAuth

- 启动时**仅**用 URL 中的 `code` 静默换 token，**不会**自动跳转授权页
- 需主动调用 `redirectToWxOAuth()` 的场景（如后续接入登录门禁）由业务自行触发

### 开发调试

- 清空演示数据：浏览器控制台执行 `localStorage.removeItem('guoxin-store')` 后刷新
- 原型对照：HTML 原型整理完成后为弹窗；uni-app 实现为独立「解读已完成」页（`pages/jiedu/complete`）

## 目录结构

```text
src/
├── constants/guoxin.ts      # 关系/方向/时辰/套餐枚举
├── stores/guoxinStore.ts    # 档案、记录、次数
├── utils/guoxin/            # 种子数据、报告生成
├── components/guoxin/       # GxNavBar / Button / Card / Chip
├── layouts/guoxin.vue       # 免责声明 layout
├── pages/
│   ├── index.vue
│   ├── profile/list|create
│   ├── jiedu/setup|processing|complete|detail|records
│   └── credits/index
└── utils/weixin/            # OAuth、JSSDK、支付
```

## 微信配置

见 [`src/api/env.ts`](src/api/env.ts)。OAuth 启动时**仅静默换 code**，不自动跳授权页。国心 V1 业务数据存 `guoxin-store`（localStorage），与登录 token（`apph5Token`）相互独立。

## 原型参考

- 视觉：[`guoxin-prototype/index.html`](guoxin-prototype/index.html)
- 交互：[`guoxin-jiedu-h5/`](guoxin-jiedu-h5/)（app.js）

## 路由

页面清单以 [`pages.config.ts`](pages.config.ts) 为准，勿手改 `src/pages.json`。

## 开发约定

与 Cursor 本地规则（`.cursor/rules/`、`.cursor/skills/`，已加入 `.gitignore`）保持一致，摘要如下：

### 架构原则

- **高内聚**：页面 + store + models + api 按业务模块聚合（如 `guoxinStore` + `pages/jiedu/*`）
- **低耦合**：通过 `RouterPaths`、类型、store 方法交互，避免魔法字符串
- **易扩展**：枚举与配置放 `src/constants/guoxin.ts`，V2 API 预留 `src/api/guoxin.ts`

### 命名与目录

| 类型 | 约定 | 示例 |
|------|------|------|
| TS / 工具文件 | camelCase | `guoxinStore.ts`、`reportGenerator.ts` |
| Vue 组件 | PascalCase | `GxButton.vue` |
| 页面目录 | 小写语义化 | `pages/jiedu/`、`pages/profile/` |
| 代码风格 | ESLint | `pnpm lint` |

### 常用命令

```bash
pnpm dev          # H5 开发 http://localhost:9999
pnpm build:h5     # 生产构建
pnpm type-check   # 类型检查
pnpm lint         # ESLint
```

### Agent 协作口令（在 Cursor 中说）

| 口令 | 行为 |
|------|------|
| （任务结束） | 汇报：本次改动、隐患、建议修改范围 |
| **审查代码** | 按影响面 → 必须修改 → 建议修改 → 可选修改 |
| **提交代码** | 撰写 commit 说明并 **push** 到远程（勿提交密钥、`.cursor`） |

### 新增页面 checklist

1. `src/pages/<模块>/xxx.vue`
2. [`pages.config.ts`](pages.config.ts) 注册（国心页 `layout: 'guoxin'`）
3. [`src/routerPaths.ts`](src/routerPaths.ts) 增加常量
4. 需要时扩展 `guoxinStore` 或 `src/api/guoxin.ts`
