import { RouterPaths } from '@/routerPaths'

/** 直接回首页（整理页返回等场景） */
export function navigateToHome(fallbackUrl = RouterPaths.home) {
  uni.reLaunch({ url: fallbackUrl })
}

/** 有历史则返回，否则回首页（OAuth 直进、redirectTo 后栈为空时） */
export function navigateBackOrHome(delta = 1, fallbackUrl = RouterPaths.home) {
  const pages = getCurrentPages()
  if (pages.length > delta) {
    uni.navigateBack({ delta })
    return
  }
  uni.reLaunch({ url: fallbackUrl })
}

function isHomePageRoute(route: string) {
  const normalized = route.replace(/^\//, '')
  return normalized === 'pages/index' || normalized.startsWith('pages/index/')
}

/**
 * 进入整理页：栈底保留首页，其上仅 setup。
 * - 已在首页：navigateTo
 * - 仅一层中间页：redirectTo 替换
 * - 多层中间页：先 navigateBack 回首页再 navigateTo
 */
export function navigateToJieduSetup() {
  const url = RouterPaths.jieduSetup
  const pages = getCurrentPages()

  if (pages.length <= 1) {
    uni.navigateTo({ url })
    return
  }

  let homeIdx = -1
  for (let i = 0; i < pages.length; i++) {
    const route = (pages[i] as UniApp.PageInstance).route ?? ''
    if (isHomePageRoute(route)) {
      homeIdx = i
      break
    }
  }

  if (homeIdx === -1) {
    uni.redirectTo({ url })
    return
  }

  const deltaToHome = pages.length - 1 - homeIdx
  if (deltaToHome <= 0) {
    uni.navigateTo({ url })
    return
  }

  if (deltaToHome === 1) {
    uni.redirectTo({ url })
    return
  }

  uni.navigateBack({
    delta: deltaToHome,
    success: () => {
      uni.navigateTo({ url })
    },
    fail: () => {
      uni.redirectTo({ url })
    },
  })
}
