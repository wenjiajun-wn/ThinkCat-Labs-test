#!/usr/bin/env bash
set -Eeuo pipefail

NAME='Thinkcat-Labs-2026-11-16-site-deploy'
EXPECTED='bc65d7e1712ab44cec1ee785b287094a585c28868c57e0c4c4ac4db099bff318'
WEB_ROOT='/var/www/thinkcat-labs'
DOMAIN='thinkcat-labs.ai-calendar.xyz'
export WEB_ROOT

[ "$(id -u)" -eq 0 ] || { echo '请先执行 sudo -i，再粘贴本段命令。'; exit 1; }
ARCHIVE=''
for DIR in /root /tmp "$HOME"; do
  if [ -f "$DIR/$NAME.tar.gz" ]; then ARCHIVE="$DIR/$NAME.tar.gz"; break; fi
done
[ -n "$ARCHIVE" ] || { echo "请先通过 SFTP 上传 $NAME.tar.gz 到 /root 或 /tmp。"; exit 1; }
printf '%s  %s\n' "$EXPECTED" "$ARCHIVE" | sha256sum -c -

[ -L "$WEB_ROOT/current" ] || { echo 'current 不是现有站点的符号链接，已停止更新。'; exit 1; }
PREVIOUS="$(readlink -f "$WEB_ROOT/current")"
[ -d "$PREVIOUS" ] || { echo '旧版本目录不存在，已停止。'; exit 1; }
nginx -t

WORK="$(mktemp -d /tmp/thinkcat-update.XXXXXX)"
tar -xzf "$ARCHIVE" -C "$WORK"
cd "$WORK/$NAME"
sha256sum -c SHA256SUMS > "$WORK/integrity.log"
printf '%s\n' "$PREVIOUS" > "$WEB_ROOT/previous-release-20261116.txt"

recover() {
  code=$?
  trap - ERR
  if [ "$(readlink -f "$WEB_ROOT/current")" != "$PREVIOUS" ]; then
    ln -sfn "$PREVIOUS" "$WEB_ROOT/current.rollback"
    mv -Tf "$WEB_ROOT/current.rollback" "$WEB_ROOT/current"
    echo "检查失败，已切回旧版本：$PREVIOUS"
  fi
  echo "更新未完成，解压目录：$WORK/$NAME"
  exit "$code"
}
trap recover ERR
bash deploy.sh
for ROUTE in /zh/ /en/ /zh/playground/ /en/playground/ /images/credit-risk-review.png /images/steel-category.png /images/mining-risk-trend.png; do
  STATUS="$(curl --noproxy '*' --resolve "$DOMAIN:443:127.0.0.1" \
    --connect-timeout 10 --max-time 30 -sS -o /dev/null -w '%{http_code}' \
    "https://$DOMAIN$ROUTE")"
  [ "$STATUS" = '200' ]
  echo "页面检查通过：https://$DOMAIN$ROUTE"
done
trap - ERR
echo "部署成功：$(readlink -f "$WEB_ROOT/current")"
echo "旧版本：$PREVIOUS"
echo "部署包解压目录：$WORK/$NAME"
