# 开发者接入

[Python SDK 快速开始](quickstart.md) · [HTTP 请求与响应](predict.md) · [错误处理](errors.md) · [本地验证](maintainers.md)

主预测入口为 POST /api/predict。在线体验中单独选择的 XGBoost 对照服务使用独立的基线处理器。预录结果仅用于在线体验内置数据集，SDK 调用返回实时结果或错误。
