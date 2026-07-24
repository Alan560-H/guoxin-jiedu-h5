<script setup lang="ts">
import type { ChatComposerAttachment, StreamChatFile } from '@/models/guoxin/chat'
import type { DifyUploadResult } from '@/models/guoxin/dify'
import { ref, watch } from 'vue'
import { uploadDifyFile } from '@/api/dify'
import { buildStreamChatFiles } from '@/models/guoxin/chat'

const props = defineProps<{
  modelValue?: string
  placeholder?: string
  disabled?: boolean
  /** 是否展示选图；首页发问不带图，默认 true */
  allowAttach?: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
  'submit': []
  'attachment': [payload: ChatComposerAttachment | null]
}>()

const draft = ref(props.modelValue || '')
const previewPath = ref('')
const uploading = ref(false)

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

/** 上传响应优先用 source_url（后端真实字段） */
function resolveRemoteUrl(data: DifyUploadResult): string {
  return String(
    data.source_url
    || data.preview_url
    || data.original_url
    || data.url
    || '',
  ).trim()
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
      void uploadPicked(path)
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

    const remoteUrl = resolveRemoteUrl(res.data)
    if (!remoteUrl)
      throw new Error('上传成功但未返回可用地址')

    const files = buildStreamChatFiles(remoteUrl)
    const file = files[0] as StreamChatFile
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
        v-if="allowAttach !== false"
        class="composer-attach"
        :class="{ disabled: disabled || uploading }"
        @tap="onPickImage"
      >
        图
      </view>
      <input
        class="composer-input"
        :value="draft"
        :disabled="disabled"
        :placeholder="placeholder || '输入你的问题'"
        confirm-type="send"
        @input="onInput"
        @confirm="onSubmit"
      >
      <view
        class="composer-send"
        :class="{ disabled: disabled || uploading }"
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
  font-size: 28rpx;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  &.disabled {
    opacity: 0.45;
  }
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
  width: 96rpx;
  height: 96rpx;
  border-radius: 50%;
  background: linear-gradient(154deg, var(--gx-chat-red, #b43a3d), var(--gx-chat-red-deep, #7f1f26));
  color: #fffdf7;
  font-size: 26rpx;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 8rpx 20rpx rgba(127, 31, 38, 0.28);

  &.disabled {
    opacity: 0.45;
  }
}
</style>
