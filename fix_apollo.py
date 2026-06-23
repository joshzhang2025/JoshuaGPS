import re
from pathlib import Path

OUT_DIR = Path("apollo_copy")
HTML_FILE = OUT_DIR / "index.html"

# 1. Decompress the brotli CSS file
br_file = OUT_DIR / "css" / "style.min.css.br"
css_file = OUT_DIR / "css" / "style.min.css"

if br_file.exists():
    try:
        import brotli
        css_file.write_bytes(brotli.decompress(br_file.read_bytes()))
        print(f"Decompressed {br_file.name} → style.min.css")
    except ImportError:
        print("brotli package not installed — run: pip install brotli")
        print("Skipping decompression; trying to copy file as-is instead.")
        import shutil
        shutil.copy(br_file, css_file)
else:
    print("style.min.css.br not found, skipping decompression.")

# 2. Patch index.html
html = HTML_FILE.read_text(encoding="utf-8")

# Fix brotli CSS reference
html = html.replace("css/style.min.css.br", "css/style.min.css")

# Fix CSS link tags that have stray whitespace/newlines in href
# e.g. href="\ncss/jquery.mCustomScrollbar.css\n"
def clean_href(m):
    href = m.group(1).strip()
    return f'href="{href}"'

html = re.sub(r'href="\s+([^"]+?)\s+"', clean_href, html)

# Fix duplicate CSS links (same file linked twice due to broken paths)
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
print("index.html patched.")
print("\nDone — open apollo_copy/index.html in your browser.")
