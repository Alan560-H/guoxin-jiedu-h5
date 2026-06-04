import { defineUniPages } from '@uni-helper/vite-plugin-uni-pages'

export default defineUniPages({
  pages: [
    {
      path: 'pages/index',
      type: 'home',
    },
    {
      path: 'pages/http/http',
      type: 'page',
      layout: 'default',
      style: {
        navigationBarTitleText: 'HTTP 测试',
      },
    },
  ],
  globalStyle: {
    backgroundColor: '@bgColor',
    backgroundColorBottom: '@bgColorBottom',
    backgroundColorTop: '@bgColorTop',
    backgroundTextStyle: '@bgTxtStyle',
    navigationBarBackgroundColor: '#000000',
    navigationBarTextStyle: '@navTxtStyle',
    navigationBarTitleText: '国心解读 H5',
    navigationStyle: 'custom',
  },
  subPackages: [],
})
