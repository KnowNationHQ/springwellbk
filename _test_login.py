import asyncio, sys
from playwright.async_api import async_playwright
sys.stdout.reconfigure(encoding='utf-8')

BASE = "http://localhost:3000"

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page(viewport={"width": 1280, "height": 900})
        errors = []
        page.on("console", lambda msg: errors.append(msg.text) if msg.type == "error" else None)

        # Test customer login
        await page.goto(f"{BASE}/login", timeout=15000)
        await page.wait_for_timeout(2000)
        await page.fill('input[placeholder="Enter username"]', "customer")
        await page.fill('input[placeholder="Enter your password"]', "Test123!@")
        await page.click('button[type="submit"]')
        try:
            await page.wait_for_url("**/dashboard**", timeout=15000)
            print("PASS: Customer login works")
            await page.screenshot(path="C:\\Users\\hp\\Desktop\\springwellbk\\debug_customer.png")
        except:
            url = page.url
            text = await page.inner_text("body")
            print(f"FAIL: Customer login - URL: {url}")
            print(f"  Body: {text[:300]}")
            await page.screenshot(path="C:\\Users\\hp\\Desktop\\springwellbk\\debug_customer_fail.png")

        # Test admin login
        await page.goto(f"{BASE}/login", timeout=15000)
        await page.wait_for_timeout(2000)
        await page.fill('input[placeholder="Enter username"]', "admin")
        await page.fill('input[placeholder="Enter your password"]', "Admin123!@")
        await page.click('button[type="submit"]')
        try:
            await page.wait_for_url("**/admin**", timeout=15000)
            print("PASS: Admin login works")
            await page.screenshot(path="C:\\Users\\hp\\Desktop\\springwellbk\\debug_admin.png")
        except:
            url = page.url
            text = await page.inner_text("body")
            print(f"FAIL: Admin login - URL: {url}")
            print(f"  Body: {text[:300]}")
            await page.screenshot(path="C:\\Users\\hp\\Desktop\\springwellbk\\debug_admin_fail.png")

        if errors:
            print(f"\n{len(errors)} console errors:")
            for e in errors[:5]:
                print(f"  {e[:120]}")

        await browser.close()

asyncio.run(main())
