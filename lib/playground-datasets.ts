import wineLarge from '../content/datasets/46964.json';
import customerLarge from '../content/datasets/46938.json';
import fitnessLarge from '../content/datasets/46927.json';
import shippingLarge from '../content/datasets/46924.json';
import airlineLarge from '../content/datasets/46920.json';
import telecomLarge from '../content/datasets/46915.json';
import career from '../content/datasets/46935.json';
import bank from '../content/datasets/46910.json';
import credit from '../content/datasets/46918.json';
import cardDefault from '../content/datasets/46919.json';
import anneal from '../content/datasets/46906.json';
import diabetes from '../content/datasets/46921.json';
import shopping from '../content/datasets/46947.json';
import seismic from '../content/datasets/46956.json';
import marketing from '../content/datasets/46940.json';
import students from '../content/datasets/46960.json';
import heloc from '../content/datasets/46932.json';
import food from '../content/datasets/46930.json';
import blood from '../content/datasets/46913.json';
import maternal from '../content/datasets/46941.json';
import defects from '../content/datasets/46979.json';
import type {Locale} from '../config/i18n';
import type {ParsedCsv} from './csv';
import {buildKumoDataset} from './kumo-api';

type DatasetData = typeof blood;
export type PlaygroundExample = {
  id: string;
  name: Record<Locale, string>;
  domain: Record<Locale, string>;
  source: string;
  originalSource: string;
  license: string;
  attribution: string;
  task: 'numeric-classification';
  data: DatasetData;
};

const registeredExamples: readonly PlaygroundExample[] = [
  {id: '46913', name: {zh: '献血记录', en: 'Blood donation records'}, domain: {zh: '献血服务', en: 'Blood donation services'}, source: 'https://www.openml.org/d/46913', originalSource: 'https://doi.org/10.24432/C5GS39', license: 'CC BY 4.0', attribution: 'Yeh, Yang & Ting (2009); TabArena Team', task: 'numeric-classification', data: blood},
  {id: '46941', name: {zh: '孕产健康风险', en: 'Maternal health risk'}, domain: {zh: '健康研究', en: 'Health research'}, source: 'https://www.openml.org/d/46941', originalSource: 'https://doi.org/10.24432/C5DP5D', license: 'CC BY 4.0', attribution: 'Ahmed et al. (2020); TabArena Team', task: 'numeric-classification', data: maternal},
  {id: '46979', name: {zh: '软件缺陷 · JM1', en: 'Software defects · JM1'}, domain: {zh: '软件质量', en: 'Software quality'}, source: 'https://www.openml.org/d/46979', originalSource: 'https://www.openml.org/d/1053', license: 'Public Domain', attribution: 'Menzies & Di Stefano (2004); TabArena Team', task: 'numeric-classification', data: defects},
  {"id": "46935", "name": {"zh": "求职意向（数值字段）", "en": "Job change · numeric fields"}, "domain": {"zh": "人力资源", "en": "Human resources"}, "source": "https://www.openml.org/d/46935", "originalSource": "https://www.kaggle.com/datasets/arashnic/hr-analytics-job-change-of-data-scientists", "license": "CC0: Public Domain", "attribution": "Kaggle User Arashnic. 'HR Analytics: Job Change of Data Scientists.' Kaggle, 2021, https://www.kaggle.com/datasets/arashnic/hr-analytics-job-change-of-data-scientists.; TabArena Team", "task": "numeric-classification", "data": career},
  {"id": "46910", "name": {"zh": "银行营销（数值字段）", "en": "Bank marketing · numeric fields"}, "domain": {"zh": "银行营销", "en": "Bank marketing"}, "source": "https://www.openml.org/d/46910", "originalSource": "https://doi.org/10.24432/C5K306", "license": "CC BY 4.0", "attribution": "Moro, Sergio, Paulo Cortez, and Paulo Rita. 'A data-driven approach to predict the success of bank telemarketing.' Decision Support Systems 62 (2014): 22-31. https://doi.org/10.1016/j.dss.2014.03.001; TabArena Team", "task": "numeric-classification", "data": bank},
  {"id": "46918", "name": {"zh": "德国信贷（数值字段）", "en": "German credit · numeric fields"}, "domain": {"zh": "信用评估", "en": "Credit assessment"}, "source": "https://www.openml.org/d/46918", "originalSource": "https://doi.org/10.24432/C5NC77", "license": "CC BY 4.0", "attribution": "Hofmann, H. (1994). Statlog (German Credit Data) [Dataset]. UCI Machine Learning Repository. https://doi.org/10.24432/C5NC77.; TabArena Team", "task": "numeric-classification", "data": credit},
  {"id": "46921", "name": {"zh": "糖尿病检测记录", "en": "Diabetes test records"}, "domain": {"zh": "健康研究", "en": "Health research"}, "source": "https://www.openml.org/d/46921", "originalSource": "https://www.openml.org/d/37", "license": "CC0: Public Domain", "attribution": "Smith, Jack W., et al. 'Using the ADAP learning algorithm to forecast the onset of diabetes mellitus.' Proceedings of the annual symposium on computer application in medical care. 1988. https://pmc.ncbi.nlm.nih.gov/articles/PMC2245318/; TabArena Team", "task": "numeric-classification", "data": diabetes},
  {"id": "46947", "name": {"zh": "网购意向（数值字段）", "en": "Shopping intention · numeric fields"}, "domain": {"zh": "电子商务", "en": "E-commerce"}, "source": "https://www.openml.org/d/46947", "originalSource": "https://doi.org/10.24432/C5F88Q", "license": "CC BY 4.0", "attribution": "Sakar, C. Okan, et al. 'Real-time prediction of online shoppers purchasing intention using multilayer perceptron and LSTM recurrent neural networks.' Neural Computing and Applications 31.10 (2019): 6893-6908.  https://doi.org/10.1007/s00521-018-3523-0; TabArena Team", "task": "numeric-classification", "data": shopping},
  {"id": "46956", "name": {"zh": "矿井震动（数值字段）", "en": "Seismic bumps · numeric fields"}, "domain": {"zh": "矿业监测", "en": "Mining monitoring"}, "source": "https://www.openml.org/d/46956", "originalSource": "https://doi.org/10.24432/C5W902", "license": "CC BY 4.0", "attribution": "Sikora, Marek, and ukasz Wrobel. 'Application of rule induction algorithms for analysis of data collected by seismic hazard monitoring systems in coal mines.' Archives of Mining Sciences 55.1 (2010): 91-114. http://yadda.icm.edu.pl/baztech/element/bwmeta1.element.baztech-article-BPZ5-0008-0008; TabArena Team", "task": "numeric-classification", "data": seismic},
  {"id": "46940", "name": {"zh": "营销活动（数值字段）", "en": "Marketing campaign · numeric fields"}, "domain": {"zh": "市场营销", "en": "Marketing"}, "source": "https://www.openml.org/d/46940", "originalSource": "https://www.kaggle.com/datasets/rodsaldanha/arketing-campaign", "license": "Public", "attribution": "Saldanha, Rodolfo. 'Marketing Campaign.' Kaggle, 2020, https://www.kaggle.com/datasets/rodsaldanha/arketing-campaign.; TabArena Team", "task": "numeric-classification", "data": marketing},
  {"id": "46960", "name": {"zh": "学业结果（数值字段）", "en": "Academic outcomes · numeric fields"}, "domain": {"zh": "教育研究", "en": "Education research"}, "source": "https://www.openml.org/d/46960", "originalSource": "https://doi.org/10.24432/C5MC89", "license": "CC BY 4.0", "attribution": "Martins, Monica V., et al. 'Early prediction of students performance in higher education: A case study.' Trends and Applications in Information Systems and Technologies: Volume 1 9. Springer International Publishing, 2021.  https://doi.org/10.1007/978-3-030-72657-7_16; TabArena Team", "task": "numeric-classification", "data": students},
  {"id": "46932", "name": {"zh": "房屋净值信贷 · HELOC", "en": "Home equity credit · HELOC"}, "domain": {"zh": "信用评估", "en": "Credit assessment"}, "source": "https://www.openml.org/d/46932", "originalSource": "https://www.kaggle.com/datasets/averkiyoliabev/home-equity-line-of-creditheloc", "license": "Public", "attribution": "Kaggle User Averkiyoliabev. 'Home Equity Line of Credit (HELOC).' Kaggle, 2021, https://www.kaggle.com/datasets/averkiyoliabev/home-equity-line-of-creditheloc.; TabArena Team", "task": "numeric-classification", "data": heloc},
  {"id": "46930", "name": {"zh": "榛子酱污染检测", "en": "Hazelnut contamination detection"}, "domain": {"zh": "食品检测", "en": "Food inspection"}, "source": "https://www.openml.org/d/46930", "originalSource": "https://www.openml.org/search?type=data&status=active&id=45538", "license": "CC BY-SA", "attribution": "Ricci, Marco, et al. 'Machine-learning-based microwave sensing: A case study for the food industry.' IEEE Journal on Emerging and Selected Topics in Circuits and Systems 11.3 (2021): 503-514. https://doi.org/10.1109/JETCAS.2021.3097699; Urbinati, Luca, et al. 'A machine-learning based microwave sensing approach to food contaminant detection.' 2020 IEEE International Symposium on Circuits and Systems (ISCAS). IEEE, 2020. https://doi.org/10.1109/ISCAS45731.2020.9181293; TabArena Team", "task": "numeric-classification", "data": food},
  {id: '46919', name: {zh: '信用卡违约（数值字段）', en: 'Credit card default · numeric fields'}, domain: {zh: '信用风险', en: 'Credit risk'}, source: 'https://www.openml.org/d/46919', originalSource: 'https://doi.org/10.24432/C55S3H', license: 'CC BY 4.0', attribution: "Yeh, I-Cheng, and Che-hui Lien. 'The comparisons of data mining techniques for the predictive accuracy of probability of default of credit card clients.' Expert Systems with Applications 36.2 (2009): 2473–2480. https://doi.org/10.1016/j.eswa.2007.12.020; TabArena Team", task: 'numeric-classification', data: cardDefault},
  {id: '46906', name: {zh: '钢材退火（数值字段）', en: 'Steel annealing · numeric fields'}, domain: {zh: '材料分类', en: 'Material classification'}, source: 'https://www.openml.org/d/46906', originalSource: 'https://doi.org/10.24432/C5RW2F', license: 'CC BY 4.0', attribution: 'Annealing. UCI Machine Learning Repository (1990). https://doi.org/10.24432/C5RW2F; TabArena Team', task: 'numeric-classification', data: anneal},
{"id": "46915", "name": {"zh": "通信客户流失", "en": "Telecom customer churn"}, "domain": {"zh": "数值分类", "en": "Numerical classification"}, "source": "https://www.openml.org/d/46915", "originalSource": "https://www.openml.org/d/46915", "license": "MIT License", "attribution": "Marcoulides, George A. 'Discovering Knowledge in Data: an Introduction to Data Mining.' (2005): 1465-1465. https://www.tandfonline.com/doi/abs/10.1198/jasa.2005.s61; TabArena Team", "task": "numeric-classification", data: telecomLarge},
{"id": "46920", "name": {"zh": "航空服务满意度", "en": "Airline satisfaction"}, "domain": {"zh": "数值分类", "en": "Numerical classification"}, "source": "https://www.openml.org/d/46920", "originalSource": "https://www.kaggle.com/datasets/yakhyojon/customer-satisfaction-in-airline", "license": "CC0: Public Domain", "attribution": "Kaggle User Yakhyojon. 'Customer Satisfaction in Airline.' Kaggle, 2023, https://www.kaggle.com/datasets/yakhyojon/customer-satisfaction-in-airline.; TabArena Team", "task": "numeric-classification", data: airlineLarge},
{"id": "46924", "name": {"zh": "物流到货分析", "en": "Shipping arrival analysis"}, "domain": {"zh": "数值分类", "en": "Numerical classification"}, "source": "https://www.openml.org/d/46924", "originalSource": "https://www.kaggle.com/datasets/prachi13/customer-analytics", "license": "Public Domain", "attribution": "Prachi Gopalani. 'E-Commerce Shipping Data.' Kaggle, 2021, https://www.kaggle.com/datasets/prachi13/customer-analytics.; TabArena Team", "task": "numeric-classification", data: shippingLarge},
{"id": "46927", "name": {"zh": "健身预约出席", "en": "Fitness booking attendance"}, "domain": {"zh": "数值分类", "en": "Numerical classification"}, "source": "https://www.openml.org/d/46927", "originalSource": "https://www.kaggle.com/datasets/ddosad/datacamps-data-science-associate-certification", "license": "Public Domain", "attribution": "Kaggle User Ddosad. 'Fitness Club Dataset for ML Classification.' Kaggle, 2023, https://www.kaggle.com/datasets/ddosad/datacamps-data-science-associate-certification.; TabArena Team", "task": "numeric-classification", data: fitnessLarge},
{"id": "46938", "name": {"zh": "客户信用类别", "en": "Customer credit classification"}, "domain": {"zh": "数值分类", "en": "Numerical classification"}, "source": "https://www.openml.org/d/46938", "originalSource": "https://www.kaggle.com/datasets/podsyp/is-this-a-good-customer", "license": "CC0: Public Domain", "attribution": "Kaggle User Podsyp. 'Is This a Good Customer?' Kaggle, 2020, https://www.kaggle.com/datasets/podsyp/is-this-a-good-customer.; TabArena Team", "task": "numeric-classification", data: customerLarge},
{"id": "46964", "name": {"zh": "葡萄酒质量分级", "en": "Wine quality grading"}, "domain": {"zh": "数值分类", "en": "Numerical classification"}, "source": "https://www.openml.org/d/46964", "originalSource": "https://doi.org/10.24432/C56S3T", "license": "CC BY 4.0", "attribution": "Cortez, Paulo, et al. 'Modeling wine preferences by data mining from physicochemical properties.' Decision support systems 47.4 (2009): 547-553. https://doi.org/10.1016/j.dss.2009.05.016; TabArena Team", "task": "numeric-classification", data: wineLarge},

];

export const playgroundExamples: readonly PlaygroundExample[] = [...registeredExamples]
  .sort((a, b) => b.data.rows.length - a.data.rows.length);

export function exampleSource(example: PlaygroundExample) {
  const {data} = example;
  const labelIndex = data.headers.indexOf(data.target);
  const csv: ParsedCsv = {headers: [...data.headers], rows: data.rows.map(row => [...row]), rowLineNumbers: [...data.sourceRecords], fileName: `openml-${example.id}.csv`, size: new TextEncoder().encode(JSON.stringify(data.rows)).length};
  const checked = buildKumoDataset(csv, labelIndex);
  if (!checked.ok || checked.data.queryIndices.join(',') !== data.queryIndices.join(',') || checked.data.supportCount !== data.supportIndices.length) throw new Error(`Invalid configured dataset: ${example.id}`);
  return {csv, labelIndex, exampleId: example.id};
}

export function nextExample(currentId: string | null, examples = playgroundExamples) {
  if (examples.length < 2) return null;
  return examples[(examples.findIndex(example => example.id === currentId) + 1) % examples.length];
}
