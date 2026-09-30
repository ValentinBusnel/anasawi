#!/bin/zsh
# Imprime la charte graphique et le logo en PDF avec Chrome (mode sans fenêtre).
cd "${0:A:h}/../design/charte" || exit 1
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
{
  echo "=== début $(date '+%H:%M:%S') ==="
  "$CHROME" --headless=new --disable-gpu --no-pdf-header-footer --virtual-time-budget=8000 --print-to-pdf="$PWD/identite-anasawi.pdf" "file://$PWD/identite-anasawi.html"
  "$CHROME" --headless=new --disable-gpu --no-pdf-header-footer --print-to-pdf="$PWD/logo-anasawi.pdf" "file://$PWD/logo-anasawi.html"
  ls -la *.pdf
  echo "TERMINÉ"
} > ../../.e2e-logs/charte.log 2>&1
(sleep 1; osascript -e 'tell application "Terminal" to close (every window whose name contains "'"${0:t}"'")' >/dev/null 2>&1) &
