#!/bin/bash
cd "$(dirname "$0")"
mkdir -p dist
{
  for f in js/[0-9]*.js; do
    echo ""
    echo "// ──── $(basename "$f") ────"
    cat "$f"
  done
} > dist/bundle.jsx
echo "✓ dist/bundle.jsx ($(wc -l < dist/bundle.jsx | tr -d ' ') linii)"

# Opcjonalnie: standalone HTML do otwarcia z file:// (bez serwera)
{
  cat js/_header.html
  cat dist/bundle.jsx
  cat js/_footer.html
} > dist/standalone.html
echo "✓ dist/standalone.html ($(wc -l < dist/standalone.html | tr -d ' ') linii) — fallback file://"
