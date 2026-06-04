/** 单爻辞条 */
export interface MeiHuaGuaExplainYao {
  index: number
  y: string
  x: string
}

/** 卦辞主体 */
export interface MeiHuaGuaExplainGua {
  m: string
  y: string
  t: string
  x: string
  yong: string
}

/** explain 页使用的数据结构（与 legacy dataList 一致） */
export interface MeiHuaGuaExplainDataList {
  gua: MeiHuaGuaExplainGua
  yao: MeiHuaGuaExplainYao[]
}
