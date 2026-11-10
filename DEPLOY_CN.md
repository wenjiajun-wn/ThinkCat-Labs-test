# 中国大陆部署准备

1. 配置真实域名环境变量 `NEXT_PUBLIC_SITE_URL=https://实际域名`；补齐 `config/site.ts` 的主体、邮箱及适用备案字段。
2. `npm ci && npm run build`，将 `out/` 上传至 Nginx 根目录或国内对象存储静态站点。`postbuild` 会生成 Next 16 静态导出的 RSC 预取别名，需连同这些文件一起部署。
3. Nginx：`location / { try_files $uri $uri/ =404; }`，关闭目录索引，为 `/_next/static/` 设置一年 immutable 缓存，HTML 使用短缓存或 no-cache。
4. 配置有效 HTTPS 证书、HTTP 到 HTTPS 跳转、gzip/Brotli。测试 IPv4/IPv6、真实移动网络和 CDN 回源。
5. 配置 `nosniff`、`Referrer-Policy: strict-origin-when-cross-origin`。CSP 应在报告模式验证 Next 内联脚本的哈希策略后启用，避免直接阻断 hydration。
6. 按实际情况完成备案、隐私声明与访问日志保留策略。此文档是工程上线清单，不是合规结论。
7. 部署前核验所有章节、隐私页、404、robots.txt、sitemap.xml、键盘操作、减少动态效果和浏览器控制台。保存桌面及移动截图与 Lighthouse 报告。
8. 本阶段无公开模型服务，无服务端密钥。邮件功能需真实邮箱配置；不启用虚假联系表单或推理接口。

回滚：保留上一版本 `out/`，使用版本目录切换站点根目录。不要在更新时混合不同构建的静态资源。

## Termius / Linux 部署包

仓库提供 [deploy/README.md](deploy/README.md) 和配套脚本：

- `deploy/deploy.sh`：创建 `/var/www/thinkcat-labs/releases/<时间戳>`，复制 `out/`，原子切换 `current`，自动执行 `nginx -t` 并 reload。
- `deploy/rollback.sh`：切换到上一版本。
- `deploy/nginx-thinkcat.conf`：Nginx 示例，默认站点根目录为 `/var/www/thinkcat-labs/current`。

在服务器上解压部署包后执行 `sudo bash deploy.sh`。当前部署包由未配置域名的预览构建生成，页面为 `noindex`；正式域名上线前必须用 `NEXT_PUBLIC_SITE_URL` 重新构建。

## 静态导出结构

- `/zh/`、`/en/` 及其页面目录。
- `/_next/static/`。
- `icon.svg`、`favicon.ico`、`THIRD_PARTY_NOTICES.txt`。
- `robots.txt`、`sitemap.xml`。
- Next 16 RSC 预取别名文件，由 `scripts/static-rsc-aliases.mjs` 在构建后生成。

## 视觉验收

最终 V5.2 证据位于 `screenshots/v5.2/after`，基线位于 `screenshots/v5.2/before`。覆盖 1440、768、390 三个视口和中英文九个页面。使用真实浏览器截图，不包含后端或真实推理。

## 发布前待确认

- 正式域名、备案、主体名称、邮箱与隐私声明。
- 模型版本、GitHub、Hugging Face 和 API 接口契约。
- 研究与论文的作者、发表信息和公开链接。
- 实际移动设备、弱网和 CDN 回源测试。

这些字段保持待确认状态，不使用虚构占位链接。
