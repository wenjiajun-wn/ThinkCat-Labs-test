import type {DocId} from './docs-navigation';
import {classificationExample} from './classification-example';

type Text = {zh: string; en: string};
const t = (zh: string, en: string): Text => ({zh, en});
type Table = {columns: Text[]; rows: Text[][]};
type Section = {
  id: string; title: Text; text?: Text; placeholder?: Text; code?: string;
  language?: string; table?: Table; links?: DocId[];
};
type Document = {title: Text; intro: Text; sections: Section[]};
const section = (id: string, zh: string, en: string, content: Partial<Omit<Section, 'id' | 'title'>> = {}): Section =>
  ({id, title: t(zh, en), ...content});

export const installCommand: string = '';
export const httpExample: string = '';
export const pending = t('待补充', 'Details to follow.');
const parameters = (): Table => ({
  columns: [t('参数', 'Parameter'), t('类型', 'Type'), t('说明', 'Description')], rows: [],
});
const response = (): Table => ({
  columns: [t('字段', 'Field'), t('类型', 'Type'), t('说明', 'Description')], rows: [],
});
export const documents: Record<DocId, Document> = {
  overview: {
    title: t('开发者文档', 'Developer documentation'),
    intro: t('ThinkCat 开发者文档提供 Python 接口的使用示例、数据准备说明与 API 参考。你可以从快速开始了解分类任务的调用流程。', 'Explore the Python classification example, prepare your data and browse the API reference.'),
    sections: [
      section('start', '开始使用', 'Getting started', {text: t('文档预览：安装与接入信息将陆续补充。', 'Documentation preview. Installation and access details will follow.'), links: ['quickstart']}),
      section('reference', '指南与参考', 'Guides and reference', {links: ['data', 'python-sdk', 'http-api']}),
    ],
  },
  quickstart: {
    title: t('快速开始', 'Quickstart'),
    intro: t('使用示例数据集，了解从划分样本到读取分类预测的过程。', 'Follow a classification example from splitting a dataset to reading its predictions.'),
    sections: [
      section('install', '安装', 'Install', {code: installCommand, language: 'Shell', placeholder: t('安装说明待补充', 'Installation instructions to follow.')}),
      section('configuration', '必要配置', 'Configuration', {placeholder: t('配置说明待补充', 'Configuration details to follow.')}),
      section('classification', '分类示例', 'Classification', {code: classificationExample, language: 'Python'}),
      section('results', '查看结果', 'View results', {placeholder: t('示例输出待补充', 'Example output to follow.')}),
      section('next', '下一步', 'Next steps', {links: ['data', 'python-sdk', 'http-api']}),
    ],
  },
  data: {
    title: t('准备自己的数据', 'Prepare your data'), intro: t('从分类示例中的特征和标签开始。', 'Start with the features and labels in the classification example.'),
    sections: [
      section('features', '示例中的 X 与 y', 'X and y', {text: t('X 是样本的特征矩阵，y 是与每一行对应的分类标签。', 'X contains the feature rows. Each entry in y is the class label for the corresponding row.')}),
      section('split', '训练数据与待预测数据', 'Training and prediction data', {text: t('示例将 20% 的样本划为测试集。fit 接收 X_train 和 y_train，predict 接收 X_test。', 'The example sets aside 20% of the samples for testing. fit takes X_train and y_train, and predict takes X_test.')}),
      section('formats','支持的数据格式','Supported formats'), section('csv','使用自己的 CSV','Use your CSV'),
      section('missing','数据类型与缺失值要求','Types and missing values'), section('checks','数据检查','Data checks'),
    ],
  },
  'python-sdk': {
    title: t('Python SDK','Python SDK'), intro: t('按示例中的调用顺序查阅分类器接口。','Follow the classifier calls in the order used by the example.'),
    sections: [
      section('import','导入方式','Import',{text:t('从 thinkcat_client 导入 ThinkcatClassifier。','Import ThinkcatClassifier from thinkcat_client.')}),
      section('classifier','ThinkcatClassifier','ThinkcatClassifier',{text:t('分类示例使用的类。','The class used in the classification example.')}),
      section('instance','创建实例','Create an instance',{text:t('示例使用 ThinkcatClassifier() 创建 model。','The example creates model with ThinkcatClassifier().')}),
      section('fit','fit 的调用方式','Call fit',{text:t('model.fit(X_train, y_train) 接收训练特征与对应标签。','model.fit(X_train, y_train) takes the training features and labels.')}),
      section('predict','predict 的调用方式','Call predict',{text:t('示例将 model.predict(X_test) 的结果保存为 predictions。','The example assigns the result of model.predict(X_test) to predictions.')}),
      section('parameters','参数说明','Parameters',{table:parameters()}), section('returns','返回结果','Return values',{table:response()}),
      section('client-config','客户端配置','Client configuration'),
    ],
  },
  'http-api': {
    title:t('HTTP API','HTTP API'), intro:t('查阅 HTTP 接入、请求与响应的文档结构。','Reference for HTTP access, requests and responses.'),
    sections:[
      section('origin','服务地址','Service address'), section('auth','访问与认证','Access and authentication'),
      section('endpoint','请求方法与路径','Method and path'), section('headers','请求头','Request headers',{table:parameters()}),
      section('parameters','请求参数','Request parameters',{table:parameters()}), section('response','响应结构','Response structure',{table:response()}),
      section('example','调用示例','Request example',{code:httpExample,language:'Shell'}),
    ],
  },
  errors:{
    title:t('错误与限制','Errors and limits'), intro:t('按问题出现的环节查找说明。','Find help by the stage at which a problem occurs.'),
    sections:[
      section('installation','安装与环境问题','Installation and environment'), section('format','数据格式问题','Data format issues'),
      section('connection','连接与请求问题','Connection and request issues'),
      section('messages','错误信息','Error messages',{table:{columns:[t('错误','Error'),t('说明','Description'),t('处理方式','Resolution')],rows:[]}}),
      section('limits','使用限制','Usage limits'), section('faq','常见问题','Common questions'),
    ],
  },
};
export const docLabels = {
  zh: {overview:'概览', nav:'文档导航', toc:'本页目录', copy:'复制完整代码', copied:'已复制', failed:'请手动复制'},
  en: {overview:'Overview', nav:'Documentation navigation', toc:'On this page', copy:'Copy full code', copied:'Copied', failed:'Copy manually'},
};
