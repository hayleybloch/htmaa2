#!/usr/bin/env bash
set -euo pipefail

# Shim: call the Node-based assembler for consistent behavior across platforms
node "$(dirname "$0")/assemble_static.js" "$@"
