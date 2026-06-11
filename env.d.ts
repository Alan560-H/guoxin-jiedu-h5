/// <reference types="vite/client" />

interface ImportMetaEnv {
    /** 微信公众号 AppId：开发用测试号，生产用正式号（见 .env.*） */
    readonly VITE_WX_APP_ID: string
    /** 仅开发：固定 OAuth redirect_uri（如 ngrok），生产构建不得设置 */
    readonly VITE_OAUTH_REDIRECT_URI?: string
}

interface ImportMeta {
    readonly env: ImportMetaEnv
}
