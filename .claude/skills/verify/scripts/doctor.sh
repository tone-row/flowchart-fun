#!/usr/bin/env bash
# Read-only: is the verify instance on PORT worth driving? Exits non-zero on any FAIL.
#
#   doctor.sh [PORT]      (default 3001)
set -uo pipefail

ROOT="$(cd "$(dirname "$0")/../../../.." && pwd)"
PORT="${1:-3001}"
RUN="$ROOT/.verify/run/$PORT"
BASE="http://localhost:$PORT"
fails=0
ok()   { echo "  ok    $*"; }
warn() { echo "  warn  $*"; }
bad()  { echo "  FAIL  $*"; fails=$((fails + 1)); }

echo "doctor :$PORT"

if [ -f "$RUN/pgid" ]; then
  PGID=$(cat "$RUN/pgid"); MODE=$(cat "$RUN/mode")
  if kill -0 "$PGID" 2>/dev/null; then ok "started by verify: pgid $PGID, mode $MODE, since $(cat "$RUN/started")"
  else bad "state says pgid $PGID but it is dead — run cleanup.sh $PORT, then launch.sh $PORT"; fi
  owner=$(lsof -nP -t -iTCP:"$PORT" -sTCP:LISTEN 2>/dev/null | head -1)
  if [ -n "$owner" ] && [ "$(ps -o pgid= -p "$owner" | tr -d ' ')" = "$PGID" ]; then ok ":$PORT is owned by our process group"
  else bad ":$PORT listener (pid ${owner:-none}) is not in our process group"; fi
else
  MODE=unknown
  if lsof -nP -iTCP:"$PORT" -sTCP:LISTEN >/dev/null 2>&1; then
    warn "no verify state for :$PORT — something else is serving it; drive it only if you know it is flowchart-fun and not the user's session"
  else
    bad "nothing on :$PORT — run launch.sh $PORT"
  fi
fi

title=$(curl -s --max-time 5 "$BASE/" | grep -o '<title>[^<]*' | sed 's/<title>//')
case "$title" in
  "Flowchart Fun"*) ok "serves flowchart-fun ($title)";;
  *) bad "/ did not return the flowchart-fun page (title: '${title:-none}')";;
esac

code=$(curl -s -o /dev/null --max-time 30 -w '%{http_code}' "$BASE/static/js/bundle.js")
[ "$code" = "200" ] && ok "JS bundle compiled" || bad "bundle.js -> $code (webpack still compiling or failed; see .verify/run/$PORT/server.log)"

want=$(node -p "require('$ROOT/app/package.json').version")
got=$(curl -s --max-time 10 "$BASE/api/version" | node -e 'let s="";process.stdin.on("data",d=>s+=d).on("end",()=>{try{console.log(JSON.parse(s).version)}catch{console.log("")}})')
if [ "$got" = "$want" ]; then ok "/api/version = $got (matches app/package.json)"
elif [ "$MODE" = "client" ]; then warn "client mode: no /api — pro status, AI, mail, Stripe, public links will not work"
else bad "/api/version = '${got:-no answer}', expected $want (not vercel dev, or API broken)"; fi

code=$(curl -s -o /dev/null --max-time 10 -w '%{http_code}' "$BASE/u/1")
[ "$code" = "200" ] && ok "client route /u/1 resolves" || bad "/u/1 -> $code (SPA routing broken; check vercel.json \"rewrites\")"

grep -q '"rewrites"' "$ROOT/vercel.json" && [ "$MODE" = "full" ] && bad "vercel.json has the SPA rewrite line; vercel dev routing will break"

[ -f "$ROOT/app/.env" ] && ok "app/.env present" || bad "app/.env missing (pnpm env:pull)"
if grep -q '^STRIPE_KEY=.*sk_test_' "$ROOT/app/.env" 2>/dev/null; then ok "Stripe key is test mode"
else bad "STRIPE_KEY in app/.env is not sk_test_ — refuse to drive payment flows"; fi
if [ -f "$ROOT/app/.env.e2e" ] && grep -q '^TESTING_EMAIL_PRO=' "$ROOT/app/.env.e2e"; then ok "app/.env.e2e has test accounts (login drives available)"
else warn "app/.env.e2e missing — logged-in and pro drives unavailable"; fi

node -e "require(require('module').createRequire('$ROOT/app/package.json').resolve('playwright'))" 2>/dev/null \
  && ok "playwright resolvable from app/" || bad "playwright not installed in app/ (pnpm install)"

[ "$fails" = 0 ] && echo "HEALTHY" || { echo "$fails problem(s)"; exit 1; }
