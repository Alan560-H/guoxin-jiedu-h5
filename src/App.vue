<script setup lang="ts">
import { onLaunch, onShow } from '@dcloudio/uni-app'
import { scheduleMarkAppEmbeddedWebView } from '@/utils/appWebView'
import { fixWeixinFontsizeByWxOS } from '@/utils/weixin/font'
import { handleOAuthOnLaunch } from '@/utils/weixin/oauth'
import { initWxJssdk } from '@/utils/weixin/jssdk'

function applyWebViewLayout() {
  // #ifdef H5
  scheduleMarkAppEmbeddedWebView()
  // #endif
}

async function initWeixinOnH5() {
  // #ifdef H5
  fixWeixinFontsizeByWxOS()
  await handleOAuthOnLaunch()
  await initWxJssdk(['chooseWXPay']).catch(() => {})
  // #endif
}

onLaunch(() => {
  applyWebViewLayout()
  initWeixinOnH5()
})

onShow(() => {
  applyWebViewLayout()
})
</script>

<style lang="scss">
@import "uview-pro/index.scss";
</style>
