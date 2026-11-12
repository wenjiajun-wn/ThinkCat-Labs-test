import type {KumoDatasetError, KumoRequestError} from '../lib/kumo-api';

type PlaygroundCopy = {
  title: string;
  privacyNotice: string;
  liveStatus: string;
  run: string;
  running: string;
  source: {
    title: string;
    description: string;
    drop: string;
    upload: string;
    help: string;
    requirements: string;
    sample: string;
    limits: string;
    rows: string;
    columns: string;
    sampleName: string;
    reading: string;
  };
  preview: {
    targetLabel: string;
    targetPlaceholder: string;
    label: string;
    rowLabel: string;
    previous: string;
    next: string;
    pageLabel: string;
    query: string;
    labelHeader: string;
    scroll: string;
    explanation: string;
  };
  states: {
    idleLabel: string;
    runningLabel: string;
    errorLabel: string;
    successLabel: string;
    loadingTitle: string;
    loadingBody: string;
    emptyTitle: string;
    emptyBody: string;
    errorTitle: string;
    errorRetention: string;
    successTitle: string;
    successBody: string;
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
  results: {
    title: string;
    tableCaption: string;
    query: string;
    prediction: string;
    probability: string;
    classDistribution: string;
    supportRows: string;
    download: string;
    downloadName: string;
    downloadNote: string;
    chartLabel: string;
    predictionCount: string;
    backToData: string;
    previous: string;
    next: string;
  };
};

export const playgroundCopy: {zh: PlaygroundCopy; en: PlaygroundCopy} = {
  zh: {
    title: '在线体验',
    liveStatus: '远程推理',
    run: '运行模型',
    running: '正在运行模型…',
    privacyNotice: '运行时会将特征和标签发送到远程推理服务。请勿提交敏感数据。',
    source: {
      title: '数据输入',
      description: '直接使用示例数据，或上传自己的 CSV。',
      drop: '或拖放 CSV',
      upload: '上传 CSV',
      help: 'CSV 格式要求',
      requirements: 'CSV 首行为列名。待预测行的目标列留空，其余列为数值特征。',
      sample: '恢复示例',
      limits: 'CSV 最大 1 MiB。数据须包含 20–500 行、至少 10 行已标注数据、1–50 行待预测数据、1–30 个数值特征、2–10 个类别。',
      rows: '行',
      columns: '列',
      sampleName: '示例数据（合成）',
      reading: '正在读取 CSV…',
    },
    preview: {
      targetLabel: '预测目标列',
      targetPlaceholder: '选择一列',
      label: '数据预览',
      rowLabel: '行号',
      previous: '上一页',
      next: '下一页',
      pageLabel: '预览',
      query: '待预测',
      labelHeader: '标签列',
      scroll: '可横向滚动查看全部列',
      explanation: '模型利用已有标签样本，预测空白标签。',
    },
    states: {
      idleLabel: '等待运行',
      runningLabel: '正在运行',
      errorLabel: '运行失败',
      successLabel: '已完成',
      loadingTitle: '正在运行模型',
      loadingBody: '远程推理服务正在处理当前数据，完成后会在此显示真实预测。',
      emptyTitle: '数据已就绪',
      emptyBody: '运行模型后，在这里查看逐行预测、类别分布并下载结果。',
      errorTitle: '预测未完成',
      errorRetention: '当前 CSV 和输入内容仍然保留，可以直接重新尝试。',
      successTitle: '本次预测已完成',
      successBody: '真实预测已映射到原始 CSV 行，输入特征一并保留。',
      errorAction: '重新运行',
    },
    errors: {
      chooseTarget: '请选择预测目标列后运行模型。',
      empty: '文件为空，或没有可读取的数据行。',
      'too-large': 'CSV 文件超过 1 MiB。',
      'too-many-rows': '数据超过 500 行。',
      'too-many-columns': '数据超过 31 列（包含标签列）。',
      'invalid-headers': '列名缺失、重复或包含换行。',
      'row-width': '至少有一行的列数与表头不一致。',
      parse: 'CSV 结构无法解析，请检查引号是否成对。',
      'no-features': '请在目标列之外提供 1–30 个数值特征列。',
      'non-numeric': '所有特征值必须是有限数值，且不能为空。',
      'row-count': '数据必须包含 20–500 行。',
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
    results: {
      title: '预测结果',
      tableCaption: '逐行预测',
      query: '样本 / CSV 行',
      prediction: '预测类别',
      probability: '预测概率',
      classDistribution: '预测类别分布',
      supportRows: '上下文样本',
      download: '下载 CSV',
      downloadName: 'thinkcat-kumo-predictions.csv',
      downloadNote: '下载文件包含全部预测行，不受表格分页影响。',
      chartLabel: '真实预测类别分布',
      predictionCount: '预测样本',
      backToData: '返回数据',
      previous: '上一页',
      next: '下一页',
    },
  },
  en: {
    title: 'Playground',
    liveStatus: 'Live inference',
    run: 'Run Model',
    running: 'Running model…',
    privacyNotice: 'Running the model sends features and labels to the remote inference service. Omit sensitive data.',
    source: {
      title: 'Data Input',
      description: 'Use the sample data or upload your own CSV.',
      drop: 'or drop a CSV',
      upload: 'Upload CSV',
      help: 'CSV requirements',
      requirements: 'Include a header row. Leave the target column blank on rows to predict and use numbers in every feature column.',
      sample: 'Restore sample',
      limits: 'CSV up to 1 MiB. Use 20–500 rows, at least 10 labeled rows, 1–50 prediction rows, 1–30 numeric features, and 2–10 classes.',
      rows: 'rows',
      columns: 'columns',
      sampleName: 'Sample data (synthetic)',
      reading: 'Reading CSV…',
    },
    preview: {
      targetLabel: 'Prediction target column',
      targetPlaceholder: 'Select a column',
      label: 'Data preview',
      rowLabel: 'CSV line',
      previous: 'Previous',
      next: 'Next',
      pageLabel: 'Preview',
      query: 'To predict',
      labelHeader: 'label column',
      scroll: 'Scroll horizontally to see every column',
      explanation: 'The model uses labeled rows to predict blank labels.',
    },
    states: {
      idleLabel: 'Ready to run',
      runningLabel: 'Running',
      errorLabel: 'Run failed',
      successLabel: 'Complete',
      loadingTitle: 'Running the model',
      loadingBody: 'The remote inference service is processing the current data. Real predictions will appear here when it responds.',
      emptyTitle: 'Your data is ready',
      emptyBody: 'Run the model to see row-level predictions, class distribution and CSV export here.',
      errorTitle: 'Prediction did not complete',
      errorRetention: 'Your CSV and current inputs are preserved, so you can try again.',
      successTitle: 'Prediction complete',
      successBody: 'Predictions are mapped to the original CSV rows with their input features.',
      errorAction: 'Retry',
    },
    errors: {
      chooseTarget: 'Select a prediction target column to run the model.',
      empty: 'The file is empty or has no readable data rows.',
      'too-large': 'The CSV exceeds 1 MiB.',
      'too-many-rows': 'The data exceeds 500 rows.',
      'too-many-columns': 'The data exceeds 31 columns, including the label.',
      'invalid-headers': 'A column name is missing, duplicated or contains a line break.',
      'row-width': 'At least one row has a different number of columns than the header.',
      parse: 'The CSV structure could not be parsed. Check that quotes are balanced.',
      'no-features': 'Include 1–30 numeric feature columns in addition to the target column.',
      'non-numeric': 'Every feature must contain a finite number.',
      'row-count': 'The dataset must contain 20–500 rows.',
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
    results: {
      title: 'Prediction results',
      tableCaption: 'Row-level predictions',
      query: 'Sample / CSV line',
      prediction: 'Predicted class',
      probability: 'Probability',
      classDistribution: 'Predicted class distribution',
      supportRows: 'Context samples',
      download: 'Download CSV',
      downloadName: 'thinkcat-kumo-predictions.csv',
      downloadNote: 'The download contains every prediction row, regardless of table pagination.',
      chartLabel: 'Distribution of actual predicted classes',
      predictionCount: 'Predicted samples',
      backToData: 'Back to Data',
      previous: 'Previous',
      next: 'Next',
    },
  },
};
