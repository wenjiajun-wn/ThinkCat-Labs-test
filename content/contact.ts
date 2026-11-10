export const contactCopy = {
  zh: {
    eyebrow: '联系 / 合作',
    title: '从一个具体的数据问题开始。',
    intro: '产业合作、研究交流或数据形态讨论，都欢迎。请尽量描述问题、数据结构和你关心的边界。',
    meta: '合作交流 / 研究讨论',
    channels: [
      {label: '合作', title: '产业与研究合作', body: '如果你正在处理表格、时间序列或混合数值数据，欢迎描述数据的形状、任务与限制。'},
      {label: '研究', title: '研究交流', body: '关于表征、迁移、不确定性或评估方法的讨论，也欢迎联系。'},
    ],
    emailLabel: '联系邮箱',
    emailPending: '联系邮箱待配置。在正式地址确认前，本站不会展示虚构的联系方式。',
    note: '我们不会通过未配置的邮箱、电话或社交账号建立联系。',
    closeTitle: '先描述数据，再讨论合作。',
  },
  en: {
    eyebrow: 'Contact / Collaboration',
    title: 'Start with a concrete data question.',
    intro: 'We welcome industry collaboration, research exchange and conversations about data shape. Describe the problem, the structure of the data and the limits you care about.',
    meta: 'Collaboration / Research exchange',
    channels: [
      {label: 'Industry', title: 'Industry and research collaboration', body: 'If you work with tables, time series or mixed numerical data, describe the shape of the data, the task and its constraints.'},
      {label: 'Research', title: 'Research exchange', body: 'We also welcome discussion of representation, transfer, uncertainty and evaluation methods.'},
    ],
    emailLabel: 'Contact email',
    emailPending: 'The contact email is pending configuration. No fictional contact channel is shown before a real address is confirmed.',
    note: 'We do not establish contact through unconfigured email, phone or social accounts.',
    closeTitle: 'Describe the data before the partnership.',
  },
} as const;

export const privacyCopy = {
  zh: {
    eyebrow: '法律 / 隐私',
    title: '隐私说明',
    intro: '本网站尽量减少数据收集。当前版本没有账号、分析脚本或广告追踪。',
    meta: '最后更新 / 2026-11',
    sections: [
      {title: '语言偏好', body: '当前浏览器会保存你选择的界面语言，用于下次访问时恢复。这个值存储在 localStorage，不会发送到服务器。'},
      {title: '演示数据', body: '在线体验中的 CSV 文件只在当前浏览器内读取和计算。文件不上传，结果不会离开设备。演示结果不代表真实模型推理。'},
      {title: '第三方资源', body: '当前前端不加载第三方字体、分析或广告脚本。若未来引入新的外部资源，我们会在此更新说明。'},
      {title: '联系', body: '与隐私相关的问题可通过正式联系渠道提出。在联系邮箱配置前，本站不展示虚构邮箱。'},
    ],
    back: '返回首页',
    railLabel: '隐私 / 数据',
  },
  en: {
    eyebrow: 'Legal / Privacy',
    title: 'Privacy notice',
    intro: 'This site collects as little data as possible. The current version has no accounts, analytics scripts or advertising trackers.',
    meta: 'Last updated / 2026-11',
    sections: [
      {title: 'Language preference', body: 'Your browser stores the interface language you select so it can be restored on the next visit. The value lives in localStorage and is not sent to a server.'},
      {title: 'Demo data', body: 'CSV files in the Playground are read and computed entirely in the current browser. Files are not uploaded, and results do not leave the device. Demo results are not real model inference.'},
      {title: 'Third-party resources', body: 'The current frontend loads no third-party fonts, analytics or advertising scripts. If external resources are added, this notice will be updated.'},
      {title: 'Contact', body: 'Privacy questions can be raised through the official contact channel. Until a contact email is configured, no fictional address is shown.'},
    ],
    back: 'Back to home',
    railLabel: 'Privacy / Data',
  },
} as const;
