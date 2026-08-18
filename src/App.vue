<script setup lang="ts">
import { onLaunch, onShow } from '@dcloudio/uni-app'
import { scheduleMarkAppEmbeddedWebView } from '@/utils/appWebView'
import { ensureH5RouterBasePath } from '@/utils/guoxin/h5RouterBase'
import { refreshShowPayFromApi } from '@/utils/guoxin/showPay'
import { fixWeixinFontsizeByWxOS } from '@/utils/weixin/font'

function applyWebViewLayout() {
  // #ifdef H5
  ensureH5RouterBasePath()
  scheduleMarkAppEmbeddedWebView()
  // #endif
}

function initWeixinOnH5() {
  // #ifdef H5
  fixWeixinFontsizeByWxOS()
  // #endif
}

onLaunch(() => {
  applyWebViewLayout()
  initWeixinOnH5()
  void refreshShowPayFromApi()
})

onShow(() => {
  applyWebViewLayout()
  void refreshShowPayFromApi()
})
</script>

<style lang="scss">
@import "uview-pro/index.scss";
</style>
