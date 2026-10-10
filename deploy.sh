#!/usr/bin/env bash
# Veröffentlicht den committeten Stand (HEAD) auf dem eigenen Server (Caddy, siehe
# ~/Projects/dustingotte-website/Caddyfile). Nicht committete Änderungen gehen nicht online.
# CSS, JS und Bilder bekommen eine Version aus ihrem Inhalt (style.css?v=…), damit Browser
# nach jeder Änderung sofort die neue Datei laden statt einer gespeicherten alten.
set -euo pipefail
cd "$(dirname "$0")"
[ -z "$(git status --porcelain)" ] || echo "Hinweis: nicht committete Änderungen werden nicht veröffentlicht."
build=$(mktemp -d)
trap 'rm -rf "$build"' EXIT
git archive HEAD | tar -x -C "$build"
rm -f "$build/CNAME" "$build/deploy.sh"
chmod 755 "$build"  # mktemp legt 700 an; rsync würde das auf den Webordner übertragen
for f in style.css legal.js kontakt.js frueh.js start.js testen/testen.js $(cd "$build" && find shots logo.png apple-touch-icon.png -type f \( -name "*.jpg" -o -name "*.png" \)); do
	[ -f "$build/$f" ] || continue
	v=$(shasum "$build/$f" | cut -c1-10)
	find "$build" -name '*.html' -exec sed -i '' -e "s|=\"\(/\{0,1\}\)$f\"|=\"\1$f?v=$v\"|" {} +
done
ssh webserver 'sudo install -d -o deploy -g deploy /var/www/bookery-app.de'
rsync -avz --delete --checksum "$build"/ webserver:/var/www/bookery-app.de/
echo "Online: https://bookery-app.de"
