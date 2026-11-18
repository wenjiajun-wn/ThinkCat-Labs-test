# 应用场景更新部署

连接托管官网的 Linux 服务器，通过 Termius SFTP 上传 `Thinkcat-Labs-2026-11-16-gallery-deploy.tar.gz` 到 `/root/`（若当前 SFTP 账号无权限，可上传 `/tmp/`）。不要将包上传到 GPU 服务器。无需在服务器上安装 Node.js 或重新构建。

先执行 `sudo -i`，然后完整粘贴：

```bash
bash <<'THINKCAT_DEPLOY'
set -Eeuo pipefail
NAME='Thinkcat-Labs-2026-11-16-gallery-deploy'
EXPECTED='37a3ce9ff1476614e7862d330dd07f3b4e1bf9386a032b65189e69c143152ab4'
[[ $EUID -eq 0 ]] || { echo '请先执行 sudo -i'; exit 1; }
ARCHIVE="/root/$NAME.tar.gz"
[[ -f "$ARCHIVE" ]] || ARCHIVE="/tmp/$NAME.tar.gz"
[[ -f "$ARCHIVE" ]] || { echo '未找到部署包，请先上传到 /root 或 /tmp'; exit 1; }
printf '%s  %s\n' "$EXPECTED" "$ARCHIVE" | sha256sum -c -
WORK="$(mktemp -d /tmp/thinkcat-gallery.XXXXXXXX)"
tar -xzf "$ARCHIVE" -C "$WORK"
cd "$WORK/$NAME"
sha256sum -c SHA256SUMS > /dev/null
bash -n update-existing.sh
bash update-existing.sh
echo "部署包解压目录：$WORK/$NAME"
THINKCAT_DEPLOY
```

脚本只适用于现有 `/var/www/thinkcat-labs/current` 符号链接部署；结构不符会停止。自动选择 Nginx 已配置的 `thinkcatlabs.ai`，没有时使用已配置的 `thinkcat-labs.ai-calendar.xyz`。不替换服务器配置，不重启 GPU，不改推理服务地址，不删除旧版本。静态文件发布无需重启 Nginx。

成功后刷新官网（必要时 Ctrl+F5）；浏览中英文首页并运行一次 Playground 公开示例。脚本只校验页面/图片响应，不发起 GPU 推理。若使用 CDN，还需按实际缓存策略刷新 HTML 和同名图片缓存。

## 手动回退

仅在本次脚本显示成功之后需要人工回退时使用。自动检查失败时脚本已切回旧版。

```bash
sudo bash <<'THINKCAT_ROLLBACK'
set -Eeuo pipefail
ROOT='/var/www/thinkcat-labs'
exec 9>"$ROOT/.update.lock"
flock -n 9 || { echo '有其他部署正在执行'; exit 1; }
CURRENT="$(readlink -f "$ROOT/current")"
[[ -f "$CURRENT/PREVIOUS_RELEASE" ]] || { echo '当前版本没有本次回退记录，已停止'; exit 1; }
PREVIOUS="$(cat "$CURRENT/PREVIOUS_RELEASE")"
[[ "$PREVIOUS" == "$ROOT/releases/"* && -f "$PREVIOUS/zh/index.html" ]] || { echo '旧版本无效，已停止'; exit 1; }
nginx -t
LINK="$ROOT/.rollback-gallery-$$"
ln -s "$PREVIOUS" "$LINK"
mv -Tf "$LINK" "$ROOT/current"
echo "已回退到：$PREVIOUS"
THINKCAT_ROLLBACK
```

## 实际验证边界

本地类型检查、Lint、生产静态导出和中英文导出检查已通过；打包后逐文件校验 TAR 内容及 ZIP 完整性。部署包不含 `.env`、私钥或 node_modules。当前构建沿用 `noindex`，需确认正式域名后另行构建 SEO 发布版本。本机没有安装可用的 WSL Linux 发行版，未运行 Linux 部署脚本，也未执行真实服务器更新；部署步骤先在服务器执行 `bash -n`。
