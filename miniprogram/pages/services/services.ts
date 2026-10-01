import { serviceCategories, services } from '../../data/services'
import type { ServiceCategoryId, ServiceRecord } from '../../data/services'
import { loadAccessibilityPreferences } from '../../utils/local-state'

/** 服务筛选允许选择“全部”或四个固定分类。 */
type ServiceCategoryFilter = ServiceCategoryId | 'all'

/** 筛选控件需要的 ID 和可见名称。 */
interface ServiceFilterOption {
  id: ServiceCategoryFilter
  name: string
}

/** 将筛选 ID 映射为可见状态文字。 */
const categoryNameById: Record<ServiceCategoryFilter, string> = {
  all: '全部服务',
  government: '办事服务',
  'daily-life': '生活缴费',
  travel: '出行服务',
  culture: '文化休闲',
}

/** “全部”选项放在分类数组首位，其他类别直接复用共享定义。 */
const filterOptions: ServiceFilterOption[] = [
  { id: 'all', name: '全部服务' },
  ...serviceCategories,
]

/** 按关键词与类别组合筛选服务记录。 */
function filterServices(keyword: string, category: ServiceCategoryFilter): ServiceRecord[] {
  // 统一大小写后，让名称、分类和摘要都能被同一关键词检索。
  const normalizedKeyword = keyword.trim().toLowerCase()

  return services.filter((service) => {
    const matchesCategory = category === 'all' || service.categoryId === category
    const searchableText = `${service.name} ${service.categoryName} ${service.summary}`.toLowerCase()
    return matchesCategory && searchableText.includes(normalizedKeyword)
  })
}

Page({
  data: {
    keyword: '',
    selectedCategory: 'all' as ServiceCategoryFilter,
    selectedCategoryLabel: categoryNameById.all,
    filterOptions,
    visibleServices: services,
    resultCount: services.length,
    hasResults: true,
    largeText: false,
    highContrast: false,
  },

  /** 页面显示时消费首页的一次性查询，并同步最新的无障碍偏好。 */
  onShow() {
    // 页面切回前台时应用已保存的字号和高对比设置。
    const preferences = loadAccessibilityPreferences()
    // 查询参数只在首页刚切到服务 Tab 时存在。
    const app = getApp<IAppOption>()
    const pendingQuery = app.globalData.pendingServiceQuery

    if (pendingQuery) {
      // 空关键词也是明确查询值，因此整体应用两个字段后再清除请求。
      const visibleServices = filterServices(pendingQuery.keyword, pendingQuery.categoryId)
      app.globalData.pendingServiceQuery = undefined
      this.setData({
        keyword: pendingQuery.keyword,
        selectedCategory: pendingQuery.categoryId,
        selectedCategoryLabel: categoryNameById[pendingQuery.categoryId],
        visibleServices,
        resultCount: visibleServices.length,
        hasResults: visibleServices.length > 0,
        largeText: preferences.largeText,
        highContrast: preferences.highContrast,
      })
      return
    }

    this.setData({
      largeText: preferences.largeText,
      highContrast: preferences.highContrast,
    })
  },

  /** 输入变化后立即更新服务结果和结果数量。 */
  onKeywordInput(event: WechatMiniprogram.Input) {
    // 使用输入框当前值和已选类别重新计算结果。
    const keyword = event.detail.value
    const visibleServices = filterServices(keyword, this.data.selectedCategory)
    this.setData({
      keyword,
      visibleServices,
      resultCount: visibleServices.length,
      hasResults: visibleServices.length > 0,
    })
  },

  /** 分类变化后保留当前关键词并重算结果。 */
  onCategoryChange(event: WechatMiniprogram.RadioGroupChange) {
    // 单选值来自页面声明的固定类别集合。
    const selectedCategory = event.detail.value as ServiceCategoryFilter
    const visibleServices = filterServices(this.data.keyword, selectedCategory)
    this.setData({
      selectedCategory,
      selectedCategoryLabel: categoryNameById[selectedCategory],
      visibleServices,
      resultCount: visibleServices.length,
      hasResults: visibleServices.length > 0,
    })
  },

  /** 清空关键词和分类筛选，恢复完整服务列表。 */
  onClearFilters() {
    this.setData({
      keyword: '',
      selectedCategory: 'all',
      selectedCategoryLabel: categoryNameById.all,
      visibleServices: services,
      resultCount: services.length,
      hasResults: true,
    })
  },

  /** 打开被选中的服务详情。 */
  onOpenService(event: WechatMiniprogram.TouchEvent) {
    // 列表按钮绑定共享服务记录的稳定 ID。
    const serviceId = event.currentTarget.dataset.serviceId as string
    wx.navigateTo({ url: `/pages/detail/detail?id=${encodeURIComponent(serviceId)}` })
  },
})
