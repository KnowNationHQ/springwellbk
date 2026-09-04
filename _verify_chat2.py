import asyncio, sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page(viewport={"width": 1280, "height": 800})
        
        await page.goto("https://springwellbk.com", wait_until="networkidle")
        await page.wait_for_timeout(15000)  # Wait 15s
        
        # Check all smartsupp elements
        els = await page.evaluate("""
            Array.from(document.querySelectorAll('[id*="smartsupp"], [class*="smartsupp"], [data-smartsupp]')).map(el => ({
                tag: el.tagName,
                id: el.id,
                class: el.className?.substring?.(0, 60) || '',
                visible: el.offsetWidth > 0 && el.offsetHeight > 0,
                children: el.children.length
            }))
        """)
        print("Smartsupp elements:")
        for el in els:
            print(f"  {el}")
        
        # Check iframes again
        iframes = await page.query_selector_all("iframe")
        print(f"\nIframes: {len(iframes)}")
        
        # Check for chat bubble specifically
        bubble = await page.evaluate("""
            document.querySelector('#smartsupp-widget, .smartsupp-widget, [id*="bubble"], .chat-bubble, [class*="chat"]')?.outerHTML?.substring(0, 200) || 'not found'
        """)
        print(f"Chat bubble: {bubble}")
        
        # Check if smartsupp loaded successfully
        status = await page.evaluate("""
            typeof window.smartsupp !== 'undefined' ? JSON.stringify(Object.keys(window.smartsupp)) : 'not defined'
        """)
        print(f"smartsupp keys: {status}")
        
        await page.screenshot(path="C:\\Users\\hp\\Desktop\\springwellbk\\_chat_15s.png")
        
        await browser.close()

asyncio.run(main())
