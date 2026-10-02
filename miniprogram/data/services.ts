/** 服务分类的稳定标识，用于页面筛选与导航。 */
export type ServiceCategoryId = 'government' | 'daily-life' | 'travel' | 'culture'

/** 服务分类的显示信息。 */
export interface ServiceCategory {
  id: ServiceCategoryId
  name: string
}

/** 图片路径、替代说明与图注必须作为一组配置。 */
export interface ServiceImage {
  src: string
  label: string
  caption: string
}

/** 视频地址与无障碍说明必须作为一组配置。 */
export interface ServiceVideo {
  src: string
  label: string
  summary: string
  transcript: string
}

/** 服务媒体按实际提供的素材显式配置。 */
export interface ServiceMedia {
  image?: ServiceImage
  video?: ServiceVideo
}

/** 服务详情页和服务卡片需要展示的完整字段。 */
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
  media?: ServiceMedia
}

/** 首页和筛选页共用的固定服务分类。 */
export const serviceCategories: ServiceCategory[] = [
  { id: 'government', name: '办事服务' },
  { id: 'daily-life', name: '生活缴费' },
  { id: 'travel', name: '出行服务' },
  { id: 'culture', name: '文化休闲' },
]

/** Demo 展示数据；详情页直接使用这些完整记录，不补造缺失字段。 */
export const services: ServiceRecord[] = [
  {
    id: 'social-card',
    name: '社保卡服务',
    categoryId: 'government',
    categoryName: '办事服务',
    summary: '了解社保卡申领、补换和使用方法。',
    requirements: ['办理前请准备本人有效身份证件。', '未成年人需由监护人陪同办理。'],
    steps: ['选择申领或补换服务。', '核对所需材料和办理地点。', '按页面提示完成线下办理。'],
    duration: '现场办理时间以服务网点公告为准。',
    contactDescription: '本 Demo 仅展示办理信息，不连接真实社保服务。',
  },
  {
    id: 'residence-permit',
    name: '居住证办理',
    categoryId: 'government',
    categoryName: '办事服务',
    summary: '查看居住证申领所需材料与办理步骤。',
    requirements: ['准备有效身份证件。', '其他材料以办理地要求为准。'],
    steps: ['阅读办理条件。', '准备材料并选择服务网点。', '到网点提交申请。'],
    duration: '办理时限以服务网点公告为准。',
    contactDescription: '本 Demo 仅作办事流程示例，不提交真实申请。',
  },
  {
    id: 'utility-bill',
    name: '水电账单查询',
    categoryId: 'daily-life',
    categoryName: '生活缴费',
    summary: '查看水电账单查询和缴费前核对事项。',
    requirements: ['准备账单上的用户编号。', '核对账单所属地址。'],
    steps: ['选择水费或电费。', '输入账单用户编号。', '核对账单周期和金额。'],
    duration: '查询结果即时显示。',
    contactDescription: '本 Demo 不连接缴费平台，不会收集账户信息。',
  },
  {
    id: 'senior-meal',
    name: '长者助餐点查询',
    categoryId: 'daily-life',
    categoryName: '生活缴费',
    summary: '了解附近社区助餐点的开放时间和服务方式。',
    requirements: ['选择所在社区。', '具体服务对象以助餐点公告为准。'],
    steps: ['选择社区。', '查看助餐点开放时间。', '按页面所示方式前往咨询。'],
    duration: '开放时间以助餐点公告为准。',
    contactDescription: '本 Demo 使用示例说明，不代表真实助餐点信息。',
  },
  {
    id: 'parking-reservation',
    name: '社区停车预约',
    categoryId: 'travel',
    categoryName: '出行服务',
    summary: '查看社区临时停车预约的操作说明。',
    requirements: ['准备车辆信息。', '预约规则以社区公告为准。'],
    steps: ['选择到访日期。', '阅读停车说明。', '向社区服务台确认车位。'],
    duration: '预约确认以社区服务台为准。',
    contactDescription: '本 Demo 不提交停车预约，也不连接停车场系统。',
  },
  {
    id: 'bus-guide',
    name: '公交乘车指南',
    categoryId: 'travel',
    categoryName: '出行服务',
    summary: '查看乘车准备、换乘和无障碍出行提示。',
    requirements: ['出行前请核对当日线路信息。'],
    steps: ['查询起点和目的地。', '确认线路与换乘站。', '预留步行和候车时间。'],
    duration: '行程时间以实时交通情况为准。',
    contactDescription: '本 Demo 不接入实时公交数据。',
  },
  {
    id: 'community-events',
    name: '社区活动报名',
    categoryId: 'culture',
    categoryName: '文化休闲',
    summary: '浏览社区活动安排和报名说明。',
    requirements: ['活动名额和参与条件以活动公告为准。'],
    steps: ['阅读活动时间与地点。', '确认参与条件。', '联系活动组织方完成报名。'],
    duration: '活动时长以活动公告为准。',
    contactDescription: '本 Demo 只展示活动报名说明，不记录报名信息。',
    // 图片使用本地素材，并为读屏节点和可见图注分别提供说明。
    media: {
      image: {
        src: '/assets/温馨多代同堂的社区活动空间.png',
        label: '社区活动室内，多代居民一起做手工、阅读和轻度锻炼。',
        caption: '共享活动空间可用于手工、阅读和轻度锻炼等社区活动。',
      },
    },
  },
  {
    id: 'culture-venue',
    name: '公共文化场馆预约',
    categoryId: 'culture',
    categoryName: '文化休闲',
    summary: '查看公共文化场馆预约前需要了解的信息。',
    requirements: ['预约规则以场馆公告为准。', '入馆时请遵守现场指引。'],
    steps: ['选择目标场馆。', '查看开放日期和入馆须知。', '通过场馆官方渠道完成预约。'],
    duration: '开放时间以场馆公告为准。',
    contactDescription: '本 Demo 不连接场馆预约系统。',
  },
]
