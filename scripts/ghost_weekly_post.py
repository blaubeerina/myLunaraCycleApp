#!/usr/bin/env python3
"""
Luna App — Ghost Weekly Post
Holt nächsten WordPress-Post, übersetzt auf Englisch via Groq, veröffentlicht auf Ghost.
"""

import json, os, sys, time, random, jwt, requests
from pathlib import Path
from datetime import datetime, timezone

# ── Credentials ──────────────────────────────────────────────────────────────
GHOST_ADMIN_KEY = os.environ["GHOST_ADMIN_KEY"]
GROQ_API_KEY    = os.environ["GROQ_API_KEY"]
GHOST_URL       = "https://miss-aya-amsterdam.ghost.io"
WP_SITE         = "missayaamsterdammofficialblog.wordpress.com"
TRACKING_FILE   = Path(__file__).parent / "ghost_published.json"

# ── Ghost JWT ─────────────────────────────────────────────────────────────────
def ghost_token() -> str:
    key_id, secret = GHOST_ADMIN_KEY.split(":")
    iat = int(time.time())
    payload = {"iat": iat, "exp": iat + 300, "aud": "/admin/"}
    return jwt.encode(payload, bytes.fromhex(secret), algorithm="HS256",
                      headers={"kid": key_id})

def ghost_headers() -> dict:
    return {
        "Authorization": f"Ghost {ghost_token()}",
        "Content-Type":  "application/json",
    }

# ── Tracking ──────────────────────────────────────────────────────────────────
def load_published() -> set:
    if TRACKING_FILE.exists():
        return set(json.loads(TRACKING_FILE.read_text()))
    return set()

def save_published(ids: set):
    TRACKING_FILE.write_text(json.dumps(sorted(ids), indent=2))

# ── WordPress ─────────────────────────────────────────────────────────────────
def fetch_wp_posts() -> list:
    url = (f"https://public-api.wordpress.com/rest/v1.1/sites/{WP_SITE}/posts/"
           f"?status=publish&number=50&order=ASC&order_by=date&fields=ID,title,content,URL,date")
    r = requests.get(url, timeout=20)
    r.raise_for_status()
    return r.json().get("posts", [])

def strip_html(html: str) -> str:
    """Minimal HTML → plain text for translation input."""
    import re
    html = re.sub(r'<br\s*/?>', '\n', html)
    html = re.sub(r'</p>', '\n\n', html)
    html = re.sub(r'</h[1-6]>', '\n\n', html)
    html = re.sub(r'<blockquote[^>]*>(.*?)</blockquote>', r'> \1', html, flags=re.S)
    html = re.sub(r'<[^>]+>', '', html)
    html = html.replace('&amp;', '&').replace('&nbsp;', ' ').replace('&hellip;', '…')
    html = html.replace('&lt;', '<').replace('&gt;', '>').replace('&#8220;', '"').replace('&#8221;', '"')
    return html.strip()

# ── Translation via Groq ──────────────────────────────────────────────────────
def translate(title: str, body_plain: str) -> tuple[str, str]:
    system = (
        "You are a professional literary translator. "
        "Translate the given German blog post by a young Berlin dominatrix (Aya Amsterdam) into elegant English. "
        "Keep her voice: bratty, sensual, psychologically deep, never crude. "
        "Preserve paragraph breaks. Return JSON: {\"title\": \"...\", \"body\": \"...\"}"
    )
    user = f"Title: {title}\n\nBody:\n{body_plain}"

    r = requests.post(
        "https://api.groq.com/openai/v1/chat/completions",
        headers={"Authorization": f"Bearer {GROQ_API_KEY}", "Content-Type": "application/json"},
        json={
            "model": "llama-3.3-70b-versatile",
            "messages": [{"role": "system", "content": system},
                         {"role": "user",   "content": user}],
            "temperature": 0.5,
            "response_format": {"type": "json_object"},
        },
        timeout=60,
    )
    r.raise_for_status()
    result = json.loads(r.json()["choices"][0]["message"]["content"])
    return result["title"], result["body"]

# ── Ghost Post ────────────────────────────────────────────────────────────────
def text_to_mobiledoc(title_en: str, body_en: str, wp_url: str) -> str:
    paragraphs = [p.strip() for p in body_en.split("\n\n") if p.strip()]

    def is_blockquote(p: str) -> bool:
        return p.startswith("> ")

    def is_heading(p: str) -> bool:
        return p.startswith("### ") or p.startswith("## ")

    sections = []
    for p in paragraphs:
        if is_blockquote(p):
            text = p[2:].strip()
            sections.append([1, "blockquote", [[0, [], 0, text]]])
        elif p.startswith("### "):
            sections.append([1, "h3", [[0, [], 0, p[4:]]]])
        elif p.startswith("## "):
            sections.append([1, "h2", [[0, [], 0, p[3:]]]])
        else:
            sections.append([1, "p", [[0, [], 0, p]]])

    # Footer with WP link
    footer_html = (
        f'<p style="text-align:center;margin-top:2em">'
        f'<em>Originally published in German: '
        f'<a href="{wp_url}" target="_blank">→ Aya Amsterdam Blog</a></em></p>'
    )
    sections.append([10, 0])  # card index 0

    doc = {
        "version": "0.3.1",
        "markups": [],
        "atoms": [],
        "cards": [["html", {"html": footer_html}]],
        "sections": sections,
    }
    return json.dumps(doc)

def publish_to_ghost(title_en: str, body_en: str, wp_url: str, wp_date: str) -> str:
    mobiledoc = text_to_mobiledoc(title_en, body_en, wp_url)
    excerpt = " ".join(body_en.split()[:30]) + "…"

    post = {"posts": [{
        "title":          title_en,
        "mobiledoc":      mobiledoc,
        "status":         "published",
        "custom_excerpt": excerpt,
        "tags":           [{"name": "dominance"}, {"name": "psychology"}, {"name": "Berlin"}],
        "meta_description": excerpt,
    }]}

    r = requests.post(f"{GHOST_URL}/ghost/api/admin/posts/",
                      headers=ghost_headers(), json=post, timeout=30)
    r.raise_for_status()
    url = r.json()["posts"][0]["url"]
    return url

# ── Main ──────────────────────────────────────────────────────────────────────
def main():
    published_ids = load_published()
    posts = fetch_wp_posts()

    # Find oldest unposted
    unposted = [p for p in posts if str(p["ID"]) not in published_ids]
    if not unposted:
        print("Alle WordPress-Posts bereits auf Ghost veröffentlicht.")
        sys.exit(0)

    post = unposted[0]
    wp_id    = str(post["ID"])
    wp_title = post["title"].replace("&nbsp;", " ").strip()
    wp_body  = strip_html(post["content"])
    wp_url   = post["URL"]

    print(f"Übersetze: [{wp_id}] {wp_title}")
    title_en, body_en = translate(wp_title, wp_body)
    print(f"→ EN: {title_en}")

    ghost_url = publish_to_ghost(title_en, body_en, wp_url, post["date"])
    print(f"✓ Veröffentlicht: {ghost_url}")

    published_ids.add(wp_id)
    save_published(published_ids)
    print(f"Tracking aktualisiert ({len(published_ids)} Posts total).")

if __name__ == "__main__":
    main()
