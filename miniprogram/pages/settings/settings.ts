import {
  loadAccessibilityPreferences,
  saveAccessibilityPreferences,
} from '../../utils/local-state'
import type { AccessibilityPreferences } from '../../utils/local-state'

/** 页面上允许修改的无障碍偏好键。 */
type PreferenceKey = 'largeText' | 'highContrast'

Page({
  data: {
    largeText: false,
    highContrast: false,
  },

  /** 页面重新显示时从本地状态恢复两个开关。 */
  onShow() {
    // 一次读取完整偏好，避免单个开关使用不同的默认策略。
    const preferences = loadAccessibilityPreferences()
    this.setData({
      largeText: preferences.largeText,
      highContrast: preferences.highContrast,
    })
  },

  /** 保存用户刚切换的设置，并立即更新整个页面的主题状态。 */
  onPreferenceChange(event: WechatMiniprogram.SwitchChange) {
    // 键名来自页面中两个固定的开关，只接受已知字段。
    const rawPreferenceKey = event.currentTarget.dataset.key
    if (rawPreferenceKey !== 'largeText' && rawPreferenceKey !== 'highContrast') {
      return
    }

    const preferenceKey = rawPreferenceKey as PreferenceKey
    // 开关事件提供原生的布尔状态。
    const preferenceValue = event.detail.value
    // 读取完整对象后只替换当前开关对应的字段。
    const preferences = loadAccessibilityPreferences()
    let nextPreferences: AccessibilityPreferences

    if (preferenceKey === 'largeText') {
      nextPreferences = { ...preferences, largeText: preferenceValue }
    } else {
      nextPreferences = { ...preferences, highContrast: preferenceValue }
    }

    saveAccessibilityPreferences(nextPreferences)
    this.setData({
      largeText: nextPreferences.largeText,
      highContrast: nextPreferences.highContrast,
    })
  },
})
