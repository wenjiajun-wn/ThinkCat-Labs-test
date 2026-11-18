import type {KumoDatasetError, KumoRequestError} from '../lib/kumo-api';

type PlaygroundCopy = {
  title: string;
  run: string;
  running: string;
  source: {
    title: string;
    upload: string;
    sample: string;
    rows: string;
    columns: string;
    reading: string;
    pending: string;
    onlyOne: string;
  };
  preview: {
    previous: string;
    next: string;
    page: string;
    targetLabel: string;
    targetPlaceholder: string;
    label: string;
    rowLabel: string;
    recordLabel: string;
    query: string;
    labelHeader: string;
    scroll: string;
    queriesOnly: string;
    predictedOnly: string;
    predicted: string;
  };
  states: {
    runningLabel: string;
    errorAction: string;
  };
  errors: {
    empty: string;
    chooseTarget: string;
    'too-large': string;
    'too-many-rows': string;
    'too-many-columns': string;
    'invalid-headers': string;
    'row-width': string;
    parse: string;
    generic: string;
  } & Record<KumoDatasetError, string>;
  requestErrors: Record<KumoRequestError, string>;
  evaluation: {
    accuracy: string;
    correctCount: string;
    actualLabel: string;
    correct: string;
    incorrect: string;
    note: string;
    unavailable: string;
  };
  results: {
    title: string;
    query: string;
    prediction: string;
    probability: string;
    classDistribution: string;
    download: string;
    downloadName: string;
    chartLabel: string;
    predictionCount: string;
  };
};

export const playgroundCopy: {zh: PlaygroundCopy; en: PlaygroundCopy} = {
  zh: {
    title: '在线体验',
    run: '运行模型',
    running: '正在运行模型…',
    source: {
      title: '数据输入',
      upload: '上传 CSV',
      sample: '切换示例数据',
      rows: '行',
      columns: '列',
      reading: '正在读取 CSV…',
      pending: '真实示例数据待接入，可上传 CSV。',
      onlyOne: '目前仅有一份可用示例。',
    },
    preview: {
      previous: '上一页', next: '下一页', page: '预览页',
      targetLabel: '预测目标列',
      targetPlaceholder: '选择一列',
      label: '数据预览',
      rowLabel: 'CSV 行号',
      recordLabel: '原始记录号',
      query: '待预测',
      labelHeader: '标签列',
      scroll: '滚动或拖动单元格空白处查看数据；文字可选择复制',
      queriesOnly: '仅看待预测行',
      predictedOnly: '仅看已预测行',
      predicted: '已预测',
    },
    states: {
      runningLabel: '正在运行',
      errorAction: '重新运行',
    },
    errors: {
      chooseTarget: '请选择预测目标列后运行模型。',
      empty: '文件为空，或没有可读取的数据行。',
      'too-large': 'CSV 文件超过 1 MiB。',
      'too-many-rows': '数据超过 10,000 行。',
      'too-many-columns': '数据超过 31 列（包含标签列）。',
      'invalid-headers': '列名缺失、重复或包含换行。',
      'row-width': '至少有一行的列数与表头不一致。',
      parse: 'CSV 结构无法解析，请检查引号是否成对。',
      'no-features': '请在目标列之外提供 1–30 个数值特征列。',
      'non-numeric': '所有特征值必须是有限数值，且不能为空。',
      'row-count': '数据必须包含 20–10,000 行。',
      'support-count': '目标列至少需要 10 行非空标签。',
      'query-count': '请在目标列留空 1–50 行作为待预测样本。',
      'class-count': '已标注数据必须包含 2–10 个类别。',
      generic: '无法读取数据，请检查 CSV 结构。',
    },
    requestErrors: {
      'payload-too-large': '推理服务器拒绝了过大的请求。请减少行数或特征数后重试。',
      'rate-limited': '请求过于频繁，请稍后再试。',
      rejected: '推理服务器未接受这份数据，请检查列和标签后重试。',
      unavailable: '暂时无法连接推理服务，请稍后重试。',
      'invalid-response': '推理服务返回的数据格式不正确，请重试。',
      timeout: '推理请求超时，请重试。',
    },
    evaluation: {
      accuracy: '示例留出集准确率',
      correctCount: '条预测正确',
      actualLabel: '真实标签',
      correct: '预测正确',
      incorrect: '预测错误',
      note: '仅评估当前示例的留出记录，不代表完整 TabArena 基准或其他数据上的表现。',
      unavailable: '预测已完成，但评估数据未能通过完整性校验，本次不显示准确率或真实标签对照。',
    },
    results: {
      title: '预测结果',
      query: '原始行号',
      prediction: '预测类别',
      probability: '预测概率',
      classDistribution: '预测类别分布',
      download: '下载 CSV',
      downloadName: 'thinkcat-kumo-predictions.csv',
      chartLabel: '真实预测类别分布',
      predictionCount: '预测样本',
    },
  },
  en: {
    title: 'Playground',
    run: 'Run Model',
    running: 'Running model…',
    source: {
      title: 'Data Input',
      upload: 'Upload CSV',
      sample: 'Switch dataset',
      rows: 'rows',
      columns: 'columns',
      reading: 'Reading CSV…',
      pending: 'Real example data is pending. Upload a CSV to continue.',
      onlyOne: 'Only one example is currently available.',
    },
    preview: {
      previous: 'Previous', next: 'Next', page: 'Preview page',
      targetLabel: 'Prediction target column',
      targetPlaceholder: 'Select a column',
      label: 'Data preview',
      rowLabel: 'CSV line',
      recordLabel: 'Source record',
      query: 'To predict',
      labelHeader: 'label column',
      scroll: 'Scroll or drag cell padding to explore data; text remains selectable',
      queriesOnly: 'Only rows to predict',
      predictedOnly: 'Only predicted rows',
      predicted: 'Predicted',
    },
    states: {
      runningLabel: 'Running',
      errorAction: 'Retry',
    },
    errors: {
      chooseTarget: 'Select a prediction target column to run the model.',
      empty: 'The file is empty or has no readable data rows.',
      'too-large': 'The CSV exceeds 1 MiB.',
      'too-many-rows': 'The data exceeds 10,000 rows.',
      'too-many-columns': 'The data exceeds 31 columns, including the label.',
      'invalid-headers': 'A column name is missing, duplicated or contains a line break.',
      'row-width': 'At least one row has a different number of columns than the header.',
      parse: 'The CSV structure could not be parsed. Check that quotes are balanced.',
      'no-features': 'Include 1–30 numeric feature columns in addition to the target column.',
      'non-numeric': 'Every feature must contain a finite number.',
      'row-count': 'The dataset must contain 20–10,000 rows.',
      'support-count': 'The target column must have at least 10 non-blank labels.',
      'query-count': 'Leave 1–50 rows blank in the target column for prediction.',
      'class-count': 'Labeled rows must contain 2–10 distinct classes.',
      generic: 'Could not read the data. Check the CSV structure.',
    },
    requestErrors: {
      'payload-too-large': 'The inference server rejected the request size. Try fewer rows or features.',
      'rate-limited': 'Too many requests. Wait a moment and try again.',
      rejected: 'The inference server rejected the data. Check the columns and labels, then try again.',
      unavailable: 'The inference service is temporarily unavailable. Try again shortly.',
      'invalid-response': 'The inference service returned an unexpected result. Try again.',
      timeout: 'The inference request timed out. Try again.',
    },
    evaluation: {
      accuracy: 'Example holdout accuracy',
      correctCount: 'correct predictions',
      actualLabel: 'Actual label',
      correct: 'Correct',
      incorrect: 'Incorrect',
      note: 'Evaluates only this example’s held-out records, not the full TabArena benchmark or performance on other data.',
      unavailable: 'Prediction completed, but evaluation data could not be verified. Accuracy and actual-label comparisons are unavailable for this run.',
    },
    results: {
      title: 'Prediction results',
      query: 'Source row',
      prediction: 'Predicted class',
      probability: 'Probability',
      classDistribution: 'Predicted class distribution',
      download: 'Download CSV',
      downloadName: 'thinkcat-kumo-predictions.csv',
      chartLabel: 'Distribution of actual predicted classes',
      predictionCount: 'Predicted samples',
    },
  },
};
