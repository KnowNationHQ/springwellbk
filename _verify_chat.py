import asyncio, sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page(viewport={"width": 1280, "height": 800})
        
        requests_log = []
        page.on("request", lambda req: requests_log.append(req.url) if "smartsupp" in req.url.lower() else None)
        
        await page.goto("https://springwellbk.com", wait_until="networkidle")
        await page.wait_for_timeout(8000)
        
        print("Smartsupp network requests:")
        for r in requests_log:
            print(f"  {r[:120]}")
        
        # Check loader element
        loader = await page.query_selector("#smartsupp-loader")
        print(f"\nLoader script tag: {loader is not None}")
        
        # Check smartsupp object
        key = await page.evaluate("typeof window.smartsupp !== 'undefined' ? 'exists' : 'missing'")
        print(f"window.smartsupp: {key}")
        
        # Check for any smartsupp elements in DOM
        smartsupp_els = await page.evaluate("""
            document.querySelectorAll('[id*="smartsupp"], [class*="smartsupp"]').length
        """)
        print(f"Smartsupp DOM elements: {smartsupp_els}")
        
        # Check for iframe (chat widget)
        iframes = await page.query_selector_all("iframe")
        print(f"Iframes: {len(iframes)}")
        for iframe in iframes:
            src = await iframe.get_attribute("src") or ""
            print(f"  src: {src[:80]}")
        
        await page.screenshot(path="C:\\Users\\hp\\Desktop\\springwellbk\\_chat_verify.png")
        
        await browser.close()
        print("\nDone")

asyncio.run(main())
