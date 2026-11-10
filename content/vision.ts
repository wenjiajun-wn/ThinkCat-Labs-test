type Principle = {
  index: string;
  title: string;
  body: string;
  label: string;
};

type VisionCopy = {
  eyebrow: string;
  title: string;
  intro: string;
  meta: string;
  statement: string;
  statementBody: string;
  statementLabel: string;
  principlesLabel: string;
  beliefsLabel: string;
  nextLabel: string;
  map: {
    label: string;
    caption: string;
    table: string;
    time: string;
    shared: string;
    hint: string;
  };
  principlesTitle: string;
  principles: readonly Principle[];
  researchTitle: string;
  researchLead: string;
  research: readonly {title: string; body: string}[];
  close: {title: string; body: string; linkLabel: string};
};

export const visionCopy: {zh: VisionCopy; en: VisionCopy} = {
  zh: {
    eyebrow: '愿景 / 研究方向',
    title: '表征，先于规模。',
    intro: '如果模型不能在上下文中理解数值结构，更大的参数规模只会放大一个未被定义的问题。我们的顺序是：先找到可检验的结构，再讨论如何扩展。',
    meta: '研究原则 / 表征假设 / 可复现评估',
    statement: '让模型读懂数字在上下文中的角色。',
    statementBody: '表格里的列、时序中的通道、跨越两者的统计关系，都可能成为表征的锚点。我们关心这些锚点能否被迁移，以及迁移的边界在哪里。',
    statementLabel: '表征 / 假设',
    principlesLabel: '原则 / 03',
    beliefsLabel: '工作判断',
    nextLabel: '下一步 / 模型',
    map: {
      label: '表格与时间序列的统一表征示意',
      caption: '合成映射示意 / 研究假设 / 非模型输出',
      table: '表格列',
      time: '时间通道',
      shared: '共享表征',
      hint: '连线表示待检验的对应假设，而不是已经发现的语义关系。',
    },
    principlesTitle: '我们如何做研究',
    principles: [
      {
        index: '01',
        title: '学习结构',
        label: 'Structure',
        body: '先理解变量之间的关联、序列中的顺序与周期，再谈泛化。没有结构的学习只会记住样本。',
      },
      {
        index: '02',
        title: '检验迁移',
        label: 'Transfer',
        body: '任何表征假设都需要离开原始数据集继续成立。跨任务、跨领域的结果比单点指标更重要。',
      },
      {
        index: '03',
        title: '明确边界',
        label: 'Limits',
        body: '用可复现的评估说明方法在何处有效、在何处失效。失败条件不是附录，而是结论的一部分。',
      },
    ],
    researchTitle: '正在形成的判断',
    researchLead: '以下不是产品承诺，而是我们愿意接受检验的研究判断。',
    research: [
      {title: '上下文是一种输入', body: '表格与时序的结构应该从当前数据中读取，而不是全部固化在模型参数里。'},
      {title: '不确定性需要被表达', body: '预测区间、置信程度与失败模式应当和预测结果一起出现。'},
      {title: '评估是模型的一部分', body: '可复现的评测、数据说明与限制条件，决定了模型是否值得被信任。'},
    ],
    close: {
      title: '用问题检验愿景。',
      body: '如果你有具体的表格、时序或混合数值问题，欢迎从数据形态开始交流。',
      linkLabel: '查看模型研究',
    },
  },
  en: {
    eyebrow: 'Vision / Research direction',
    title: 'Representation, before scale.',
    intro: 'If a model cannot read numerical structure in context, more parameters only amplify an undefined problem. Our order is deliberate: find a testable structure first, then discuss how to scale it.',
    meta: 'Research principles / Representation hypothesis / Reproducible evaluation',
    statement: 'Read the role of a number in context.',
    statementBody: 'Columns in a table, channels in a time series, and statistical relationships across both can become anchors for representation. The questions are whether those anchors transfer, and where that transfer stops.',
    statementLabel: 'Representation / Hypothesis',
    principlesLabel: 'Principles / 03',
    beliefsLabel: 'Working beliefs',
    nextLabel: 'Next / Models',
    map: {
      label: 'Illustration of a shared representation for tables and time series',
      caption: 'Synthetic mapping / Research hypothesis / Not model output',
      table: 'Table columns',
      time: 'Temporal channels',
      shared: 'Shared representation',
      hint: 'The arcs express a correspondence hypothesis to be tested, not semantic relations the model has discovered.',
    },
    principlesTitle: 'How we work',
    principles: [
      {
        index: '01',
        title: 'Learn structure',
        label: 'Structure',
        body: 'Understand relationships between variables, and order and cycles in sequences, before talking about generalization. Learning without structure only memorizes samples.',
      },
      {
        index: '02',
        title: 'Test transfer',
        label: 'Transfer',
        body: 'Any representation hypothesis must continue to hold outside its original dataset. Cross-task and cross-domain results matter more than a single benchmark point.',
      },
      {
        index: '03',
        title: 'Name the limits',
        label: 'Limits',
        body: 'Use reproducible evaluation to show where a method works and where it fails. Failure conditions are part of the conclusion, not an appendix.',
      },
    ],
    researchTitle: 'Working beliefs',
    researchLead: 'These are not product promises. They are research beliefs we are willing to have tested.',
    research: [
      {title: 'Context is an input', body: 'Table and temporal structure should be read from the data in front of the model, not frozen entirely into parameters.'},
      {title: 'Uncertainty must be expressed', body: 'Forecast intervals, confidence and failure modes belong next to the prediction itself.'},
      {title: 'Evaluation is part of the model', body: 'Reproducible benchmarks, data notes and limits decide whether a model deserves trust.'},
    ],
    close: {
      title: 'Test the vision with a question.',
      body: 'If you have a concrete table, sequence or mixed numerical problem, start with the shape of the data.',
      linkLabel: 'Explore model studies',
    },
  },
};
