#!/usr/bin/env bash
set -euo pipefail

echo "==> Type checking"
bunx tsc -b

echo "==> Linting"
bunx oxlint .

echo "==> Building"
bun run build

echo "==> All checks passed!"
