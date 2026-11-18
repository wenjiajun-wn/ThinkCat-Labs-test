#!/usr/bin/env bash
# Alibaba Cloud Linux 4：新增 ThinkCat 域名，保留现有网站与推理代理。
set -Eeuo pipefail
export PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin
[[ $EUID -eq 0 ]] || { echo '请使用 root 执行。'; exit 1; }

original=/etc/nginx/conf.d/thinkcat-labs.conf
new_conf=/etc/nginx/conf.d/thinkcatlabs-ai.conf
venv=/opt/thinkcatlabs-certbot
certdir=/etc/letsencrypt-thinkcatlabs
service=/etc/systemd/system/thinkcatlabs-cert-renew.service
timer=/etc/systemd/system/thinkcatlabs-cert-renew.timer
[[ -f "$original" ]] || { echo '未找到原网站配置，停止。'; exit 1; }
for item in "$new_conf" "$service" "$timer"; do
  [[ ! -e "$item" ]] || { echo "已存在 $item；停止，避免覆盖，请提供当前配置。"; exit 1; }
done
nginx -t
dnf install -y python3 python3-pip curl

python3 - <<'PY'
import socket
for host in ['thinkcatlabs.ai', 'www.thinkcatlabs.ai']:
    ips = {v[4][0] for v in socket.getaddrinfo(host, 80, socket.AF_INET)}
    print(host, sorted(ips))
    if ips != {'101.200.189.110'}:
        raise SystemExit('服务器 DNS 缓存尚未更新为唯一目标地址，请稍后重试。')
PY

python3 -m venv "$venv"
"$venv/bin/python" -m pip install --upgrade pip certbot

backup=$(mktemp -d /root/thinkcat-domain-backup-XXXXXXXX)
cp -a "$original" "$backup/thinkcat-labs.conf"
echo "原配置备份：$backup/thinkcat-labs.conf"
export backup

# 从真实现网配置复制 HTTPS server，只替换域名和证书路径。
# 不复制 limit_*_zone 定义，继续引用现有 zone。
python3 - <<'PY'
from pathlib import Path
import os, re
source = Path('/etc/nginx/conf.d/thinkcat-labs.conf').read_text()
starts = list(re.finditer(r'(?m)^\s*server\s*\{', source))
if len(starts) != 2:
    raise SystemExit('原配置结构与已核对版本不同，未写入新站点。')
https = source[starts[1].start():]
required = ['listen 443 ssl;', 'server_name thinkcat-labs.ai-calendar.xyz;',
    '/etc/letsencrypt/live/thinkcat-labs.ai-calendar.xyz/fullchain.pem',
    '/etc/letsencrypt/live/thinkcat-labs.ai-calendar.xyz/privkey.pem',
    'proxy_pass http://127.0.0.1:18000/predict;', 'root /var/www/thinkcat-labs/current;']
if any(https.count(token) != 1 for token in required):
    raise SystemExit('原 HTTPS / 推理配置与已核对版本不同，停止。')
https = https.replace('server_name thinkcat-labs.ai-calendar.xyz;',
    'server_name thinkcatlabs.ai www.thinkcatlabs.ai;')
https = https.replace('/etc/letsencrypt/live/thinkcat-labs.ai-calendar.xyz/',
    '/etc/letsencrypt-thinkcatlabs/live/thinkcatlabs.ai/')
http = '''server {
    listen 80;
    server_name thinkcatlabs.ai www.thinkcatlabs.ai;
    location ^~ /.well-known/acme-challenge/ { root /var/lib/pubmed-acme; }
    location / { return 308 https://$host$request_uri; }
}
'''
directory = Path(os.environ['backup'])
(directory/'http.conf').write_text(http)
(directory/'complete.conf').write_text(http + https)
PY

created=0
units=0
rollback() {
  status=$?
  trap - EXIT
  if [[ $status -ne 0 ]]; then
    echo "操作失败，退出码 $status。恢复新增站点前的状态。备份：$backup"
    if [[ $units -eq 1 ]]; then
      systemctl disable --now thinkcatlabs-cert-renew.timer || true
      rm -f -- "$timer" "$service"
      systemctl daemon-reload || true
    fi
    if [[ $created -eq 1 ]]; then
      rm -f -- "$new_conf"
      nginx -t && systemctl reload nginx || true
    fi
    echo '安装工具和已签发证书保留；原网站配置未修改。'
  fi
  exit "$status"
}
trap rollback EXIT
install -d -m 755 /var/lib/pubmed-acme/.well-known/acme-challenge
created=1
install -m 644 "$backup/http.conf" "$new_conf"
nginx -t
systemctl reload nginx

echo '开始申请证书，请按 Certbot 提示填写邮箱并确认服务条款。'
"$venv/bin/certbot" certonly --webroot -w /var/lib/pubmed-acme \
  --config-dir "$certdir" --work-dir /var/lib/thinkcatlabs-certbot \
  --logs-dir /var/log/thinkcatlabs-certbot \
  --keep-until-expiring --cert-name thinkcatlabs.ai -d thinkcatlabs.ai -d www.thinkcatlabs.ai

install -m 644 "$backup/complete.conf" "$new_conf"
nginx -t
systemctl reload nginx

# reload 返回时新 worker 可能尚未就绪，必须等待实际 HTTPS 响应。
# 保留 CA / 主机名验证，只在成功且 HTTP 200 时打印“通过”。
verify_route() {
  local host=$1 route=$2 status='' failure=1 attempt
  for attempt in {1..10}; do
    if status=$(curl --noproxy '*' --resolve "$host:443:127.0.0.1" \
      --connect-timeout 5 --max-time 10 -fsS -o /dev/null \
      -w '%{http_code}' "https://$host$route" 2> "$backup/curl-error.log"); then
      if [[ $status == 200 ]]; then
        echo "通过：$host$route HTTP $status"
        return 0
      fi
      failure=22
    else
      failure=$?
    fi
    echo "等待 HTTPS 就绪：$host$route，第 $attempt/10 次，curl=$failure，HTTP=$status"
    if [[ $attempt -lt 10 ]]; then sleep 2; fi
  done
  echo 'HTTPS 检查失败，以下是完整错误和证书诊断（不输出私钥）：'
  cat "$backup/curl-error.log"
  date -u
  curl --version | head -n 2
  echo '磁盘上的新域名证书：'
  openssl x509 -in "$certdir/live/thinkcatlabs.ai/fullchain.pem" \
    -noout -subject -issuer -dates -ext subjectAltName || true
  echo '使用系统信任库检查证书链：'
  openssl verify -untrusted "$certdir/live/thinkcatlabs.ai/chain.pem" \
    "$certdir/live/thinkcatlabs.ai/cert.pem" || true
  echo '当前 Nginx 实际返回的证书：'
  timeout 8 openssl s_client -connect 127.0.0.1:443 -servername "$host" \
    </dev/null > "$backup/served-certificate.log" 2>&1 || true
  openssl x509 -in "$backup/served-certificate.log" \
    -noout -subject -issuer -dates -ext subjectAltName || true
  return "$failure"
}
for host in thinkcatlabs.ai www.thinkcatlabs.ai; do
  for route in /zh/ /en/ /zh/playground/; do
    verify_route "$host" "$route"
  done
done

# 独立的证书配置目录和定时器，不接管其他网站的证书续期。
units=1
cat > "$service" <<'UNIT'
[Unit]
Description=Renew ThinkCat Labs domain certificate
Wants=network-online.target
After=network-online.target
[Service]
Type=oneshot
ExecStart=/opt/thinkcatlabs-certbot/bin/certbot renew --quiet --config-dir /etc/letsencrypt-thinkcatlabs --work-dir /var/lib/thinkcatlabs-certbot --logs-dir /var/log/thinkcatlabs-certbot --deploy-hook "/usr/sbin/nginx -t && /usr/bin/systemctl reload nginx"
UNIT
cat > "$timer" <<'UNIT'
[Unit]
Description=Check ThinkCat Labs certificate twice daily
[Timer]
OnCalendar=*-*-* 00,12:00:00
RandomizedDelaySec=3600
Persistent=true
[Install]
WantedBy=timers.target
UNIT
systemctl daemon-reload
systemctl enable --now thinkcatlabs-cert-renew.timer
systemctl is-active --quiet thinkcatlabs-cert-renew.timer
trap - EXIT
echo '新域名 HTTPS 已配置；旧域名及原网站配置保留。'
echo '请访问 https://thinkcatlabs.ai/zh/ 并手动运行一次 Playground，确认真实推理。'
echo '网页与 TLS 检查通过不代表真实预测通过。'
echo "回退方式：移走 $new_conf，nginx -t 通过后 reload；配置备份目录：$backup"
