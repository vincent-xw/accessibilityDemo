import { loadAccessibilityPreferences } from '../../utils/local-state'

/** 报名演示中需要校验的必填字段。 */
type RequiredField = 'contactName' | 'activityDate' | 'session'
/** 必填字段的可见错误信息。 */
type FormErrors = Partial<Record<RequiredField, string>>

Page({
  data: {
    validService: false,
    contactName: '',
    activityDate: '',
    session: '',
    accessibilityNeeds: [] as string[],
    needsStepFree: false,
    needsGuide: false,
    needsLargePrint: false,
    notes: '',
    errors: {} as FormErrors,
    errorSummary: '',
    successAnnouncement: '',
    largeText: false,
    highContrast: false,
  },

  /** 仅接受社区活动的稳定 ID；无效链接展示明确状态。 */
  onLoad(query: Record<string, string | undefined>) {
    this.setData({ validService: query.serviceId === 'community-events' })
  },

  /** 页面显示时同步全站无障碍主题偏好，报名内容仍只留在页面内存中。 */
  onShow() {
    // 只读取已有的显示偏好，不保存任何报名字段。
    const preferences = loadAccessibilityPreferences()
    this.setData({
      largeText: preferences.largeText,
      highContrast: preferences.highContrast,
    })
  },

  /** 联系人输入使用原生输入值作为页面内状态。 */
  onContactNameInput(event: WechatMiniprogram.Input) {
    this.setData({ contactName: event.detail.value })
  },

  /** 日期选择器固定为 date 模式，事件值为日期字符串。 */
  onActivityDateChange(event: WechatMiniprogram.PickerChange) {
    this.setData({ activityDate: event.detail.value as string })
  },

  /** 保存原生单选组当前选中的场次。 */
  onSessionChange(event: WechatMiniprogram.RadioGroupChange) {
    this.setData({ session: event.detail.value })
  },

  /** 保存原生复选组返回的协助项目列表。 */
  onAccessibilityNeedsChange(event: WechatMiniprogram.CheckboxGroupChange) {
    // 原生复选组返回完整选中列表；布尔值供 WXML 直接绑定勾选状态。
    const accessibilityNeeds = event.detail.value
    this.setData({
      accessibilityNeeds,
      needsStepFree: accessibilityNeeds.includes('step-free'),
      needsGuide: accessibilityNeeds.includes('guide'),
      needsLargePrint: accessibilityNeeds.includes('large-print'),
    })
  },

  /** 备注仅在本页保留，不参与必填校验。 */
  onNotesInput(event: WechatMiniprogram.TextareaInput) {
    this.setData({ notes: event.detail.value })
  },

  /** 一次性更新三项必填错误及播报摘要，不发送或保存报名资料。 */
  onSubmit(_event: WechatMiniprogram.FormSubmit) {
    // 称呼只用去空白后的结果判断是否填写，不修改输入框中的原文。
    const errors: FormErrors = {}
    if (!this.data.contactName.trim()) {
      errors.contactName = '请填写联系人称呼。'
    }
    if (!this.data.activityDate) {
      errors.activityDate = '请选择活动日期。'
    }
    if (!this.data.session) {
      errors.session = '请选择活动场次。'
    }

    // 提交后统一生成摘要，避免逐字段 setData 导致多次播报中间状态。
    const errorMessages = Object.values(errors)
    if (errorMessages.length > 0) {
      this.setData({
        errors,
        errorSummary: `报名演示有 ${errorMessages.length} 项需要补充：${errorMessages.join('')}`,
        successAnnouncement: '',
      })
      return
    }

    this.setData({
      errors: {},
      errorSummary: '',
      successAnnouncement: '报名演示完成，信息未发送或保存',
    })
  },

  /** 无效报名链接返回服务详情，由用户重新选择目标服务。 */
  onBackToServiceDetail() {
    wx.redirectTo({ url: '/pages/detail/detail?id=community-events' })
  },
})
