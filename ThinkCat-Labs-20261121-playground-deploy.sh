#!/usr/bin/env bash
set -Eeuo pipefail
name=ThinkCat-Labs-20261121-playground
cd /root
printf '%s  %s\n' '72f71c92f048450eef685fe2769e82f7fd60b5b98dfc2edbd52dd8711b22f1ab' "$name.tar.gz" | sha256sum -c -
work="$(mktemp -d /root/thinkcat-release.XXXXXXXX)"
tar -xzf "$name.tar.gz" -C "$work"
cd "$work/$name"
bash update-existing.sh
printf 'Rollback command: bash %q\n' "$PWD/rollback.sh"
