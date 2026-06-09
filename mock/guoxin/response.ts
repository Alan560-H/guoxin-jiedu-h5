import type { ResponseData } from '../../src/models/responseData'

export function ok<T>(data: T, msg = 'success'): ResponseData<T> {
  return { code: 200, data, msg }
}

export function fail(code: number, msg: string): ResponseData<null> {
  return { code, data: null, msg }
}
