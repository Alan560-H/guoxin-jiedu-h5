
interface EnvConfig {
  baseUrl: string;
}

interface AppConfig {
  wxAppId: string;
  domain: {
    baseUrl: string;
  };
  dev: EnvConfig;
  prod: EnvConfig;
}

// 第二步：定义配置对象（保持原数据结构不变）
const appConfig: AppConfig = {
  // 微信公众号appId
  wxAppId: 'wx325a13465914e261',

  // 域名地址
  domain: {
    baseUrl: 'https://test.yipuwenhua.com/app-api'
  },
  // 开发环境
  dev: {
    baseUrl:'/prod-api',// 测试/prod-api
    // baseUrl: 'https://care.yipuwenhua.com/prod-api'
  },
  // 生产环境
  prod: {
    baseUrl: '/prod-api'
  }
};

// // 第三步：ES 模块化导出（替代 module.exports）
// export default appConfig;

// 可选：按需导出单个配置项（方便其他文件单独导入）
export const { wxAppId, domain, dev, prod } = appConfig;