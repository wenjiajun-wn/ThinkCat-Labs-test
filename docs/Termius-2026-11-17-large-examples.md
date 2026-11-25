# Termius 部署：2026-11-17 大规模示例

将 Thinkcat-Labs-2026-11-17-large-examples-deploy.tar.gz 上传到前端服务器 /root/。不要上传到 GPU 服务器。
包含七个大规模场景、七张配图、中英文内容、200行分页预览以及删除标题上方小字的最终修改。
包已构建，不需要服务器安装 Node.js。只更新现有网站静态目录，不替换 Nginx、证书、8m配置或推理服务。

以 root 执行：

```bash
bash <<'THINKCAT_DEPLOY'
set -Eeuo pipefail
NAME='Thinkcat-Labs-2026-11-17-large-examples-deploy'
EXPECTED='ca5599d0db8119b8958d49cb7f5adc4a801bc5a626250a62f168dda2e0ad8986'
[[ $EUID -eq 0 ]] || { echo '请使用前端服务器的 root 终端'; exit 1; }
ARCHIVE="/root/$NAME.tar.gz"
[[ -f "$ARCHIVE" ]] || ARCHIVE="/tmp/$NAME.tar.gz"
[[ -f "$ARCHIVE" ]] || { echo '请先将部署包上传至 /root/ 或 /tmp/'; exit 1; }
printf '%s  %s\n' "$EXPECTED" "$ARCHIVE" | sha256sum -c -
WORK="$(mktemp -d /tmp/thinkcat-large-examples.XXXXXXXX)"
tar -xzf "$ARCHIVE" -C "$WORK"
cd "$WORK/$NAME"
sha256sum -c SHA256SUMS > /dev/null
bash -n update-existing.sh
DOMAIN=thinkcatlabs.ai bash update-existing.sh
echo "部署完成，解压目录：$WORK/$NAME"
THINKCAT_DEPLOY
```

通过正式域名验证 current 目录中的发布内容。
静态发布无需重启 Nginx/GPU。浏览器 Ctrl+F5 刷新；有CDN时清理HTML和同名资源缓存。
上线后在 /zh/playground/?dataset=46910 点击运行模型验证一万行，切换英文再检查一次。
服务器脚本只自动核验静态页面和图片，不自动发送推理请求。

## 可选回退

仅部署成功后需要恢复旧页面时执行：

```bash
bash <<'THINKCAT_ROLLBACK'
set -Eeuo pipefail
ROOT='/var/www/thinkcat-labs'
exec 9>"$ROOT/.update.lock"
flock -n 9 || { echo '有其他部署正在执行'; exit 1; }
CURRENT="$(readlink -f "$ROOT/current")"
[[ -f "$CURRENT/PREVIOUS_RELEASE" ]] || { echo '当前版本没有回退记录'; exit 1; }
PREVIOUS="$(cat "$CURRENT/PREVIOUS_RELEASE")"
[[ "$PREVIOUS" == "$ROOT/releases/"* && -f "$PREVIOUS/zh/index.html" ]] || { echo '旧版本无效'; exit 1; }
nginx -t
LINK="$ROOT/.rollback-large-$$"
ln -s "$PREVIOUS" "$LINK"
mv -Tf "$LINK" "$ROOT/current"
echo "已恢复：$PREVIOUS"
THINKCAT_ROLLBACK
```

## 验证与未完成事项

部署包202个导出文件已逐文件核对；TAR内容和ZIP完整性均已检查。不包含环境文件、私钥、node_modules。
代码构建与浏览器验收见 LARGE_EXAMPLES_2026-11-17.md。当前电脑无可用Linux Bash，未在本地执行Linux部署脚本；
上述命令会先在服务器运行bash -n和nginx -t。尚未由助手操作线上发布。
通信数据原始MIT版权声明完整性仍待人工核对，既有授权待确认事项不因打包自动消除。
