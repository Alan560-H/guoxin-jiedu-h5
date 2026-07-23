import { defineUniPages } from '@uni-helper/vite-plugin-uni-pages'

const guoxinPage = (path: string, title: string) => ({
  path,
  type: 'page' as const,
  layout: 'guoxin',
  style: { navigationBarTitleText: title },
})

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
    guoxinPage('pages/jiedu/processing', '正在整理'),
    guoxinPage('pages/jiedu/complete', '解读已完成'),
    {
      path: 'pages/jiedu/detail',
      type: 'page' as const,
      layout: 'guoxinReport',
      style: { navigationBarTitleText: '专属解读详情' },
    },
    guoxinPage('pages/credits/index', '解读权益'),
    guoxinPage('pages/legal/service', '用户服务协议'),
    guoxinPage('pages/legal/privacy', '隐私协议'),
  ],
  globalStyle: {
    backgroundColor: '#FAF6EF',
    navigationBarBackgroundColor: '#1E3F35',
    navigationBarTextStyle: 'white',
    navigationBarTitleText: '国心解读 H5',
    navigationStyle: 'custom',
  },
  subPackages: [],
})
