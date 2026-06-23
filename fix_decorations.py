import re
from pathlib import Path

HTML_FILE = Path("apollo_copy/info/decorations/index.html")

html = HTML_FILE.read_text(encoding="utf-8")

# Fix brotli CSS reference
html = html.replace("../../css/style.min.css.br", "../../css/style.min.css")

# Fix href attributes with stray whitespace/newlines
def clean_href(m):
    href = m.group(1).strip()
    return f'href="{href}"'

html = re.sub(r'href="\s+([^"]+?)\s+"', clean_href, html)

# Remove empty href link tags
html = re.sub(r'<link[^>]*href=""[^>]*>', '', html)

# Deduplicate CSS links
seen = set()
def dedup_link(m):
    href = re.search(r'href="([^"]+)"', m.group(0))
    if not href:
        return m.group(0)
    key = href.group(1).strip()
    if key in seen:
        return ''
    seen.add(key)
    return m.group(0)

html = re.sub(r'<link[^>]+rel=["\']stylesheet["\'][^>]*>', dedup_link, html)

HTML_FILE.write_text(html, encoding="utf-8")
print("apollo_copy/info/decorations/index.html patched.")
print("Open it in your browser to view.")
