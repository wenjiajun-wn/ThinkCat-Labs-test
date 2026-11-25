#!/usr/bin/env bash
# Update an existing static website; never replace Nginx or inference configuration.
set -Eeuo pipefail
export PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin
[[ $EUID -eq 0 ]] || { echo 'Run with sudo bash update-existing.sh'; exit 1; }
for cmd in nginx curl sha256sum flock readlink mktemp cp mv; do
  command -v "$cmd" >/dev/null || { echo "Missing command: $cmd"; exit 1; }
done
WEB_ROOT='/var/www/thinkcat-labs'
PACKAGE_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
[[ -L "$WEB_ROOT/current" ]] || { echo 'Existing current symlink not found; no changes made.'; exit 1; }
exec 9>"$WEB_ROOT/.update.lock"
flock -n 9 || { echo 'Another deployment is running.'; exit 1; }
PREVIOUS="$(readlink -f "$WEB_ROOT/current")"
[[ -f "$PREVIOUS/zh/index.html" ]] || { echo 'Previous site is incomplete; stopped.'; exit 1; }
nginx -t
cd "$PACKAGE_DIR"
sha256sum -c SHA256SUMS > /dev/null
for file in index.html zh/index.html en/index.html zh/products/index.html en/products/index.html zh/docs/index.html en/docs/index.html zh/playground/index.html en/playground/index.html images/application-commerce.webp images/application-software.webp images/application-food.webp images/application-education.webp images/application-bank.webp images/application-telecom.webp images/application-airline.webp images/application-shipping.webp images/application-fitness.webp images/application-customer.webp images/application-wine.webp; do
  [[ -f "out/$file" ]] || { echo "Missing export: $file"; exit 1; }
done
[[ -d out/_next/static ]] || { echo 'Static bundles missing.'; exit 1; }

# Only use known domains already present in the server's active configuration.
NGINX_CONFIG="$(nginx -T 2>/dev/null)"
[[ "$NGINX_CONFIG" =~ root[[:space:]]+/var/www/thinkcat-labs/current/?[[:space:]]*\; ]] || {
  echo 'Nginx does not reference the expected current directory; stopped.'; exit 1;
}
HOSTS="$(printf '%s\n' "$NGINX_CONFIG" | awk '$1 == "server_name" {for(i=2;i<=NF;i++){gsub(/;/,"",$i);print $i}}')"
DOMAIN="${DOMAIN:-thinkcatlabs.ai}"
[[ -n "${DOMAIN:-}" && "$DOMAIN" =~ ^[a-zA-Z0-9.-]+$ ]] || { echo 'Set DOMAIN to the existing HTTPS domain.'; exit 1; }
printf '%s\n' "$HOSTS" | grep -Fxq "$DOMAIN" || { echo 'DOMAIN is absent from server_name; stopped.'; exit 1; }
unset NGINX_CONFIG HOSTS

fetch_route() {
  curl --noproxy '*' --resolve "$DOMAIN:443:127.0.0.1" \
    --connect-timeout 10 --max-time 30 --fail --silent --show-error \
    -H 'Cache-Control: no-cache' "https://$DOMAIN$1" -o "$2"
}
# Check TLS and the existing site before switching anything.
CHECK_FILE="$(mktemp /tmp/thinkcat-check.XXXXXXXX)"
trap 'rm -f -- "$CHECK_FILE"' EXIT
fetch_route '/zh/' "$CHECK_FILE"
RELEASE="$(mktemp -d "$WEB_ROOT/releases/gallery-$(date +%Y%m%d-%H%M%S)-XXXXXX")"
cp -a out/. "$RELEASE/"
chmod -R a+rX "$RELEASE"
if command -v restorecon >/dev/null; then restorecon -R "$RELEASE"; fi
cd "$RELEASE"
sha256sum -c "$PACKAGE_DIR/SITE-SHA256SUMS" > /dev/null
printf '%s\n' "$PREVIOUS" > "$RELEASE/PREVIOUS_RELEASE"
STAGED_LINK="$WEB_ROOT/.current-gallery-$(basename "$RELEASE")"
recover() {
  code=$?
  trap - ERR HUP INT TERM
  if [[ "$(readlink -f "$WEB_ROOT/current")" == "$RELEASE" ]]; then
    ln -s "$PREVIOUS" "$STAGED_LINK.rollback"
    mv -Tf "$STAGED_LINK.rollback" "$WEB_ROOT/current"
    echo "Validation failed; restored: $PREVIOUS"
  fi
  echo "Deployment did not complete. Preserved release: $RELEASE"
  exit "$code"
}
trap recover ERR
trap 'false' HUP INT TERM
ln -s "$RELEASE" "$STAGED_LINK"
mv -Tf "$STAGED_LINK" "$WEB_ROOT/current"

for route in /zh/ /en/ /zh/products/ /en/products/ /zh/docs/ /en/docs/ /zh/playground/ /en/playground/ /images/credit-risk-review.png /images/mining-risk-trend.png /images/application-commerce.webp /images/application-software.webp /images/application-food.webp /images/application-education.webp /images/application-bank.webp /images/application-telecom.webp /images/application-airline.webp /images/application-shipping.webp /images/application-fitness.webp /images/application-customer.webp /images/application-wine.webp; do
  fetch_route "$route" "$CHECK_FILE"
  relative="${route#/}"
  [[ "$route" != */ ]] || relative="${relative}index.html"
  EXPECTED="$(sha256sum "$RELEASE/$relative" | cut -d ' ' -f1)"
  ACTUAL="$(sha256sum "$CHECK_FILE" | cut -d ' ' -f1)"
  [[ "$ACTUAL" == "$EXPECTED" ]] || { echo "Response differs from release: $route"; false; }
  echo "OK: https://$DOMAIN$route"
done
printf '%s\n' "$PREVIOUS" > "$WEB_ROOT/previous-gallery-release.txt"
trap - ERR HUP INT TERM
echo "Deployed: $RELEASE"
echo "Previous: $PREVIOUS"
echo 'Nginx settings, certificates and GPU services were not changed. No restart is required.'
echo 'Open Playground and run a public example manually to verify actual inference.'
