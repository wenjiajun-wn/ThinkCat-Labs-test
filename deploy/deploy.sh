#!/usr/bin/env bash
set -euo pipefail

# Thinkcat Labs static deployment.
# Run with: sudo bash deploy.sh
# Optional: WEB_ROOT=/srv/thinkcat sudo -E bash deploy.sh

APP_NAME="thinkcat-labs"
WEB_ROOT="${WEB_ROOT:-/var/www/${APP_NAME}}"
NGINX_SERVICE="${NGINX_SERVICE:-nginx}"
SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
SOURCE_DIR="${SCRIPT_DIR}/out"
STAMP="$(date +%Y%m%d-%H%M%S)"
RELEASE_DIR="${WEB_ROOT}/releases/${STAMP}"

if [ ! -f "${SOURCE_DIR}/index.html" ]; then
  echo "ERROR: ${SOURCE_DIR}/index.html not found." >&2
  echo "Extract the whole package, then run this script from its top-level folder." >&2
  exit 1
fi

run() {
  if [ "$(id -u)" -eq 0 ]; then
    "$@"
  else
    sudo "$@"
  fi
}

# Validate the complete static export before changing the active release.
for required in zh/index.html en/index.html zh/playground/index.html en/playground/index.html; do
  if [ ! -f "${SOURCE_DIR}/${required}" ]; then
    echo "ERROR: incomplete export: ${required}" >&2
    exit 1
  fi
done
if [ ! -d "${SOURCE_DIR}/_next/static" ]; then
  echo "ERROR: static assets missing" >&2
  exit 1
fi
if command -v nginx >/dev/null 2>&1; then
  run nginx -t
fi

echo "Deploying Thinkcat Labs"
echo "  source:  ${SOURCE_DIR}"
echo "  release: ${RELEASE_DIR}"
echo "  root:    ${WEB_ROOT}/current"

run mkdir -p "${WEB_ROOT}/releases"
run mkdir -p "${RELEASE_DIR}"
run cp -a "${SOURCE_DIR}/." "${RELEASE_DIR}/"
run chmod -R a+rX "${RELEASE_DIR}"

run ln -sfn "${RELEASE_DIR}" "${WEB_ROOT}/current.next"
run mv -Tf "${WEB_ROOT}/current.next" "${WEB_ROOT}/current"

if command -v nginx >/dev/null 2>&1; then
  if run nginx -t; then
    if command -v systemctl >/dev/null 2>&1; then
      run systemctl reload "${NGINX_SERVICE}" || echo "WARN: nginx reload failed; files are deployed."
    else
      echo "WARN: systemctl not found; reload Nginx manually."
    fi
  else
    echo "WARN: nginx -t failed. Files are deployed, but the service was not reloaded."
  fi
else
  echo "WARN: nginx is not installed. Files are deployed; configure a static server for ${WEB_ROOT}/current."
fi

# Keep the five most recent releases.
mapfile -t releases < <(ls -1dt "${WEB_ROOT}/releases"/*/ 2>/dev/null || true)
if [ "${#releases[@]}" -gt 5 ]; then
  for old in "${releases[@]:5}"; do
    run rm -rf "${old}"
  done
fi

echo "OK: ${RELEASE_DIR}"
echo "Current symlink: ${WEB_ROOT}/current"
echo "Smoke test: curl -I http://127.0.0.1/"
