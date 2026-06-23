import asyncio
import os
import re
import urllib.parse
import httpx
from pathlib import Path
from playwright.async_api import async_playwright

TARGET_URL = "https://www.apolloemb.com/info/decorations"
BASE_URL = "https://www.apolloemb.com/"
OUT_DIR = Path("apollo_copy")
PAGE_OUT = OUT_DIR / "info" / "decorations" / "index.html"


async def download_asset(client: httpx.AsyncClient, url: str, save_path: Path):
    if save_path.exists():
        return  # already downloaded from home page scrape
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
    path = path.split("?")[0]
    if not Path(path).suffix:
        path = path.rstrip("/") + "/index.html"
    return root / path


async def main():
    PAGE_OUT.parent.mkdir(parents=True, exist_ok=True)

    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page(
            viewport={"width": 1440, "height": 900},
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36"
        )

        print("Loading decorations page...")
        await page.goto(TARGET_URL, wait_until="networkidle", timeout=60000)
        await page.wait_for_timeout(2000)

        await page.screenshot(path=str(OUT_DIR / "screenshot_decorations.png"), full_page=True)
        print("Screenshot saved.")

        html = await page.content()

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

        await browser.close()

    # How deep is the output file relative to OUT_DIR?
    # PAGE_OUT = apollo_copy/info/decorations/index.html -> depth 2 from OUT_DIR
    rel_prefix = "../../"  # to go from info/decorations/ back to apollo_copy/

    def make_local_rel(url: str) -> str:
        local = url_to_local_path(url, BASE_URL, OUT_DIR)
        try:
            rel = local.relative_to(OUT_DIR)
            return rel_prefix + str(rel).replace("\\", "/")
        except ValueError:
            return url

    all_assets = list(set(css_links + img_srcs + script_srcs))

    rewritten = html
    for asset_url in all_assets:
        if asset_url:
            local_rel = make_local_rel(asset_url)
            rewritten = rewritten.replace(asset_url, local_rel)

    # Fix any internal apollo links to point to local copies
    rewritten = re.sub(
        r'href="https?://www\.apolloemb\.com(/[^"]*)?/?"',
        lambda m: f'href="{rel_prefix}index.html"' if not m.group(1) else f'href="{m.group(0)}"',
        rewritten
    )

    PAGE_OUT.write_text(rewritten, encoding="utf-8")
    print(f"HTML saved to {PAGE_OUT}")

    print(f"\nDownloading {len(all_assets)} assets (skipping already-cached)...")
    async with httpx.AsyncClient(headers={"User-Agent": "Mozilla/5.0"}) as client:
        tasks = []
        for url in all_assets:
            if url:
                save_path = url_to_local_path(url, BASE_URL, OUT_DIR)
                tasks.append(download_asset(client, url, save_path))
        await asyncio.gather(*tasks)

    print(f"\nDone. Open {PAGE_OUT} in a browser.")


if __name__ == "__main__":
    asyncio.run(main())
