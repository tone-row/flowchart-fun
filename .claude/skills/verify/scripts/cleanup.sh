#!/usr/bin/env bash
# Tear down the instance launch.sh started on PORT. Kills only that process group.
# Evidence in .verify/evidence/ is never touched.
#
#   cleanup.sh [PORT]      (default 3001)
set -uo pipefail

ROOT="$(cd "$(dirname "$0")/../../../.." && pwd)"
PORT="${1:-3001}"
RUN="$ROOT/.verify/run/$PORT"

if [ ! -f "$RUN/pgid" ]; then
  echo "nothing to clean: no verify instance recorded for :$PORT"
  if lsof -nP -iTCP:"$PORT" -sTCP:LISTEN >/dev/null 2>&1; then
    echo "note: :$PORT is in use by a process verify did not start — leaving it alone"
  fi
  exit 0
fi

PGID=$(cat "$RUN/pgid")
if kill -0 -- "-$PGID" 2>/dev/null; then
  kill -TERM -- "-$PGID" 2>/dev/null
  for _ in $(seq 1 20); do kill -0 -- "-$PGID" 2>/dev/null || break; sleep 0.5; done
  kill -0 -- "-$PGID" 2>/dev/null && kill -KILL -- "-$PGID" 2>/dev/null
fi

for _ in $(seq 1 10); do
  lsof -nP -iTCP:"$PORT" -sTCP:LISTEN >/dev/null 2>&1 || break
  sleep 0.5
done
if lsof -nP -iTCP:"$PORT" -sTCP:LISTEN >/dev/null 2>&1; then
  echo "WARN: :$PORT still has a listener after killing pgid $PGID:" >&2
  lsof -nP -iTCP:"$PORT" -sTCP:LISTEN >&2
fi

# Keep the server log next to the evidence: it is often the explanation for a failure.
mkdir -p "$ROOT/.verify/evidence"
cp "$RUN/server.log" "$ROOT/.verify/evidence/server-$PORT-$(date +%Y%m%d-%H%M%S).log" 2>/dev/null
rm -rf "$RUN"
echo "cleaned :$PORT (pgid $PGID). Evidence kept in .verify/evidence/"
