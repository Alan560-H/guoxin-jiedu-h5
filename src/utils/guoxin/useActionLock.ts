import { ref } from 'vue'

/** 防连点：异步操作进行中时忽略重复点击 */
export function useActionLock(initial = false) {
  const locking = ref(initial)

  async function runLocked<T>(task: () => Promise<T> | T): Promise<T | undefined> {
    if (locking.value)
      return undefined
    locking.value = true
    try {
      return await task()
    }
    finally {
      locking.value = false
    }
  }

  return { locking, runLocked }
}
