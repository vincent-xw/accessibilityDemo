/// <reference path="./types/index.d.ts" />

interface IAppOption {
  globalData: {
    userInfo?: WechatMiniprogram.UserInfo,
    /** 首页切换到服务 Tab 时传递的一次性查询条件。 */
    pendingServiceQuery?: {
      categoryId: 'government' | 'daily-life' | 'travel' | 'culture' | 'all',
      keyword: string,
    },
  }
  userInfoReadyCallback?: WechatMiniprogram.GetUserInfoSuccessCallback,
}
