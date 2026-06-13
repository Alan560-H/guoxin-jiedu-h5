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
