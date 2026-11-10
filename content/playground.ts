type PlaygroundCopy = {
  eyebrow: string;
  title: string;
  intro: string;
  meta: string;
  demoNotice: string;
  model: {
    label: string;
    options: readonly {id: string; label: string; state: string; disabled: boolean}[];
    note: string;
  };
  source: {
    label: string;
    title: string;
    description: string;
    drop: string;
    choose: string;
    replace: string;
    sample: string;
    limits: string;
    loaded: string;
    rows: string;
    columns: string;
    sampleName: string;
    reading: string;
    next: string;
  };
  config: {
    label: string;
    title: string;
    labelColumn: string;
    labelHelp: string;
    neighbor: string;
    neighborHelp: string;
    metric: string;
    euclidean: string;
    manhattan: string;
    normalize: string;
    normalizeHelp: string;
    run: string;
    rerun: string;
    running: string;
    demoTag: string;
    advanced: string;
    blocked: string;
  };
  preview: {
    label: string;
    caption: string;
    query: string;
    support: string;
    labelHeader: string;
    scroll: string;
  };
  states: {
    loadingTitle: string;
    loadingBody: string;
    emptyTitle: string;
    emptyBody: string;
    errorTitle: string;
    errorBody: string;
    successTitle: string;
    successBody: string;
    liveUnavailable: string;
    errorAction: string;
  };
  errors: {
    empty: string;
    'too-large': string;
    'too-many-rows': string;
    'too-many-columns': string;
    'invalid-headers': string;
    'row-width': string;
    parse: string;
    'no-features': string;
    'non-numeric': string;
    'no-support': string;
    'no-queries': string;
    generic: string;
  };
  results: {
    label: string;
    title: string;
    caption: string;
    tableCaption: string;
    query: string;
    prediction: string;
    confidence: string;
    distance: string;
    classDistribution: string;
    averageConfidence: string;
    supportRows: string;
    download: string;
    downloadName: string;
    demoNote: string;
    k: string;
    chartLabel: string;
    confidenceLabel: string;
    predictionCount: string;
    rowLabel: string;
    metricLabels: {euclidean: string; manhattan: string};
  };
};

export const playgroundCopy: {zh: PlaygroundCopy; en: PlaygroundCopy} = {
  zh: {
    eyebrow: '开发者 / 浏览器工作台',
    title: '在线体验',
    intro: '用合成示例或自己的 CSV 试跑分类。选择标签列后即可在浏览器中运行，并下载演示结果。',
    meta: '本地计算 / 无网络请求 / 合成演示数据',
    demoNotice: '所有结果均为 Demo，由浏览器中的最近邻算法生成，不代表 Thinkcat 模型输出。',
    model: {
      label: '模型',
      options: [
        {id: 'tabular', label: '表格基础模型', state: '本地演示', disabled: false},
        {id: 'time-series', label: '时间序列基础模型', state: '等待接口', disabled: true},
        {id: 'unified', label: '统一数值基础模型', state: '等待接口', disabled: true},
      ],
      note: '本轮仅开放表格形态的本地演示。另外两个模型未接入真实推理，不会被模拟为可用。',
    },
    source: {
      label: '01 / 数据',
      title: '准备数据',
      description: '上传一个无敏感信息的数值 CSV。第一行是列名，标签列可以留空表示待预测行。',
      drop: '选择或拖入 CSV',
      choose: '选择 CSV',
      replace: '替换文件',
      sample: '恢复合成示例',
      limits: '最多 64 KiB、200 行、14 列；仅支持无引号或标准双引号 CSV。',
      loaded: '已载入',
      rows: '行',
      columns: '列',
      sampleName: '合成示例 CSV',
      reading: '正在读取 CSV…',
      next: '继续设置参数',
    },
    config: {
      label: '02 / 配置',
      title: '设置参数',
      labelColumn: '标签列',
      labelHelp: '选择用于分类的标签列。留空的行会被视为待预测样本。',
      neighbor: '邻居数量',
      neighborHelp: '本地演示最多使用指定数量的带标签样本。',
      metric: '距离度量',
      euclidean: '欧氏距离',
      manhattan: '曼哈顿距离',
      normalize: '标准化特征',
      normalizeHelp: '将每个特征缩放到同一量级，便于比较不同单位的列。',
      run: '运行本地演示',
      rerun: '重新运行演示',
      running: '正在计算',
      demoTag: 'DEMO',
      advanced: '高级参数',
      blocked: '先载入有效的 CSV，再运行演示。',
    },
    preview: {
      label: '数据预览',
      caption: '前 8 行 / 标签列已高亮',
      query: '待预测',
      support: '带标签',
      labelHeader: '标签列',
      scroll: '可横向滚动查看全部列',
    },
    states: {
      loadingTitle: '正在浏览器内计算',
      loadingBody: '读取数据并比较上下文样本。没有请求离开这台设备。',
      emptyTitle: '结果会出现在这里',
      emptyBody: '载入数据并设置参数，然后运行本地演示。结果会明确标注 Demo。',
      errorTitle: '演示未完成',
      errorBody: '请检查标签列和参数，再运行一次。',
      successTitle: '演示已完成',
      successBody: '以下分类由浏览器中的本地算法生成。',
      liveUnavailable: '真实推理尚未开放',
      errorAction: '返回数据',
    },
    errors: {
      empty: '文件为空，或没有可读取的数据行。',
      'too-large': '文件超过 64 KiB 限制。',
      'too-many-rows': '数据超过 200 行限制。',
      'too-many-columns': '列数超过 14 列限制。',
      'invalid-headers': '列名缺失、重复或包含换行。',
      'row-width': '至少有一行的列数与表头不一致。',
      parse: 'CSV 结构无法解析，请检查引号是否成对。',
      'no-features': '除了标签列之外，至少需要一个特征列。',
      'non-numeric': '特征列包含无法解析为数字的值。',
      'no-support': '至少需要一行带标签的上下文样本。',
      'no-queries': '至少需要一行标签为空的待预测样本。',
      generic: '无法读取数据，请检查 CSV 结构。',
    },
    results: {
      label: '03 / 结果',
      title: '演示结果',
      caption: '浏览器最近邻分类 / 非模型输出',
      tableCaption: '本地演示分类结果',
      query: '待预测行',
      prediction: '演示分类',
      confidence: '一致性',
      distance: '平均距离',
      classDistribution: '预测类别分布',
      averageConfidence: '平均一致性',
      supportRows: '上下文样本',
      download: '下载结果 CSV',
      downloadName: 'thinkcat-demo-predictions.csv',
      demoNote: 'CSV 记录演示分类、一致性和 Demo 来源说明。',
      k: '邻居',
      chartLabel: '演示分类结果图表',
      confidenceLabel: '每个待预测行的一致性',
      predictionCount: '待预测行',
      rowLabel: '行',
      metricLabels: {euclidean: '欧氏距离', manhattan: '曼哈顿距离'},
    },
  },
  en: {
    eyebrow: 'Developer / Browser workspace',
    title: 'Playground',
    intro: 'Try classification with the synthetic sample or your own CSV. Choose a label column, run the demo in your browser, and download the results.',
    meta: 'Local compute / No network request / Synthetic demo data',
    demoNotice: 'Every result is a Demo produced by nearest-neighbor classification in the browser. It does not represent Thinkcat model output.',
    model: {
      label: 'Model',
      options: [
        {id: 'tabular', label: 'Tabular Foundation Model', state: 'Local demo', disabled: false},
        {id: 'time-series', label: 'Time Series Foundation Model', state: 'Awaiting API', disabled: true},
        {id: 'unified', label: 'Unified Numerical Foundation Model', state: 'Awaiting API', disabled: true},
      ],
      note: 'Only the tabular local demo is available. The other two models are not connected to live inference and are not simulated as available.',
    },
    source: {
      label: '01 / Data',
      title: 'Prepare data',
      description: 'Upload a numeric CSV without sensitive information. The first row holds column names. Leave the label cell blank for a prediction row.',
      drop: 'Choose or drop a CSV',
      choose: 'Choose CSV',
      replace: 'Replace file',
      sample: 'Restore synthetic sample',
      limits: 'Up to 64 KiB, 200 rows and 14 columns. Unquoted or standard double-quoted CSV only.',
      loaded: 'Loaded',
      rows: 'rows',
      columns: 'columns',
      sampleName: 'Synthetic sample CSV',
      reading: 'Reading CSV…',
      next: 'Continue to parameters',
    },
    config: {
      label: '02 / Configure',
      title: 'Set parameters',
      labelColumn: 'Label column',
      labelHelp: 'Choose the label column. Rows with an empty label are treated as prediction samples.',
      neighbor: 'Neighbors',
      neighborHelp: 'The local demo uses up to this many labeled samples.',
      metric: 'Distance metric',
      euclidean: 'Euclidean',
      manhattan: 'Manhattan',
      normalize: 'Normalize features',
      normalizeHelp: 'Scale each feature to a comparable range so columns with different units can be compared.',
      run: 'Run local demo',
      rerun: 'Run demo again',
      running: 'Computing',
      demoTag: 'DEMO',
      advanced: 'Advanced parameters',
      blocked: 'Load a valid CSV to run the demo.',
    },
    preview: {
      label: 'Data preview',
      caption: 'First 8 rows / label column highlighted',
      query: 'Prediction',
      support: 'Labeled',
      labelHeader: 'label column',
      scroll: 'Scroll horizontally to see every column',
    },
    states: {
      loadingTitle: 'Computing in your browser',
      loadingBody: 'Reading data and comparing context samples. No request leaves this device.',
      emptyTitle: 'Results will appear here',
      emptyBody: 'Load data, set parameters and run the local demo. Results are always labeled Demo.',
      errorTitle: 'Demo did not finish',
      errorBody: 'Check the label column and parameters, then try again.',
      successTitle: 'Demo complete',
      successBody: 'The classifications below were produced by a local algorithm in this browser.',
      liveUnavailable: 'Live inference unavailable',
      errorAction: 'Back to data',
    },
    errors: {
      empty: 'The file is empty or has no readable data rows.',
      'too-large': 'The file exceeds the 64 KiB limit.',
      'too-many-rows': 'The data exceeds the 200 row limit.',
      'too-many-columns': 'The data exceeds the 14 column limit.',
      'invalid-headers': 'A column name is missing, duplicated or contains a line break.',
      'row-width': 'At least one row has a different number of columns than the header.',
      parse: 'The CSV structure could not be parsed. Check that quotes are balanced.',
      'no-features': 'At least one feature column is required besides the label column.',
      'non-numeric': 'A feature column contains a value that is not numeric.',
      'no-support': 'At least one labeled context row is required.',
      'no-queries': 'At least one prediction row with an empty label is required.',
      generic: 'Could not read the data. Check the CSV structure.',
    },
    results: {
      label: '03 / Results',
      title: 'Demo results',
      caption: 'Browser nearest-neighbor classification / Not model output',
      tableCaption: 'Local demo classifications',
      query: 'Query row',
      prediction: 'Demo prediction',
      confidence: 'Agreement',
      distance: 'Mean distance',
      classDistribution: 'Predicted class distribution',
      averageConfidence: 'Mean agreement',
      supportRows: 'Context samples',
      download: 'Download results CSV',
      downloadName: 'thinkcat-demo-predictions.csv',
      demoNote: 'The CSV includes demo predictions, agreement, and a note on how the results were generated.',
      k: 'Neighbors',
      chartLabel: 'Demo classification result chart',
      confidenceLabel: 'Agreement per prediction row',
      predictionCount: 'Prediction rows',
      rowLabel: 'Row',
      metricLabels: {euclidean: 'Euclidean', manhattan: 'Manhattan'},
    },
  },
};
