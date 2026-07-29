import type { RecordVo } from '@/models/guoxin/record'

export interface JieduTaskCreateReq {
  profileId: string
  directions: string[]
  userQuestion?: string
}

export interface JieduTaskCreateVo {
  taskId: string
}

export type JieduTaskStatus = 'pending' | 'streaming' | 'done' | 'error'

export interface JieduTaskStatusVo {
  status: JieduTaskStatus
  recordId?: string
  msg?: string
}

export interface StreamStepEvent {
  index: number
  title: string
  desc: string
}

export interface StreamDeltaEvent {
  text: string
}

export interface StreamDoneEvent {
  recordId: string
}

export interface StreamErrorEvent {
  msg: string
}

export type StreamEventType = 'step' | 'delta' | 'done' | 'error'

export interface JieduReportVo extends RecordVo {}
