<script setup lang="ts">
import type { ChatComposerAttachment, StreamChatFile } from '@/models/guoxin/chat'
import type { DifyUploadResult } from '@/models/guoxin/dify'
import { computed, ref, watch } from 'vue'
import { uploadDifyFile } from '@/api/dify'
import { buildStreamChatFiles } from '@/models/guoxin/chat'

const props = withDefaults(defineProps<{
  modelValue?: string
  placeholder?: string
  disabled?: boolean
  /** 是否展示选图；首页发问不带图，默认 true */
  allowAttach?: boolean
}>(), {
  allowAttach: true,
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  'submit': []
  'attachment': [payload: ChatComposerAttachment | null]
}>()

const draft = ref(props.modelValue || '')
const previewPath = ref('')
const uploading = ref(false)
const showAttach = computed(() => props.allowAttach !== false)

watch(
  () => props.modelValue,
  (v) => {
    if (v !== draft.value)
      draft.value = v || ''
  },
)

function onInput(e: { detail?: { value?: string } }) {
  const v = e.detail?.value ?? ''
  draft.value = v
  emit('update:modelValue', v)
}

function onSubmit() {
  if (props.disabled || uploading.value)
    return
  emit('submit')
}

function clearAttachment() {
  previewPath.value = ''
  uploading.value = false
  emit('attachment', null)
}

/** 父级发送成功后清空预览 */
function resetAttachment() {
  clearAttachment()
}

defineExpose({ resetAttachment })

const MAX_UPLOAD_BYTES = 5 * 1024 * 1024

function pickUploadFileId(data: DifyUploadResult): string {
  return String(data.id || data.fileId || '').trim()
}

function resolvePickedFileSize(res: UniApp.ChooseImageSuccessCallbackResult, path: string): Promise<number> {
  const fromTemp = Number((res.tempFiles as Array<{ size?: number }> | undefined)?.[0]?.size)
  if (Number.isFinite(fromTemp) && fromTemp > 0)
    return Promise.resolve(fromTemp)

  return new Promise((resolve) => {
    uni.getFileInfo({
      filePath: path,
      success: (info) => resolve(Number(info.size) || 0),
      fail: () => resolve(0),
    })
  })
}

async function onPickImage() {
  if (props.allowAttach === false || props.disabled || uploading.value)
    return

  uni.chooseImage({
    count: 1,
    sizeType: ['compressed'],
    sourceType: ['album', 'camera'],
    success: (res) => {
      const path = res.tempFilePaths?.[0]
      if (!path) {
        uni.showToast({ title: '未选择到图片', icon: 'none' })
        return
      }
      void (async () => {
        const size = await resolvePickedFileSize(res, path)
        if (size > MAX_UPLOAD_BYTES) {
          uni.showToast({ title: '图片不能超过 5MB', icon: 'none' })
          return
        }
        await uploadPicked(path)
      })()
    },
    fail: (err) => {
      if (/cancel|取消/i.test(err.errMsg || ''))
        return
      uni.showToast({ title: '选图失败，请重试', icon: 'none' })
    },
  })
}

async function uploadPicked(localPath: string) {
  previewPath.value = localPath
  uploading.value = true
  emit('attachment', null)

  try {
    const res = await uploadDifyFile(localPath)
    if (res.code !== 200 || !res.data)
      throw new Error(res.msg || '上传失败')

    const uploadFileId = pickUploadFileId(res.data)
    if (!uploadFileId)
      throw new Error('上传成功但未返回文件 ID')

    const files = buildStreamChatFiles(uploadFileId)
    const file = files[0]
    if (!file)
      throw new Error('上传成功但未返回文件 ID')
    emit('attachment', { localPath, file })
  }
  catch (e) {
    previewPath.value = ''
    emit('attachment', null)
    uni.showToast({
      title: e instanceof Error ? e.message : '图片上传失败',
      icon: 'none',
    })
  }
  finally {
    uploading.value = false
  }
}
</script>

<template>
  <view class="composer-wrap">
    <view
      v-if="previewPath"
      class="composer-preview"
    >
      <image
        class="composer-thumb"
        :src="previewPath"
        mode="aspectFill"
      />
      <text class="composer-preview-tip">
        {{ uploading ? '上传中…' : '已附图片' }}
      </text>
      <view
        class="composer-preview-clear"
        @tap="clearAttachment"
      >
        清除
      </view>
    </view>

    <view class="composer">
      <view
        v-if="showAttach"
        class="composer-attach"
        :class="{ disabled: props.disabled || uploading }"
        @tap="onPickImage"
      >
        <view
          class="i-carbon-image composer-attach-icon"
          aria-hidden="true"
        />
      </view>
      <input
        class="composer-input"
        :value="draft"
        :disabled="props.disabled"
        :placeholder="placeholder || '输入你的问题'"
        confirm-type="send"
        @input="onInput"
        @confirm="onSubmit"
      >
      <view
        class="composer-send"
        :class="{ disabled: props.disabled || uploading }"
        @tap="onSubmit"
      >
        发送
      </view>
    </view>
  </view>
</template>

<style scoped lang="scss">
.composer-wrap {
  flex-shrink: 0;
  background: rgba(255, 246, 238, 0.96);
  border-top: 2rpx solid rgba(236, 205, 187, 0.8);
}

.composer-preview {
  display: flex;
  align-items: center;
  gap: 16rpx;
  padding: 16rpx 24rpx 0;
}

.composer-thumb {
  width: 88rpx;
  height: 88rpx;
  border-radius: 16rpx;
  border: 2rpx solid var(--gx-chat-border, #eccdbb);
  background: #fff;
  flex-shrink: 0;
}

.composer-preview-tip {
  flex: 1;
  min-width: 0;
  color: var(--gx-chat-muted, #755d52);
  font-size: 24rpx;
}

.composer-preview-clear {
  flex-shrink: 0;
  padding: 8rpx 16rpx;
  color: var(--gx-chat-red, #b43a3d);
  font-size: 24rpx;
  font-weight: 700;
}

.composer {
  display: flex;
  align-items: center;
  gap: 16rpx;
  padding: 16rpx 24rpx;
  padding-bottom: calc(16rpx + env(safe-area-inset-bottom));
}

.composer-attach {
  width: 72rpx;
  height: 72rpx;
  border-radius: 50%;
  border: 2rpx solid var(--gx-chat-border, #eccdbb);
  background: #fff;
  color: var(--gx-chat-red, #b43a3d);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  &.disabled {
    opacity: 0.45;
  }
}

.composer-attach-icon {
  width: 36rpx;
  height: 36rpx;
  color: var(--gx-chat-red, #b43a3d);
}

.composer-input {
  flex: 1;
  min-width: 0;
  height: 84rpx;
  padding: 0 32rpx;
  border-radius: 999rpx;
  background: #fff;
  border: 2rpx solid var(--gx-chat-border, #eccdbb);
  color: var(--gx-chat-ink, #2b1712);
  font-size: 28rpx;
}

.composer-send {
  width: 84rpx;
  height: 84rpx;
  border-radius: 50%;
  background: linear-gradient(154deg, var(--gx-chat-red, #b43a3d), var(--gx-chat-red-deep, #7f1f26));
  color: #fffdf7;
  font-size: 24rpx;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 6rpx 16rpx rgba(127, 31, 38, 0.24);

  &.disabled {
    opacity: 0.45;
  }
}
</style>
