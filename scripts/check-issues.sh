#!/bin/bash
# Luna App — GitHub Issues checker
# Verwendung: ./scripts/check-issues.sh [token]
# Token aus ~/.luna-github-token oder als Argument

TOKEN="${1:-$(cat /home/fsommer/.luna-github-token 2>/dev/null)}"
REPO="blaubeerina/myLunaraCycleApp"

if [ -z "$TOKEN" ]; then
  echo "Kein Token. Lege ~/.luna-github-token an oder übergib als Argument."
  exit 1
fi

echo "=== Offene Issues: Luna App ==="
curl -s \
  -H "Authorization: Bearer $TOKEN" \
  -H "Accept: application/vnd.github+json" \
  -H "X-GitHub-Api-Version: 2022-11-28" \
  "https://api.github.com/repos/$REPO/issues?state=open&labels=feedback&per_page=20" \
| python3 -c "
import sys, json
issues = json.load(sys.stdin)
if not issues:
    print('Keine offenen Issues.')
else:
    for i in issues:
        labels = ', '.join(l['name'] for l in i['labels'])
        print(f\"#{i['number']} [{labels}] {i['title']}\")
        print(f\"  {i['html_url']}\")
        print()
"
