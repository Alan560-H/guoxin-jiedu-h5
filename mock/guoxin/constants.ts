/**
 * 与 src/constants/guoxin.ts 中 CREDIT_PACKAGES[].id / amount 保持同步。
 * 修改套餐时请同时更新两处。
 */
export const CREDIT_PACKAGE_AMOUNTS: Record<string, number> = {
  trial: 1,
  standard: 10,
  family: 20,
}
