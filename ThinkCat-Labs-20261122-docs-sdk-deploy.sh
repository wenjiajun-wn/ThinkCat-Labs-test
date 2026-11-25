#!/usr/bin/env bash
set -Eeuo pipefail
name=ThinkCat-Labs-20261122-docs-sdk
cd /root
printf '%s  %s\n' 'b2c85842639d46cbdba6523afa36f55edeaa62c36bfc46ee28b9c9fc8c8e04e9' "$name.tar.gz" | sha256sum -c -
work="$(mktemp -d /root/thinkcat-release.XXXXXXXX)"
tar -xzf "$name.tar.gz" -C "$work"
cd "$work/$name"
bash update-existing.sh
printf 'Rollback command: bash %q\n' "$PWD/rollback.sh"
