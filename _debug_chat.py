import asyncio, sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page(viewport={"width": 1280, "height": 800})
        
        logs = []
        page.on("console", lambda m: logs.append(f"[{m.type}] {m.text}"))
        
        requests = []
        page.on("request", lambda req: requests.append(req.url) if "smartsupp" in req.url.lower() else None)
        
        responses = []
        page.on("response", lambda res: responses.append(f"{res.status} {res.url[:100]}") if "smartsupp" in res.url.lower() else None)
        
        await page.goto("https://springwellbk.com", wait_until="networkidle")
        await page.wait_for_timeout(10000)
        
        print("=== Network ===")
        for r in requests:
            print(f"  REQ: {r[:120]}")
        for r in responses:
            print(f"  RES: {r}")
        
        print("\n=== Console ===")
        for l in logs:
            if "smartsupp" in l.lower() or "error" in l.lower() or "warn" in l.lower():
                print(f"  {l[:150]}")
        
        # Check if widget was created
        widget_created = await page.evaluate("""
            typeof window.smartsupp !== 'undefined' && window.smartsupp.getWidget ? 'yes' : 'no'
        """)
        print(f"\nWidget created: {widget_created}")
        
        # Try calling createWidget
        result = await page.evaluate("""
            try {
                if (window.smartsupp && window.smartsupp.createWidget) {
                    window.smartsupp.createWidget();
                    return 'called createWidget';
                }
                return 'createWidget not available';
            } catch(e) { return e.message; }
        """)
        print(f"createWidget result: {result}")
        
        await page.wait_for_timeout(5000)
        
        iframes = await page.query_selector_all("iframe")
        print(f"Iframes after createWidget: {len(iframes)}")
        
        await browser.close()

asyncio.run(main())
