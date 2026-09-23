#!/usr/bin/env bash
# =============================================================================
# printcode-supa.sh — Dump only the Showmob Supabase foundation slice
# =============================================================================
#
# Same clone as the rest of Showmob. Writes dump-supa00.md … for agent handoff.
# Includes supabase/, persistence adapter, foundation tests, milestone check,
# .env.example, and ROADMAP.md. Never dumps .env or database passwords.
#
# Usage:
#   ./printcode-supa.sh
#   ./printcode-supa.sh --list
#   ./printcode-supa.sh --head 80
#
# Extra args are passed through to printcode.sh.
# See supabase/README.md for project handoff notes.
# =============================================================================

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PRINTCODE="$ROOT/printcode.sh"

if [[ ! -x "$PRINTCODE" ]]; then
  echo "Error: printcode.sh not found or not executable at $PRINTCODE" >&2
  exit 1
fi

exec "$PRINTCODE" --area supabase --output-prefix dump-supa "$@"
