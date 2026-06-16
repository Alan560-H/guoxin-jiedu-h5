const CN_DIGITS = ['零', '壹', '贰', '叁', '肆', '伍', '陆', '柒', '捌', '玖', '拾']

export function formatChapterBadge(chapterNum?: string): string {
  if (!chapterNum)
    return '·'
  if (chapterNum === '∞')
    return '∞'
  if (chapterNum === '00')
    return '序'
  const n = Number.parseInt(chapterNum, 10)
  if (!Number.isNaN(n) && n >= 1 && n <= 10)
    return CN_DIGITS[n]
  return chapterNum
}
