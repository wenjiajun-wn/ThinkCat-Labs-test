# API 文档更新包：Termius 完整部署命令

服务器：`101.200.189.110`。通过 Termius 的 SFTP 将 `Thinkcat-Labs-2026-11-20-model-docs-deploy.tar.gz` 上传至 `/root/`，随后在该服务器 root 终端完整执行以下命令。无需在服务器安装 Node.js 或重新构建。

```bash
bash <<'THINKCAT_DEPLOY'
set -Eeuo pipefail
NAME='Thinkcat-Labs-2026-11-20-model-docs-deploy'
EXPECTED='ac1d5c29feac388947ff5719dc4524ff5c7668154f022bd1b82ce5fd16773ae1'
[[ $EUID -eq 0 ]] || { echo '请使用前端服务器的 root 终端'; exit 1; }
ARCHIVE="/root/$NAME.tar.gz"
[[ -f "$ARCHIVE" ]] || ARCHIVE="/tmp/$NAME.tar.gz"
[[ -f "$ARCHIVE" ]] || { echo '请先上传部署包到 /root/ 或 /tmp/'; exit 1; }
printf '%s  %s\n' "$EXPECTED" "$ARCHIVE" | sha256sum -c -
WORK="$(mktemp -d /tmp/thinkcat-model-docs.XXXXXXXX)"
tar -xzf "$ARCHIVE" -C "$WORK"
cd "$WORK/$NAME"
sha256sum -c SHA256SUMS > /dev/null
bash -n update-existing.sh
bash update-existing.sh
echo "部署完成，解压目录：$WORK/$NAME"
THINKCAT_DEPLOY
```

脚本会按现有 Nginx 配置选择 `thinkcatlabs.ai`，缺少配置时停止。它只更新静态文件，不修改 Nginx、域名、证书、API、SSH 隧道和 GPU 服务，不删除旧版本。

部署前 HTTPS 校验失败会停止；发布后内容校验失败会自动回退。不要使用 curl -k 绕过证书问题。请在正式域名的 HTTPS 校验通过后发布。

成功后打开脚本打印的中文／英文文档地址，Ctrl+F5 刷新，并在 Playground 手动运行一个真实示例。包内代码不自动触发推理。

## 手动恢复到本次发布前的版本

仅在需要撤销此次成功部署时执行：

```bash
bash <<'THINKCAT_ROLLBACK'
set -Eeuo pipefail
[[ $EUID -eq 0 ]] || { echo '请使用 root'; exit 1; }
WEB_ROOT='/var/www/thinkcat-labs'
exec 9>"$WEB_ROOT/.update.lock"
flock -n 9 || { echo '另一发布操作正在运行'; exit 1; }
CURRENT="$(readlink -f "$WEB_ROOT/current")"
[[ "$CURRENT" == "$WEB_ROOT"/releases/model-docs-* ]] || { echo '当前不是本次 API 文档版本，停止回退'; exit 1; }
PREVIOUS="$(cat "$CURRENT/PREVIOUS_RELEASE")"
[[ "$PREVIOUS" == "$WEB_ROOT"/releases/* && -f "$PREVIOUS/zh/index.html" && -f "$PREVIOUS/en/index.html" ]] || { echo '旧版本路径异常，未修改'; exit 1; }
LINK="$WEB_ROOT/.rollback-model-docs-$(date +%s)-$$"
ln -s "$PREVIOUS" "$LINK"
mv -Tf "$LINK" "$WEB_ROOT/current"
echo "已回退至：$PREVIOUS"
THINKCAT_ROLLBACK
```

## 验证范围

- 使用本轮已通过构建、125 项测试及静态导出检查的完整 out/；未新增远程服务。
- 打包前静态导出复核通过，包内所有文件哈希逐一比对通过，两个部署脚本 Bash 语法检查通过。
- 当前 noindex 和空 sitemap 策略保留，没有自行启用生产索引。
- 未在远程服务器执行；真实 HTTPS、权限和推理情况以部署后的实测为准。
