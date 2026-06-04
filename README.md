# 国心解读 H5

基于 uni-app 3 + Vue 3 + uView-Pro 的微信公众号 H5 基础框架。

## 技术栈

- uni-app 3、Vue 3 Composition API
- uView-Pro、Pinia（persist）、UnoCSS
- 包管理：pnpm；H5 开发端口 **9999**

## 项目结构

```text
src/
├── api/
│   ├── env.ts              # 环境与微信配置
│   ├── http.interceptor.ts # HTTP 拦截器
│   └── weixin.ts           # 微信 JSSDK / OAuth / 支付 API
├── models/
│   ├── responseData.ts
│   └── weixin.ts
├── pages/
│   ├── index.vue           # 首页（OAuth / 支付联调入口）
│   └── http/http.vue       # HTTP 测试页
├── stores/
│   └── userInfoStore.ts    # 登录态（apph5Token / apph5UserInfo）
└── utils/weixin/
    ├── env.ts              # 微信环境检测、OAuth URL
    ├── font.ts             # 微信字体修复
    ├── jssdk.ts            # wx.config 初始化
    ├── oauth.ts            # 网页授权登录
    └── pay.ts              # chooseWXPay 支付
```

## 快速开始

```bash
pnpm install
pnpm dev        # H5 开发，http://localhost:9999
pnpm build:h5   # H5 构建
```

## 微信配置

在 [`src/api/env.ts`](src/api/env.ts) 中配置：

| 字段 | 说明 |
|------|------|
| `wxAppId` | 公众号 AppID |
| `wxOAuthRedirectUri` | 授权回调地址（留空则使用当前页 origin + pathname） |
| `wxOAuthScope` | `snsapi_userinfo` 或 `snsapi_base` |
| `wxJssdkSignPath` | JSSDK 签名接口，默认 `/app/wx/jssdk/sign` |
| `wxOAuthLoginPath` | OAuth 换 token，默认 `/app/wx/oauth/login` |
| `wxPayCreatePath` | 创建支付订单，默认 `/app/wx/pay/create` |

### 后端接口约定

**JSSDK 签名** `GET /app/wx/jssdk/sign?url={encodeURIComponent(当前页URL不含hash)}`

响应 `data`：`{ appId, timestamp, nonceStr, signature }`

**OAuth 登录** `POST /app/wx/oauth/login` body: `{ code }`

响应 `data`：`{ token, userInfo? }`

**创建支付** `POST /app/wx/pay/create` body: `{ orderId, amount?, description? }`

响应 `data`：`{ timeStamp, nonceStr, package, signType, paySign }`

### 公众号后台配置

- **网页授权域名**：与 H5 部署域名一致
- **JS 接口安全域名**：同上
- 开发期可用内网穿透域名，并在 `wxOAuthRedirectUri` 中填写对应地址

### 联调说明

- JSSDK / OAuth / 支付需在**微信内置浏览器**且域名已配置时才能完整验证
- PC Chrome 可访问页面，但微信能力会提示「请在微信内打开」
- 首页提供「微信授权登录」「测试支付」按钮用于联调

## 路由

页面清单以 [`pages.config.ts`](pages.config.ts) 为唯一来源，**勿手改** `src/pages.json`（由 vite-plugin-uni-pages 生成）。

## 参考原型

[`guoxin-jiedu-h5/`](guoxin-jiedu-h5/) 目录为静态 HTML 产品原型，供 UI/交互参考。
