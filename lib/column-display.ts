import type {Locale} from '../config/i18n';

// Display metadata only. Never use these names for requests or CSV exports.
// Sources and intentionally untranslated fields: docs/中文界面本地化.md.
export const columnLabels: Readonly<Record<string, Readonly<Record<string, string>>>> = {
  "46906": {
    "carbon": "碳含量",
    "hardness": "硬度",
    "strength": "强度",
    "thick": "厚度",
    "width": "宽度",
    "len": "长度",
    "classes": "退火类别"
  },
  "46910": {
    "age": "年龄",
    "balance": "账户余额",
    "campaign": "本次营销联系次数",
    "pdays": "距上次营销联系天数",
    "previous": "此前营销联系次数",
    "SubscribeTermDeposit": "是否认购定期存款"
  },
  "46913": {
    "MonthsSinceLastDonation": "距上次献血月数",
    "NumberOfDonations": "累计献血次数",
    "TotalBloodDonated": "累计献血量",
    "MonthsSinceFirstDonation": "距首次献血月数",
    "DonatedBloodInMarch2007": "2007年3月是否献血"
  },
  "46915": {
    "account_length": "入网时长",
    "number_vmail_messages": "语音信箱消息数",
    "total_day_minutes": "日间通话分钟数",
    "total_day_calls": "日间通话次数",
    "total_day_charge": "日间通话费用",
    "total_eve_minutes": "晚间通话分钟数",
    "total_eve_calls": "晚间通话次数",
    "total_eve_charge": "晚间通话费用",
    "total_night_minutes": "夜间通话分钟数",
    "total_night_calls": "夜间通话次数",
    "total_night_charge": "夜间通话费用",
    "total_intl_minutes": "国际通话分钟数",
    "total_intl_calls": "国际通话次数",
    "total_intl_charge": "国际通话费用",
    "number_customer_service_calls": "联系客服次数",
    "CustomerChurned": "是否流失"
  },
  "46918": {
    "duration_months": "贷款期限（月）",
    "credit_amount": "贷款金额",
    "installment_rate_percent": "分期还款占可支配收入比例",
    "residence_since": "现居住地居住年数",
    "age_years": "年龄",
    "existing_credits_count": "现有贷款数量",
    "people_liable": "需抚养人数",
    "good_or_bad_customer": "信用类别"
  },
  "46919": {
    "LIMIT_BAL": "信用额度",
    "AGE": "年龄",
    "PAY_0": "2005年9月还款状态",
    "PAY_2": "2005年8月还款状态",
    "PAY_3": "2005年7月还款状态",
    "PAY_4": "2005年6月还款状态",
    "PAY_5": "2005年5月还款状态",
    "PAY_6": "2005年4月还款状态",
    "BILL_AMT1": "2005年9月账单金额",
    "BILL_AMT2": "2005年8月账单金额",
    "BILL_AMT3": "2005年7月账单金额",
    "BILL_AMT4": "2005年6月账单金额",
    "BILL_AMT5": "2005年5月账单金额",
    "BILL_AMT6": "2005年4月账单金额",
    "PAY_AMT1": "2005年9月还款金额",
    "PAY_AMT2": "2005年8月还款金额",
    "PAY_AMT3": "2005年7月还款金额",
    "PAY_AMT4": "2005年6月还款金额",
    "PAY_AMT5": "2005年5月还款金额",
    "PAY_AMT6": "2005年4月还款金额",
    "DefaultOnPaymentNextMonth": "下月是否违约"
  },
  "46920": {
    "Age": "年龄",
    "FlightDistance": "飞行距离",
    "Onlineboarding": "在线登机服务评分",
    "DepartureDelayinMinutes": "起飞延误分钟数",
    "ArrivalDelayinMinutes": "到达延误分钟数",
    "satisfaction": "满意度类别"
  },
  "46921": {
    "Pregnancies": "怀孕次数",
    "Glucose": "血糖浓度",
    "BloodPressure": "舒张压",
    "SkinThickness": "皮褶厚度",
    "Insulin": "胰岛素水平",
    "BMI": "身体质量指数（BMI）",
    "DiabetesPedigreeFunction": "糖尿病家族遗传评分",
    "Age": "年龄",
    "TestedPositiveForDiabetes": "糖尿病检测是否阳性"
  },
  "46924": {
    "Customer_care_calls": "客服联系次数",
    "Customer_rating": "客户评分",
    "Cost_of_the_Product": "商品价格",
    "Prior_purchases": "既往购买次数",
    "Discount_offered": "优惠折扣",
    "Weight_in_gms": "重量（克）",
    "ArrivedLate": "是否延迟到货"
  },
  "46927": {
    "months_as_member": "会员时长（月）",
    "weight": "体重",
    "days_before": "提前预约天数",
    "attended": "是否出席"
  },
  "46932": {
    "ExternalRiskEstimate": "外部风险评分",
    "MSinceOldestTradeOpen": "距最早信贷账户开立月数",
    "MSinceMostRecentTradeOpen": "距最近信贷账户开立月数",
    "AverageMInFile": "信贷记录平均月数",
    "NumSatisfactoryTrades": "正常履约账户数",
    "NumTrades60Ever2DerogPubRec": "曾逾期60天及以上账户数",
    "NumTrades90Ever2DerogPubRec": "曾逾期90天及以上账户数",
    "PercentTradesNeverDelq": "从未逾期账户占比",
    "MSinceMostRecentDelq": "距最近逾期月数",
    "MaxDelq2PublicRecLast12M": "近12个月最严重逾期或公共记录类别",
    "MaxDelqEver": "历史最严重逾期类别",
    "NumTotalTrades": "信贷账户总数",
    "NumTradesOpeninLast12M": "近12个月新开账户数",
    "PercentInstallTrades": "分期账户占比",
    "MSinceMostRecentInqexcl7days": "距最近征信查询月数（不含近7天）",
    "NumInqLast6M": "近6个月征信查询次数",
    "NumInqLast6Mexcl7days": "近6个月征信查询次数（不含近7天）",
    "NetFractionRevolvingBurden": "循环信贷余额与额度比",
    "NetFractionInstallBurden": "分期信贷余额与原始金额比",
    "NumRevolvingTradesWBalance": "有余额的循环信贷账户数",
    "NumInstallTradesWBalance": "有余额的分期信贷账户数",
    "NumBank2NatlTradesWHighUtilization": "高额度使用率账户数",
    "PercentTradesWBalance": "有余额账户占比",
    "RiskPerformance": "信用风险类别"
  },
  "46935": {
    "city_development_index": "城市发展指数",
    "training_hours": "培训小时数",
    "LookingForJobChange": "是否寻求换工作"
  },
  "46938": {
    "credit_amount": "贷款金额",
    "credit_term": "贷款期限",
    "age": "年龄",
    "income": "收入",
    "bad_client_target": "客户信用类别"
  },
  "46940": {
    "Year_Birth": "出生年份",
    "Income": "收入",
    "Kidhome": "家中儿童数",
    "Teenhome": "家中青少年数",
    "Recency": "距最近购买天数",
    "MntWines": "葡萄酒消费金额",
    "MntFruits": "水果消费金额",
    "MntMeatProducts": "肉类消费金额",
    "MntFishProducts": "鱼类消费金额",
    "MntSweetProducts": "甜品消费金额",
    "MntGoldProds": "黄金制品消费金额",
    "NumDealsPurchases": "优惠购买次数",
    "NumWebPurchases": "网站购买次数",
    "NumCatalogPurchases": "目录购买次数",
    "NumStorePurchases": "门店购买次数",
    "NumWebVisitsMonth": "每月网站访问次数",
    "Response": "是否接受营销邀约"
  },
  "46941": {
    "Age": "年龄",
    "SystolicBP": "收缩压",
    "DiastolicBP": "舒张压",
    "BS": "血糖",
    "BodyTemp": "体温",
    "HeartRate": "心率",
    "RiskLevel": "风险等级"
  },
  "46947": {
    "Administrative": "账户管理页面访问数",
    "Administrative_Duration": "账户管理页面停留时间",
    "Informational": "信息页面访问数",
    "Informational_Duration": "信息页面停留时间",
    "ProductRelated": "商品页面访问数",
    "ProductRelated_Duration": "商品页面停留时间",
    "BounceRates": "跳出率",
    "ExitRates": "退出率",
    "PageValues": "页面价值",
    "SpecialDay": "特殊日期接近程度",
    "Revenue": "是否购买"
  },
  "46956": {
    "genergy": "上一班次最活跃检波器能量",
    "gpuls": "上一班次最活跃检波器脉冲数",
    "gdenergy": "检波器能量相对前8班次均值偏差",
    "gdpuls": "检波器脉冲数相对前8班次均值偏差",
    "nbumps": "上一班次震动次数",
    "nbumps2": "能量10²至10³焦耳震动次数",
    "nbumps3": "能量10³至10⁴焦耳震动次数",
    "nbumps4": "能量10⁴至10⁵焦耳震动次数",
    "nbumps5": "能量10⁵至10⁶焦耳震动次数",
    "energy": "上一班次震动总能量",
    "maxenergy": "上一班次最大震动能量",
    "HighEnergySeismicBump": "下一班次是否发生高能震动"
  },
  "46960": {
    "Application_order": "志愿顺序",
    "Previous_qualification_grade": "前置学历成绩",
    "Admission_grade": "入学成绩",
    "Age_at_enrollment": "入学年龄",
    "Curricular_units_1st_sem_credited": "第一学期学分认可课程数",
    "Curricular_units_1st_sem_enrolled": "第一学期注册课程数",
    "Curricular_units_1st_sem_evaluations": "第一学期考核次数",
    "Curricular_units_1st_sem_approved": "第一学期通过课程数",
    "Curricular_units_1st_sem_grade": "第一学期课程成绩",
    "Curricular_units_1st_sem_without_evaluations": "第一学期未参加考核课程数",
    "Curricular_units_2nd_sem_credited": "第二学期学分认可课程数",
    "Curricular_units_2nd_sem_enrolled": "第二学期注册课程数",
    "Curricular_units_2nd_sem_evaluations": "第二学期考核次数",
    "Curricular_units_2nd_sem_approved": "第二学期通过课程数",
    "Curricular_units_2nd_sem_grade": "第二学期课程成绩",
    "Curricular_units_2nd_sem_without_evaluations": "第二学期未参加考核课程数",
    "Unemployment_rate": "失业率",
    "Inflation_rate": "通胀率",
    "GDP": "国内生产总值（GDP）",
    "AcademicOutcome": "学业结局"
  },
  "46964": {
    "fixed_acidity": "固定酸度",
    "volatile_acidity": "挥发性酸度",
    "citric_acid": "柠檬酸",
    "residual_sugar": "残糖",
    "chlorides": "氯化物",
    "free_sulfur_dioxide": "游离二氧化硫",
    "total_sulfur_dioxide": "总二氧化硫",
    "density": "密度",
    "pH": "酸碱度（pH）",
    "sulphates": "硫酸盐",
    "alcohol": "酒精含量",
    "median_wine_quality": "葡萄酒质量评分中位数"
  },
  "46979": {
    "loc": "代码行数",
    "v(g)": "圈复杂度",
    "ev(g)": "基本复杂度",
    "iv(g)": "设计复杂度",
    "n": "运算符与操作数总数",
    "v": "程序容量",
    "l": "程序长度指标（l）",
    "d": "程序难度",
    "i": "智能含量",
    "e": "编程工作量",
    "t": "估计编程时间",
    "lOCode": "代码行数（Halstead）",
    "lOComment": "注释行数",
    "lOBlank": "空白行数",
    "locCodeAndComment": "代码与注释混合行数",
    "uniq_Op": "不同运算符数",
    "uniq_Opnd": "不同操作数数",
    "total_Op": "运算符总数",
    "total_Opnd": "操作数总数",
    "branchCount": "分支数",
    "defects": "是否存在缺陷"
  },
  "46930": {
    "s12": "检测信号（s12）",
    "s13": "检测信号（s13）",
    "s14": "检测信号（s14）",
    "s15": "检测信号（s15）",
    "s16": "检测信号（s16）",
    "s21": "检测信号（s21）",
    "s23": "检测信号（s23）",
    "s24": "检测信号（s24）",
    "s25": "检测信号（s25）",
    "s26": "检测信号（s26）",
    "s31": "检测信号（s31）",
    "s32": "检测信号（s32）",
    "s34": "检测信号（s34）",
    "s35": "检测信号（s35）",
    "s36": "检测信号（s36）",
    "s41": "检测信号（s41）",
    "s42": "检测信号（s42）",
    "s43": "检测信号（s43）",
    "s45": "检测信号（s45）",
    "s46": "检测信号（s46）",
    "s51": "检测信号（s51）",
    "s52": "检测信号（s52）",
    "s53": "检测信号（s53）",
    "s54": "检测信号（s54）",
    "s56": "检测信号（s56）",
    "s61": "检测信号（s61）",
    "s62": "检测信号（s62）",
    "s63": "检测信号（s63）",
    "s64": "检测信号（s64）",
    "s65": "检测信号（s65）",
    "Contaminated": "是否污染"
  }
};

export function getDisplayColumnName(header: string, locale: Locale, datasetId?: string | null): string {
  if (locale !== 'zh' || !datasetId) return header;
  const labels = Object.hasOwn(columnLabels, datasetId) ? columnLabels[datasetId] : undefined;
  return labels && Object.hasOwn(labels, header) ? labels[header] : header;
}

/** Resolve translated-name collisions without changing column order or identity. */
export function getDisplayColumnNames(headers: readonly string[], locale: Locale, datasetId?: string | null): string[] {
  const names = headers.map(header => getDisplayColumnName(header, locale, datasetId));
  const counts = new Map<string, number>();
  names.forEach(name => counts.set(name, (counts.get(name) ?? 0) + 1));
  const used = new Set<string>();
  return names.map((name, index) => {
    const base = counts.get(name)! > 1 ? `${name}（${headers[index]}）` : name;
    let unique = base;
    for (let suffix = 2; used.has(unique); suffix += 1) unique = `${base} (${suffix})`;
    used.add(unique);
    return unique;
  });
}
