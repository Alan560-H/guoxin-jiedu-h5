# 国心解读 API 契约（Mock / Java 对照）

Base URL：`/prod-api`  
统一响应：`{ code, data, msg }`，**成功 code 为 200–299**。

## 认证（注册登录一体）

### POST `/app/guoxin/auth/wx-session`

用 openid 或 wxCode 查询会话状态。

请求：
```json
{ "openid": "mock_o_dev", "wxCode": "" }
```

响应：
```json
{
  "code": 200,
  "data": {
    "step": "need_phone",
    "openid": "mock_o_dev"
  }
}
```

`step`：`ready` | `need_phone` | `need_wx_auth`

### POST `/app/guoxin/auth/wx-authorize`

Mock 模拟微信授权，返回 openid。

### POST `/app/guoxin/auth/sms-code`

请求：`{ "phone": "13800138001" }`  
Mock 固定验证码：`1234`

### POST `/app/guoxin/auth/bind-phone`

请求：
```json
{ "openid": "mock_o_dev", "phone": "13800138001", "smsCode": "1234" }
```

响应：
```json
{
  "code": 200,
  "data": {
    "token": "mock_guoxin_mock_o_dev_...",
    "phoneMasked": "138****8001"
  }
}
```

业务接口 Header：`Authorization: Bearer <guoxinToken>`

**勿用 code 401 表示国心未登录**（会触发全局 apph5 登出），使用 **4002**。

## 业务接口

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/app/guoxin/profiles` | 档案列表 |
| POST | `/app/guoxin/profiles` | 创建档案 |
| PUT | `/app/guoxin/profiles/:id` | 更新 |
| DELETE | `/app/guoxin/profiles/:id` | 删除 |
| GET | `/app/guoxin/records?profileId=` | 记录列表 |
| GET | `/app/guoxin/records/latest` | 上次解读 |
| GET | `/app/guoxin/credits` | 剩余次数 |
| POST | `/app/guoxin/credits/purchase` | 购买加次 `{ packageId }`（trial→1, standard→10, family→20） |
| POST | `/app/guoxin/jiedu/create` | 创建任务 |
| GET | `/app/guoxin/jiedu/task/:taskId` | 任务状态 |
| GET | `/app/guoxin/jiedu/stream?taskId=` | SSE |
| GET | `/app/guoxin/jiedu/report?recordId=` | 报告详情 |

### 创建解读

```json
{
  "profileId": "p1",
  "directions": ["家庭关系", "情绪状态"],
  "userQuestion": "最近睡眠不好"
}
```

### SSE 样例

```
event: step
data: {"index":1,"title":"整理档案信息","desc":"..."}

event: delta
data: {"text":"心语老师正在为您整理"}

event: done
data: {"recordId":"r_1710000000000"}
```

## 错误码

| code | 说明 |
|------|------|
| 4002 | 未登录 / token 无效 |
| 4001 | 解读次数不足 |
| 4003 | 手机号或验证码错误 |
| 4004 | 资源不存在 |

## 扣次规则

- `POST /jiedu/create`：仅校验 `credits > 0`，不扣次
- SSE `done`：写记录并 `credits -= 1`

## 开发 Mock

- `.env.development`：`VITE_USE_MOCK=true`
- `VITE_MOCK_OPENID=mock_o_dev`（新用户）或 `mock_o_returning`（已绑手机老用户）
- Postman：`http://localhost:9999/prod-api/app/guoxin/...`
