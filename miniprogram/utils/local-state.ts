/** 用户可调整的无障碍显示偏好。 */
export interface AccessibilityPreferences {
  largeText: boolean
  highContrast: boolean
}

/** 本地存储键集中定义，避免页面间出现不一致。 */
const PREFERENCES_KEY = 'accessibility-preferences'
const FAVORITE_IDS_KEY = 'favorite-service-ids'
const RECENT_IDS_KEY = 'recent-service-ids'

/** 新安装时的明确初始设置；只有首次读取无存储值时使用。 */
const DEFAULT_PREFERENCES: AccessibilityPreferences = {
  largeText: false,
  highContrast: false,
}

/** 读取显示偏好；没有本地记录代表首次启动，使用明确初始值。 */
export function loadAccessibilityPreferences(): AccessibilityPreferences {
  // 只在本地存储不存在时使用新用户的明确初始偏好。
  const storedPreferences = wx.getStorageSync<AccessibilityPreferences | ''>(PREFERENCES_KEY)

  if (storedPreferences === '') {
    return { ...DEFAULT_PREFERENCES }
  }

  return storedPreferences
}

/** 保存完整的无障碍显示偏好。 */
export function saveAccessibilityPreferences(preferences: AccessibilityPreferences): void {
  wx.setStorageSync(PREFERENCES_KEY, preferences)
}

/** 读取收藏 ID；新安装时尚无收藏，因此返回空列表。 */
export function loadFavoriteIds(): string[] {
  // 首次启动没有收藏记录，空数组代表尚未收藏任何服务。
  const storedIds = wx.getStorageSync<string[] | ''>(FAVORITE_IDS_KEY)
  return storedIds === '' ? [] : storedIds
}

/** 保存完整的收藏 ID 列表。 */
export function saveFavoriteIds(ids: string[]): void {
  wx.setStorageSync(FAVORITE_IDS_KEY, ids)
}

/** 读取最近浏览 ID；新安装时尚无浏览记录，因此返回空列表。 */
export function loadRecentServiceIds(): string[] {
  // 首次启动没有浏览历史，空数组代表尚未打开详情页。
  const storedIds = wx.getStorageSync<string[] | ''>(RECENT_IDS_KEY)
  return storedIds === '' ? [] : storedIds
}

/** 将服务移至最近浏览首位，并去重后最多保留五条。 */
export function recordRecentService(id: string): string[] {
  // 最新浏览排在首位，旧记录去重后最多留下五条。
  const recentIds = [id, ...loadRecentServiceIds().filter((storedId) => storedId !== id)].slice(0, 5)
  wx.setStorageSync(RECENT_IDS_KEY, recentIds)
  return recentIds
}
