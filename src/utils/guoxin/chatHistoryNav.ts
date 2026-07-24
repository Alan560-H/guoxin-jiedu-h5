/** 从开聊返回首页时，避免 onShow 立刻因有历史再踢回开聊 */
let skipAutoEnterChat = false

export function setSkipAutoEnterChat(skip: boolean) {
  skipAutoEnterChat = skip
}

export function shouldSkipAutoEnterChat() {
  return skipAutoEnterChat
}
