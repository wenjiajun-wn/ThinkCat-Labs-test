import type {Locale} from '../config/i18n';

type LocalizedText = Record<Locale, string>;

export const researchDirections: readonly {title: LocalizedText; detail: LocalizedText}[] = [
  {
    title: {zh: '表格基础模型', en: 'Tabular foundation models'},
    detail: {zh: '研究如何从行列和不同特征类型中学习上下文。', en: 'Study how to learn context from rows, columns and heterogeneous features.'},
  },
  {
    title: {zh: '时间序列基础模型', en: 'Time series foundation models'},
    detail: {zh: '研究时间动态、预测与不确定性。', en: 'Study temporal dynamics, forecasting and uncertainty.'},
  },
  {
    title: {zh: '异常检测', en: 'Anomaly detection'},
    detail: {zh: '研究如何在标注样本稀少时识别异常模式。', en: 'Study how to identify anomalous patterns with sparse labels.'},
  },
  {
    title: {zh: '时空学习', en: 'Spatiotemporal learning'},
    detail: {zh: '研究空间关系与时间变化的联合建模。', en: 'Study how to model spatial relationships and temporal changes together.'},
  },
  {
    title: {zh: '持续评估', en: 'Continuously updated benchmarks'},
    detail: {zh: '研究可复现且可持续更新的模型评估方法。', en: 'Study reproducible evaluation methods that can be updated over time.'},
  },
];

type ResearchOutput = {
  title: LocalizedText;
  status: 'pending' | 'verified';
  url: string | null;
};

export const researchOutputs: readonly ResearchOutput[] = [
  {title: {zh: 'Outformer', en: 'Outformer'}, status: 'pending', url: null},
  {title: {zh: 'FoMo', en: 'FoMo'}, status: 'pending', url: null},
  {title: {zh: 'DiffSTG', en: 'DiffSTG'}, status: 'pending', url: null},
  {title: {zh: '时间序列基础模型综述', en: 'Time Series Foundation Model Survey'}, status: 'pending', url: null},
  {title: {zh: '时间序列基础模型持续评测', en: 'TSFM Live Benchmark'}, status: 'pending', url: null},
];

export const researchCopy = {
  zh: {
    eyebrow: '研究 / 可检验的问题',
    title: '研究方向',
    intro: '我们研究表格、时间序列、异常检测与可复现的评估方法。论文信息待核实。',
    meta: '五项研究议题 / 成果待核验 / 不以愿景代替证据',
    directions: '研究议题',
    directionsLabel: '研究领域 / 05',
    outputs: '成果核验',
    outputsLabel: '成果 / 核验',
    closeTitle: '把问题带回模型。',
    note: '以下为现有材料中的候选条目。作者关系、发表信息和公开链接有待确认。',
    status: {pending: '待确认', verified: '已核实'},
    outputsEmpty: '在核实公开链接与作者信息之前，这里只显示条目名称。',
    back: '查看模型',
    aside: '研究从问题开始，而不是从演示开始。',
  },
  en: {
    eyebrow: 'Research / Testable questions',
    title: 'Research directions',
    intro: 'We study tables, time series, anomaly detection and reproducible evaluation. Publication details are pending verification.',
    meta: 'Five research areas / Outputs pending verification / Evidence before narrative',
    directions: 'Research areas',
    directionsLabel: 'Research areas / 05',
    outputs: 'Research output verification',
    outputsLabel: 'Outputs / Verification',
    closeTitle: 'Bring the question back to the model.',
    note: 'These entries come from existing project materials. Authorship, publication details and public links are pending verification.',
    status: {pending: 'Pending verification', verified: 'Verified'},
    outputsEmpty: 'Until public links and authorship are verified, only entry titles are shown.',
    back: 'See models',
    aside: 'Research starts with a question, not a demo.',
  },
} as const;
