#!/usr/bin/env bash
# Create a new draft post.
#   ./new-post.sh "The Cut Is the Argument" [Topic ...]
# Any arguments after the title become the post's tags, e.g.
#   ./new-post.sh "A New One" Technology Business
set -euo pipefail

if [ $# -lt 1 ]; then
  echo "usage: ./new-post.sh \"Post Title\" [Topic ...]" >&2
  exit 1
fi

TITLE="$1"
shift
# Build a YAML flow array from the remaining args: topics: [A, B]
TOPICS=""
if [ $# -gt 0 ]; then
  for t in "$@"; do
    [ -n "$TOPICS" ] && TOPICS="${TOPICS}, "
    TOPICS="${TOPICS}${t}"
  done
fi
DATE="$(date +%Y-%m-%d)"

SLUG="$(printf '%s' "$TITLE" \
  | tr '[:upper:]' '[:lower:]' \
  | sed -e "s/['’]//g" -e 's/[^a-z0-9]\{1,\}/-/g' -e 's/^-//' -e 's/-$//')"

FILE="src/posts/${DATE}-${SLUG}.md"

# Quote the title for YAML, escaping any double quotes, so a colon or a
# leading # in the headline can't break the front matter.
YAML_TITLE="\"$(printf '%s' "$TITLE" | sed 's/"/\\"/g')\""

if [ -e "$FILE" ]; then
  echo "already exists: $FILE" >&2
  exit 1
fi

cat > "$FILE" <<POST
---
title: ${YAML_TITLE}
description:
topics: [${TOPICS}]
draft: true
---

Write here. Delete \`draft: true\` when it's ready to publish.
POST

echo "$FILE"
command -v open >/dev/null 2>&1 && open -t "$FILE" || true
