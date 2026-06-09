import type { IncomingMessage, ServerResponse } from 'node:http'
import type { MockDb, MockProfile } from './db'
import {
  createToken,
  getDefaultMockOpenId,
  maskPhone,
  parseTokenOpenid,
} from './db'
import { CREDIT_PACKAGE_AMOUNTS } from './constants'
import { fail, ok } from './response'
import { handleJieduStream } from './stream'

function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    let body = ''
    req.on('data', chunk => { body += chunk })
    req.on('end', () => resolve(body))
    req.on('error', reject)
  })
}

function parseJson<T>(body: string): T {
  return body ? JSON.parse(body) as T : {} as T
}

function getAuthToken(req: IncomingMessage): string | null {
  const auth = req.headers.authorization || ''
  const m = auth.match(/^Bearer\s+(.+)$/i)
  return m?.[1] ?? null
}

function requireAuth(req: IncomingMessage, db: MockDb): string | null {
  const token = getAuthToken(req)
  if (!token)
    return null
  const openid = parseTokenOpenid(token)
  if (!openid)
    return null
  const user = db.users.find(u => u.openid === openid && u.phone)
  if (!user)
    return null
  return openid
}

function getUserByOpenid(db: MockDb, openid: string) {
  return db.users.find(u => u.openid === openid)
}

function resolveOpenid(body: { openid?: string }): string {
  return body.openid || getDefaultMockOpenId()
}

function sendJson(res: ServerResponse, payload: object, status = 200) {
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  res.end(JSON.stringify(payload))
}

export async function handleGuoxinMock(
  req: IncomingMessage,
  res: ServerResponse,
  db: MockDb,
  pathname: string,
  searchParams: URLSearchParams,
): Promise<boolean> {
  const method = req.method?.toUpperCase() || 'GET'

  // --- Auth ---
  if (method === 'POST' && pathname === '/app/guoxin/auth/wx-session') {
    const body = parseJson<{ openid?: string, wxCode?: string }>(await readBody(req))
    const openid = resolveOpenid(body)
    const user = getUserByOpenid(db, openid)
    if (!user) {
      sendJson(res, ok({ step: 'need_phone', openid }))
      return true
    }
    if (!user.phone) {
      sendJson(res, ok({ step: 'need_phone', openid }))
      return true
    }
    sendJson(res, ok({
      step: 'ready',
      openid,
      token: createToken(openid),
      phoneMasked: maskPhone(user.phone),
    }))
    return true
  }

  if (method === 'POST' && pathname === '/app/guoxin/auth/wx-authorize') {
    const openid = getDefaultMockOpenId()
    if (!getUserByOpenid(db, openid))
      db.users.push({ openid })
    sendJson(res, ok({ openid }))
    return true
  }

  if (method === 'POST' && pathname === '/app/guoxin/auth/sms-code') {
    const body = parseJson<{ phone: string }>(await readBody(req))
    if (!body.phone?.match(/^1[3-9]\d{9}$/)) {
      sendJson(res, fail(4003, '手机号格式不正确'))
      return true
    }
    db.smsCodes.set(body.phone, '1234')
    sendJson(res, ok({ sent: true }))
    return true
  }

  if (method === 'POST' && pathname === '/app/guoxin/auth/bind-phone') {
    const body = parseJson<{ openid: string, phone: string, smsCode: string }>(await readBody(req))
    const expected = db.smsCodes.get(body.phone)
    if (!expected || body.smsCode !== expected) {
      sendJson(res, fail(4003, '验证码错误'))
      return true
    }
    let user = getUserByOpenid(db, body.openid)
    if (!user) {
      user = { openid: body.openid }
      db.users.push(user)
    }
    user.phone = body.phone
    sendJson(res, ok({
      token: createToken(body.openid),
      phoneMasked: maskPhone(body.phone),
    }))
    return true
  }

  // --- Business (require auth) ---
  const authedOpenid = requireAuth(req, db)
  if (!authedOpenid) {
    sendJson(res, fail(4002, '请先登录'))
    return true
  }

  if (method === 'GET' && pathname === '/app/guoxin/profiles') {
    sendJson(res, ok(db.profiles))
    return true
  }

  if (method === 'POST' && pathname === '/app/guoxin/profiles') {
    const dto = parseJson<Record<string, unknown>>(await readBody(req))
    const profile: MockProfile = {
      id: `p_${Date.now()}`,
      ...(dto as Omit<MockProfile, 'id' | 'jieduCount' | 'lastJieduTime'>),
      jieduCount: 0,
      lastJieduTime: '无',
    }
    db.profiles.push(profile)
    sendJson(res, ok(profile))
    return true
  }

  const profileMatch = pathname.match(/^\/app\/guoxin\/profiles\/([^/]+)$/)
  if (profileMatch) {
    const id = profileMatch[1]
    if (method === 'PUT') {
      const dto = parseJson<Record<string, unknown>>(await readBody(req))
      const idx = db.profiles.findIndex(p => p.id === id)
      if (idx === -1) {
        sendJson(res, fail(4004, '档案不存在'))
        return true
      }
      db.profiles[idx] = { ...db.profiles[idx], ...dto }
      sendJson(res, ok(db.profiles[idx]))
      return true
    }
    if (method === 'DELETE') {
      db.profiles = db.profiles.filter(p => p.id !== id)
      db.records = db.records.filter(r => r.profileId !== id)
      sendJson(res, ok(null))
      return true
    }
  }

  if (method === 'GET' && pathname === '/app/guoxin/records') {
    const profileId = searchParams.get('profileId') || ''
    sendJson(res, ok(db.records.filter(r => r.profileId === profileId)))
    return true
  }

  if (method === 'GET' && pathname === '/app/guoxin/records/latest') {
    sendJson(res, ok(db.records[0] ?? null))
    return true
  }

  if (method === 'GET' && pathname === '/app/guoxin/credits') {
    sendJson(res, ok({ credits: db.credits }))
    return true
  }

  if (method === 'POST' && pathname === '/app/guoxin/credits/purchase') {
    const body = parseJson<{ packageId: string }>(await readBody(req))
    const add = CREDIT_PACKAGE_AMOUNTS[body.packageId] ?? 0
    if (add <= 0) {
      sendJson(res, fail(4004, '套餐不存在'))
      return true
    }
    db.credits += add
    sendJson(res, ok({ credits: db.credits }))
    return true
  }

  if (method === 'POST' && pathname === '/app/guoxin/jiedu/create') {
    const body = parseJson<{ profileId: string, directions: string[], userQuestion?: string }>(await readBody(req))
    if (db.credits <= 0) {
      sendJson(res, fail(4001, '解读次数不足'))
      return true
    }
    const taskId = `t_${Date.now()}`
    db.tasks.set(taskId, {
      taskId,
      profileId: body.profileId,
      directions: body.directions,
      userQuestion: body.userQuestion,
      status: 'pending',
    })
    sendJson(res, ok({ taskId }))
    return true
  }

  const taskMatch = pathname.match(/^\/app\/guoxin\/jiedu\/task\/([^/]+)$/)
  if (method === 'GET' && taskMatch) {
    const task = db.tasks.get(taskMatch[1])
    if (!task) {
      sendJson(res, fail(4004, '任务不存在'))
      return true
    }
    sendJson(res, ok({
      status: task.status,
      recordId: task.recordId,
      msg: task.msg,
    }))
    return true
  }

  if (method === 'GET' && pathname === '/app/guoxin/jiedu/stream') {
    const taskId = searchParams.get('taskId') || ''
    handleJieduStream(res, db, taskId)
    return true
  }

  if (method === 'GET' && pathname === '/app/guoxin/jiedu/report') {
    const recordId = searchParams.get('recordId') || ''
    const record = db.records.find(r => r.id === recordId)
    if (!record) {
      sendJson(res, fail(4004, '记录不存在'))
      return true
    }
    sendJson(res, ok(record))
    return true
  }

  sendJson(res, fail(4004, '接口不存在'))
  return true
}
