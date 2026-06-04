import type { MeiHuaPanPayload } from '@/stores/meiHuaStore'
import { RouterPaths } from '@/routerPaths'

/** 梅花排盘详情页 URL（与老项目 `?info=` + JSON 一致，使用 encodeURIComponent） */
export function buildMeiHuaDetailsUrl(payload: MeiHuaPanPayload): string {
  return `${RouterPaths.meiHuaDetails}?info=${encodeURIComponent(JSON.stringify(payload))}`
}
