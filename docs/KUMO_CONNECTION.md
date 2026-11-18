# Kumo 推理连接配置与排查

## 当前发现

- 浏览器在 lib/kumo-api.ts 中发送 POST /api/kumo/predict。
- next.config.ts 使用静态导出。当前仓库没有该路径的 Next.js Route Handler，也没有 Next.js rewrites。
- scripts/preview.mjs 的 forwardKumo 是本地预览转发器，仅在 --kumo 模式启用。
- deploy/nginx-thinkcat.conf 没有该 API 的 proxy_pass。生产网关配置尚未提供。
- 用户确认 GPU 公网 IP 为 49.232.246.48，使用 SSH 密钥登录。HTTP 服务的协议、端口和预测路径待确认。SSH 登录端口不能作为 HTTP 推理端口使用。
- 2026-11-13 查询到原预览目标域名 thinkcat-labs.ai-calendar.xyz 的 A 记录为 101.200.189.110。该域名可能是前端或网关，不能据此认定为旧 GPU IP。

本次修复本地转发器配置与日志。线上 502 的根因和恢复状态尚未确认。

2026-11-13 对用户提供站点做公开 HTTP 诊断，/zh/playground/ 返回 200；不带 Origin 的 API GET 返回 403；带本站 Origin 的 POST /api/kumo/predict（空 JSON，仅诊断参数校验入口）返回 502、Nginx HTML 错误页，Server 为 nginx/1.30.4。已复现生产网关错误，但此响应无法确定具体上游 IP。没有发送有效推理数据。

## 配置现有预览转发器

复制 deploy/kumo.env.example 为项目根目录 .env.kumo。将 KUMO_INFERENCE_URL 设置为已确认的完整预测 URL，包含协议、端口和路径。完整路径原样保留，代码不会自动追加 /api/kumo/predict。

~~~powershell
Copy-Item deploy/kumo.env.example .env.kumo
# 编辑 .env.kumo 后启动
node --env-file=.env.kumo scripts/preview.mjs --kumo
~~~

Linux 用 cp 替换 Copy-Item。该变量是服务端运行时变量，不使用 NEXT_PUBLIC_ 前缀。npm run preview 本身不会自动读取 .env.kumo。已有进程环境中的同名变量优先于 --env-file，修改时须核对两处。

缺失或无效地址在 --kumo 模式下启动失败，静态预览不需要该变量。HTTPS 应使用证书覆盖的域名。保留现有请求体、Content-Type、响应体透传及 55 秒超时。

## 查找真实生产转发位置

在前端服务器执行以下只读检查，定位实际网关文件和上游。

~~~bash
sudo nginx -T 2>&1 | grep -nE 'configuration file|server_name|location.*api|proxy_pass|upstream'
~~~

仅分享脱敏的 API location 和 upstream 片段。仓库无法确定线上 vhost 文件名、部署平台、容器或 systemd 服务名。

在 GPU 服务器检查服务监听状态及启动配置。

~~~bash
sudo ss -lntp
~~~

结合服务启动命令或其 API 文档确认协议和预测路径。若使用 SSH 隧道，需要核对隧道进程、远端目标 IP 与本地转发端口，不能直接将 GPU 公网 IP 当作 HTTP 上游。

## 更新与重启

如果生产 Nginx 直接转发 GPU，在实际 vhost 的 /api/kumo/predict location 或引用的 upstream 中更新确认后的地址。沿用现有请求头、鉴权、路径重写和超时设置，注意 proxy_pass 的路径及末尾斜线语义。然后执行以下命令。

~~~bash
sudo nginx -t && sudo systemctl reload nginx
sudo tail -n 80 /var/log/nginx/error.log
~~~

日志路径以实际 error_log 为准。Nginx 普通配置不会自动读取 .env.kumo 或插值 KUMO_INFERENCE_URL。不要直接用仓库的静态 Nginx 示例覆盖生产网关配置。

如果 Nginx 转发到另一 Node / Next.js 服务，需要修改该服务实际读取的上游变量。其源码目前不在仓库。只有服务已接入 KUMO_INFERENCE_URL 时，才将此变量添加到部署平台对应后端服务的运行时环境变量。仅设置静态前端构建变量无法修改网关。

- systemd 更新实际 EnvironmentFile，然后执行 sudo systemctl restart 实际服务名。修改 unit 本身时，先执行 sudo systemctl daemon-reload。
- PM2 更新 ecosystem 环境配置或启动 shell 环境，再执行 pm2 restart 实际进程名 --update-env。
- Docker Compose 更新网关服务 environment 或 env_file，执行 docker compose up -d --force-recreate 实际网关服务名。
- 托管平台在实际后端服务的运行时环境变量设置中更新，再重新部署或重启。

若上游使用 GPU 域名，在确认该域名用途后更新 DNS，并处理网关 DNS 缓存。不要因前端域名与 GPU IP 不同就修改前端 DNS。

## 验证与日志

从前端服务器使用已有合成请求文件直接调用已确认的 GPU 完整端点，再通过站点 /api/kumo/predict 发送同一请求，核对状态及响应格式。

~~~bash
curl --connect-timeout 5 --max-time 60 -i -H 'Content-Type: application/json' --data-binary @synthetic-request.json "$KUMO_INFERENCE_URL"
~~~

沿用现网鉴权要求，不分享密钥或客户数据。不得以能通过 SSH 登录作为 HTTP 推理服务连通的验证。

本地转发器 stderr 输出 kumo_proxy_failure 日志。

- connection_refused 为连接拒绝，返回 502。
- timeout 为连接或响应超时，返回 504。
- dns_error、tls_error 分别为 DNS 与证书错误，返回 502。
- upstream_http_error 为上游非成功 HTTP 响应，原状态码和响应体透传。
- connection_error 为其他网络失败，返回 502。

日志只包含分类、受控错误码、HTTP 状态与耗时，不输出上游 URL、请求/响应体、请求头或原始异常消息。不会自动重试推理。

自动测试命令为 node --test scripts/kumo-connection.test.mjs，使用本机模拟上游验证请求/响应透传、上游 HTTP 错误、真实连接拒绝和日志脱敏。超时分类使用模拟异常测试，未运行 55 秒超时的真实 GPU 请求。
