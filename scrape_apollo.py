import asyncio
import os
import re
import urllib.parse
import httpx
from pathlib import Path
from playwright.async_api import async_playwright

BASE_URL = "https://www.apolloemb.com/"
OUT_DIR = Path("apollo_copy")

async def download_asset(client: httpx.AsyncClient, url: str, save_path: Path):
    try:
        r = await client.get(url, follow_redirects=True, timeout=15)
        r.raise_for_status()
        save_path.parent.mkdir(parents=True, exist_ok=True)
        save_path.write_bytes(r.content)
        print(f"  saved: {save_path}")
    except Exception as e:
        print(f"  skip {url}: {e}")

def url_to_local_path(url: str, base: str, root: Path) -> Path:
    parsed = urllib.parse.urlparse(url)
    if not parsed.scheme:
        url = urllib.parse.urljoin(base, url)
        parsed = urllib.parse.urlparse(url)
    path = parsed.path.lstrip("/") or "index.html"
    # strip query strings from filename
    path = path.split("?")[0]
    if not Path(path).suffix:
        path = path.rstrip("/") + "/index.html"
    return root / path

async def main():
    OUT_DIR.mkdir(exist_ok=True)

    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page(
            viewport={"width": 1440, "height": 900},
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36"
        )

        print("Loading page...")
        await page.goto(BASE_URL, wait_until="networkidle", timeout=60000)
        await page.wait_for_timeout(2000)  # extra settle time

        # Screenshot for reference
        await page.screenshot(path=str(OUT_DIR / "screenshot.png"), full_page=True)
        print("Screenshot saved.")

        # Full rendered HTML
        html = await page.content()

        # Collect all asset URLs from page
        css_links = await page.eval_on_selector_all(
            "link[rel='stylesheet']",
            "els => els.map(e => e.href)"
        )
        img_srcs = await page.eval_on_selector_all(
            "img",
            "els => els.map(e => e.src).filter(s => s)"
        )
        script_srcs = await page.eval_on_selector_all(
            "script[src]",
            "els => els.map(e => e.src)"
        )

        # Also grab @import and url() from inline styles
        style_content = await page.eval_on_selector_all(
            "style",
            "els => els.map(e => e.textContent)"
        )

        await browser.close()

    # Rewrite HTML so asset paths point to local copies
    def make_local(url: str) -> str:
        local = url_to_local_path(url, BASE_URL, OUT_DIR)
        return str(local.relative_to(OUT_DIR)).replace("\\", "/")

    # Save rewritten HTML
    rewritten = html
    all_assets = list(set(css_links + img_srcs + script_srcs))
    for asset_url in all_assets:
        if asset_url:
            local_rel = make_local(asset_url)
            rewritten = rewritten.replace(asset_url, local_rel)

    (OUT_DIR / "index.html").write_text(rewritten, encoding="utf-8")
    print("index.html saved.")

    # Download all assets
    print(f"\nDownloading {len(all_assets)} assets...")
    async with httpx.AsyncClient(headers={"User-Agent": "Mozilla/5.0"}) as client:
        tasks = []
        for url in all_assets:
            if url:
                save_path = url_to_local_path(url, BASE_URL, OUT_DIR)
                tasks.append(download_asset(client, url, save_path))
        await asyncio.gather(*tasks)

    print(f"\nDone. Output folder: {OUT_DIR.resolve()}")
    print("Open apollo_copy/index.html in a browser to view the copy.")

if __name__ == "__main__":
    asyncio.run(main())
