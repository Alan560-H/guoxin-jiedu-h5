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

见 [`src/api/env.ts`](src/api/env.ts)。OAuth 启动时**仅静默换 code**，不自动跳授权页。

## 原型参考

- 视觉：[`guoxin-prototype/index.html`](guoxin-prototype/index.html)
- 交互：[`guoxin-jiedu-h5/`](guoxin-jiedu-h5/)（app.js）

## 路由

页面清单以 [`pages.config.ts`](pages.config.ts) 为准，勿手改 `src/pages.json`。
