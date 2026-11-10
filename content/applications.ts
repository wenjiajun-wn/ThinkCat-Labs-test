import type {Locale} from '../config/i18n';
import type {ModelId} from '../config/models';
import type {IndustryId} from './solutions';

type Scenario = {title: string; body: string; visual: IndustryId};
type ApplicationsCopy = {
  title: string;
  intro: string;
  scenarios: Record<ModelId, Scenario>;
};

export const applicationsCopy: Record<Locale, ApplicationsCopy> = {
  zh: {
    title: '模型应用场景',
    intro: '从交易复核到用电预测和设备监测，了解三种模型各自处理什么数据、研究什么任务。',
    scenarios: {
      tabular: {
        title: '金融交易复核',
        body: '将交易金额、频次和账户特征整理成表格，用少量已标注的交易研究如何筛出值得人工复核的记录。配图标示了交易分布中的复核位置。',
        visual: 'finance',
      },
      'time-series': {
        title: '电力负荷预测',
        body: '输入按小时记录的历史负荷，研究如何预测接下来几小时的用电需求。配图展示了不同的日内负荷曲线和一个峰值观察点。',
        visual: 'energy',
      },
      unified: {
        title: '工业设备状态监测',
        body: '将设备规格和维护记录与连续的传感器读数结合，探索能否用同一套表征比较不同设备的运行状态。配图标出一个传感器通道发生偏移的时段。',
        visual: 'industry',
      },
    },
  },
  en: {
    title: 'Model applications',
    intro: 'See what data each model uses and what tasks it could support, from transaction review to power forecasting and equipment monitoring.',
    scenarios: {
      tabular: {
        title: 'Financial transaction review',
        body: 'Organize amounts, transaction frequency and account attributes in a table. A few labeled examples can help study how to flag records for human review. The chart marks a review point in a sample distribution.',
        visual: 'finance',
      },
      'time-series': {
        title: 'Electricity load forecasting',
        body: 'Use hourly load history to study how to forecast electricity demand over the next few hours. The chart shows several daily load profiles and a point for examining peak demand.',
        visual: 'energy',
      },
      unified: {
        title: 'Industrial equipment monitoring',
        body: 'Combine equipment specifications and maintenance records with sensor streams to study whether a shared representation can compare operating conditions across machines. The chart highlights a deviation in one sensor channel.',
        visual: 'industry',
      },
    },
  },
};
