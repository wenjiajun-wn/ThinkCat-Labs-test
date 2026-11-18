# 素材授权记录

| 资源 | 来源 | 授权状态 |
|---|---|---|
| 数值地形、矩阵、时序曲线、表征图、行业图形 | `components/visualizations/` 中的原创 React/SVG 代码 | 项目原创；不含第三方素材 |
| 品牌标记、favicon 与页面图标 | `components/layout/brand.tsx`、`app/icon.svg`、`public/favicon.ico` 原创几何图形 | 项目原创；商标权需主体确认 |
| 页面文案 | 用户提供定位与本项目整理 | 需公司确认事实与对外发布口径 |
| thinkcat labs 文字标识 | 原生文字排版 | 非外部 Logo；商标权需主体确认 |
| 字体 | 本地托管 Geist Variable、Geist Mono Variable。中文使用系统字体回退 | 字体包为 SIL OFL 1.1，版权与许可原文收录于 `public/THIRD_PARTY_NOTICES.txt`。中文回退只引用设备本地字体 |
| 首页第三方品牌名称与图形 | `components/home/model-marquee.tsx` 中的文字与手绘 SVG | 上线前需核对品牌使用规则及展示语境，避免被理解为合作或背书 |
| 交互演示数据 | `lib/demo-data.ts` 合成数据 | 项目原创；不是客户数据或模型输出 |

历史记录：V5.2 当时没有引入 Runway 图片、视频、字体或代码，没有图库、外部 CDN、生成式图片素材或新的生产依赖。所有图形与图标均由本地代码或手工 SVG 生成。


## 2026-11-16 应用场景生成图

新增 `public/images/application-commerce.webp`、`application-software.webp`、`application-food.webp`、`application-education.webp`。由内置 OpenAI image_gen 根据本项目文字提示生成，未输入第三方素材；本地 WebP 压缩，单图约 34–97 KiB。用于概念说明，不是实测数据或真实预测。

提示词共同约束：2:1 横幅，深绿近黑背景、细网格、酸橙绿与灰绿线条，克制的科研信息图；无文字、数值、品牌标识、水印或真实推理结论。

| 文件 | 场景提示摘要 |
|---|---|
| application-commerce.webp | 访问轨迹穿过特征节点并分为两组，下方为停留时间柱状图 |
| application-software.webp | 复杂度特征矩阵连接软件模块关系图，局部突出异常特征 |
| application-food.webp | 三条检测光谱，局部差异峰值及样本分布 |
| application-education.webp | 学习轨迹穿过阶段节点，最终分成三组 |

来源为本次内置工具生成输出，不是从其他网站复制或授权图库下载。生成式素材不按 MIT/OFL 等开源许可证归类；公开商用前由项目负责人确认适用的生成服务条款及最终发布语境。此记录不是法律审查或排他性版权保证。


## 2026-11-17 大规模应用示例

详见 docs/LARGE_EXAMPLES_2026-11-17.md；来源快照保存在 content/datasets/*-source.json，署名及处理说明随站点发布于 public/DATASET_NOTICES.txt。新增代码无第三方依赖。七张配图由内置 image_gen 生成，不使用竞品素材，不宣称独占版权；所有权及商用使用仍受适用服务条款约束。通信数据MIT原始版权声明完整性待人工核对；既有待确认事项不因本轮自动消除。

配图来源：artifacts/large-example-image-sources.json。输出 public/images/application-{bank,telecom,airline,shipping,fitness,customer,wine}.webp。生成后仅等比缩小并转WebP，未添加第三方素材。

提示词规范：Original premium scientific data illustration for Thinkcat Labs. Landscape 2:1. Near-black forest green background, lime and muted sage fine geometry and subtle luminous accents. No text, letters, numbers, logos, buttons, or watermark. Conceptual illustration only, no actual model outputs. Generous margins, refined restrained rendering.
场景分别为银行营销的特征节点与响应路径、通信天线与使用信号、航空轮廓与满意度分布、物流包裹与到达路径、健身预约节点与出席分布、客户账目矩阵与信用分布、酒杯与11种理化信号和7级评分节点。
