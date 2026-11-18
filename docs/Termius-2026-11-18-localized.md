# Termius 完整部署命令（2026-11-18）

将 `Thinkcat-Labs-2026-11-18-localized-deploy.tar.gz` 上传到前端服务器 `101.200.189.110` 的 `/root/`，然后以 root 执行以下完整命令。无需安装 Node.js。

```bash
bash <<'THINKCAT_DEPLOY'
set -Eeuo pipefail
NAME='Thinkcat-Labs-2026-11-18-localized-deploy'
EXPECTED='84e11e8f2b6cff118110272437964238703957407c30ca0ea81cec3775455c7e'
[[ $EUID -eq 0 ]] || { echo '请使用前端服务器的 root 终端'; exit 1; }
ARCHIVE="/root/$NAME.tar.gz"
[[ -f "$ARCHIVE" ]] || ARCHIVE="/tmp/$NAME.tar.gz"
[[ -f "$ARCHIVE" ]] || { echo '请先上传部署包到 /root/ 或 /tmp/'; exit 1; }
printf '%s  %s\n' "$EXPECTED" "$ARCHIVE" | sha256sum -c -
WORK="$(mktemp -d /tmp/thinkcat-localized.XXXXXXXX)"
tar -xzf "$ARCHIVE" -C "$WORK"
cd "$WORK/$NAME"
sha256sum -c SHA256SUMS > /dev/null
bash -n update-existing.sh
bash update-existing.sh
echo "部署完成，解压目录：$WORK/$NAME"
THINKCAT_DEPLOY
```

脚本依据现有 Nginx 配置选择 thinkcatlabs.ai 或原域名，先检查 HTTPS，再发布；不改域名、证书、API 或 GPU 配置。若 HTTPS 验证失败会停止，不能通过跳过证书校验来部署。发布后验证失败自动恢复旧站点。旧版本路径保存在新版本的 PREVIOUS_RELEASE 文件。

部署包逐文件校验通过，构建与静态导出通过；尚未在远程服务器执行，也未验证真实推理。完成后 Ctrl+F5 刷新，手动运行一次示例确认推理服务。
