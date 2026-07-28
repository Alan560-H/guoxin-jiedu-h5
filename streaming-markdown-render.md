# 流式 Markdown 渲染说明（可直接给另一个 AI）

> 本文描述 AI 聊天里「流式返回 Markdown → 安全 HTML 展示」的完整约定。实现时按本文即可，无需复制源码文件。
>
> 国心实现目录：`src/utils/guoxin/chat/`（分层对齐 ai-im `src/utils/chat/`）。

## 目标

AI 流式返回的是 **Markdown 原文**（可能夹少量 HTML）。前端边收边显示：

1. 先修复流式拆坏 / 粘行的 Markdown（写回 `content`）
2. 展示时再做中文加粗等预处理，渲成安全 HTML
3. 用 `v-html` 挂到助手气泡上（class：`message-text markdown-content`）

---

## 总流程（流式）

1. 网络 SSE / 文本流不断追加到 `fullText`
2. 每次回调前对全文做 **流式 artifact 修复**，得到可显示的 Markdown 字符串
3. 把该字符串写进当前助手消息的 `content`（**累计全文覆盖，禁止按字符打字机切开 Markdown**）
4. UI 用格式化函数把 `content` 转成 HTML（含展示层预处理 + 缓存）
5. `v-html` 注入助手气泡

打字机（按字符 `setInterval`）**仅允许** mock / 空回复兜底短文案；真 SSE 禁止使用。

---

## 模块分层（国心）

| 模块 | 职责 |
|------|------|
| `streamMarkdownRepair.ts` | 修会写回 `content` 的 Markdown |
| `markdownNormalize.ts` | 防御性 normalize（内含 repair） |
| `displayMarkdownPrep.ts` | **仅展示**：临时闭合半截 `**`、代码块外 `**`→`<strong>` |
| `markdownRenderer.ts` | markdown-it + highlight.js |
| `markdownEnhance.ts` | 代码复制按钮、表格外包滚动 |
| `sanitizeAssistantHtml.ts` | DOMPurify |
| `messageHtmlCache.ts` | 流式/历史 HTML 缓存 + `formatChatAnswerHtml` |

---

## 流式修复（写回 content）

对 **累计全文** 按固定顺序执行：

### 1. 噪声与字面量换行

去掉尾部 `done` 等噪声；字面量 `\\n` → 真实 `\n`。

### 2. 表格行被拆碎

`|` 后面紧跟换行，下一行又是同一行的单元格片段 → 合并回一行（用 `| ` 代替 `|\n`），循环直到稳定。

### 3. 引用「注：」被拆开

`\n>\n注：` 这类 → 改成 `\n> 注：`，否则不成 blockquote。

### 4. 「结论」粗体与「喜用神」被拆行

`**结论：…**\n喜用神` → `**结论：…** 喜用神`

### 5. 粗体内单换行

`**…**` 内部若只有单 `\n`（没有空行 `\n\n`）→ 把内部 `\n` 换成空格。

### 6. 粘行有序列表（国心）

- `：1.` / `。2.**` 等 → 在序号前插入换行，使 `1.` 落在行首
- `2.**标题` / `3.给自己` → 列表标记后补空格

### 7. 粘行无序列表（国心）

- `：- 项`、同行多个 `- 项` → 拆到行首（匹配面保持较窄，避免误伤正文 `A - B`）

入口：`repairStreamMarkdownArtifacts(fullText)`。

**要求：**

- 流式 **每个 chunk 回调** 都要用修复后的文本（建议在 SSE 层统一 repair）
- **流结束返回值** 也要用同一套修复
- 页面写入 `content` 时不要再无意义二次 repair（SSE 已修则直接写）
- 避免末尾闪一下未修复内容

**禁止在 repair 里把 `**` 转成 `<strong>`**（那是展示层，否则会污染存储）。

---

## Markdown → HTML（展示时）

对消息 `content` 执行：

1. **规范化**：防御性再跑 repair + trim（兼容历史脏数据）
2. **错误短路**：若整段等于业务错误文案 → 直接输出固定错误 HTML
3. **展示预处理**（不写回 store）：
   - streaming 时：奇数个 `**` 临时闭合，避免半截星号
   - 代码块外：`**…**` → `<strong>…</strong>`（修复 CommonMark 对「」"" 紧贴 `**` 不认强调）
4. **markdown-it** 配置：
   - `html: true`（允许助手里的受信 HTML，如 `<details>`）
   - `linkify: true`
   - `breaks: true`（单换行当换行）
5. **代码高亮**：highlight.js（js / ts / json / python / bash / html / xml / css）；未知语言做 HTML 转义
6. **增强**：每个 `<pre>` 外包复制按钮；每个 `<table>` 外包 `.md-table-wrap`
7. **消毒**：`DOMPurify.sanitize`（需允许 `button` / `class` / `type`）
8. 得到 HTML 字符串，`v-html` 渲染

### 伪代码

```text
raw = streamAccumulatedText
mdText = repairStreamMarkdownArtifacts(raw).trim()
message.content = mdText                    // 仍是 Markdown

normalized = normalize(mdText)              // 防御性 repair
prepared = displayPrep(normalized, streaming)
html = markdownIt.render(prepared)
html = wrapCodeBlocks + wrapTables
html = DOMPurify.sanitize(html)
DOM: v-html = html
```

---

## 流式性能：必须缓存

流式时同一条助手消息 `content` 高频变化。必须缓存：

- 流式：key = `messageId`，value = `{ source: 展示源全文, html }`；source 不变则复用
- 历史：key = `messageId`，全量比对 `source`（勿只用 length+prefix）
- 发送结束 / 切会话 → 清空缓存

---

## UI 交互（事件委托）

不要在 Markdown 里写 `onclick`：

- 点击 Markdown 内的 `img` → 打开图片预览
- 点击 `.copy-code-btn` → 复制同级 `pre` 的纯文本

---

## 实现约束（流式专用）

1. 存储与传输层始终是 **Markdown 字符串**，不要提前存最终 HTML
2. **每个 onChunk 都对累计全文做 repair**，不要只修最后一块
3. 流结束返回值必须与最后一次 onChunk 使用同一套 repair，避免 UI 闪跳
4. 渲染管线固定：`normalize → displayPrep → markdown-it → 增强 → DOMPurify → v-html`
5. 流式必须做「同 id + 同展示源 → 复用 html」缓存
6. XSS：开 `html: true` 后，**输出必须 DOMPurify**
7. **真流式禁止逐字打字机**；打字机仅兜底短文案

---

## 推荐依赖

- `markdown-it`
- `highlight.js`
- `dompurify`

按本文实现即可，不必复制本仓库任何源码文件。
