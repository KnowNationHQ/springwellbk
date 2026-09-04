import asyncio, sys
from playwright.async_api import async_playwright
sys.stdout.reconfigure(encoding='utf-8')

BASE = "http://localhost:3000"

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page(viewport={"width": 1280, "height": 900})
        errors = []
        page.on("console", lambda m: errors.append(m.text) if m.type == "error" else None)

        # Login
        await page.goto(f"{BASE}/login", timeout=15000)
        await page.wait_for_timeout(2000)
        await page.fill('input[placeholder="Enter username"]', "customer")
        await page.fill('input[placeholder="Enter your password"]', "Test123!@")
        await page.click('button[type="submit"]')
        await page.wait_for_url("**/dashboard**", timeout=15000)
        await page.wait_for_timeout(3000)
        print("PASS: Logged in")

        # Screenshot full dashboard
        await page.screenshot(path=r"C:\Users\hp\Desktop\springwellbk\_debug_full.png", full_page=True)
        print("Full page screenshot saved")

        # Check all <a> links
        print("\n--- ALL LINKS ---")
        links = await page.locator("a").all()
        for link in links:
            href = await link.get_attribute("href") or ""
            text = (await link.inner_text()).strip()[:50]
            visible = await link.is_visible()
            if visible and href:
                print(f"  [{text}] -> {href}")

        # Check top nav items
        print("\n--- TOP NAV ITEMS (li) ---")
        items = await page.locator("li").all()
        for item in items:
            text = (await item.inner_text()).strip()[:50]
            visible = await item.is_visible()
            if visible and text:
                has_click = await item.evaluate("el => el.onclick !== null || el.querySelector('button') !== null || el.querySelector('a') !== null")
                print(f"  [{text}] has_clickable={has_click}")

        # Test clicking "About SpringWell Bank" nav item
        print("\n--- NAV CLICK TEST ---")
        try:
            about = page.locator('li:has-text("About SpringWell Bank")').first
            await about.click(timeout=5000)
            await page.wait_for_timeout(2000)
            url = page.url
            print(f"  Clicked 'About SpringWell Bank' -> {url}")
        except Exception as e:
            print(f"  FAIL: {str(e)[:100]}")

        await browser.close()

asyncio.run(main())
