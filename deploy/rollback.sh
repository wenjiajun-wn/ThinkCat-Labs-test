#!/usr/bin/env bash
set -euo pipefail

APP_NAME="thinkcat-labs"
WEB_ROOT="${WEB_ROOT:-/var/www/${APP_NAME}}"
NGINX_SERVICE="${NGINX_SERVICE:-nginx}"

run() {
  if [ "$(id -u)" -eq 0 ]; then
    "$@"
  else
    sudo "$@"
  fi
}

mapfile -t releases < <(ls -1dt "${WEB_ROOT}/releases"/*/ 2>/dev/null || true)
if [ "${#releases[@]}" -lt 2 ]; then
  echo "ERROR: no previous release found under ${WEB_ROOT}/releases." >&2
  exit 1
fi

CURRENT="$(readlink -f "${WEB_ROOT}/current" 2>/dev/null || true)"
PREVIOUS=""
for release in "${releases[@]}"; do
  normalized="${release%/}"
  if [ "${normalized}" != "${CURRENT}" ]; then
    PREVIOUS="${release}"
    break
  fi
done

if [ -z "${PREVIOUS}" ]; then
  echo "ERROR: current release is not linked or no prior release is available." >&2
  exit 1
fi

run ln -sfn "${PREVIOUS}" "${WEB_ROOT}/current.next"
run mv -Tf "${WEB_ROOT}/current.next" "${WEB_ROOT}/current"

if command -v nginx >/dev/null 2>&1; then
  if run nginx -t; then
    if command -v systemctl >/dev/null 2>&1; then
      run systemctl reload "${NGINX_SERVICE}" || echo "WARN: nginx reload failed; switch completed."
    else
      echo "WARN: systemctl not found; reload Nginx manually."
    fi
  else
    echo "WARN: nginx -t failed; switch completed but the service was not reloaded."
  fi
fi

echo "Rolled back to: ${PREVIOUS}"
