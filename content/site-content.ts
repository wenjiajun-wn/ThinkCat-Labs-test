export const technologyTracks = [
  {key:'table',name:'表格基础模型',zh:'让模型理解行列之间的关系',description:'表格的列有不同类型与含义，行的顺序也不总是重要。我们研究如何在数据上下文中学习特征关系，探索分类、回归和小样本推断。',question:'新的表格到来时，模型能否从当前数据理解变量关系？'},
  {key:'time',name:'时间序列基础模型',zh:'从连续变化中学习',description:'时间序列同时包含周期、趋势与突发变化。研究重点包括跨序列学习、预测范围和不确定性表达。',question:'当环境变化时，模型如何保持预测的可靠性？'},
  {key:'unified',name:'统一数值基础模型',zh:'寻找表格与时间的共同语言',description:'探索统一编码行列结构与时间动态的表征方式，让不同数值任务可以共享一部分学习基础。',question:'不同数据形态之间，哪些统计关系能够迁移？'},
  {key:'anomaly',name:'异常检测',zh:'发现偏离常态的信号',description:'在金融交易和设备传感器等场景中，异常往往稀少且不断变化。我们研究基础模型如何在有限标注下识别异常模式。',question:'没有充足异常样本时，模型如何判断什么值得关注？'},
] as const;
export const solutionFields = [
  {key:'finance',zh:'金融',en:'FINANCE',signal:'交易与信用特征',purpose:'风险评估与异常信号研究',explain:'观察客户属性、交易行为与时间变化之间的关联。潜在任务包括信用风险分析和欺诈检测。'},
  {key:'energy',zh:'能源',en:'ENERGY',signal:'负荷与气象序列',purpose:'需求预测与设备监测研究',explain:'将负荷周期、外部环境与设备状态放在同一时间视角中，探索预测与异常发现。'},
  {key:'health',zh:'医疗',en:'HEALTH',signal:'结构化医疗指标',purpose:'辅助风险预测研究',explain:'研究指标之间的统计联系与时间变化。示意不用于临床诊断或治疗决策。'},
  {key:'retail',zh:'零售',en:'RETAIL',signal:'销量、价格与库存',purpose:'需求预测研究',explain:'在促销与季节变化中研究需求节奏，探索销量与库存的数值建模。'},
  {key:'industry',zh:'工业',en:'INDUSTRY',signal:'设备传感器数据',purpose:'状态监测与异常检测研究',explain:'研究连续传感器读数中的正常波动与异常变化，为设备监测提供方法基础。'},
] as const;
