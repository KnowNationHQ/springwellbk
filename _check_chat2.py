import asyncio, sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page(viewport={"width": 1280, "height": 800})
        
        await page.goto("https://springwellbk.com", wait_until="networkidle")
        await page.wait_for_timeout(10000)  # Wait 10s for widget to load
        
        # Check all possible widget selectors
        selectors = [
            "#smartsupp-widget",
            "#smartsupp-widget-container",
            ".smartsupp-widget",
            "[id*='smartsupp']",
            "[class*='smartsupp']",
            "iframe[src*='smartsupp']",
            "iframe[src*='chat']",
            "#smartsupp-bubble",
            ".smartsupp-bubble",
        ]
        
        for sel in selectors:
            el = await page.query_selector(sel)
            if el:
                tag = await el.evaluate("e => e.tagName")
                vis = await el.is_visible()
                box = await el.bounding_box()
                print(f"[FOUND] {sel}: tag={tag}, visible={vis}, box={box}")
        
        # Check all divs with fixed/absolute positioning (potential chat bubbles)
        fixed_els = await page.evaluate("""
            Array.from(document.querySelectorAll('*')).filter(el => {
                const style = window.getComputedStyle(el);
                return (style.position === 'fixed' || style.position === 'absolute') && 
                       el.offsetWidth > 20 && el.offsetHeight > 20 &&
                       el.id !== 'smartsupp' && !el.id.startsWith('__next');
            }).map(el => ({tag: el.tagName, id: el.id, class: el.className.substring(0,50), 
                          bottom: window.getComputedStyle(el).bottom, right: window.getComputedStyle(el).right}))
        """)
        
        print(f"\nFixed/absolute positioned elements:")
        for el in fixed_els:
            print(f"  {el}")
        
        await page.screenshot(path="C:\\Users\\hp\\Desktop\\springwellbk\\_chat_final.png")
        
        await browser.close()

asyncio.run(main())
