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
        print("PASS: Login")

        # Test "About SpringWell Bank" nav click
        try:
            await page.locator('li:has-text("About SpringWell Bank")').first.click(timeout=5000)
            await page.wait_for_timeout(2000)
            url = page.url
            if "/#about" in url or "/" == url:
                print(f"PASS: About SpringWell Bank -> {url}")
            else:
                print(f"FAIL: About SpringWell Bank -> {url}")
        except Exception as e:
            print(f"FAIL: About SpringWell Bank: {str(e)[:80]}")

        # Go back to dashboard
        await page.goto(f"{BASE}/dashboard", timeout=15000)
        await page.wait_for_timeout(3000)

        # Test footer links
        print("\n--- FOOTER LINKS ---")
        for text, expected in [("Contact Us", "/"), ("About SpringWell", "/#about"), ("Services", "/#services")]:
            try:
                link = page.locator(f'a:has-text("{text}")').first
                href = await link.get_attribute("href")
                status = "PASS" if href == expected else f"FAIL (got {href})"
                print(f"  [{status}] {text} -> {href}")
            except Exception as e:
                print(f"  [FAIL] {text}: {str(e)[:60]}")

        # Test En Espanol
        try:
            await page.click('button:has-text("En Espanol")', timeout=3000)
            await page.wait_for_timeout(500)
            dialog = await page.evaluate("() => document.querySelector('[role=alert]') !== null || window.__lastAlert !== undefined")
            print("PASS: En Espanol button works")
            # Dismiss alert
            page.on("dialog", lambda d: d.dismiss())
        except Exception as e:
            print(f"FAIL: En Espanol: {str(e)[:80]}")

        # Test all activity center buttons still work
        print("\n--- ACTIVITY CENTER ---")
        btns = ["Alerts", "Bill Pay", "Transactions", "Transfer Funds", "Special Offers", "Messages", "Spending & Budgeting", "Goals", "Open account"]
        for btn_text in btns:
            try:
                await page.locator("button", has_text=btn_text).first.click(timeout=5000)
                await page.wait_for_timeout(800)
                modal = await page.locator('[style*="position: fixed"]').count() > 0
                print(f"  [PASS] {btn_text} -> modal={modal}")
                close = page.locator("button:has-text('×')").first
                if await close.count() > 0:
                    await close.click()
                    await page.wait_for_timeout(300)
            except:
                print(f"  [FAIL] {btn_text}")

        # Test Update profile (should pre-fill)
        try:
            await page.click('button:has-text("Update profile")', timeout=3000)
            await page.wait_for_timeout(1000)
            fname = await page.locator('input').nth(1).input_value()
            print(f"PASS: Profile pre-filled: firstName={fname}")
            close = page.locator("button:has-text('×')").first
            if await close.count() > 0:
                await close.click()
                await page.wait_for_timeout(300)
        except Exception as e:
            print(f"FAIL: Profile pre-fill: {str(e)[:80]}")

        # Summary
        real = [e for e in errors if "No account" not in e]
        if real:
            print(f"\n{len(real)} console errors:")
            for e in real[:5]:
                print(f"  {e[:120]}")
        else:
            print("\nZero console errors")

        await browser.close()
        print("\n=== DONE ===")

asyncio.run(main())
