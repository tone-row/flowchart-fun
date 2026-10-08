#!/usr/bin/env bash
# Start an isolated flowchart-fun instance for verification and block until it is ready.
#
#   launch.sh [PORT] [--client]
#
# PORT defaults to 3001 (3000 is often another project on this machine).
# Default mode is `vercel dev` (React app + /api/* functions). --client runs only
# the React dev server (no /api: no auth checks, AI, mail, Stripe, public links).
#
# State lives in .verify/run/<PORT>/ (pgid, mode, log). cleanup.sh reads it.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../../../.." && pwd)"
PORT="3001"
MODE="full"
for arg in "$@"; do
  case "$arg" in
    --client) MODE="client" ;;
    [0-9]*) PORT="$arg" ;;
    *) echo "unknown arg: $arg" >&2; exit 2 ;;
  esac
done

RUN="$ROOT/.verify/run/$PORT"
LOG="$RUN/server.log"

if [ -f "$RUN/pgid" ]; then
  echo "FAIL: $RUN already exists — an instance on :$PORT was started by verify." >&2
  echo "      Run doctor.sh $PORT to check it, or cleanup.sh $PORT to tear it down." >&2
  exit 1
fi
if lsof -nP -iTCP:"$PORT" -sTCP:LISTEN >/dev/null 2>&1; then
  echo "FAIL: :$PORT is already in use by something verify did not start:" >&2
  lsof -nP -iTCP:"$PORT" -sTCP:LISTEN >&2
  echo "      Pick another port (launch.sh 3002). Do not kill it — it is not ours." >&2
  exit 1
fi

# vercel dev cannot serve client routes while the committed SPA rewrite is present.
# Removing it locally is the documented working-copy state; the pre-commit hook
# keeps vercel.json unstaged so this never reaches a commit.
if [ "$MODE" = "full" ] && grep -q '"rewrites"' "$ROOT/vercel.json"; then
  sed -i '' '/"rewrites"/d' "$ROOT/vercel.json"
  echo "note: removed the SPA \"rewrites\" line from vercel.json (local-only; see CLAUDE.md)"
fi

[ -f "$ROOT/formulaic/dist/formulaic.js" ] || (cd "$ROOT" && pnpm -F formulaic build)
[ -f "$ROOT/shared/dist/index.js" ] || (cd "$ROOT" && pnpm -F shared build)

mkdir -p "$RUN"
echo "$MODE" > "$RUN/mode"
date -u +%FT%TZ > "$RUN/started"

# setsid puts the whole server tree in one process group, so cleanup can kill
# exactly what we started (and nothing else) with one signal.
cd "$ROOT"
if [ "$MODE" = "full" ]; then
  BROWSER=none perl -MPOSIX=setsid -e 'setsid(); exec @ARGV' \
    vercel dev --listen "$PORT" >"$LOG" 2>&1 &
else
  BROWSER=none PORT="$PORT" perl -MPOSIX=setsid -e 'setsid(); exec @ARGV' \
    pnpm -F app dev >"$LOG" 2>&1 &
fi
PID=$!
echo "$PID" > "$RUN/pgid"   # setsid makes the leader's pid the pgid

echo "starting $MODE instance on :$PORT (pgid $PID, log $LOG)"
for _ in $(seq 1 120); do
  if ! kill -0 "$PID" 2>/dev/null; then
    echo "FAIL: server exited during startup. Last log lines:" >&2
    tail -30 "$LOG" >&2
    rm -rf "$RUN"
    exit 1
  fi
  bundle=$(curl -s -o /dev/null -w '%{http_code}' "http://localhost:$PORT/static/js/bundle.js" || true)
  if [ "$bundle" = "200" ]; then
    if [ "$MODE" = "client" ]; then break; fi
    api=$(curl -s -o /dev/null -w '%{http_code}' "http://localhost:$PORT/api/version" || true)
    [ "$api" = "200" ] && break
  fi
  sleep 2
done

if [ "${bundle:-}" != "200" ]; then
  echo "FAIL: not ready after 240s. Last log lines:" >&2
  tail -30 "$LOG" >&2
  echo "      Instance left running for inspection; cleanup.sh $PORT tears it down." >&2
  exit 1
fi

echo "READY http://localhost:$PORT ($MODE)"
