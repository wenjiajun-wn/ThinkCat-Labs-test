export type IndustryId = 'finance' | 'energy' | 'health' | 'retail' | 'industry';

type IndustryStudy = {
  id: IndustryId;
  index: string;
  name: string;
  label: string;
  title: string;
  summary: string;
  question: string;
  reading: string;
  signals: readonly string[];
  note: string;
};

type SolutionsCopy = {
  eyebrow: string;
  title: string;
  intro: string;
  meta: string;
  indexLabel: string;
  disclaimer: string;
  back: string;
  labels: {
    question: string;
    reading: string;
    signals: string;
    synthetic: string;
    baseline: string;
    shifted: string;
    baselineShort: string;
    tail: string;
    week: string;
    threshold: string;
    hover: string;
    hour: string;
    load: string;
    pair: string;
    indicatorA: string;
    indicatorB: string;
    demandIndex: string;
    scrub: string;
    channel: string;
    deviation: string;
    normal: string;
    selected: string;
  };
  studies: readonly IndustryStudy[];
  close: {title: string; body: string; link: string};
};

export const solutionsCopy: {zh: SolutionsCopy; en: SolutionsCopy} = {
  zh: {
    eyebrow: '应用 / 行业图谱',
    title: '数字在现实中的形状。',
    intro: '同一个模型不会以同一种方式看见每个行业。交易分布、负荷周期、指标关联、季节需求与传感器偏移，需要不同的数据语言。',
    meta: '五项行业研究 / 全部使用原创合成示意 / 非客户数据',
    indexLabel: '行业索引',
    disclaimer: '全部图形均为原创合成演示。它们不代表客户数据、模型输出或已验证的生产性能。',
    back: '模型研究',
    labels: {
      question: '值得追问',
      reading: '如何阅读',
      signals: '数据形态',
      synthetic: '合成数据示意',
      baseline: '基线分布',
      shifted: '偏移分布',
      baselineShort: '基线',
      tail: '尾部 / 复核',
      week: '周次',
      threshold: '复核线',
      hover: '悬停或选择以读取',
      hour: '小时',
      load: '负荷',
      pair: '指标组合',
      indicatorA: '指标 A',
      indicatorB: '指标 B',
      demandIndex: '需求指数',
      scrub: '拖动查看全天',
      channel: '通道',
      deviation: '偏移窗口',
      normal: '正常范围',
      selected: '当前读数',
    },
    studies: [
      {
        id: 'finance',
        index: '01',
        name: '金融',
        label: '分布与偏移',
        title: '分布与偏移',
        summary: '交易与信用特征很少只有一条干净的分布。观察密度如何从基线向更宽的尾部移动，有助于把“风险上升”拆成更具体的问题。',
        question: '哪些子人群先发生变化，而核心指标还没有反应？',
        reading: '切换基线分布与偏移分布。虚线是复核线，不是模型输出的阈值。',
        signals: ['交易密度', '信用特征', '尾部变化'],
        note: '合成分布示意',
      },
      {
        id: 'energy',
        index: '02',
        name: '能源',
        label: '负荷与周期',
        title: '负荷与周期',
        summary: '日内负荷嵌在更长周期里。一个尖峰可能来自天气，也可能只是周内节律。把时间尺度放在一起，才能判断变化是否值得追踪。',
        question: '今天的偏移里，有多少是节奏，有多少是真正的变化？',
        reading: '拖动时间游标，读取合成负荷曲线在一天中的位置。',
        signals: ['日内曲线', '周期叠加', '需求响应'],
        note: '合成负荷曲线',
      },
      {
        id: 'health',
        index: '03',
        name: '医疗',
        label: '关联与分群',
        title: '关联与分群',
        summary: '结构化指标之间的关联值得被看见，但看见不等于因果。散点与分群只帮助我们提出更好的复核问题。',
        question: '哪些指标组合值得进一步核查，而不是直接下结论？',
        reading: '悬停一个点，比较两组合成指标的局部位置。示意不用于诊断。',
        signals: ['指标关联', '群体差异', '时间变化'],
        note: '合成指标示意 / 不用于诊断',
      },
      {
        id: 'retail',
        index: '04',
        name: '零售',
        label: '需求与季节',
        title: '需求与季节',
        summary: '促销、周末与季节变化会叠在一起。按周与时段展开矩阵，比一条平滑的总量曲线更容易看见需求在哪里集中。',
        question: '需求集中在哪些时段，又在哪些位置变得脆弱？',
        reading: '悬停矩阵单元读取合成需求指数。颜色越亮表示需求越集中。',
        signals: ['周内节律', '促销响应', '库存压力'],
        note: '合成需求矩阵',
      },
      {
        id: 'industry',
        index: '05',
        name: '工业',
        label: '信号与偏差',
        title: '信号与偏差',
        summary: '多个传感器通道通常共享一部分正常波动。真正值得关注的，是某个通道开始离开共同节奏的时刻。',
        question: '哪个通道最先偏离共享节律？',
        reading: '拖动时间轴比较三条合成通道。高亮窗口是示意性的偏移，不是检测结果。',
        signals: ['多通道', '同步性', '偏移窗口'],
        note: '合成传感器信号',
      },
    ],
    close: {
      title: '从你的数据问题开始。',
      body: '如果你的数据有形状、周期或偏移，欢迎把它描述给我们。我们更愿意先讨论问题，再讨论模型。',
      link: '联系我们',
    },
  },
  en: {
    eyebrow: 'Applications / Industry atlas',
    title: 'The shape of numbers in the field.',
    intro: 'A model does not see every industry the same way. Transaction distributions, load cycles, indicator associations, seasonal demand and sensor deviations each require a different data language.',
    meta: 'Five industry studies / Original synthetic illustrations / No client data',
    indexLabel: 'Industry index',
    disclaimer: 'Every graphic is an original synthetic demonstration. It does not represent client data, model output or verified production performance.',
    back: 'Model studies',
    labels: {
      question: 'Question worth asking',
      reading: 'How to read',
      signals: 'Data form',
      synthetic: 'Synthetic data illustration',
      baseline: 'Baseline',
      shifted: 'Shifted',
      baselineShort: 'Baseline',
      tail: 'Tail / review',
      week: 'Week',
      threshold: 'Review line',
      hover: 'Hover or select to read',
      hour: 'Hour',
      load: 'Load',
      pair: 'Indicator pair',
      indicatorA: 'Indicator A',
      indicatorB: 'Indicator B',
      demandIndex: 'Demand index',
      scrub: 'Drag through the day',
      channel: 'Channel',
      deviation: 'Deviation window',
      normal: 'Normal range',
      selected: 'Current reading',
    },
    studies: [
      {
        id: 'finance',
        index: '01',
        name: 'Finance',
        label: 'Distribution and drift',
        title: 'Distribution and drift',
        summary: 'Transaction and credit attributes rarely form one clean distribution. Watching density move from a baseline into a wider tail helps turn “risk is rising” into a more specific question.',
        question: 'Which subpopulations move before the headline metric does?',
        reading: 'Switch between baseline and shifted. The dashed line is a review line, not a model output threshold.',
        signals: ['Transaction density', 'Credit attributes', 'Tail movement'],
        note: 'Synthetic distribution',
      },
      {
        id: 'energy',
        index: '02',
        name: 'Energy',
        label: 'Load and cycles',
        title: 'Load and cycles',
        summary: 'Daily load sits inside longer cycles. A spike may come from weather, or it may simply be part of the weekly rhythm. Time scales need to be read together.',
        question: 'How much of today’s shift is rhythm, and how much is a real change?',
        reading: 'Drag the time cursor to read the synthetic load curve at each hour of the day.',
        signals: ['Daily curve', 'Cycle overlay', 'Demand response'],
        note: 'Synthetic load profile',
      },
      {
        id: 'health',
        index: '03',
        name: 'Healthcare',
        label: 'Association and clusters',
        title: 'Association and clusters',
        summary: 'Associations between structured indicators are worth seeing, but seeing is not causation. Scatter and grouping help us ask better review questions.',
        question: 'Which indicator combinations deserve closer inspection, rather than a conclusion?',
        reading: 'Hover a point to compare two synthetic indicators. This illustration is not for diagnosis.',
        signals: ['Indicator association', 'Group difference', 'Change over time'],
        note: 'Synthetic indicators / not for diagnosis',
      },
      {
        id: 'retail',
        index: '04',
        name: 'Retail',
        label: 'Demand and seasonality',
        title: 'Demand and seasonality',
        summary: 'Promotions, weekends and seasonal change overlap. A matrix by week and time slot makes concentration visible in a way a smoothed total cannot.',
        question: 'Where does demand concentrate, and where does it become fragile?',
        reading: 'Hover a cell to read a synthetic demand index. Brighter cells indicate stronger concentration.',
        signals: ['Weekly rhythm', 'Promotion response', 'Inventory pressure'],
        note: 'Synthetic demand matrix',
      },
      {
        id: 'industry',
        index: '05',
        name: 'Industry',
        label: 'Signals and deviation',
        title: 'Signals and deviation',
        summary: 'Sensor channels usually share some normal variation. What matters is the moment one channel leaves the shared rhythm.',
        question: 'Which channel leaves the shared rhythm first?',
        reading: 'Drag the timeline to compare three synthetic channels. The highlighted window is illustrative, not a detection result.',
        signals: ['Multiple channels', 'Synchrony', 'Deviation window'],
        note: 'Synthetic sensor signals',
      },
    ],
    close: {
      title: 'Start with your data question.',
      body: 'If your data has shape, cycles or drift, describe it to us. We would rather begin with the question than the model.',
      link: 'Get in touch',
    },
  },
};
