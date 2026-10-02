import { services } from '../../data/services'
import type { ServiceRecord } from '../../data/services'
import {
  loadAccessibilityPreferences,
  loadFavoriteIds,
  loadRecentServiceIds,
} from '../../utils/local-state'

/** 按本地 ID 顺序映射共享服务记录，保持最近浏览的时间顺序。 */
function mapServiceIds(ids: string[]): ServiceRecord[] {
  // 收藏和浏览记录只由本 Demo 的有效服务入口写入。
  return ids.map((id) => services.find((service) => service.id === id) as ServiceRecord)
}

Page({
  data: {
    favoriteServices: [] as ServiceRecord[],
    recentServices: [] as ServiceRecord[],
    favoriteCount: 0,
    recentServiceCount: 0,
    hasFavorites: false,
    hasRecentServices: false,
    largeText: false,
    highContrast: false,
  },

  /** 页面显示时同步设置、收藏和最近浏览记录。 */
  onShow() {
    // 偏好用于给个人中心根节点应用全局显示主题。
    const preferences = loadAccessibilityPreferences()
    // ID 按保存顺序映射回服务记录，保证与详情页共享同一数据。
    const favoriteServices = mapServiceIds(loadFavoriteIds())
    const recentServices = mapServiceIds(loadRecentServiceIds())
    this.setData({
      favoriteServices,
      recentServices,
      favoriteCount: favoriteServices.length,
      recentServiceCount: recentServices.length,
      hasFavorites: favoriteServices.length > 0,
      hasRecentServices: recentServices.length > 0,
      largeText: preferences.largeText,
      highContrast: preferences.highContrast,
    })
  },

  /** 打开收藏或最近浏览中的详情。 */
  onOpenService(event: WechatMiniprogram.TouchEvent) {
    // 列表项的服务 ID 由共享记录提供。
    const serviceId = event.currentTarget.dataset.serviceId as string
    wx.navigateTo({ url: `/pages/detail/detail?id=${encodeURIComponent(serviceId)}` })
  },

  /** 打开完整服务列表并重置过期筛选条件。 */
  onOpenServices() {
    // 从个人中心进入服务 Tab 时展示完整列表。
    const app = getApp<IAppOption>()
    app.globalData.pendingServiceQuery = {
      categoryId: 'all',
      keyword: '',
    }
    wx.switchTab({ url: '/pages/services/services' })
  },

  /** 切换到原生 TabBar 中的设置页。 */
  onOpenSettings() {
    wx.switchTab({ url: '/pages/settings/settings' })
  },
})
