import type { ServerResponse } from 'node:http'
import type { MockDb } from './db'
import { formatNowTime, formatRecordTitle, generateReportContent } from './report'

function writeEvent(res: ServerResponse, event: string, data: object) {
  res.write(`event: ${event}\n`)
  res.write(`data: ${JSON.stringify(data)}\n\n`)
}

const STEPS = [
  { index: 1, title: '整理档案信息', desc: '正在读取您的关注方向与档案背景。' },
  { index: 2, title: '梳理情绪脉络', desc: '结合生活场景归纳近期心理状态。' },
  { index: 3, title: '生成行动建议', desc: '正在组织可执行的生活与照护建议。' },
  { index: 4, title: '完成报告撰写', desc: '即将为您呈现完整解读内容。' },
]

const DELTAS = ['根据您选择的关注方向，', '心语老师正在为您整理', '适合当前阶段的生活建议…']

export function handleJieduStream(res: ServerResponse, db: MockDb, taskId: string): void {
  const task = db.tasks.get(taskId)
  if (!task) {
    res.statusCode = 200
    res.setHeader('Content-Type', 'text/event-stream')
    writeEvent(res, 'error', { msg: '任务不存在' })
    res.end()
    return
  }

  task.status = 'streaming'
  res.statusCode = 200
  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache')
  res.setHeader('Connection', 'keep-alive')

  let stepIdx = 0
  let deltaIdx = 0

  const stepTimer = setInterval(() => {
    if (stepIdx < STEPS.length) {
      writeEvent(res, 'step', STEPS[stepIdx])
      stepIdx += 1
      return
    }
    clearInterval(stepTimer)

    const deltaTimer = setInterval(() => {
      if (deltaIdx < DELTAS.length) {
        writeEvent(res, 'delta', { text: DELTAS[deltaIdx] })
        deltaIdx += 1
        return
      }
      clearInterval(deltaTimer)

      const profile = db.profiles.find(p => p.id === task.profileId)
      if (!profile) {
        task.status = 'error'
        task.msg = '档案不存在'
        writeEvent(res, 'error', { msg: '档案不存在' })
        res.end()
        return
      }

      const timeStr = formatNowTime()
      const recordId = `r_${Date.now()}`
      const content = generateReportContent(profile, task.directions)

      db.records.unshift({
        id: recordId,
        profileId: profile.id,
        profileName: profile.name,
        title: formatRecordTitle(task.directions),
        time: timeStr,
        directions: task.directions,
        content,
      })
      profile.jieduCount += 1
      profile.lastJieduTime = timeStr
      if (db.credits > 0)
        db.credits -= 1

      task.status = 'done'
      task.recordId = recordId
      writeEvent(res, 'done', { recordId })
      res.end()
    }, 400)
  }, 2500)
}
