import type {Locale} from '../config/i18n';
import type {ModelId} from '../config/models';
import type {IndustryId} from './solutions';

type Scenario = {title: string; body: string; visual: IndustryId; imageAlt: string};
export const applicationDatasets: Record<ModelId, string> = {
  tabular: '46919',
  'time-series': '46956',
  unified: '46906',
};
// Homepage display metadata only. The data registry and held-out labels stay in Playground.
export const additionalApplications = [
  {id: 'bank', datasetId: '46910', task: 'binary'},
  {id: 'telecom', datasetId: '46915', task: 'binary'},
  {id: 'airline', datasetId: '46920', task: 'binary'},
  {id: 'shipping', datasetId: '46924', task: 'binary'},
  {id: 'fitness', datasetId: '46927', task: 'binary'},
  {id: 'customer', datasetId: '46938', task: 'binary'},
  {id: 'wine', datasetId: '46964', task: 'multiclass'},
  {id: 'commerce', datasetId: '46947', task: 'binary'},
  {id: 'software', datasetId: '46979', task: 'binary'},
  {id: 'food', datasetId: '46930', task: 'binary'},
  {id: 'education', datasetId: '46960', task: 'multiclass'},
] as const;
type AdditionalApplicationId = typeof additionalApplications[number]['id'];
type ApplicationsCopy = {
  title: string;
  runExample: string;
  browseLabel: string;
  scenarios: Record<ModelId, Scenario>;
  additional: Record<AdditionalApplicationId, {domain: string; title: string; body: string; imageAlt: string}>;
};

export const applicationsCopy: Record<Locale, ApplicationsCopy> = {
  zh: {
    title: '模型应用场景',
    runExample: '运行示例',
    browseLabel: '可独立滚动的模型应用示例',
    scenarios: {
      tabular: {
        title: '信用卡风险复核',
        body: '根据授信额度、账单与还款记录，预测下个月是否发生违约。',
        visual: 'finance',
        imageAlt: '信用额度、账单金额和历史还款记录汇入违约风险评分与风险复核的示意图',
      },
      'time-series': {
        title: '矿井震动风险',
        body: '根据班次震动能量、脉冲与事件统计，预测下一班次的高能震动风险。',
        visual: 'energy',
        imageAlt: '矿井震动能量趋势示意图，展示三个测点、预警阈值与风险峰值',
      },
      unified: {
        title: '钢材类别识别',
        body: '根据碳含量、硬度、强度与尺寸，识别钢材退火记录的类别。',
        visual: 'industry',
        imageAlt: '钢材特征与类别识别示意图；图中牌号仅用于示意，不代表在线示例的原始类别',
      },
    },
    additional: {
      bank: {"domain": "10,000 行真实记录 · 50 行待预测", "title": "银行营销响应", "body": "根据年龄、余额与历史联系记录，识别定期存款订阅意向。", "imageAlt": "银行营销响应的概念示意图，不代表实际预测结果"},
      telecom: {"domain": "5,000 行真实记录 · 50 行待预测", "title": "通信客户流失", "body": "根据通话时长、费用和客服记录，识别客户流失类别。", "imageAlt": "通信客户流失的概念示意图，不代表实际预测结果"},
      airline: {"domain": "4,000 行真实记录 · 50 行待预测", "title": "航空服务满意度", "body": "结合飞行距离、登机评分与延误记录，识别旅客满意度类别。", "imageAlt": "航空服务满意度的概念示意图，不代表实际预测结果"},
      shipping: {"domain": "8,000 行真实记录 · 50 行待预测", "title": "物流到货分析", "body": "根据商品成本、重量、折扣及服务记录，识别货物是否延迟到达。", "imageAlt": "物流到货分析的概念示意图，不代表实际预测结果"},
      fitness: {"domain": "1,480 行真实记录 · 50 行待预测", "title": "健身预约出席", "body": "根据会员时长、体重与提前预约天数，识别预约是否出席。", "imageAlt": "健身预约出席的概念示意图，不代表实际预测结果"},
      customer: {"domain": "1,723 行真实记录 · 50 行待预测", "title": "客户信用类别", "body": "根据收入、年龄、贷款金额与期限，识别数据中的信用类别。", "imageAlt": "客户信用类别的概念示意图，不代表实际预测结果"},
      wine: {"domain": "6,497 行真实记录 · 50 行待预测", "title": "葡萄酒质量分级", "body": "根据酸度、密度和酒精含量等理化指标，识别质量评分等级。", "imageAlt": "葡萄酒质量分级的概念示意图，不代表实际预测结果"},
      commerce: {domain: '电商分析', title: '电商购买意向', body: '根据访问页面、停留时间与跳出率，预测一次访问是否产生购买。', imageAlt: '访问轨迹经过特征节点后分为两组的概念图'},
      software: {domain: '软件质量', title: '软件缺陷识别', body: '根据代码规模与复杂度指标，识别可能存在缺陷的软件模块。', imageAlt: '软件复杂度特征矩阵与模块关系的概念图'},
      food: {domain: '食品检测', title: '食品污染识别', body: '根据榛子酱样本的检测信号，识别样本是否受到污染。', imageAlt: '三组检测信号与局部差异峰值的概念图'},
      education: {domain: '教育研究', title: '学业结局分析', body: '结合入学信息与学期表现，预测辍学、在读或毕业类别。', imageAlt: '学习路径经过多个阶段后分为三组的概念图'},
    },
  },
  en: {
    title: 'Model applications',
    runExample: 'Run example',
    browseLabel: 'Scrollable model application examples',
    scenarios: {
      tabular: {
        title: 'Credit card risk review',
        body: 'Predict next-month default from credit limits, bills and repayment records.',
        visual: 'finance',
        imageAlt: 'Illustration of credit limits, bills and repayment history informing default risk scoring and review; labels are in Chinese',
      },
      'time-series': {
        title: 'Seismic risk in mining',
        body: 'Predict high-energy seismic risk in the next shift from recorded energy, pulses and event counts.',
        visual: 'energy',
        imageAlt: 'Illustration of mining seismic energy trends at three observation points, with a warning threshold and risk peak; labels are in Chinese',
      },
      unified: {
        title: 'Steel category classification',
        body: 'Classify steel annealing records using carbon content, hardness, strength and dimensions.',
        visual: 'industry',
        imageAlt: 'Illustration of steel features and classification; pictured grades are illustrative, not the online dataset labels. Text is in Chinese',
      },
    },
    additional: {
      bank: {"domain": "10,000 real records · 50 query rows", "title": "Bank marketing response", "body": "Classify term-deposit subscription using age, balance and contact history.", "imageAlt": "Concept illustration of bank marketing response, not a model prediction"},
      telecom: {"domain": "5,000 real records · 50 query rows", "title": "Telecom customer churn", "body": "Classify customer churn using call duration, charges and service interactions.", "imageAlt": "Concept illustration of telecom customer churn, not a model prediction"},
      airline: {"domain": "4,000 real records · 50 query rows", "title": "Airline satisfaction", "body": "Classify passenger satisfaction using flight distance, boarding scores and delays.", "imageAlt": "Concept illustration of airline satisfaction, not a model prediction"},
      shipping: {"domain": "8,000 real records · 50 query rows", "title": "Shipping arrival analysis", "body": "Classify late arrivals using product cost, weight, discounts and service records.", "imageAlt": "Concept illustration of shipping arrival analysis, not a model prediction"},
      fitness: {"domain": "1,480 real records · 50 query rows", "title": "Fitness booking attendance", "body": "Classify attendance using membership duration, weight and booking lead time.", "imageAlt": "Concept illustration of fitness booking attendance, not a model prediction"},
      customer: {"domain": "1,723 real records · 50 query rows", "title": "Customer credit classification", "body": "Classify recorded credit outcomes using income, age, loan amount and term.", "imageAlt": "Concept illustration of customer credit classification, not a model prediction"},
      wine: {"domain": "6,497 real records · 50 query rows", "title": "Wine quality grading", "body": "Classify quality grades using acidity, density, alcohol and other chemical measurements.", "imageAlt": "Concept illustration of wine quality grading, not a model prediction"},
      commerce: {domain: 'E-commerce analytics', title: 'Online purchase intention', body: 'Predict whether a visit leads to a purchase using page views, visit duration and bounce rates.', imageAlt: 'Concept diagram of visit trajectories passing feature nodes and separating into two groups'},
      software: {domain: 'Software quality', title: 'Software defect detection', body: 'Identify potentially defective software modules using code size and complexity metrics.', imageAlt: 'Concept diagram of a software complexity matrix connected to module relationships'},
      food: {domain: 'Food testing', title: 'Food contamination detection', body: 'Identify contamination in hazelnut spread samples using their measured detection signals.', imageAlt: 'Concept diagram of three detection signals with a distinctive local peak'},
      education: {domain: 'Education research', title: 'Academic outcome analysis', body: 'Predict dropout, enrollment or graduation categories using admission information and semester performance.', imageAlt: 'Concept diagram of learning trajectories through milestones into three outcome groups'},
    },
  },
};
