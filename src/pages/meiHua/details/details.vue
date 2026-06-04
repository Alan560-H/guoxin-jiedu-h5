<script setup lang="ts">
import type { MeiHuaPanPayload } from '@/stores/meiHuaStore'
import { onLoad } from '@dcloudio/uni-app'
import { computed, nextTick, ref } from 'vue'
import { RouterPaths } from '@/routerPaths'
import { CalendarConverter } from '@/utils/meihua/calendarConverterFn.js'
import formatDate from '@/utils/meihua/formatMeiHuaDate'
import { SiZhuInfo } from '@/utils/meihua/siZhuInfo.js'

const calendarConverterFn = new CalendarConverter()
const siZhuInfoFn = new SiZhuInfo()

const ready = ref(false)

const zhugua_img = ref('qianqian')
const zhugua_img_data = ref('qianqian')
const hugua_img = ref('qianqian')
const biangua_img = ref('qianqian')
const zhugua_text = ref('乾为天')
const hugua_text = ref('乾为天')
const biangua_text = ref('乾为天')

const type = ref(1)
const sc = ref(1)
const number1 = ref(1)
const number2 = ref(1)
const gonli = ref('')
const nongli = ref('')
const s = ref(6)
const x = ref(3)
const d = ref(4)
const sizhuArray = ref<string[]>([])
const hasBaoshuCategory = ref(false)
const category = ref<number | string>('')

function goToExplain(guapathKey: string) {
  uni.navigateTo({
    url: `${RouterPaths.meiHuaAboutExplain}?guapath=${encodeURIComponent(guapathKey)}`,
  })
}

/** 四值前两字：天干一行、地支一行 */
const sizhuStems = computed(() =>
  sizhuArray.value.slice(0, 4).map((cell) => {
    const s = String(cell ?? '')
    return s.length ? s.charAt(0) : ''
  }),
)
const sizhuBranches = computed(() =>
  sizhuArray.value.slice(0, 4).map((cell) => {
    const s = String(cell ?? '')
    return s.length >= 2 ? s.charAt(1) : ''
  }),
)
const sizhuKong = computed(() => String(sizhuArray.value[4] ?? '').trim())
const sizhuKongDisplay = computed(() => {
  const k = sizhuKong.value
  if (!k)
    return ''
  if (k.startsWith('('))
    return k
  return `(${k})`
})

/** 动爻红点：自下而上第 d 爻（1–6），对齐本卦图右侧 */
const yaoDotStyle = computed(() => {
  const line = Math.min(6, Math.max(1, d.value))
  const imgRpx = 178
  const segment = imgRpx / 6
  const bottom = (line - 0.5) * segment - 7
  return { bottom: `${bottom}rpx` }
})

onLoad((opts) => {
  const n = formatDate(new Date(), 'Y')
  const month = formatDate(new Date(), 'M')
  const day = formatDate(new Date(), 'D')
  const r = Math.floor((new Date().getHours() + 1) % 24 / 2) + 1
  const o = '子丑寅卯辰巳午未申酉戌亥'.charAt(r - 1)
  const h = new Date(Number(n), Number(month) - 1, Number(day))
  const l = calendarConverterFn.solar2lunar(h) as {
    cDay: string
    cMonth: string
    cYear: string
    lunarMonth: string
    lunarDay: string
  }
  const dSi = siZhuInfoFn.getSiZhu(l.cDay, r) + o
  const c = siZhuInfoFn.getKongWang(l.cDay)
  const f = formatDate(new Date(), 'Y年M月D日 h:m')
  const p = `${l.cYear}年${l.lunarMonth}月${l.lunarDay}日${o}时`
  const mDefault = `${l.cYear} ${l.cMonth} ${l.cDay} ${dSi} (${c}空)`

  let y: MeiHuaPanPayload
  try {
    const raw = opts?.info
    if (raw == null || raw === '')
      throw new Error('missing info')
    y = JSON.parse(decodeURIComponent(String(raw))) as MeiHuaPanPayload
  }
  catch {
    uni.showToast({ title: '参数无效', icon: 'none' })
    setTimeout(() => uni.navigateBack(), 400)
    return
  }

  if (y.category !== undefined && y.category !== null) {
    hasBaoshuCategory.value = true
    category.value = y.category as number
  }

  const sizhuStr = y.sizhu == null ? mDefault : String(y.sizhu)
  sizhuArray.value = siZhuInfoFn.getSiZhuQufen(sizhuStr) as string[]

  s.value = Number(y.sg)
  x.value = Number(y.xg)
  d.value = Number(y.dy)
  type.value = Number(y.type)
  sc.value = y.sc == null ? 1 : Number(y.sc)
  number1.value = y.number1 == null ? 1 : Number(y.number1)
  number2.value = y.number2 == null ? 1 : Number(y.number2)
  gonli.value = y.gonli == null ? f : String(y.gonli)
  nongli.value = y.nongli == null ? p : String(y.nongli)

  const scLabel = `${'子丑寅卯辰巳午未申酉戌亥'.charAt(sc.value - 1)}时`
  let barTitle = '时间起盘'
  if (type.value === 1)
    barTitle = '时间起盘'
  else if (type.value === 2)
    barTitle = '随机起盘'
  else if (type.value === 3)
    barTitle = `报数起盘(${number1.value},${number2.value})`
  else if (type.value === 4)
    barTitle = '指定起盘'
  else if (type.value === 5)
    barTitle = `报数起盘(${number1.value},${number2.value} 加${scLabel})`

  uni.setNavigationBarTitle({ title: barTitle })

  const D = siZhuInfoFn.getMap()
  const S = siZhuInfoFn.getMap64()
  const matrix = [[1, 1, 1], [0, 1, 1], [1, 0, 1], [0, 0, 1], [1, 1, 0], [0, 1, 0], [1, 0, 0], [0, 0, 0]]
  const v = siZhuInfoFn.getZhuGua(matrix, s.value, x.value).split('-')
  const z = siZhuInfoFn.getHuGua(matrix, s.value, x.value).split('-')
  const q = siZhuInfoFn.getBianGua(matrix, s.value, x.value, d.value).split('-')
  const M = D.get(v[0]) + D.get(v[1])
  const j = D.get(z[0]) + D.get(z[1])
  const I = D.get(q[0]) + D.get(q[1])

  zhugua_img.value = M + d.value
  zhugua_img_data.value = M
  hugua_img.value = j
  biangua_img.value = I
  zhugua_text.value = S.get(M) ?? ''
  hugua_text.value = S.get(j) ?? ''
  biangua_text.value = S.get(I) ?? ''

  void nextTick(() => {
    ready.value = true
  })
})
</script>

<template>
  <view v-if="ready" class="content">
    <view class="content-main details-scroll">
      <view class="details-inner">
        <view class="time-stack">
          <view class="time-card">
            <text class="time-card-label">
              公历：
            </text>
            <text class="time-card-value">
              {{ gonli }}
            </text>
          </view>
          <view class="time-card">
            <text class="time-card-label">
              农历：
            </text>
            <text class="time-card-value">
              {{ nongli }}
            </text>
          </view>
          <view class="time-card time-card-sizhu">
            <text class="sizhu-inline-label">
              四值：
            </text>
            <view class="sizhu-body">
              <view class="sizhu-grid">
                <text v-for="(t, i) in sizhuStems" :key="`stem-${i}`" class="sizhu-cell">
                  {{ t }}
                </text>
              </view>
              <view class="sizhu-grid">
                <text v-for="(t, i) in sizhuBranches" :key="`branch-${i}`" class="sizhu-cell">
                  {{ t }}
                </text>
              </view>
            </view>
            <text v-if="sizhuKongDisplay" class="sizhu-kong">
              {{ sizhuKongDisplay }}
            </text>
          </view>
          <view v-if="hasBaoshuCategory" class="time-card">
            <text class="time-card-label">
              课程流派：
            </text>
            <text class="time-card-value">
              {{ category === 1 ? '广元老师' : '朱昱/易谦老师' }}
            </text>
          </view>
        </view>

        <view class="gua-row">
          <view class="gua-col" @click="goToExplain(zhugua_img_data)">
            <text class="gua-tag">
              [本卦]
            </text>
            <view class="gua-img-wrap">
              <image
                class="gua-img"
                :src="`/static/meihua/detail/${zhugua_img}.png`"
                mode="aspectFit"
              />
              <view class="yao-dot" :style="yaoDotStyle" />
            </view>
            <text class="gua-name">
              {{ zhugua_text }}
            </text>
          </view>
          <view class="gua-col" @click="goToExplain(hugua_img)">
            <text class="gua-tag">
              [互卦]
            </text>
            <view class="gua-img-wrap">
              <image
                class="gua-img"
                :src="`/static/meihua/detail/${hugua_img}.png`"
                mode="aspectFit"
              />
            </view>
            <text class="gua-name">
              {{ hugua_text }}
            </text>
          </view>
          <view class="gua-col" @click="goToExplain(biangua_img)">
            <text class="gua-tag">
              [变卦]
            </text>
            <view class="gua-img-wrap">
              <image
                class="gua-img"
                :src="`/static/meihua/detail/${biangua_img}.png`"
                mode="aspectFit"
              />
            </view>
            <text class="gua-name">
              {{ biangua_text }}
            </text>
          </view>
        </view>

        <view class="kind-list">
          <view class="kind-list-item" @click="goToExplain(zhugua_img_data)">
            <view class="kind-list-item-hd">
              <text class="kind-list-text">
                {{ zhugua_text }}
              </text>
              <view class="kind-list-icons">
                <image
                  class="kind-list-gua"
                  :src="`/static/meihua/gua/${zhugua_img_data}.png`"
                  mode="aspectFit"
                />
                <image class="kind-list-arrow" src="/static/gua/arrow_l.png" mode="aspectFit" />
              </view>
            </view>
          </view>
          <view class="kind-list-item" @click="goToExplain(hugua_img)">
            <view class="kind-list-item-hd">
              <text class="kind-list-text">
                {{ hugua_text }}
              </text>
              <view class="kind-list-icons">
                <image
                  class="kind-list-gua"
                  :src="`/static/meihua/gua/${hugua_img}.png`"
                  mode="aspectFit"
                />
                <image class="kind-list-arrow" src="/static/gua/arrow_l.png" mode="aspectFit" />
              </view>
            </view>
          </view>
          <view class="kind-list-item" @click="goToExplain(biangua_img)">
            <view class="kind-list-item-hd">
              <text class="kind-list-text">
                {{ biangua_text }}
              </text>
              <view class="kind-list-icons">
                <image
                  class="kind-list-gua"
                  :src="`/static/meihua/gua/${biangua_img}.png`"
                  mode="aspectFit"
                />
                <image class="kind-list-arrow" src="/static/gua/arrow_l.png" mode="aspectFit" />
              </view>
            </view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<style scoped lang="scss">
.content {
  flex: 1;
  min-height: 0;
  width: 100%;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  background: #fff;
  padding: 28rpx 0 48rpx;
}

.content-main {
  flex: 1;
  min-height: 0;
  width: 100%;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}

.details-scroll {
  padding: 0 28rpx;
}

.details-inner {
  width: 100%;
  max-width: 680rpx;
  margin: 0 auto;
  flex-shrink: 0;
}

.time-stack {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
  margin-bottom: 36rpx;
}

.time-card {
  box-sizing: border-box;
  width: 100%;
  padding: 22rpx 26rpx;
  border: 1rpx solid #d8d8d8;
  border-radius: 12rpx;
  background: #fff;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  align-items: center;
  font-size: 28rpx;
  line-height: 1.45;
}

.time-card-label {
  color: #333;
  flex-shrink: 0;
}

.time-card-value {
  flex: 1;
  min-width: 0;
  color: #111;
  font-size: 28rpx;
}

.time-card-sizhu {
  align-items: flex-start;
  flex-wrap: nowrap;
  gap: 12rpx;
}

.sizhu-inline-label {
  color: #333;
  flex-shrink: 0;
  padding-top: 4rpx;
}

.sizhu-body {
  flex: 1;
  min-width: 0;
}

.sizhu-grid {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  max-width: 360rpx;
}

.sizhu-grid + .sizhu-grid {
  margin-top: 8rpx;
}

.sizhu-cell {
  flex: 1;
  text-align: center;
  font-size: 30rpx;
  color: #111;
  font-weight: 500;
}

.sizhu-kong {
  flex-shrink: 0;
  align-self: center;
  font-size: 26rpx;
  color: #666;
  padding-left: 8rpx;
}

.gua-row {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: flex-start;
  width: 100%;
  padding: 8rpx 0 32rpx;
  box-sizing: border-box;
}

.gua-col {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 0;
  padding: 0 4rpx;
}

.gua-tag {
  font-size: 24rpx;
  color: #888;
  margin-bottom: 12rpx;
}

.gua-img-wrap {
  position: relative;
  width: 178rpx;
  height: 178rpx;
}

.gua-img {
  width: 178rpx;
  height: 178rpx;
  display: block;
}

.yao-dot {
  position: absolute;
  right: -10rpx;
  width: 16rpx;
  height: 16rpx;
  border-radius: 50%;
  background: #e02020;
  box-shadow: 0 0 0 2rpx #fff;
}

.gua-name {
  margin-top: 12rpx;
  font-size: 26rpx;
  color: #111;
  text-align: center;
  line-height: 1.35;
}

.kind-list {
  width: 100%;
  padding: 0;
  box-sizing: border-box;
}

.kind-list-item {
  width: 100%;
  box-sizing: border-box;
  margin-bottom: 20rpx;
  border-radius: 12rpx;
  border: solid 2rpx #d3653c;
  background: #fff;
}

.kind-list-item:last-child {
  margin-bottom: 0;
}

.kind-list-item-hd {
  box-sizing: border-box;
  width: 100%;
  min-height: 72rpx;
  display: flex;
  align-items: center;
  flex-direction: row;
  justify-content: space-between;
  padding: 16rpx 24rpx 16rpx 28rpx;
}

.kind-list-text {
  color: #d3653c;
  font-size: 30rpx;
  flex: 1;
  min-width: 0;
}

.kind-list-icons {
  display: flex;
  flex-direction: row;
  align-items: center;
  flex-shrink: 0;
}

.kind-list-gua {
  width: 44rpx;
  height: 44rpx;
}

.kind-list-arrow {
  width: 36rpx;
  height: 36rpx;
  margin-left: 12rpx;
}
</style>
