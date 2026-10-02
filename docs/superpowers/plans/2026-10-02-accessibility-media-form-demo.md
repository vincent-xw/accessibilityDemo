# 无障碍媒体与表单 Demo 实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax.

**Goal:** 按微信小程序 ARIA 文档完善现有节点语义，为社区活动详情增加可访问图片/视频区域，并新增本地报名表单演示页。

**Architecture:** 保留首页、服务、设置、我的四个原生 Tab 和现有详情页。详情页增加显式媒体模型；图片使用本地资源和图像角色说明，视频仅在用户提供直链及文字内容后渲染原生播放器。社区活动详情以 `navigateTo` 打开独立报名页，表单仅在页面内校验，不联网、不持久化输入。

**Tech Stack:** 微信原生小程序、TypeScript、WXML、WXSS、原生表单/媒体组件。

**Spec:** [docs/superpowers/specs/2026-10-01-accessibility-mini-program-design.md](../specs/2026-10-01-accessibility-mini-program-design.md)

## Global Constraints

- 所有用户可见文字、函数/变量说明及复杂逻辑注释使用简体中文。
- ARIA 属性按微信文档和具体语义使用；原生可见标签、角色、状态优先，不重复覆盖；`aria-label` 只增补可见文字没有表达的操作意图。
- 表单仅保存在页面内存；不请求网络、不保存用户输入、不采集手机号。
- 媒体字段显式可选；不为未提供的视频链接设置默认 URL，也不伪造素材。
- 正文保持可换行；大字/高对比主题覆盖新增页面和媒体区域。
- 不新增或运行自动化测试；采用差异检查、配置解析、源码节点盘点及可用时的开发者工具走查。
- 按既有授权在当前工作区内联实施并分步提交。

---

## 文件结构

- 修改 `miniprogram/app.json`：注册不占 Tab 的 `pages/appointment/appointment`。
- 修改 `miniprogram/data/services.ts`：已声明可选媒体字段；`community-events` 已接入本地活动图片，视频对象待用户提供完整素材后加入。
- 修改五个现有业务页面的 WXML/TS/WXSS：修正冗余名称，补可见标签关联、列表位置语义和动态结果播报。
- 修改 `miniprogram/pages/detail/`：呈现图片、视频状态/播放器、文字说明和报名入口。
- 新建 `miniprogram/pages/appointment/appointment.{json,ts,wxml,wxss}`：实现本地表单与字段级错误。
- 用户提供的社区活动图片位于 `miniprogram/assets/温馨多代同堂的社区活动空间.png`，并由服务数据配置路径、替代说明和图注。
- 更新本计划和设计文档中的实现记录。

## Task 1: 完善既有页面的节点关系和状态

**Files:**
- Modify: `miniprogram/pages/index/index.wxml`
- Modify: `miniprogram/pages/index/index.ts`
- Modify: `miniprogram/pages/services/services.wxml`
- Modify: `miniprogram/pages/services/services.ts`
- Modify: `miniprogram/pages/profile/profile.wxml`
- Modify: `miniprogram/pages/profile/profile.ts`
- Modify: `miniprogram/pages/settings/settings.wxml`
- Modify: `miniprogram/pages/detail/detail.wxml`

**Interfaces:**
- 首页提供 `categoryCount` 和 `featuredServiceCount`，供列表位置说明使用。
- 服务页继续使用 `resultCount` 作为列表总数和结果播报内容。
- 个人中心提供 `favoriteCount` 和 `recentServiceCount`，与当前记录数组同步。

- [x] **Step 1: 将可见字段文字关联到控件**

在首页和服务页将搜索标题改成带 `for`/`id` 的 `<label>`，并为搜索输入补充 `aria-describedby` 指向持久可见的帮助文字。设置页开关继续使用现有 `<label for>`；删除与可见名称完全相同的冗余 `aria-label`，使用 `aria-describedby` 关联开关用途说明。

- [x] **Step 2: 为重复卡片补充分组及位置语义**

把首页分类、首页推荐、服务结果、个人中心收藏/最近浏览各自标记为 `aria-role="list"`。循环按钮外增加 `aria-role="listitem"` 的轻量包装节点，并在包装节点设置 `aria-posinset="{{index + 1}}"` 与对应数组总数的 `aria-setsize`。将双列 Flex 宽度移到包装节点，按钮设为 `width: 100%`，保持原有 48% 双列、文本换行和原生按钮焦点。

- [x] **Step 3: 只保留有区分价值的附加名称**

服务卡片的可见子文本继续呈现服务名、类别和简介；卡片按钮的 `aria-label` 只补充“打开详情”动作，不重复播报可见文字。普通按钮使用可见按钮文字作为名称。单选项和复选框依靠包裹 `<label>` 的可见文字及原生 checked 状态，不重复添加同义名称。

- [x] **Step 4: 为动态筛选结果增加克制的播报**

给结果数量节点设置 `aria-live="polite"`、`aria-atomic="true"`；只播报“当前类别”和数量结果，不将卡片列表整体设为 live region。保留滚动区 `type="list"` 和现有标题 `aria-role="header"`。

- [x] **Step 5: 检查新增语义未覆盖原生角色**

逐页搜索 `bindtap`、`bindchange`、`aria-`、`<label>` 和 `type="list"`；确认没有把原生 button/switch/radio/checkbox 的角色替换成另一个角色，装饰色块仍为 `aria-hidden`。

- [x] **Step 6: 提交既有页面语义修正**

运行 `rtk git diff --check` 后暂存 Task 1 列出的八个文件，并提交 `fix: add relationships and list semantics`。

## Task 2: 增加有替代说明的服务图片

**Files:**
- Modify: `miniprogram/data/services.ts`
- Modify: `miniprogram/pages/detail/detail.wxml`
- Modify: `miniprogram/pages/detail/detail.wxss`
- Use: `miniprogram/assets/温馨多代同堂的社区活动空间.png`

**Interfaces:**

```ts
export interface ServiceVideo {
  src: string
  label: string
  summary: string
  transcript: string
}

export interface ServiceMedia {
  image?: {
    src: string
    label: string
    caption: string
  }
  video?: ServiceVideo
}
```

实际实现为 `ServiceRecord.media?: ServiceMedia`，其中 `image?: { src; label; caption }`、`video?: ServiceVideo` 均为可选对象；`community-events` 已配置本地图片的三个字段，视频配置仍为整体对象，避免只有 URL、没有无障碍文字内容。

- [x] **Step 1: 接入用户提供的本地社区活动图片**

用户提供的 PNG 已位于 `miniprogram/assets/`。图片本身不承载必要文字，解释文案放在服务数据字段中。

- [x] **Step 2: 为活动服务记录添加显式媒体数据**

`ServiceRecord` 已增加可选 `media` 属性；`community-events` 已配置 `image.src`、`image.label`、`image.caption`。不为其他服务伪造媒体字段。

- [x] **Step 3: 用微信支持的图像角色呈现说明**

详情页媒体区域在 `service.media.image` 存在时使用 `view aria-role="img" aria-label="{{service.media.image.label}}"` 作为单一图像节点，内部 `<image>` 标记 `aria-hidden="true"` 防止重复聚焦；旁边显示 `image.caption` 作为视觉说明。图片容器设置宽高比和 `mode="aspectFill"`，在大字/高对比模式下保留边框及图注。社区活动图片已配置，详情页显示真实图片。

- [x] **Step 4: 静态检查并提交图片演示**

确认本地图片路径与 `ServiceRecord.media.image.src` 一致、图片节点只有一个可访问名称后，提交服务数据与同步更新的覆盖文档。图片文件由用户放置在工作区。

## Task 3: 接入视频播放器与文字等效内容

**Files:**
- Modify: `miniprogram/data/services.ts`
- Modify: `miniprogram/pages/detail/detail.wxml`
- Modify: `miniprogram/pages/detail/detail.wxss`

**Interfaces:**
- `ServiceVideo.src` 是用户提供的 HTTPS 直链。
- `ServiceVideo.label` 是播放器焦点的附加播报。
- `ServiceVideo.summary` 与 `ServiceVideo.transcript` 是播放器旁可读文字；不假设来源视频自带字幕。

- [x] **Step 1: 添加无来源时的明确待接入状态**

当 `service.media` 存在但没有 `service.media.video` 时，显示普通文本“视频素材待提供”，说明链接到位后会出现播放器。禁止填占位 URL 或空字符串作为视频源。

- [x] **Step 2: 添加条件渲染的原生播放器**

当 `service.media.video` 存在时显示 `<video>`，绑定 `src`、`controls`、`aria-label` 与文字稿描述关系；不设置 autoplay。播放器标题、简介和文字稿按读屏顺序放在播放器后方，文字稿提供列表/段落语义。

- [ ] **Step 3: 将视频资料依赖明确留给用户提供**

收到用户后续链接后，将完整的 `ServiceVideo` 对象加到 `community-events.media.video`。只有链接通过 HTTPS、能作为直接媒体源访问且满足小程序服务器域名配置后，才确认视频示范可运行；未收到前保留待接入状态，并将目标标记为未完成。

- [x] **Step 4: 提交不含虚构来源的视频播放器结构**

运行 `rtk git diff --check`，确认 WXML 只有通过 `wx:if` 才引用 `video.src`，并确认 `services.ts` 中没有空字符串或示例 URL，提交为 `feat: add accessible video player slot`。用户提供真实链接后再单独提交素材配置。

## Task 4: 构建本地无障碍报名表单页

**Files:**
- Modify: `miniprogram/app.json`
- Modify: `miniprogram/pages/detail/detail.wxml`
- Modify: `miniprogram/pages/detail/detail.ts`
- Create: `miniprogram/pages/appointment/appointment.json`
- Create: `miniprogram/pages/appointment/appointment.ts`
- Create: `miniprogram/pages/appointment/appointment.wxml`
- Create: `miniprogram/pages/appointment/appointment.wxss`

**Interfaces:**
- 路由：`/pages/appointment/appointment?serviceId=community-events`。
- 表单状态：`contactName: string`、`activityDate: string`、`session: string`、`accessibilityNeeds: string[]`、`notes: string`。
- 错误状态：`Partial<Record<'contactName' | 'activityDate' | 'session', string>>`。
- 页面事件采用项目现有类型：`WechatMiniprogram.Input`、`PickerChange`、`RadioGroupChange`、`CheckboxGroupChange`、`TextareaInput` 和 `FormSubmit`。

- [x] **Step 1: 注册表单路由并增加详情入口**

在 `app.json` 注册 appointment 页面，不添加 TabBar 项。只在 `community-events` 详情显示原生“填写活动报名演示”按钮；点击时带稳定服务 ID 使用 `wx.navigateTo`。无效 ID 显示有标题、说明及返回服务详情按钮的状态页，不替换成其他服务。

- [x] **Step 2: 创建页面标题和本地隐私说明**

表单页使用 `scroll-view type="list"`、页内一级标题、说明文字和 `form bindsubmit="onSubmit"`。标题下显示“仅演示校验，信息不会发送或保存”，表单不包含手机号字段。

- [x] **Step 3: 创建四类可访问字段**

字段依次为：必填联系人称呼（`input`）、必填活动日期（`picker mode="date"`）、必填活动场次（`radio-group`，上午/下午）、可选无障碍协助（`checkbox-group`）和可选备注（`textarea`）。每个字段都有持久 `<label>`、说明节点 ID、必填可见文字。单选/复选项各自用 `<label>` 包裹原生组件。

- [x] **Step 4: 建立字段错误关系和动态摘要**

必填字段使用 `aria-required="true"`；校验失败时使用 `aria-invalid="true"` 和 `aria-errormessage` 指向对应可见错误文本；字段始终使用 `aria-describedby` 指向说明。错误摘要容器使用 `aria-live="polite"`、`aria-atomic="true"`，只在提交后有错误时显示。

- [x] **Step 5: 实现可预测的本地校验**

在 `appointment.ts` 实现中文注释的 `onContactNameInput`、`onActivityDateChange`、`onSessionChange`、`onAccessibilityNeedsChange`、`onNotesInput` 和 `onSubmit`。`onSubmit` 仅检查称呼去空白后非空、日期已选、场次已选；失败时一次性设置对应字段错误和错误摘要，成功时将播报文字设为“报名演示完成，信息未发送或保存”。不调用网络、存储 API 或真实预约 API。

- [x] **Step 6: 适配大字/高对比样式和窄屏换行**

表单字段垂直排列，标签与帮助/错误文字始终可见；按钮和选择项满足至少 `96rpx` 触控高度，错误不能只用颜色区分。对 `.page-shell--large` 和 `.page-shell--contrast` 添加对应 WXSS。

- [x] **Step 7: 静态检查并提交报名表单**

运行 `rtk git diff --check` 并核对 `app.json` 路由只新增非 Tab 页面；提交详情入口和 appointment 四个页面文件，消息为 `feat: add accessible local appointment form`。

## Task 5: 汇总覆盖核验和文档

**Files:**
- Modify: `docs/superpowers/specs/2026-10-01-accessibility-mini-program-design.md`
- Modify: `docs/superpowers/plans/2026-10-01-accessibility-mini-program.md`
- Modify: this plan

- [x] **Step 1: 逐页盘点交互和 ARIA 属性**

检查首页、服务列表、详情、设置、个人中心和报名页全部 WXML。区分原生可见名称/状态与需要补充的 ARIA；检查标题、列表项位置、输入说明、错误关联、装饰隐藏、动态播报和 Tab 文本。

- [x] **Step 2: 静态验证源文件与配置**

运行 `rtk git diff --check`；解析 `miniprogram/app.json` 和所有页面 JSON；用 `rtk rg -n 'aria-|bindtap|bindchange|bindinput|bindsubmit|<input|<picker|<radio|<checkbox|<switch|<video|<image' miniprogram` 逐项核对可操作节点与关系属性。此项只记录源码与配置的静态核验，不代表编译或读屏实测通过。

- [ ] **Step 2a: 编译核验**

本地 TypeScript 编译器不可用，未运行 `rtk pnpm exec tsc --noEmit`。微信开发者工具已热更新本次改动，服务详情中的图片成功显示，控制台没有 JavaScript 错误；但尚未单独执行“普通编译”，因此显式编译步骤保持未完成。

- [ ] **Step 3: 在工具可操作时检查运行中的无障碍树**

本次通过集成 CUA 检查了首页、服务列表、社区活动详情和报名页。详情页运行时树显示带替代说明的图像、相邻图注和视频待提供状态；空表单提交后显示三条字段错误及汇总提示。设置与个人中心仅在初始树中看到，尚未检查其交互状态；报名成功状态、视频播放、VoiceOver / TalkBack 真机播报也未检查，因此本步骤保持未完成。此前 `hermes computer-use doctor` 报告 `cua-driver: not installed`，但这不影响本会话通过集成 CUA 查看开发者工具。

- [x] **Step 4: 分项提交已完成内容**

用 `rtk git add` 仅暂存本次计划内文件；每次提交前运行 `rtk git diff --cached --check`。消息分别描述节点语义、图片媒体、表单、视频来源完成情况；视频链接未提供时不提交虚构数据，也不标记整体目标完成。

## 完成边界

表单及图片/视频条件渲染结构已提交。图片示意尚需用户提供本地素材，并一次配置 `src`、`label`、`caption`；视频播放尚需用户提供可直接播放的链接、播放器名称、简介和文字稿。ARIA 运行时播报依赖微信开发者工具/真机检查；源码标记本身不能证明所有系统的实际播报。

## 实施与核验记录（2026-10-02）

- Task 1 的既有页面语义代码见 `ded3854`、`f1742e8`；Task 4 的表单与校验修正见 `d6f4c63`、`b1343a7`；媒体结构见 `4dbae2a`、`d23a346`、`bfb48ea`。Task 2 的图像节点条件结构和 Task 3 的视频播放器条件结构已写入代码，但 Task 2 的素材生成、图片数据配置与图片交付、Task 3 的视频资料配置仍保持未完成。
- `community-events.media.image` 已指向 `miniprogram/assets/温馨多代同堂的社区活动空间.png`，并提供图像替代说明和可见图注；`video` 对象仍不存在，详情页显示“视频素材待提供”，不渲染播放器。视频内容验收仍需等待素材。
- 六个业务页面 WXML 已逐页盘点：首页搜索输入及按钮、分类/推荐卡片与通知入口；服务搜索、类别单选、结果卡片及清除入口；详情返回、收藏、联系、报名入口及条件媒体；设置双开关；个人中心常用入口与收藏/浏览卡片；报名页五类字段、提交与无效链接返回。可见标签、原生 checked、标题、重复列表位置、错误 ID 关系和有限的 live 区域均按源码核对；实际焦点名称与播报仍需运行时复核。
- `rtk git diff --check` 通过；`miniprogram/app.json` 和全部七个页面 JSON（含未注册的模板 logs 页）均可解析。工作区没有 `node_modules/.bin/tsc`，因此未运行 `rtk pnpm exec tsc --noEmit`，也未安装依赖。TypeScript 编译与微信开发者工具编译均未在本次核验中完成。
- 本次集成 CUA 运行时检查确认详情图像节点、图注和报名页必填错误播报可见；开发者工具控制台未见 JavaScript 错误，另有基础库灰度和 `reportRealtimeAction:fail not support` 警告。设置/个人中心状态、报名成功、视频播放及 VoiceOver / TalkBack 真机播报未核验，Task 5 Step 3 保持待完成。整体视频与完整运行时目标仍未完成。
