# SDK 本地验收

从仓库根目录构建 wheel（构建环境需要 setuptools 和 wheel）。

~~~bash
python -m pip wheel --no-build-isolation --no-deps sdk/python -w public/sdk
~~~

安装方法和预测代码见 quickstart.md。包内 donation.json 与 public/api-examples/donation-request.json 必须一致。

## 用 CPU 服务验证完整 HTTP 调用

使用安装了 numpy、xgboost 的环境运行以下命令。

~~~bash
python scripts/xgboost_service.py
~~~

另开一个终端启动本地网关。以下为 Bash 命令。

~~~bash
KUMO_INFERENCE_URL=http://127.0.0.1:8765/api/xgboost/predict THINKCAT_PREVIEW_PORT=3024 node scripts/preview.mjs --kumo
~~~

客户端配置为 Client(base_url="http://127.0.0.1:3024")。使用系统 HTTP 代理时将 localhost、127.0.0.1 加入 NO_PROXY。用 load_example() 发起请求，检查 model 为 XGBoost、row_indices 为 [19]。正式 GPU 服务使用其实际推理地址作为网关上游。默认本地预览只允许内置献血示例访问远程服务。

发布静态文件时包含 public/sdk 对应的 wheel。生产 Nginx 的 /api/predict 应转发到已配置的真实主服务。
