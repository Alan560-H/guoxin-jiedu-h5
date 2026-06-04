export interface ResponseData<T = any> {
  code: number
  data: T
  msg?: string
}
