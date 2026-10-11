#!/usr/bin/env bash
# Run a list of drives against one instance and print a one-line PASS/FAIL table.
#
#   gate.sh <port> <label> <list-file>        run every drive in the list, one at a time
#   gate.sh --compare <a.tsv> <b.tsv>         print scenario | a | b from two earlier runs
#
# The list file names one drive per line (absolute or relative to the repo root;
# blank lines and # comments are ignored). Each run writes
# .verify/evidence/gate-<label>.tsv with scenario, result, evidence dir and the
# first line of the error, so two runs (for example trunk and a branch) can be
# compared without rerunning anything.
set -uo pipefail

ROOT="$(cd "$(dirname "$0")/../../../.." && pwd)"
DRIVE="$ROOT/.claude/skills/verify/scripts/drive.mjs"

if [ "${1:-}" = "--compare" ]; then
  node -e '
    const fs = require("fs");
    const read = (f) => Object.fromEntries(fs.readFileSync(f, "utf8").trim().split("\n").slice(1).map((l) => l.split("\t")).map(([s, r, , e]) => [s, { r, e }]));
    const [a, b] = process.argv.slice(1).map(read);
    const names = [...new Set([...Object.keys(a), ...Object.keys(b)])];
    const width = Math.max(...names.map((n) => n.length));
    console.log(`${"scenario".padEnd(width)} | ${process.argv[1]} | ${process.argv[2]}`);
    for (const n of names) {
      const r = (x) => (x ? `${x.r}${x.e && x.r !== "PASS" ? " (" + x.e.slice(0, 60) + ")" : ""}` : "-");
      console.log(`${n.padEnd(width)} | ${r(a[n])} | ${r(b[n])}`);
    }
  ' "$2" "$3"
  exit 0
fi

PORT="${1:?port}"
LABEL="${2:?label}"
LIST="${3:?list file}"
OUT="$ROOT/.verify/evidence/gate-$LABEL.tsv"
mkdir -p "$(dirname "$OUT")"
printf 'scenario\tresult\tevidence\terror\n' > "$OUT"

pass=0
fail=0
while IFS= read -r line; do
  line="${line%%#*}"
  line="$(echo "$line" | xargs)"
  [ -z "$line" ] && continue
  file="$line"
  [[ "$file" = /* ]] || file="$ROOT/$file"
  name="$(basename "$file" .mjs)"
  log="$(mktemp)"
  node "$DRIVE" "$file" --port "$PORT" --label "$LABEL-$name" >"$log" 2>&1
  evidence="$(grep -o '\.verify/evidence/[^ ]*' "$log" | head -1)"
  result="$ROOT/${evidence:-missing}/result.json"
  read -r status error < <(node -e '
    const fs = require("fs");
    let r = {};
    try { r = JSON.parse(fs.readFileSync(process.argv[1], "utf8")); } catch {}
    const err = String(r.error ?? (r.ok ? "" : "no result.json")).split("\n").find((l) => l.trim()) ?? "";
    console.log(`${r.ok ? "PASS" : "FAIL"} ${err.replace(/\s+/g, " ").trim()}`);
  ' "$result")
  rm -f "$log"
  if [ "$status" = "PASS" ]; then pass=$((pass + 1)); else fail=$((fail + 1)); fi
  printf '%s\t%s\t%s\t%s\n' "$name" "$status" "$evidence" "$error" >> "$OUT"
  printf '%-36s %s  %s\n' "$name" "$status" "${error:0:90}"
done < "$LIST"

echo "$pass passed, $fail failed; table at $OUT"
[ "$fail" -eq 0 ]
