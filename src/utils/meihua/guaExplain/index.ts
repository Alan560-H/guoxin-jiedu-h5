import type { MeiHuaGuaExplainDataList } from './types'

import { dataList as g_difengsheng } from './difengsheng'
import { dataList as g_dihuomingyi } from './dihuomingyi'
import { dataList as g_dileifu } from './dileifu'
import { dataList as g_dishanqian } from './dishanqian'
import { dataList as g_dishuishi } from './dishuishi'
import { dataList as g_ditiantai } from './ditiantai'
import { dataList as g_dizelin } from './dizelin'
import { dataList as g_duiweize } from './duiweize'
import { dataList as g_fengdiguan } from './fengdiguan'
import { dataList as g_fenghuorenjia } from './fenghuorenjia'
import { dataList as g_fengleiyi } from './fengleiyi'
import { dataList as g_fengshanjian } from './fengshanjian'
import { dataList as g_fengshuihuan } from './fengshuihuan'
import { dataList as g_fengzezhongfu } from './fengzezhongfu'
import { dataList as g_genweishan } from './genweishan'
import { dataList as g_huodijin } from './huodijin'
import { dataList as g_huofengding } from './huofengding'
import { dataList as g_huoleishike } from './huoleishike'
import { dataList as g_huosahnlv } from './huosahnlv'
import { dataList as g_huoshanbi } from './huoshanbi'
import { dataList as g_huozekui } from './huozekui'
import { dataList as g_kanweishui } from './kanweishui'
import { dataList as g_kunweidi } from './kunweidi'
import { dataList as g_leidiyu } from './leidiyu'
import { dataList as g_leifengheng } from './leifengheng'
import { dataList as g_leihuofeng } from './leihuofeng'
import { dataList as g_leishanxiaoguo } from './leishanxiaoguo'
import { dataList as g_leishuixie } from './leishuixie'
import { dataList as g_leitiandazhuang } from './leitiandazhuang'
import { dataList as g_leizeguimei } from './leizeguimei'
import { dataList as g_liweihuo } from './liweihuo'
import { dataList as g_qianweitian } from './qianweitian'
import { dataList as g_shandibo } from './shandibo'
import { dataList as g_shandidaxu } from './shandidaxu'
import { dataList as g_shanfenggu } from './shanfenggu'
import { dataList as g_shanleiyi } from './shanleiyi'
import { dataList as g_shanshuimeng } from './shanshuimeng'
import { dataList as g_shanzesun } from './shanzesun'
import { dataList as g_shuidibi } from './shuidibi'
import { dataList as g_shuifengjing } from './shuifengjing'
import { dataList as g_shuihuojiji } from './shuihuojiji'
import { dataList as g_shuihuoweiji } from './shuihuoweiji'
import { dataList as g_shuileizhun } from './shuileizhun'
import { dataList as g_shuishanjian } from './shuishanjian'
import { dataList as g_shuitianxu } from './shuitianxu'
import { dataList as g_shuizejie } from './shuizejie'
import { dataList as g_tiandipi } from './tiandipi'
import { dataList as g_tianfenggou } from './tianfenggou'
import { dataList as g_tianfengxiaoxu } from './tianfengxiaoxu'
import { dataList as g_tianhuodayou } from './tianhuodayou'
import { dataList as g_tianhuotongren } from './tianhuotongren'
import { dataList as g_tianleiwuwang } from './tianleiwuwang'
import { dataList as g_tianshandun } from './tianshandun'
import { dataList as g_tianshuisong } from './tianshuisong'
import { dataList as g_tianzelv } from './tianzelv'
import { dataList as g_xunweifeng } from './xunweifeng'
import { dataList as g_zedicui } from './zedicui'
import { dataList as g_zefengdaguo } from './zefengdaguo'
import { dataList as g_zehuoge } from './zehuoge'
import { dataList as g_zeleisui } from './zeleisui'
import { dataList as g_zeshanxian } from './zeshanxian'
import { dataList as g_zeshuikun } from './zeshuikun'
import { dataList as g_zetianguai } from './zetianguai'
import { dataList as g_zhenweilei } from './zhenweilei'

/** 六十四卦 guapath → 卦爻辞数据 */
export const MEI_HUA_GUA_EXPLAIN: Record<string, MeiHuaGuaExplainDataList> = {
  duidui: g_duiweize,
  duigen: g_zeshanxian,
  duikan: g_zeshuikun,
  duikun: g_zedicui,
  duili: g_zehuoge,
  duiqian: g_zetianguai,
  duixun: g_zefengdaguo,
  duizhen: g_zeleisui,
  gendui: g_shanzesun,
  gengen: g_genweishan,
  genkan: g_shanshuimeng,
  genkun: g_shandibo,
  genli: g_huoshanbi,
  genqian: g_shandidaxu,
  genxun: g_shanfenggu,
  genzhen: g_shanleiyi,
  kandui: g_shuizejie,
  kangen: g_shuishanjian,
  kankan: g_kanweishui,
  kankun: g_shuidibi,
  kanli: g_shuihuojiji,
  kanqian: g_shuitianxu,
  kanxun: g_shuifengjing,
  kanzhen: g_shuileizhun,
  kundui: g_dizelin,
  kungen: g_dishanqian,
  kunkan: g_dishuishi,
  kunkun: g_kunweidi,
  kunli: g_dihuomingyi,
  kunqian: g_ditiantai,
  kunxun: g_difengsheng,
  kunzhen: g_dileifu,
  lidui: g_huozekui,
  ligen: g_huosahnlv,
  likan: g_shuihuoweiji,
  likun: g_huodijin,
  lili: g_liweihuo,
  liqian: g_tianhuodayou,
  lixun: g_huofengding,
  lizhen: g_huoleishike,
  qiandui: g_tianzelv,
  qiangen: g_tianshandun,
  qiankan: g_tianshuisong,
  qiankun: g_tiandipi,
  qianli: g_tianhuotongren,
  qianqian: g_qianweitian,
  qianxun: g_tianfenggou,
  qianzhen: g_tianleiwuwang,
  xundui: g_fengzezhongfu,
  xungen: g_fengshanjian,
  xunkan: g_fengshuihuan,
  xunkun: g_fengdiguan,
  xunli: g_fenghuorenjia,
  xunqian: g_tianfengxiaoxu,
  xunxun: g_xunweifeng,
  xunzhen: g_fengleiyi,
  zhendui: g_leizeguimei,
  zhengen: g_leishanxiaoguo,
  zhenkan: g_leishuixie,
  zhenkun: g_leidiyu,
  zhenli: g_leihuofeng,
  zhenqian: g_leitiandazhuang,
  zhenxun: g_leifengheng,
  zhenzhen: g_zhenweilei,
}

const DEFAULT_PATH = 'qianqian'

/** 将任意入参规范为字典中存在的 guapath（未知则乾为天） */
export function resolveMeihuaGuapath(guapath: string): string {
  return guapath && MEI_HUA_GUA_EXPLAIN[guapath] ? guapath : DEFAULT_PATH
}

export function getMeihuaGuaExplain(guapath: string): MeiHuaGuaExplainDataList {
  const key = resolveMeihuaGuapath(guapath)
  if (key !== guapath && guapath)
    console.warn('[meihua] unknown guapath, fallback:', guapath)
  return MEI_HUA_GUA_EXPLAIN[key]!
}
