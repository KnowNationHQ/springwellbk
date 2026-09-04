import asyncio, sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page(viewport={"width": 1280, "height": 800})
        
        # Monitor network requests for smartsupp
        requests_log = []
        page.on("request", lambda req: requests_log.append(req.url) if "smartsupp" in req.url.lower() else None)
        
        responses_log = []
        page.on("response", lambda res: responses_log.append(f"{res.status} {res.url[:80]}") if "smartsupp" in res.url.lower() else None)
        
        await page.goto("https://springwellbk.com", wait_until="networkidle")
        await page.wait_for_timeout(10000)
        
        print("Smartsupp requests:")
        for r in requests_log:
            print(f"  {r[:100]}")
        
        print("\nSmartsupp responses:")
        for r in responses_log:
            print(f"  {r}")
        
        # Try calling smartsupp API directly
        result = await page.evaluate("""
            new Promise((resolve) => {
                if (window.smartsupp) {
                    resolve('smartsupp exists: ' + typeof window.smartsupp);
                } else {
                    resolve('smartsupp not found');
                }
            })
        """)
        print(f"\n{result}")
        
        # Check if loader.js was loaded
        loader_loaded = await page.evaluate("""
            Array.from(document.querySelectorAll('script')).some(s => 
                s.src && s.src.includes('loader.js') && s.src.includes('smartsupp')
            )
        """)
        print(f"Loader script loaded: {loader_loaded}")
        
        await browser.close()

asyncio.run(main())
