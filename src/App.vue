<script setup lang="ts">
import { onLaunch, onShow } from '@dcloudio/uni-app'
import { scheduleMarkAppEmbeddedWebView } from '@/utils/appWebView'

function applyWebViewLayout() {
  // #ifdef H5
  scheduleMarkAppEmbeddedWebView()
  // #endif
}

onLaunch(() => {
  applyWebViewLayout()
})

onShow(() => {
  applyWebViewLayout()
})
</script>

<style lang="scss">
@import "uview-pro/index.scss";
</style>
