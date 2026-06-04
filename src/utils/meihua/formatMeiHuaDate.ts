/** 与老 `getDateFn.js` 行为一致：用 Y M D h m s 占位符格式化日期时间（纯 ESM，避免 Vite 对 CJS default 的报错） */

function pad2(n: number): string {
  const e = n.toString()
  return e[1] ? e : `0${e}`
}

export default function formatMeiHuaDate(t: Date, pattern: string): string {
  const r = ['Y', 'M', 'D', 'h', 'm', 's']
  const n = new Date(t)
  const s: string[] = []
  s.push(String(n.getFullYear()))
  s.push(pad2(n.getMonth() + 1))
  s.push(pad2(n.getDate()))
  s.push(pad2(n.getHours()))
  s.push(pad2(n.getMinutes()))
  s.push(pad2(n.getSeconds()))
  let u = pattern
  for (let o = 0; o < s.length; o++)
    u = u.replace(r[o], s[o])
  return u
}
