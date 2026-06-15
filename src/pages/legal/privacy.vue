<script setup lang="ts">
import GxNavBar from '@/components/guoxin/GxNavBar.vue'

const ALIYUN_BAILIAN_TERMS_URL = 'https://terms.alicdn.com/legal-agreement/terms/common_platform_service/20230728213935489/20230728213935489.html'

function openAliyunBailianTerms() {
  // #ifdef H5
  if (typeof window !== 'undefined')
    window.open(ALIYUN_BAILIAN_TERMS_URL, '_blank', 'noopener,noreferrer')
  // #endif
}
</script>

<template>
  <view class="gx-page flex_column legal-page">
    <GxNavBar title="隐私协议" :show-back="true" />

    <scroll-view scroll-y class="gx-scroll">
      <view class="legal-content">
        <view class="legal-title">国心解读隐私协议</view>
        <view class="legal-meta">生效日期：2026年6月9日</view>
        <view class="legal-meta">个人信息处理者：武汉洞烛本命咨询文化有限公司</view>

        <view class="legal-card highlight-card">
          <view class="section-title">重要提示</view>
          <view class="paragraph">“国心解读”是一项结合东方文化视角、心理分析表达和生活建议参考的 AI 解读服务。您提交的档案信息、关注方向和问题内容，可能会用于生成 AI 解读结果。AI 生成技术服务提供方为阿里云百炼。</view>
          <view class="paragraph">请您不要提交与本服务无关的敏感信息。涉及子女、亲友或其他第三方信息时，请确保已取得合法授权或具备相应监护、管理权限。</view>
        </view>

        <view class="legal-card">
          <view class="section-title">一、适用范围</view>
          <view class="paragraph">本隐私协议适用于武汉洞烛本命咨询文化有限公司通过微信公众号、H5 页面或其他官方入口向您提供的国心解读服务。</view>
          <view class="paragraph">本协议说明我们如何收集、使用、存储、共享、保护您的个人信息，以及您如何行使查询、更正、删除、撤回同意、注销账号等权利。</view>
        </view>

        <view class="legal-card">
          <view class="section-title">二、我们收集的信息</view>
          <view class="paragraph">1. 登录与账号信息：手机号码、短信验证码校验结果、登录状态；如通过微信公众号使用，可能涉及微信 OpenID、UnionID、头像昵称等授权信息，具体以微信授权页面和实际接入为准。</view>
          <view class="paragraph">2. 心语档案信息：档案名称、与您的关系、性别、出生日期、出生时间、出生地、历法类型、真太阳时选项、已完成解读次数、最近解读时间等。</view>
          <view class="paragraph">3. 解读交互信息：您选择的关注方向、输入的问题、确认的档案信息、快速预览、深度整理状态、完整解读内容、历史解读记录等。</view>
          <view class="paragraph">4. 权益与订单信息：权益商品名称、价格、原价、可使用次数、有效期、订单编号、支付状态、权益消耗记录。支付过程可能由微信支付等第三方支付渠道完成，我们通常不会收集您的银行卡号、支付密码等完整支付账户信息。</view>
          <view class="paragraph">5. 设备与日志信息：设备型号、操作系统、浏览器类型、网络状态、IP 地址、访问时间、页面点击、错误日志、服务异常日志等，用于保障服务安全、排查故障和优化体验。</view>
          <view class="paragraph">6. 本地存储信息：为保持登录状态、字号设置、心语档案、解读记录和测试体验，H5 页面可能使用 localStorage、sessionStorage 或类似本地存储能力。</view>
        </view>

        <view class="legal-card">
          <view class="section-title">三、我们如何使用信息</view>
          <view class="paragraph">我们会基于以下目的使用您的信息：完成账号登录与身份验证；创建、编辑和展示心语档案；生成快速预览、深度整理和完整解读；保存解读记录；展示剩余解读次数和权益消耗；处理订单、支付和售后；提供客服支持；保障系统安全；优化页面、适老化体验和服务质量；履行法律法规要求。</view>
          <view class="paragraph">如我们拟将信息用于本协议未载明的其他目的，或将基于特定目的收集的信息用于其他目的，我们会依法再次取得您的同意。</view>
        </view>

        <view class="legal-card">
          <view class="section-title">四、AI 处理与阿里云百炼</view>
          <view class="paragraph">为向您生成解读内容，我们可能将必要的心语档案信息、关注方向、用户问题和上下文提示提交给阿里云百炼模型服务进行处理。阿里云百炼作为 AI 模型技术服务提供方，根据我们的服务请求返回生成结果。</view>
          <view class="paragraph">我们会尽量遵循最小必要原则，只提交生成解读所需的信息。请您避免在问题中主动输入身份证号、银行卡号、详细住址、病历、精确财产信息、账号密码等与解读无关的敏感内容。详情可参考<text class="link-text" @tap="openAliyunBailianTerms">阿里云百炼服务协议</text>。</view>
          <view class="paragraph">AI 生成结果可能存在不准确、不完整或表达偏差。生成内容仅供传统文化学习、交流陪伴和生活参考，不作为医疗、投资、法律或重大人生决策依据。</view>
        </view>

        <view class="legal-card">
          <view class="section-title">五、敏感信息与第三方信息</view>
          <view class="paragraph">您的出生日期、出生时间、出生地、家庭关系、健康作息、情绪状态、子女关系等信息，可能具有较强个人属性，部分场景下可能构成敏感个人信息或具有敏感属性的信息。我们仅在实现心语档案和解读服务所必需的范围内处理。</view>
          <view class="paragraph">如您为未成年人、子女、父母、配偶或亲友创建档案，应确保具有合法授权或监护权限。涉及不满十四周岁儿童个人信息的，应由其监护人同意并在必要范围内提供。</view>
          <view class="paragraph">您可以选择不提供部分信息，但可能导致无法创建档案、无法生成相应解读或无法使用部分功能。</view>
        </view>

        <view class="legal-card">
          <view class="section-title">六、共享、委托处理与第三方服务</view>
          <view class="paragraph">我们不会出售您的个人信息。为实现服务功能，我们可能在必要范围内向以下第三方共享或委托处理信息：阿里云百炼等 AI 模型服务提供方；短信验证码服务商；云服务器、存储、网络安全服务商；微信开放平台、微信公众号能力和微信支付等支付渠道；依法要求的信息接收方。</view>
          <view class="paragraph">我们会要求合作方按照法律法规、本协议以及双方约定处理信息，并采取必要的安全保护措施。若第三方具有独立隐私政策或服务规则，您还应阅读并遵守其规则。</view>
          <view class="paragraph">除依法披露、取得您单独同意、保护用户或公共安全、维护合法权益等情形外，我们不会公开披露您的个人信息。</view>
        </view>

        <view class="legal-card">
          <view class="section-title">七、存储期限与存储地点</view>
          <view class="paragraph">我们将在实现本协议所述目的所必需的最短期限内保存您的个人信息。心语档案和解读记录通常会在您使用账号期间保存，以便您查看和管理；您删除档案或申请删除相关信息后，我们会依法删除或匿名化处理，但法律法规另有要求的除外。</view>
          <view class="paragraph">我们在中华人民共和国境内收集和产生的个人信息原则上存储在境内。如因业务发展确需跨境提供，我们将依法履行相应程序并征得您的单独同意或满足法律规定条件。</view>
        </view>

        <view class="legal-card">
          <view class="section-title">八、信息安全</view>
          <view class="paragraph">我们会采取合理可行的安全措施保护您的个人信息，包括访问控制、权限管理、日志审计、传输保护、数据备份、异常监控等。互联网环境并非绝对安全，我们会尽力防止信息泄露、毁损、丢失或被非法使用。</view>
          <view class="paragraph">如发生个人信息安全事件，我们将依法采取补救措施，并在必要时通过页面提示、公告、站内通知、短信或其他合理方式告知您。</view>
        </view>

        <view class="legal-card">
          <view class="section-title">九、您的权利</view>
          <view class="paragraph">您有权依法查询、复制、更正、补充、删除您的个人信息，有权撤回授权同意、注销账号、限制或拒绝部分处理活动，并有权对自动化处理或 AI 生成结果提出疑问、投诉或反馈。</view>
          <view class="paragraph">您可以通过产品页面功能自行编辑或删除心语档案，也可以通过国心解读微信公众号内客服入口或页面客服入口联系我们处理。为保障账号安全，我们可能需要验证您的身份后再响应相关请求。</view>
          <view class="paragraph">请理解，撤回同意或删除必要信息后，可能导致部分或全部服务无法继续使用；但不会影响撤回前基于您同意已经进行的个人信息处理活动的效力。</view>
        </view>

        <view class="legal-card">
          <view class="section-title">十、未成年人保护</view>
          <view class="paragraph">国心解读主要面向成年人使用。未成年人应在监护人同意和指导下使用本服务。监护人如发现未成年人未经同意使用本服务或提交个人信息，可通过客服入口联系我们处理。</view>
        </view>

        <view class="legal-card">
          <view class="section-title">十一、协议更新</view>
          <view class="paragraph">我们可能根据法律法规、监管要求、产品功能、阿里云百炼等第三方服务变化更新本隐私协议。更新后，我们会在页面展示最新版本；涉及个人信息处理目的、方式、种类、保存期限、共享对象等重大变化的，我们会以弹窗、页面提示或其他合理方式再次告知并依法征得您的同意。</view>
        </view>

        <view class="legal-card">
          <view class="section-title">十二、联系我们</view>
          <view class="paragraph">个人信息处理者：武汉洞烛本命咨询文化有限公司。</view>
          <view class="paragraph">联系渠道：国心解读微信公众号内客服入口或页面客服入口。</view>
          <view class="paragraph">联系邮箱：liuerdi@sunlands.com；联系电话：17612756386。</view>
          <view class="paragraph">我们将在核验身份后尽快处理您的请求。对于复杂请求或法律法规允许延长处理期限的情形，我们会向您说明原因。</view>
        </view>

        <view class="legal-tip">请您在提交档案和问题前确认信息来源合法、内容必要，并理解 AI 生成内容仅供参考。</view>
      </view>
    </scroll-view>
  </view>
</template>

<style scoped lang="scss">
.legal-page {
  min-height: 100vh;
  background:
    url("@/static/assets/rice-paper-bg.svg") center / cover no-repeat,
    linear-gradient(140deg, rgba(255, 252, 244, 0.95), rgba(249, 239, 220, 0.9)),
    #FCF5E9;
}

.legal-content {
  padding: 32rpx 28rpx 56rpx;
  box-sizing: border-box;
}

.legal-title {
  font-family: "Noto Serif SC", Georgia, serif;
  font-size: 40rpx;
  font-weight: 900;
  color: #153F33;
  line-height: 1.35;
  margin-bottom: 16rpx;
}

.legal-meta {
  font-size: 24rpx;
  color: #665B4E;
  line-height: 1.7;
}

.legal-card {
  margin-top: 24rpx;
  padding: 28rpx;
  border-radius: 24rpx;
  border: 2rpx solid rgba(185, 148, 95, 0.3);
  background: linear-gradient(180deg, rgba(255, 253, 247, 0.95), rgba(251, 244, 231, 0.9));
  box-shadow: 0 6rpx 16rpx rgba(74, 49, 21, 0.06);
  box-sizing: border-box;
}

.highlight-card {
  border-color: rgba(21, 63, 51, 0.42);
  background: linear-gradient(180deg, rgba(238, 243, 234, 0.92), rgba(252, 245, 233, 0.94));
}

.section-title {
  font-family: "Noto Serif SC", Georgia, serif;
  font-size: 30rpx;
  font-weight: 900;
  color: #153F33;
  margin-bottom: 18rpx;
  line-height: 1.35;
}

.paragraph {
  font-size: 27rpx;
  line-height: 1.85;
  color: #241F19;
  margin-top: 14rpx;

  .link-text {
    color: #153F33;
    font-weight: 700;
    text-decoration: underline;
  }
}

.legal-tip {
  margin-top: 28rpx;
  padding: 24rpx;
  border-left: 6rpx solid #B9945F;
  background: rgba(238, 243, 234, 0.8);
  color: #665B4E;
  font-size: 25rpx;
  line-height: 1.75;
  border-radius: 16rpx;
}
</style>
