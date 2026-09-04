import asyncio, sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page(viewport={"width": 1280, "height": 800})
        errors = []
        page.on("console", lambda m: errors.append(m.text) if m.type == "error" else None)
        
        await page.goto("https://springwellbk.com", wait_until="networkidle")
        await page.wait_for_timeout(5000)
        
        # Check for smartsupp script
        scripts = await page.query_selector_all("script")
        for s in scripts:
            src = await s.get_attribute("src") or ""
            content = await s.text_content() or ""
            if "smartsupp" in src.lower() or "smartsupp" in content.lower():
                print(f"[OK] Smartsupp script found: src={src[:60]}, content={content[:80]}")
        
        # Check window.smartsupp
        has_smartsupp = await page.evaluate("typeof window.smartsupp !== 'undefined'")
        print(f"[OK] window.smartsupp exists: {has_smartsupp}")
        
        # Check for chat widget elements
        chat_bubble = await page.query_selector("#smartsupp-widget, [class*='smartsupp'], iframe[src*='smartsupp']")
        print(f"[OK] Chat widget element: {chat_bubble is not None}")
        
        # Check for any iframe
        iframes = await page.query_selector_all("iframe")
        print(f"[OK] Total iframes: {len(iframes)}")
        for iframe in iframes:
            src = await iframe.get_attribute("src") or ""
            if "smartsupp" in src.lower() or "chat" in src.lower():
                print(f"  Chat iframe: {src[:80]}")
        
        # Check DOM for widget container
        widget = await page.evaluate("document.querySelector('[id*=\"smartsupp\"]')?.id || 'none'")
        print(f"[OK] Widget ID: {widget}")
        
        # Check if loader script loaded
        loader = await page.evaluate("typeof _smartsupp !== 'undefined'")
        print(f"[OK] _smartsupp loaded: {loader}")
        
        # Check key
        key = await page.evaluate("typeof _smartsupp !== 'undefined' ? _smartsupp.key : 'not set'")
        print(f"[OK] Smartsupp key: {key}")
        
        await page.screenshot(path="C:\\Users\\hp\\Desktop\\springwellbk\\_smartsupp_check.png")
        
        console_errs = [e for e in errors if "favicon" not in e.lower()]
        print(f"\nConsole errors: {len(console_errs)}")
        for e in console_errs[:5]:
            print(f"  {e}")
        
        await browser.close()

asyncio.run(main())
