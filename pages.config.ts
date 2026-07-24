import { defineUniPages } from '@uni-helper/vite-plugin-uni-pages'

function guoxinPage(path: string, title: string) {
  return {
    path,
    type: 'page' as const,
    layout: 'guoxin',
    style: { navigationBarTitleText: title },
  }
}

export default defineUniPages({
  pages: [
    {
      path: 'pages/index',
      type: 'home',
      layout: 'guoxinChat',
      style: { navigationBarTitleText: '国心解读' },
    },
    guoxinPage('pages/profile/list', '我的心语档案'),
    guoxinPage('pages/profile/create', '创建心语档案'),
    {
      path: 'pages/jiedu/setup',
      type: 'page' as const,
      layout: 'guoxinChat',
      style: { navigationBarTitleText: '心语老师' },
    },
    {
      path: 'pages/jiedu/chat',
      type: 'page' as const,
      layout: 'guoxinChat',
      style: { navigationBarTitleText: '国心解读' },
    },
    {
      path: 'pages/mine/index',
      type: 'page' as const,
      layout: 'guoxinChat',
      style: { navigationBarTitleText: '我的' },
    },
    {
      path: 'pages/users/index',
      type: 'page' as const,
      layout: 'guoxinChat',
      style: { navigationBarTitleText: '八字用户' },
    },
    {
      path: 'pages/invite/accept',
      type: 'page' as const,
      layout: 'guoxinChat',
      style: { navigationBarTitleText: '好友邀请' },
    },
    guoxinPage('pages/jiedu/processing', '正在整理'),
    guoxinPage('pages/jiedu/complete', '解读已完成'),
    {
      path: 'pages/jiedu/detail',
      type: 'page' as const,
      layout: 'guoxinReport',
      style: { navigationBarTitleText: '专属解读详情' },
    },
    {
      path: 'pages/credits/index',
      type: 'page' as const,
      layout: 'guoxinChat',
      style: { navigationBarTitleText: '解读权益' },
    },
    {
      path: 'pages/credits/member',
      type: 'page' as const,
      layout: 'guoxinChat',
      style: { navigationBarTitleText: '会员详情' },
    },
    {
      path: 'pages/credits/paid',
      type: 'page' as const,
      layout: 'guoxinChat',
      style: { navigationBarTitleText: '开通成功' },
    },
    guoxinPage('pages/legal/service', '用户服务协议'),
    guoxinPage('pages/legal/privacy', '隐私协议'),
  ],
  globalStyle: {
    backgroundColor: '#fae5e2',
    navigationBarBackgroundColor: '#1E3F35',
    navigationBarTextStyle: 'white',
    navigationBarTitleText: '国心解读 H5',
    navigationStyle: 'custom',
  },
  subPackages: [],
})
