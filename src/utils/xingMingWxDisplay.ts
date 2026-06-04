import wuxingColor from '@/utils/wuxing.js'

/** 姓名学六格五行展示（与老 liugeDetail getColorImg 一致，走 wuxing 表） */
export function getWuxingDisplay(wx?: string) {
  const info = wuxingColor.getWuxingColorInfo(wx ?? '')
  return {
    color: info.color || '#333',
    img: info.img ? `/static/bazi/fortune/${info.img}` : '',
  }
}
