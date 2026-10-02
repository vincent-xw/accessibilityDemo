# 无障碍生活服务小程序 Demo 实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` (recommended) or `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将微信小程序模板扩展为包含首页、服务列表、服务详情、设置和个人中心的可操作生活服务 Demo，并覆盖清楚的读屏名称、状态和页面顺序。

**Architecture:** 使用微信原生 TabBar 承载首页、服务、设置、我的四个页面；详情页由首页和列表页打开。服务记录、收藏、最近浏览及无障碍设置均存于本地，通过共享 TypeScript 模块供页面读取。

**Tech Stack:** 微信原生小程序、TypeScript、WXML、WXSS、微信本地存储。

**Spec:** [docs/superpowers/specs/2026-10-01-accessibility-mini-program-design.md](../specs/2026-10-01-accessibility-mini-program-design.md)

## Global Constraints

- 用户可见文案与新增代码注释使用简体中文。
- 每个可操作控件均显式设置 `aria-label`；按钮名称说明操作及目标，原生选择控件名称描述用途、选中状态由控件自身提供。
- 输入项始终显示文字标签；图标不独立承载名称；装饰色块不进入读屏节点。
- 仅在首次启动且本地设置尚不存在时采用明确默认值：常规字号、标准对比度；不为服务记录必需字段添加兜底。
- 不接入服务端、账号系统或真实联系操作；视频只有在用户提供直链后才呈现。
- 大字和高对比主题作用于所有页面，文本允许换行，不设会裁切文本的固定高度。
- 不新增或运行自动化测试；按用户环境可用性使用微信开发者工具编译，并进行源码级无障碍节点检查。

---

## 文件结构

- `miniprogram/app.json`：五个业务页面路由、窗口标题和四项原生 TabBar。
- `miniprogram/assets/tabbar/`：TabBar 四项的常态和选中态本地 PNG 图标，文字标签保留为无障碍名称。
- `miniprogram/app.ts`、`typings/index.d.ts`：移除模板启动日志和登录请求，定义首页传给服务 Tab 的待处理查询对象。
- `miniprogram/app.wxss`：全局页面底色、正文颜色、主题色和大字/高对比主题类。
- `miniprogram/data/services.ts`：服务类别、服务记录类型、分类和示例记录。
- `miniprogram/utils/local-state.ts`：无障碍设置、收藏 ID 和最近浏览 ID 的本地读写。
- `miniprogram/pages/index/`：首页视图、搜索与快捷入口。
- `miniprogram/pages/services/`：服务搜索、单选分类筛选、结果与空状态。
- `miniprogram/pages/detail/`：服务说明、收藏、联系提示和最近浏览更新。
- `miniprogram/pages/settings/`：大字与高对比开关。
- `miniprogram/pages/profile/`：Demo 身份、收藏和最近浏览。
- 首页主视觉由 WXSS 色块和可读文字构成，不含插画；TabBar 图标单独放在 `miniprogram/assets/tabbar/`。

## Task 1: 建立共享服务模型与本地状态模块

**Files:**
- Create: `miniprogram/data/services.ts`
- Create: `miniprogram/utils/local-state.ts`

**Interfaces:**
- Produces `ServiceCategoryId`, `ServiceRecord`, `serviceCategories`, `services`。
- Produces `AccessibilityPreferences`, `loadAccessibilityPreferences`, `saveAccessibilityPreferences`, `loadFavoriteIds`, `saveFavoriteIds`, `loadRecentServiceIds`, `recordRecentService`。
- `recordRecentService(id: string): string[]` 将该 ID 提到最近浏览首位，去重并最多保留 5 项。

- [x] **Step 1: 定义服务数据类型和分类**

```ts
export type ServiceCategoryId = 'government' | 'daily-life' | 'travel' | 'culture'

export interface ServiceRecord {
  id: string
  name: string
  categoryId: ServiceCategoryId
  categoryName: string
  summary: string
  requirements: string[]
  steps: string[]
  duration: string
  contactDescription: string
}
```

分类固定为：办事服务、生活缴费、出行服务、文化休闲；每类提供两个示例服务：社保卡服务、居住证办理、水电账单查询、长者助餐点、社区停车预约、公交乘车指南、社区活动报名、公共文化场馆预约。每条记录填写类型中的全部字段。

- [x] **Step 2: 实现本地状态读写函数**

在 `local-state.ts` 定义存储键常量，并实现 `loadAccessibilityPreferences`、`saveAccessibilityPreferences`、`loadFavoriteIds`、`saveFavoriteIds`、`loadRecentServiceIds`、`recordRecentService`。只对“本地存储尚不存在”的首次启动状态使用明确的默认设置或空数组；已有记录按约定类型直接读取，不逐字段补值。复杂的去重和最多 5 条记录逻辑添加简体中文注释。

```ts
export interface AccessibilityPreferences {
  largeText: boolean
  highContrast: boolean
}

export function recordRecentService(id: string): string[] {
  // 最近浏览去重，并保留最新的五条记录。
  const recentIds = [id, ...loadRecentServiceIds().filter((item) => item !== id)].slice(0, 5)
  wx.setStorageSync(RECENT_IDS_KEY, recentIds)
  return recentIds
}
```

- [x] **Step 3: 检查数据字段与存储模块边界**

运行 `rtk rg -n "export (type|interface|const|function)" miniprogram/data/services.ts miniprogram/utils/local-state.ts`。预期可看到本任务声明的导出；确认服务数据记录没有缺字段兜底，空值默认只用于首次安装时的本地存储。

## Task 2: 注册页面、原生 TabBar 并清理模板启动行为

**Files:**
- Modify: `miniprogram/app.json`
- Modify: `miniprogram/app.ts`
- Modify: `typings/index.d.ts`
- Modify: `miniprogram/app.wxss`

**Interfaces:**
- Consumes: Task 1 的 `AccessibilityPreferences` 与 `ServiceCategoryId`。
- Produces: `IAppOption.globalData.pendingServiceQuery?: { categoryId: ServiceCategoryId | 'all'; keyword: string }`，供首页向服务 Tab 传递一次性查询条件。

- [x] **Step 1: 更新应用路由和 TabBar**

在 `app.json` 注册 `pages/index/index`、`pages/services/services`、`pages/detail/detail`、`pages/settings/settings`、`pages/profile/profile`。原生 TabBar 仅包含首页、服务、设置、我的；每项使用本地常态和选中态 PNG 图标，并保留文字标签。详情页保留为普通页面。移除日志页路由，不删除模板日志文件。

- [x] **Step 2: 定义短生命周期的导航参数并移除模板启动副作用**

在 `typings/index.d.ts` 扩展 `IAppOption.globalData` 的待处理查询字段。在 `app.ts` 初始化空的 `globalData`，删除写入 `logs` 的启动逻辑和自动调用 `wx.login` 的模板逻辑；Demo 不采集或打印登录信息。所有页面文件使用声明文件支持的原生 `Page({...})` 构造器和页面生命周期。

- [x] **Step 3: 设置全局文字和主题样式**

在 `app.wxss` 定义页面基线、正文颜色、青绿色强调色、高对比样式和大字样式。各页面根节点统一根据设置绑定主题类，例如：

```xml
<view class="page-shell {{largeText ? 'page-shell--large' : ''}} {{highContrast ? 'page-shell--contrast' : ''}}">
```

- [x] **Step 4: 检查路由与全局类定义**

检查 `app.json` 中 TabBar 路径均属于已注册页面；使用 `rtk rg -n "page-shell--large|page-shell--contrast|wx.login|logs" miniprogram/app.json miniprogram/app.ts miniprogram/app.wxss`。预期主题类有定义，`app.ts` 不再包含模板登录和启动日志。

## Task 3: 实现首页和服务入口

**Files:**
- Modify: `miniprogram/pages/index/index.ts`
- Modify: `miniprogram/pages/index/index.wxml`
- Modify: `miniprogram/pages/index/index.wxss`
- Modify: `miniprogram/pages/index/index.json`

**Interfaces:**
- Consumes: `services`, `serviceCategories`、`AccessibilityPreferences` 及 `IAppOption.globalData`。
- Produces: `onSearchInput`、`onSearchTap`、`onCategoryTap`、`onAllServicesTap`、`onOpenService`、`onNoticeTap`。

- [x] **Step 1: 制作首页文字与色块主视觉**

用 WXSS 色块和页内文字构成清爽的社区生活服务主视觉；色块纯属装饰并从读屏节点隐藏，标题文字保留给读屏用户。首页主视觉不生成或引用插画资源。

- [x] **Step 2: 构建首页内容层级**

在页面根节点显示“社区生活服务”页内标题、欢迎说明、带可见“搜索服务”标签的 `input`、四个带文字名称的分类按钮、推荐服务和通知说明入口。使用 `scroll-view scroll-y type="list"` 包含可滚动内容；推荐服务从共享 `services` 读取并以双列卡片呈现。

- [x] **Step 3: 实现首页导航动作**

搜索动作把 `{ categoryId: 'all', keyword: this.data.keyword }` 写入 `getApp<IAppOption>().globalData.pendingServiceQuery` 后调用 `wx.switchTab({ url: '/pages/services/services' })`。分类入口把 `{ categoryId, keyword: '' }` 写入同一字段后切换服务 Tab。推荐服务调用 `wx.navigateTo` 打开详情并传入服务 ID。每个处理函数添加简体中文注释。

- [x] **Step 4: 完成首页样式并检查节点**

在 WXSS 保证搜索框、分类入口和卡片按钮拥有至少约 48 CSS px 的操作高度；分类卡片使用 Flex 双列布局和 `box-sizing: border-box`；色块只作装饰。用 `rtk rg -n "button|input|type=\"list\"|bindtap" miniprogram/pages/index/index.wxml` 检查输入标签和按钮文字均存在。

## Task 4: 实现服务列表、搜索和分类筛选

**Files:**
- Create: `miniprogram/pages/services/services.ts`
- Create: `miniprogram/pages/services/services.wxml`
- Create: `miniprogram/pages/services/services.wxss`
- Create: `miniprogram/pages/services/services.json`

**Interfaces:**
- Consumes: `services`, `serviceCategories`, `ServiceCategoryId` 和 `IAppOption.globalData.pendingServiceQuery`。
- Produces: 列表页筛选状态 `keyword: string`、`selectedCategory: ServiceCategoryId | 'all'`、`selectedCategoryLabel: string`、`visibleServices: ServiceRecord[]`，以及 `onKeywordInput`、`onCategoryChange`、`onClearFilters`、`onOpenService`。

- [x] **Step 1: 初始化筛选状态并消费首页参数**

在 `onShow` 检查 `globalData.pendingServiceQuery` 是否存在；存在时按对象的两个字段原样应用（空关键词也有明确语义），然后清空整个待处理对象。对象不存在时保留当前筛选。页面首次状态明确为关键词空串、分类 `all`。

- [x] **Step 2: 实现组合筛选**

将关键词统一转小写，并匹配服务名称、类别名称和摘要；分类选择必须同时匹配。用一个计算函数生成 `visibleServices` 和结果数量文本。搜索和分类变化后都调用同一计算函数。

```ts
const normalizedKeyword = this.data.keyword.trim().toLowerCase()
const visibleServices = services.filter((service) => {
  const matchesCategory = this.data.selectedCategory === 'all' || service.categoryId === this.data.selectedCategory
  const searchableText = `${service.name} ${service.categoryName} ${service.summary}`.toLowerCase()
  return matchesCategory && searchableText.includes(normalizedKeyword)
})
```

- [x] **Step 3: 实现列表控件与空状态**

使用带可见标签的 `input` 和带名称的原生 `radio-group` 分类筛选；每条服务记录以原生按钮呈现名称、类别和摘要，并以双列卡片排列。结果数量、当前分类和无结果说明作为普通文本节点；空状态提供“清除筛选”按钮，不依赖未经验证的实时播报。

- [x] **Step 4: 实现详情导航和页面样式**

点击服务按钮使用服务的稳定 `id` 导航到 `/pages/detail/detail?id=...`。列表行可换行，分类状态同时有原生单选状态与可读标签。用 `rtk rg -n "radio-group|input|button|visibleServices|aria-label|type=\"list\"" miniprogram/pages/services/services.*` 检查主要节点。

## Task 5: 实现服务详情、收藏和浏览记录

**Files:**
- Create: `miniprogram/pages/detail/detail.ts`
- Create: `miniprogram/pages/detail/detail.wxml`
- Create: `miniprogram/pages/detail/detail.wxss`
- Create: `miniprogram/pages/detail/detail.json`

**Interfaces:**
- Consumes: `ServiceRecord`, `services`、`loadFavoriteIds`、`saveFavoriteIds`、`recordRecentService`。
- Produces: `onLoad(query: Record<string, string | undefined>)`、`onFavoriteChange`、`onContactTap`、`onBackToServices`。

- [x] **Step 1: 按 ID 载入记录并登记浏览**

详情页只按 URL 的 `id` 查找共享数据；找到记录后调用 `recordRecentService(id)`。缺少 ID 或 ID 不存在时显示明确的“未找到该服务”文本和返回服务列表按钮；不拿第一条服务记录代替无效 ID。

- [x] **Step 2: 实现收藏控件和本地同步**

使用 `checkbox-group` 包含单个 `checkbox` 和可见“收藏此服务”文字。`onFavoriteChange` 根据 `event.detail.value` 计算收藏 ID 列表并保存；进入页面时从 `loadFavoriteIds()` 初始化勾选状态。页面返回时收藏列表可从同一存储读到最新值。

- [x] **Step 3: 展示服务信息与本地联系提示**

使用标题层级和有序步骤列表呈现摘要、办理条件、时长、步骤与联系说明。联系按钮仅打开包含 `contactDescription` 的本地弹窗，不拨打电话或请求网络。

- [x] **Step 4: 保留可选视频边界并检查详情节点**

当前没有用户提供的视频直链，因此不渲染播放器或伪造视频源。若实施前收到直链，在服务记录增加显式可选的 `videoUrl` 和文字稿内容，并仅对具备这两项素材的详情显示播放器和文字稿入口。运行 `rtk rg -n "checkbox-group|checkbox|button|aria-label|steps|notFound" miniprogram/pages/detail/detail.*` 检查收藏状态、步骤和错误状态。

## Task 6: 实现无障碍设置页

**Files:**
- Create: `miniprogram/pages/settings/settings.ts`
- Create: `miniprogram/pages/settings/settings.wxml`
- Create: `miniprogram/pages/settings/settings.wxss`
- Create: `miniprogram/pages/settings/settings.json`

**Interfaces:**
- Consumes: `AccessibilityPreferences`、`loadAccessibilityPreferences`、`saveAccessibilityPreferences`。
- Produces: `onShow`、`onPreferenceChange`。

- [x] **Step 1: 读取设置并应用原生开关状态**

页面 `onShow` 通过 `loadAccessibilityPreferences()` 填充 `largeText`、`highContrast`；WXML 使用两个带可见说明的原生 `switch`，旁边显示“已开启/未开启”状态文字。开关名称分别为“大字模式”和“高对比模式”。

- [x] **Step 2: 持久化开关变更**

每个 `switch` 使用 `data-key="largeText"` 或 `data-key="highContrast"`。`onPreferenceChange` 从 `event.currentTarget.dataset.key` 取得已知设置键，从 `event.detail.value` 取得布尔值，构造新的完整 `AccessibilityPreferences` 对象并调用 `saveAccessibilityPreferences`，随后更新页面状态。只处理本页两个已知开关键，不逐字段回退。

- [x] **Step 3: 添加无障碍使用说明并检查设置节点**

加入普通文本说明读屏顺序与两个开关作用；根节点绑定大字/高对比主题类。用 `rtk rg -n "switch|largeText|highContrast|无障碍|page-shell--" miniprogram/pages/settings/settings.*` 检查标签、状态与主题绑定。

## Task 7: 实现个人中心

**Files:**
- Create: `miniprogram/pages/profile/profile.ts`
- Create: `miniprogram/pages/profile/profile.wxml`
- Create: `miniprogram/pages/profile/profile.wxss`
- Create: `miniprogram/pages/profile/profile.json`

**Interfaces:**
- Consumes: `services`、`loadFavoriteIds`、`loadRecentServiceIds`、`loadAccessibilityPreferences`。
- Produces: `onShow`、`onOpenService`、`onOpenServices`、`onOpenSettings`。

- [x] **Step 1: 从共享数据组装个人中心内容**

在 `onShow` 把收藏 ID、最近浏览 ID 映射到服务记录；示例身份文字固定标注“Demo 用户”。

- [x] **Step 2: 实现分组入口和空状态**

以分组标题呈现收藏、最近浏览与常用入口。收藏和浏览服务项以双列原生按钮卡片进入详情，设置入口和服务入口使用 `wx.switchTab`；收藏或浏览列表为空时显示对应说明文字。

- [x] **Step 3: 检查读屏顺序和主题状态**

根节点读取无障碍设置并绑定主题类；所有头像/装饰图若存在均隐藏为装饰节点，身份以文本表达。用 `rtk rg -n "Demo 用户|收藏|最近浏览|button|aria-hidden|page-shell--" miniprogram/pages/profile/profile.*` 检查页面分组。

## Task 8: 集成检查与交付前检查

**Files:**
- Review: `miniprogram/app.json`
- Review: `miniprogram/app.ts`
- Review: `miniprogram/app.wxss`
- Review: `miniprogram/pages/index/`
- Review: `miniprogram/pages/services/`
- Review: `miniprogram/pages/detail/`
- Review: `miniprogram/pages/settings/`
- Review: `miniprogram/pages/profile/`

**Interfaces:**
- Consumes: 前七个任务的页面、共享数据和状态模块。
- Produces: 可在微信开发者工具打开的完整 Demo。

- [x] **Step 1: 检查无障碍节点与页面配置**

运行 `rtk rg -n "bindtap|bindchange|<input|<switch|<checkbox|<radio|aria-|type=\"list\"" miniprogram/pages`。逐个检查每个交互控件都有明确 `aria-label`，选择控件能读出状态；检查装饰图片是否隐藏、每个滚动区域是否有列表语义。

- [x] **Step 2: 检查代码格式和数据完整性**

运行 `rtk git diff --check`；检查所有服务记录实现 `ServiceRecord` 全部必需字段，并确认模板 `wx.login`、`logs` 路由已移除。

- [ ] **Step 3: 在微信开发者工具中编译并走查页面流**

打开项目并完成一次编译，逐页走查：首页搜索和分类入口、列表组合筛选和空状态、详情收藏与返回、设置保存、个人中心收藏/最近记录。切换大字和高对比模式后返回其他 Tab，确认样式仍有效；若当前环境没有微信开发者工具，则记录无法进行该项工具内编译，不以源码检查代替真机读屏结论。

- [ ] **Step 4: 记录读屏实测边界**

在开发者工具中检查节点树的可见名称、顺序和状态；对尚未连接的 iOS VoiceOver / Android TalkBack 只记录为待真机验证，不宣称已完成实际播报验证。

> **集成走查记录（2026-10-02）：** 曾在微信开发者工具查看首页、服务列表和设置页的部分节点；后续逐页核对发现卡片按钮及原生筛选控件虽有可读文字，但缺少显式 `aria-label`。现已给所有页面交互控件补齐名称，并通过源码静态扫描确认 21 个原生交互节点都有 `aria-label`。修改后的开发者工具节点树、完整交互流、详情页与个人中心节点树，以及大字/高对比跨 Tab 持久化走查尚未复核。运行 `hermes computer-use doctor` 后报告 `cua-driver: not installed`；iOS VoiceOver / Android TalkBack 真机播报也仍待验证。

> **视觉修正记录（2026-10-02）：** 原生 TabBar 已增加四组常态和选中态图标，同时保留文字名称。首页分类、首页推荐、服务结果、个人中心收藏和最近浏览卡片均由按钮节点自身循环输出，并明确指定横向 Flex、48% 不收缩基准宽度和左右零外边距。待开发者工具可操作时复核最终双列效果。

## 后续实施补充（2026-10-02）

本节记录原计划之后的变更；上方任务步骤保留当时的实施记录。新增 `pages/appointment/appointment` 普通路由，由社区活动详情的“填写活动报名演示”按钮进入，不占用 TabBar。报名字段、必填校验、字段错误、错误摘要和完成提示仅存在页面内存；不采集手机号，不发送或持久化表单输入。

原计划要求所有控件添加 `aria-label`，后续按微信原生控件语义作了修正：输入和开关优先关联可见 `<label>`，原生按钮依赖可见文字，服务卡片的 `aria-label` 只补“打开详情”动作，单选/复选使用原生勾选状态。首页分类与推荐、服务结果、个人中心收藏与最近浏览改用列表包装节点及位置/总数属性；服务筛选结果、表单错误摘要和完成提示设置有限的动态播报。既有页面语义提交为 `ded3854`、`f1742e8`，表单及校验修正提交为 `d6f4c63`、`b1343a7`，媒体槽位与视频条件渲染结构提交为 `4dbae2a`、`d23a346`、`bfb48ea`。

社区活动记录已配置本地图片 `miniprogram/assets/温馨多代同堂的社区活动空间.png`，包含 `image.src`、`image.label` 和 `image.caption`；视频直链、播放器名称、简介和文字稿尚未提供，因此 `video` 对象不存在。详情页展示有替代说明和可见图注的图片，以及视频待提供文案。通过集成 CUA 已检查首页、服务列表、社区活动详情和报名页；设置/个人中心的交互状态、报名成功状态、视频播放及 VoiceOver / TalkBack 真机播报仍未验证。此前 `hermes computer-use doctor` 报告 `cua-driver: not installed`，但本会话使用的集成 CUA 可控制微信开发者工具。静态源码核对与 TypeScript 检查结果以 2026-10-02 计划的核验记录为准，不等同于上述运行时验收。
