import { services } from '../../data/services'
import type { ServiceRecord } from '../../data/services'
import {
  loadAccessibilityPreferences,
  loadFavoriteIds,
  recordRecentService,
  saveFavoriteIds,
} from '../../utils/local-state'

Page({
  data: {
    service: null as ServiceRecord | null,
    loading: true,
    notFound: false,
    isFavorite: false,
    largeText: false,
    highContrast: false,
  },

  /** 按 URL 中的稳定服务 ID 读取记录；无效 ID 不替换成其他服务。 */
  onLoad(query: Record<string, string | undefined>) {
    // 详情入口只传共享数据中定义的服务 ID。
    const serviceId = query.id
    const service = services.find((item) => item.id === serviceId)

    if (!service) {
      this.setData({ loading: false, notFound: true })
      return
    }

    // 打开详情后更新本地浏览记录和当前收藏状态。
    recordRecentService(service.id)
    const favoriteIds = loadFavoriteIds()
    this.setData({
      service,
      loading: false,
      notFound: false,
      isFavorite: favoriteIds.includes(service.id),
    })
  },

  /** 每次显示时读取最新的主题偏好和收藏状态。 */
  onShow() {
    // 主题偏好由设置页保存，所有页面在显示时同步。
    const preferences = loadAccessibilityPreferences()
    // 未找到服务时没有收藏状态可同步。
    const serviceId = this.data.service ? this.data.service.id : undefined
    // 页面重新显示时按本地收藏列表还原复选状态。
    const isFavorite = serviceId ? loadFavoriteIds().includes(serviceId) : false
    this.setData({
      largeText: preferences.largeText,
      highContrast: preferences.highContrast,
      isFavorite,
    })
  },

  /** 根据原生复选框状态更新收藏，并去重后写回本地存储。 */
  onFavoriteChange(event: WechatMiniprogram.CheckboxGroupChange) {
    // 空详情仅出现在未找到状态，不执行收藏写入。
    const service = this.data.service
    if (!service) {
      return
    }

    // 复选框数组是当前视图状态，收藏集合负责跨页面同步。
    const shouldBeFavorite = event.detail.value.includes(service.id)
    // 先读当前完整列表，再按新状态加入或移除此服务。
    const favoriteIds = loadFavoriteIds()
    const nextFavoriteIds = shouldBeFavorite
      ? Array.from(new Set([...favoriteIds, service.id]))
      : favoriteIds.filter((id) => id !== service.id)

    saveFavoriteIds(nextFavoriteIds)
    this.setData({ isFavorite: shouldBeFavorite })
  },

  /** 用本地弹窗展示服务中的联系说明，不发起真实联系操作。 */
  onContactTap() {
    // 未找到服务时没有联系说明可展示。
    const service = this.data.service
    if (!service) {
      return
    }

    wx.showModal({
      title: '联系说明',
      content: service.contactDescription,
      showCancel: false,
      confirmText: '我知道了',
    })
  },

  /** 从社区活动详情进入本地报名演示，并保持服务 ID 与当前详情一致。 */
  onAppointmentTap() {
    // 入口只在社区活动详情显示；再次核对可避免无效详情发起导航。
    const service = this.data.service
    if (!service || service.id !== 'community-events') {
      return
    }

    wx.navigateTo({ url: `/pages/appointment/appointment?serviceId=${service.id}` })
  },

  /** 无效详情返回服务 Tab，并清除上次遗留的筛选条件。 */
  onBackToServices() {
    // 明确重置为完整列表，避免返回时继承过期筛选。
    const app = getApp<IAppOption>()
    app.globalData.pendingServiceQuery = {
      categoryId: 'all',
      keyword: '',
    }
    wx.switchTab({ url: '/pages/services/services' })
  },
})
