import { serviceCategories, services } from '../../data/services'
import type { ServiceCategoryId } from '../../data/services'
import { loadAccessibilityPreferences } from '../../utils/local-state'

/** 首页展示的推荐服务从共享数据中选取，保证首页与详情信息一致。 */
const featuredServices = services.slice(0, 4)

Page({
  data: {
    keyword: '',
    serviceCategories,
    featuredServices,
    categoryCount: serviceCategories.length,
    featuredServiceCount: featuredServices.length,
    largeText: false,
    highContrast: false,
  },

  /** 页面重新显示时读取用户保存的字号和对比度设置。 */
  onShow() {
    // 每次回到首页都从本地状态读取最新偏好。
    const preferences = loadAccessibilityPreferences()
    this.setData({
      largeText: preferences.largeText,
      highContrast: preferences.highContrast,
    })
  },

  /** 保存搜索框输入，搜索时会原样传给服务列表。 */
  onSearchInput(event: WechatMiniprogram.Input) {
    this.setData({ keyword: event.detail.value })
  },

  /** 把关键词与“全部分类”组合后切换到服务列表。 */
  onSearchTap() {
    // 导航参数放在应用短期状态中，供服务 Tab 首次显示时消费。
    const app = getApp<IAppOption>()
    app.globalData.pendingServiceQuery = {
      categoryId: 'all',
      keyword: this.data.keyword,
    }

    wx.switchTab({ url: '/pages/services/services' })
  },

  /** 选择分类后切换服务 Tab，并清空上一次的关键词。 */
  onCategoryTap(event: WechatMiniprogram.TouchEvent) {
    // 分类 ID 来自页面内固定的服务分类按钮。
    const categoryId = event.currentTarget.dataset.categoryId as ServiceCategoryId
    // 通过应用级短期状态把筛选条件传给 Tab 页面。
    const app = getApp<IAppOption>()
    app.globalData.pendingServiceQuery = {
      categoryId,
      keyword: '',
    }

    wx.switchTab({ url: '/pages/services/services' })
  },

  /** 打开完整服务列表并重置此前的分类和关键词。 */
  onAllServicesTap() {
    // 明确写入全部分类和空关键词，避免沿用上一轮筛选条件。
    const app = getApp<IAppOption>()
    app.globalData.pendingServiceQuery = {
      categoryId: 'all',
      keyword: '',
    }

    wx.switchTab({ url: '/pages/services/services' })
  },

  /** 打开对应服务的详情页。 */
  onOpenService(event: WechatMiniprogram.TouchEvent) {
    // 服务 ID 由共享的本地服务记录提供。
    const serviceId = event.currentTarget.dataset.serviceId as string
    wx.navigateTo({ url: `/pages/detail/detail?id=${encodeURIComponent(serviceId)}` })
  },

  /** 用文字弹窗说明 Demo 服务信息范围，不发起外部请求。 */
  onNoticeTap() {
    wx.showModal({
      title: '服务信息说明',
      content: '本页面展示的是生活服务 Demo 示例内容，办理要求请以服务提供方发布的信息为准。',
      showCancel: false,
      confirmText: '我知道了',
    })
  },
})
