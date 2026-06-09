import type { MockProfile } from './db'

export function formatNowTime(): string {
  const now = new Date()
  const pad = (n: number) => n.toString().padStart(2, '0')
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`
}

export function formatRecordTitle(directions: string[]): string {
  const slice = directions.slice(0, 2)
  return slice.length ? `${slice.join('与')}生活解读参考` : '生活解读参考'
}

export function generateReportContent(profile: MockProfile, directions: string[]) {
  const age = new Date().getFullYear() - profile.birthYear
  const isMale = profile.gender === 'male'
  const titleName = isMale ? `${profile.name.substring(0, 2)}先生` : `${profile.name.substring(0, 2)}女士`
  const dirText = directions.join('、')

  return [
    {
      title: '一、本次解读摘要',
      body: `根据您选择的关注方向（${dirText}），心语老师为您整理了生活与心理参考。结合档案信息，${titleName}当前处于需要关照自身节奏的阶段。`,
    },
    {
      title: '二、性格与表达方式',
      body: `${titleName}在家庭中注重责任与分寸，表达关爱时偏含蓄。建议在沟通中多一些耐心倾听，少一些急于给建议。`,
    },
    {
      title: '三、当前阶段状态',
      body: `处于 ${age} 岁这一阶段，宜将生活重心逐步转向自我调养与情绪安顿，减少不必要的焦虑与自责。`,
    },
    {
      title: '四、近期可以尝试的行动建议',
      body: '1. 每日安排 20 分钟静心散步。\n2. 与家人进行一次轻松的家常闲聊。\n3. 保持规律作息，睡前减少屏幕使用。',
    },
    {
      title: '五、温馨提示',
      body: '本篇内容由心语老师结合东方文化观点整理，仅供生活参考，不作为医疗或法律等专业决策依据。',
    },
  ]
}
