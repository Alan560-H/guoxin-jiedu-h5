import type { DirectionValue } from '@/constants/guoxin'
import type { ProfileVo } from '@/models/guoxin/profile'
import type { ReportSection } from '@/models/guoxin/record'

export function generateDynamicReportContent(
  profile: ProfileVo,
  directions: DirectionValue[],
): ReportSection[] {
  const age = new Date().getFullYear() - profile.birthYear
  const isMale = profile.gender === 'male'
  const name = profile.name
  const titleName = isMale ? `${name.substring(0, 2)}先生` : `${name.substring(0, 2)}女士`
  const isSelf = profile.relation === 'self'
  const dirText = directions.join('、')

  const contents: ReportSection[] = [
    {
      title: '一、本次解读摘要',
      body: `根据您选择的关注方向（${dirText}），心语老师为您整理了以下关于生活与情绪起伏的宏观观察。结合东方文化中的天人合一思想及现代心理学的投射效应，本篇内容将重点探析您在当前生命周期的内在调节策略。总体来看，这组信息折射出一种“外刚内柔、谋定后动”的心境特征，需要您在节奏把控与家庭情感交互中，多一些顺其自然的包容，少一些刻意苛求的紧张。`,
    },
    {
      title: '二、性格与表达方式',
      body: `根据档案信息，${titleName}在交往与行事风格上体现出东方传统中“温良恭俭”的特质，注重责任与尊严，对家人有强烈的庇护欲。然而，这种守护心强烈的表达方式，有时会转化为默默承受一切压力而不宣之于口，甚至在关心晚辈或伴侣时显得有些含蓄或严厉。在心理层面，这容易造成“内心关怀十分，言语传达三分”的落差。在东方哲学中，最高明的沟通如同“润物细无声”，建议今后在表达关爱时，尝试用温和、倾听的角色代替指导与要求。`,
    },
    {
      title: '三、当前阶段状态',
      body: `处于 ${age} 岁这一阶段的${profile.relationText}，处于一个需要学会“做减法”的生命转折期。结合东方传统对时序循环的认知，这一年龄段恰如白露之后、秋分之前，万物敛藏，心境由向外探索逐步转为向内安顿。此时，容易出现对往日未竟之事的遗憾感，或者对下一代独立后产生的“空巢感”焦虑。这种内在的状态在近期较为明显，需要意识到这是正常的心理阶段转换，而非坏事，主动把生活的重心拉回到自我的兴趣和调养上。`,
    },
  ]

  if (directions.includes('家庭关系') || directions.includes('子女关系')) {
    contents.push({
      title: '四、家庭关系建议',
      body: `在家庭成员的交流中，特别是在处理${isSelf ? '子女及晚辈' : '长辈与同辈'}的关系时，${titleName}需要掌握“适当退位”的艺术。东方伦理重视序齿和尊重，但在日常生活中过于强调规矩会让气氛变硬。建议：\n1. 对年轻一代的选择保持“知而不评、帮而不包”的态度。\n2. 多组织轻松的餐桌家常闲聊，将话题引向当年的传统美食或文化旧事，这能增进家族温情，拉近两代人心灵距离。`,
    })
  }
  else {
    contents.push({
      title: '四、家庭关系建议',
      body: `家庭是心灵最安稳的港湾。对于${titleName}来说，近期在家庭中建议扮演“静观者”的角色，让家人各自承担他们的成长功课，不要因为细枝末节的琐碎小事劳心费神。在沟通时保持温柔的眼神和耐心的倾听，不仅能平复对方的情绪，也会让您自己收获更多宁静。`,
    })
  }

  if (directions.includes('健康作息') || directions.includes('情绪状态')) {
    contents.push({
      title: '五、生活节奏与情绪照护',
      body: `养生之道，首重养心。东方医学提倡“子午觉”与“顺应时序”。${titleName}近期需提防因思虑过度引起的睡眠质量波动或头绪杂乱。建议：\n1. 每日在上午或傍晚安排至少20分钟的静心散步，专注观察大自然的时令变化（如风拂树梢、草木荣枯）。\n2. 睡前两小时减少接触手机等屏幕，可以泡一杯温热的淡茶（如麦冬或大枣茶），舒缓心经脉络。\n3. 在情绪低落或焦躁时，深吸气四秒，呼气六秒，默念“物来顺应，未来不迎”，调节身心共振。`,
    })
  }
  else {
    contents.push({
      title: '五、生活节奏与情绪照护',
      body: `规律的作息是保持情绪饱满的根本。近期建议在清晨起床后进行深呼吸，并在饮食上遵循多温少凉、清淡为主的规律。遇到不顺心的事情，可以用温水擦拭额头，或者写几行大字、抚弄花草来转移思绪，以柔克刚。`,
    })
  }

  contents.push({
    title: '六、近期可以尝试的行动建议',
    body: '1. 【东方微仪式】：挑选一个阳光和煦的早晨，煮一壶家乡的茶，在桌前给久未深聊的家人打个电话，聊聊时令，不谈决策，只道安好。\n2. 【整理心境】：整理一次房间或储物柜，把不再需要的物品妥善断舍离，这一行为在心理学上能起到显著的焦虑净化作用。\n3. 【动静相宜】：找时间出门走走，脚踏实地踩一踩泥土与草地，吸纳自然朝气，有助于提振脾胃心神。',
  })

  contents.push({
    title: '七、温馨提示',
    body: '本篇整理由心语老师结合东方经典文化观点与日常心理沟通技巧倾情输出。人生的美好在于当下的踏实。希望这份解读能如同微风一般，拂去您心头的喧嚣，为您和家人的日常生活带去一份温暖的参考和抚慰。',
  })

  return contents
}

export function formatRecordTitle(directions: DirectionValue[]): string {
  const slice = directions.slice(0, 2)
  return slice.length ? `${slice.join('与')}生活解读参考` : '生活解读参考'
}

export function formatNowTime(): string {
  const now = new Date()
  const pad = (n: number) => n.toString().padStart(2, '0')
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`
}
