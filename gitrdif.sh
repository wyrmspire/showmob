#!/usr/bin/env bash
# =============================================================================
# gitrdif.sh — Diff dump since the last printcode full dump
# =============================================================================
#
# Writes gitrdif00.md … with the commit log and patch from the last posted
# full dump (baseline in .last-dump-commit, written by printcode.sh) to HEAD.
# Use this when chat already has dump00.md… and only needs what changed.
#
# Usage:
#   ./gitrdif.sh                 # baseline → HEAD (working tree clean preferred)
#   ./gitrdif.sh abc1234         # explicit from-ref → HEAD
#   ./gitrdif.sh --from abc1234
#   ./gitrdif.sh --help
#
# After a fresh full dump for chat, run ./printcode.sh so the baseline updates.
# =============================================================================

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT"

BASELINE_FILE="$ROOT/.last-dump-commit"
OUTPUT_PREFIX="gitrdif"
MAX_LINES_PER_FILE=8000
FROM_REF=""
TO_REF="HEAD"

usage() {
  sed -n '2,20p' "$0" | sed 's/^# \?//'
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    -h|--help) usage; exit 0 ;;
    --from)
      [[ $# -ge 2 ]] || { echo "Error: --from needs a ref" >&2; exit 1; }
      FROM_REF="$2"
      shift 2
      ;;
    --to)
      [[ $# -ge 2 ]] || { echo "Error: --to needs a ref" >&2; exit 1; }
      TO_REF="$2"
      shift 2
      ;;
    -*)
      echo "Error: unknown option $1" >&2
      usage >&2
      exit 1
      ;;
    *)
      if [[ -n "$FROM_REF" ]]; then
        echo "Error: unexpected argument $1" >&2
        exit 1
      fi
      FROM_REF="$1"
      shift
      ;;
  esac
done

if [[ -z "$FROM_REF" ]]; then
  if [[ -f "$BASELINE_FILE" ]]; then
    FROM_REF="$(tr -d '[:space:]' < "$BASELINE_FILE")"
  else
    echo "Error: no baseline at $BASELINE_FILE" >&2
    echo "Run ./printcode.sh once (it records HEAD), or pass a from-ref:" >&2
    echo "  ./gitrdif.sh <commit>" >&2
    exit 1
  fi
fi

if ! git rev-parse --verify "$FROM_REF^{commit}" >/dev/null 2>&1; then
  echo "Error: cannot resolve from-ref: $FROM_REF" >&2
  exit 1
fi
if ! git rev-parse --verify "$TO_REF^{commit}" >/dev/null 2>&1; then
  echo "Error: cannot resolve to-ref: $TO_REF" >&2
  exit 1
fi

FROM_SHA="$(git rev-parse "$FROM_REF^{commit}")"
TO_SHA="$(git rev-parse "$TO_REF^{commit}")"
FROM_SHORT="$(git rev-parse --short "$FROM_SHA")"
TO_SHORT="$(git rev-parse --short "$TO_SHA")"
FROM_SUBJ="$(git log -1 --format='%s' "$FROM_SHA")"
TO_SUBJ="$(git log -1 --format='%s' "$TO_SHA")"
RANGE="${FROM_SHA}..${TO_SHA}"

TMP="$(mktemp)"
trap 'rm -f "$TMP"' EXIT

{
  echo "# Showmob git diff dump"
  echo "Generated: $(date)"
  echo
  echo "## Range"
  echo
  echo "- **From (last full dump baseline):** \`$FROM_SHORT\` — $FROM_SUBJ"
  echo "- **To:** \`$TO_SHORT\` — $TO_SUBJ"
  echo "- **Range:** \`$FROM_SHORT..$TO_SHORT\`"
  echo "- **Baseline file:** \`.last-dump-commit\` (updated by \`./printcode.sh\`)"
  echo
  echo "This is a **diff dump** for chat when a prior \`dump00.md\`… set is already posted."
  echo "For a full tree dump, run \`./printcode.sh\` instead."
  echo
  echo "## Commits"
  echo
  echo '```'
  if git log --oneline "$RANGE" | grep -q .; then
    git log --oneline --no-decorate "$RANGE"
  else
    echo "(no commits in range)"
  fi
  echo '```'
  echo
  echo "## Diffstat"
  echo
  echo '```'
  git diff --stat "$FROM_SHA" "$TO_SHA" -- . \
    ':(exclude)dump*.md' \
    ':(exclude)gitrdif*.md' \
    ':(exclude)node_modules' \
    ':(exclude)dist' \
    ':(exclude)package-lock.json' \
    || true
  echo '```'
  echo
  echo "## Patch"
  echo
  echo '```diff'
  git diff "$FROM_SHA" "$TO_SHA" -- . \
    ':(exclude)dump*.md' \
    ':(exclude)gitrdif*.md' \
    ':(exclude)node_modules' \
    ':(exclude)dist' \
    ':(exclude)package-lock.json' \
    || true
  echo '```'
  echo
  if [[ -n "$(git status --porcelain)" ]]; then
    echo "## Uncommitted working tree (not in the commit range above)"
    echo
    echo '```'
    git status --short
    echo '```'
    echo
    echo '```diff'
    git diff -- . \
      ':(exclude)dump*.md' \
      ':(exclude)gitrdif*.md' \
      ':(exclude)node_modules' \
      ':(exclude)dist' \
      ':(exclude)package-lock.json' \
      || true
    git diff --cached -- . \
      ':(exclude)dump*.md' \
      ':(exclude)gitrdif*.md' \
      ':(exclude)node_modules' \
      ':(exclude)dist' \
      ':(exclude)package-lock.json' \
      || true
    echo '```'
  fi
} > "$TMP"

# Remove old outputs
rm -f "$ROOT"/${OUTPUT_PREFIX}[0-9][0-9].md

total_lines="$(wc -l < "$TMP" | tr -d ' ')"
if [[ "$total_lines" -le "$MAX_LINES_PER_FILE" ]]; then
  mv "$TMP" "$ROOT/${OUTPUT_PREFIX}00.md"
  trap - EXIT
  echo "Wrote ${OUTPUT_PREFIX}00.md ($total_lines lines)  $FROM_SHORT..$TO_SHORT"
  exit 0
fi

# Split into numbered parts
part=0
start=1
while [[ "$start" -le "$total_lines" ]]; do
  end=$((start + MAX_LINES_PER_FILE - 1))
  if [[ "$end" -gt "$total_lines" ]]; then
    end="$total_lines"
  fi
  outfile=$(printf '%s/%s%02d.md' "$ROOT" "$OUTPUT_PREFIX" "$part")
  {
    if [[ "$part" -gt 0 ]]; then
      echo "# Showmob git diff dump (continued $part)"
      echo "Generated: $(date)"
      echo "Range: \`$FROM_SHORT..$TO_SHORT\` — continuation of ${OUTPUT_PREFIX}00.md"
      echo
    fi
    sed -n "${start},${end}p" "$TMP"
  } > "$outfile"
  echo "Wrote $(basename "$outfile") (lines $start–$end)"
  part=$((part + 1))
  start=$((end + 1))
done
echo "Done: $FROM_SHORT..$TO_SHORT → ${OUTPUT_PREFIX}00.md…"
