const STATIC_BASE = '/static/assets'

/** 静态资源路径统一入口，避免在页面中硬编码完整 URL */
export const ImageConfig = {
  static(path: string) {
    return `${STATIC_BASE}/${path.replace(/^\//, '')}`
  },
  directionIcons: `${STATIC_BASE}/direction-icons.svg`,
  xinyuTeacher: `${STATIC_BASE}/xinyu-teacher.svg`,
  ricePaperBg: `${STATIC_BASE}/rice-paper-bg.svg`,
  chatLandscape: `${STATIC_BASE}/chat-landscape.svg`,
  buttonCloud: `${STATIC_BASE}/button-cloud.svg`,
  icon(name: string) {
    return `${this.directionIcons}#icon-${name}`
  },
} as const
