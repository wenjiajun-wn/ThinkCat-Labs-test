import type {ModelId} from '../config/models';

type ModelStudy = {
  kicker: string;
  name: string;
  short: string;
  summary: string;
  focus: string;
  tasks: readonly string[];
  figure: string;
  note: string;
  interaction: string;
  details: readonly {title: string; body: string}[];
  params?: readonly {label: string; value: string}[];
};

type ProductsPageCopy = {
  eyebrow: string;
  title: string;
  intro: string;
  meta: string;
  labels: {
    status: string;
    version: string;
    focus: string;
    tasks: string;
    resources: string;
    links: string;
    pending: string;
    synthetic: string;
    docs: string;
    playground: string;
    docsAction: string;
    playgroundAction: string;
    studyNotes: string;
    closeNotes: string;
    modelIndex: string;
    scrollHint: string;
    notPublished: string;
    github: string;
    huggingFace: string;
  };
  tabular: {
    axisX: string;
    axisY: string;
    legend: string;
    selected: string;
    reading: string;
    instruction: string;
  };
  time: {
    observed: string;
    forecast: string;
    interval: string;
    origin: string;
    scrub: string;
    horizon: string;
  };
  unified: {
    tableSide: string;
    seriesSide: string;
    linkLabel: string;
    instruction: string;
    pair: string;
  };
  resources: {title: string; body: string; docs: string; playground: string};
  studies: Record<ModelId, ModelStudy>;
};

export const productsCopy: {zh: ProductsPageCopy; en: ProductsPageCopy} = {
  zh: {
    eyebrow: '模型 / 研究进行中',
    title: '数值基础模型',
    intro: '从表格到时间序列，再到统一表征。三个研究模型共享同一个问题：模型如何从上下文中读取数值结构。',
    meta: '三项模型研究 / 全部处于研究阶段 / 合成数据示意',
    labels: {
      status: '状态',
      version: '版本',
      focus: '技术方向',
      tasks: '研究任务',
      resources: '开发者入口',
      links: '公开资源',
      pending: '待确认',
      synthetic: '合成数据示意',
      docs: 'API 文档',
      playground: '在线体验',
      docsAction: '查看接口草案',
      playgroundAction: '打开本地浏览器演示',
      studyNotes: '技术说明',
      closeNotes: '收起说明',
      modelIndex: '模型索引',
      scrollHint: '向下滚动查看三项研究',
      notPublished: '尚未发布',
      github: 'GitHub',
      huggingFace: 'Hugging Face',
    },
    tabular: {
      axisX: '特征列',
      axisY: '样本行',
      legend: '关联强度',
      selected: '选中单元',
      reading: '该矩阵用于说明列之间的关系如何在不同行中变化。数值为合成示意。',
      instruction: '使用方向键或指针选择一个单元。',
    },
    time: {
      observed: '已观察',
      forecast: '预测区间',
      interval: '不确定性',
      origin: '预测起点',
      scrub: '拖动改变预测起点',
      horizon: '预测视野',
    },
    unified: {
      tableSide: '表格结构',
      seriesSide: '时间动态',
      linkLabel: '共享表征',
      instruction: '悬停或聚焦一组映射，观察表格列与时间通道之间的对应关系。',
      pair: '映射对',
    },
    resources: {
      title: '从模型到开发者入口',
      body: '接口文档仍是草案，在线体验只运行浏览器本地演示。两者都已明确标注，不会把设计草案描述为已上线服务。',
      docs: '查看接口草案',
      playground: '打开本地演示',
    },
    studies: {
      tabular: {
        kicker: 'A / 表格',
        name: '表格基础模型',
        short: '从行与列中学习上下文。',
        summary: '研究如何利用当前表格中的标注样本，理解不同类型列之间的关系，并迁移到分类、回归与小样本推断。',
        focus: '上下文学习 / 异构特征 / 小样本推断',
        tasks: ['分类', '回归', '小样本推断'],
        figure: '表格特征关联矩阵',
        note: '合成特征矩阵。悬停或使用键盘选择一个单元以查看局部读数。',
        interaction: '交互式矩阵',
        details: [
          {title: '研究关注', body: '每一张表都可以被看作自己的上下文。模型需要在不更新参数的前提下，从列名、数值分布和少量标注样本中读取关系。'},
          {title: '边界', body: '矩阵展示的是合成数据中的局部模式，不代表模型已经学会因果关系。版本、公开权重和服务接口仍待确认。'},
        ],
        params: [
          {label: '输入', value: '带标注与未标注行的数值表格'},
          {label: '读取方式', value: '在当前上下文中比较样本'},
          {label: '当前阶段', value: '研究 / 合成演示'},
        ],
      },
      'time-series': {
        kicker: 'B / 时间序列',
        name: '时间序列基础模型',
        short: '在变化中保留不确定性。',
        summary: '研究序列中的周期、趋势与异常变化，并让预测结果以区间而不是单一数字表达。',
        focus: '长程依赖 / 预测区间 / 异常偏移',
        tasks: ['时序预测', '异常检测'],
        figure: '时间序列与预测区间示意',
        note: '合成序列。拖动预测起点，观察历史窗口、预测路径与区间如何一起移动。',
        interaction: '可拖动预测起点',
        details: [
          {title: '研究关注', body: '时序模型需要同时处理短期波动与更长周期的结构。预测区间是表达不确定性的必要部分，而不是装饰。'},
          {title: '边界', body: '曲线是合成的教学示意。它不来自真实模型输出，也不构成对任何真实序列的预测。'},
        ],
        params: [
          {label: '输入', value: '有序数值序列与时间上下文'},
          {label: '输出', value: '预测路径与不确定区间'},
          {label: '当前阶段', value: '研究 / 合成演示'},
        ],
      },
      unified: {
        kicker: 'C / 统一表征',
        name: '统一数值基础模型',
        short: '寻找表格与时间的共同语言。',
        summary: '探索能够同时表达表格结构与时间动态的数值表征，让不同数据形态之间的知识迁移成为可研究的问题。',
        focus: '跨形态表征 / 结构对齐 / 迁移假设',
        tasks: ['跨数据形态的表征迁移（研究方向）'],
        figure: '表格与时间序列的统一表征示意',
        note: '映射图为研究假设的合成示意，不代表已测量的性能。',
        interaction: '交互式映射图',
        details: [
          {title: '研究关注', body: '表格强调变量之间的横向关系，时序强调同一变量沿时间的纵向变化。统一表征需要同时保留这两类结构，而不是简单拼接。'},
          {title: '边界', body: '连线表示一种可检验的对应假设，不是模型已经发现的真实语义。统一模型仍在研究阶段。'},
        ],
        params: [
          {label: '输入', value: '表格列与时间通道'},
          {label: '输出', value: '共享表征空间'},
          {label: '当前阶段', value: '研究方向 / 合成示意'},
        ],
      },
    },
  },
  en: {
    eyebrow: 'Models / Research in progress',
    title: 'Numerical foundation models',
    intro: 'From tables to time series, and toward a unified representation. Three studies share one question: how a model reads numerical structure from context.',
    meta: 'Three model studies / All at research stage / Synthetic data illustrations',
    labels: {
      status: 'Status',
      version: 'Version',
      focus: 'Technical focus',
      tasks: 'Research tasks',
      resources: 'Developer entry',
      links: 'Public resources',
      pending: 'Pending',
      synthetic: 'Synthetic data illustration',
      docs: 'API Docs',
      playground: 'Playground',
      docsAction: 'Open the draft reference',
      playgroundAction: 'Open the local browser demo',
      studyNotes: 'Model notes',
      closeNotes: 'Close notes',
      modelIndex: 'Model index',
      scrollHint: 'Scroll to read all three studies',
      notPublished: 'Not published',
      github: 'GitHub',
      huggingFace: 'Hugging Face',
    },
    tabular: {
      axisX: 'Feature column',
      axisY: 'Sample row',
      legend: 'Association strength',
      selected: 'Selected cell',
      reading: 'This matrix illustrates how relationships between columns can change across rows. Values are synthetic.',
      instruction: 'Use the arrow keys or a pointer to select a cell.',
    },
    time: {
      observed: 'Observed',
      forecast: 'Forecast',
      interval: 'Uncertainty',
      origin: 'Forecast origin',
      scrub: 'Drag to move the forecast origin',
      horizon: 'Forecast horizon',
    },
    unified: {
      tableSide: 'Table structure',
      seriesSide: 'Temporal dynamics',
      linkLabel: 'Shared representation',
      instruction: 'Hover or focus a mapping to compare table columns with temporal channels.',
      pair: 'Mapping pair',
    },
    resources: {
      title: 'From model study to developer entry',
      body: 'The API reference is a draft. The Playground runs a local browser demo only. Both are labeled clearly and neither is presented as a live service.',
      docs: 'Read the API draft',
      playground: 'Open the local demo',
    },
    studies: {
      tabular: {
        kicker: 'A / Tabular',
        name: 'Tabular Foundation Model',
        short: 'Learn context from rows and columns.',
        summary: 'Studies how labeled examples in the current table can reveal relationships across heterogeneous columns, and transfer to classification, regression and few-shot inference.',
        focus: 'In-context learning / Heterogeneous features / Few-shot inference',
        tasks: ['Classification', 'Regression', 'Few-shot inference'],
        figure: 'Tabular feature relationship matrix',
        note: 'Synthetic feature matrix. Hover or use the keyboard to select a cell and inspect a local reading.',
        interaction: 'Interactive matrix',
        details: [
          {title: 'Research focus', body: 'Every table can be treated as its own context. The model needs to read relationships from column names, value distributions and a small set of labeled examples without updating its parameters.'},
          {title: 'Boundaries', body: 'The matrix shows local patterns in synthetic data. It does not show that the model has learned causal structure. Version, public weights and serving access are pending verification.'},
        ],
        params: [
          {label: 'Input', value: 'Numeric table with labeled and unlabeled rows'},
          {label: 'Reading', value: 'Compare samples within the current context'},
          {label: 'Stage', value: 'Research / synthetic demo'},
        ],
      },
      'time-series': {
        kicker: 'B / Temporal',
        name: 'Time Series Foundation Model',
        short: 'Hold uncertainty while things change.',
        summary: 'Studies cycles, trends and anomalous shifts in sequences, and expresses a forecast as an interval rather than a single number.',
        focus: 'Long-range dependence / Forecast intervals / Anomalous shifts',
        tasks: ['Time series forecasting', 'Anomaly detection'],
        figure: 'Illustrative time series and forecast interval',
        note: 'Synthetic sequence. Drag the forecast origin to see how the history window, path and interval move together.',
        interaction: 'Draggable forecast origin',
        details: [
          {title: 'Research focus', body: 'A temporal model must handle short-term variation together with longer cycles. The forecast interval is a necessary expression of uncertainty, not decoration.'},
          {title: 'Boundaries', body: 'The curve is a synthetic teaching illustration. It is not model output and does not forecast any real series.'},
        ],
        params: [
          {label: 'Input', value: 'Ordered numeric sequence and temporal context'},
          {label: 'Output', value: 'Forecast path and uncertainty interval'},
          {label: 'Stage', value: 'Research / synthetic demo'},
        ],
      },
      unified: {
        kicker: 'C / Unified',
        name: 'Unified Numerical Foundation Model',
        short: 'Find a shared language for tables and time.',
        summary: 'Explores numerical representations that can hold both table structure and temporal dynamics, making transfer across data forms a testable research question.',
        focus: 'Cross-form representation / Structural alignment / Transfer hypothesis',
        tasks: ['Representation transfer across data formats (research direction)'],
        figure: 'Illustration of a shared representation for tables and time series',
        note: 'The mapping is a synthetic illustration of a research hypothesis, not a measured performance result.',
        interaction: 'Interactive mapping',
        details: [
          {title: 'Research focus', body: 'Tables emphasize horizontal relationships between variables. Time series emphasize vertical change of one variable through time. A unified representation must preserve both kinds of structure, not simply concatenate them.'},
          {title: 'Boundaries', body: 'The connecting arcs express a testable correspondence hypothesis. They are not semantic relations the model has discovered. The unified model remains at research stage.'},
        ],
        params: [
          {label: 'Input', value: 'Table columns and temporal channels'},
          {label: 'Output', value: 'A shared representation space'},
          {label: 'Stage', value: 'Research direction / synthetic illustration'},
        ],
      },
    },
  },
};
