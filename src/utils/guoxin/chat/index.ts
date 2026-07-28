/**
 * 国心聊天 Markdown 管线（对齐 ai-im utils/chat 分层）。
 * 存储层：repair 后的 Markdown；展示层：prep → render → enhance → sanitize。
 */

export {
  convertBoldOutsideCode,
  prepareMarkdownForDisplay,
  softenIncompleteEmphasis,
} from '@/utils/guoxin/chat/displayMarkdownPrep'

export {
  wrapCodeBlocksWithCopyButton,
  wrapMarkdownTables,
} from '@/utils/guoxin/chat/markdownEnhance'

export { normalizeMarkdownText } from '@/utils/guoxin/chat/markdownNormalize'

export {
  ERROR_HTML,
  ERROR_TEXT,
  renderAssistantMarkdownHtml,
} from '@/utils/guoxin/chat/markdownRenderer'

export {
  clearChatMarkdownCache,
  formatChatAnswerHtml,
} from '@/utils/guoxin/chat/messageHtmlCache'

export { sanitizeAssistantHtml } from '@/utils/guoxin/chat/sanitizeAssistantHtml'

export {
  repairBrokenNoteBlockquote,
  repairConclusionBoldBeforeXiyongshen,
  repairFragmentedPipeTableRows,
  repairInlineBoldBrokenLines,
  repairJammedFormLabels,
  repairJammedOrderedLists,
  repairJammedUnorderedLists,
  repairListDiscourseBreaks,
  repairStreamMarkdownArtifacts,
  stripChatAnswerNoise,
} from '@/utils/guoxin/chat/streamMarkdownRepair'
