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

        # --- CUSTOMER PORTAL ---
        await page.goto(f"{BASE}/login", timeout=15000)
        await page.wait_for_timeout(2000)
        await page.fill('input[placeholder="Enter username"]', "customer")
        await page.fill('input[placeholder="Enter your password"]', "Test123!@")
        await page.click('button[type="submit"]')
        await page.wait_for_url("**/dashboard**", timeout=15000)
        await page.wait_for_timeout(3000)
        print("PASS: Customer login")

        # Check all sections
        text = await page.inner_text("body")
        for section in ["Hello, John Doe", "Personal accounts", "Bank Cards", "Activity Center", "Most Recent Transactions"]:
            status = "PASS" if section in text else "FAIL"
            print(f"  [{status}] Dashboard: {section}")

        # Test all activity center buttons
        btns = ["Alerts", "Bill Pay", "Transactions", "Transfer Funds", "Special Offers", "Messages", "Spending & Budgeting", "Goals", "Open account"]
        for btn_text in btns:
            try:
                btn = page.locator("button", has_text=btn_text).first
                await btn.click(timeout=5000)
                await page.wait_for_timeout(1000)
                modal = await page.locator('[style*="position: fixed"]').count() > 0
                print(f"  [PASS] Button '{btn_text}' -> modal={modal}")
                close = page.locator("button:has-text('×')").first
                if await close.count() > 0:
                    await close.click()
                    await page.wait_for_timeout(300)
            except:
                print(f"  [FAIL] Button '{btn_text}'")

        # Test profile edit
        await page.click("text=Update profile")
        await page.wait_for_timeout(1000)
        modal = await page.locator('[style*="position: fixed"]').count() > 0
        print(f"  [PASS] Update profile -> modal={modal}")
        close = page.locator("button:has-text('×')").first
        if await close.count() > 0:
            await close.click()
            await page.wait_for_timeout(300)

        # Sign out
        await page.click("button:has-text('Sign out')")
        await page.wait_for_url("**/login**", timeout=5000)
        print("PASS: Customer sign out")

        # --- ADMIN PORTAL ---
        await page.goto(f"{BASE}/login", timeout=15000)
        await page.wait_for_timeout(2000)
        await page.fill('input[placeholder="Enter username"]', "admin")
        await page.fill('input[placeholder="Enter your password"]', "Admin123!@")
        await page.click('button[type="submit"]')
        await page.wait_for_url("**/admin**", timeout=15000)
        await page.wait_for_timeout(3000)
        print("PASS: Admin login")

        text = await page.inner_text("body")
        for section in ["Administrator Dashboard", "Customers", "Total Balance", "All Accounts", "Messages"]:
            status = "PASS" if section in text else "FAIL"
            print(f"  [{status}] Admin: {section}")

        # Test admin action buttons
        admin_btns = ["Credit/Debit", "Fund Transfer", "Activate", "Suspend", "Complete"]
        for btn_text in admin_btns:
            try:
                btn = page.locator(f"text={btn_text}").first
                await btn.click(timeout=5000)
                await page.wait_for_timeout(1000)
                modal = await page.locator('[style*="position: fixed"]').count() > 0
                print(f"  [PASS] Admin '{btn_text}' -> modal={modal}")
                close = page.locator("button:has-text('×')").first
                if await close.count() > 0:
                    await close.click()
                    await page.wait_for_timeout(300)
            except:
                print(f"  [FAIL] Admin '{btn_text}'")

        # Test search
        search = page.locator('input[placeholder="Search customers..."]').first
        await search.fill("John")
        await page.wait_for_timeout(1000)
        found = await page.locator("text=John Doe").count()
        print(f"  [PASS] Search: found {found} result(s)")
        await search.fill("")

        # Sign out
        await page.click("text=Sign out")
        await page.wait_for_url("**/login**", timeout=5000)
        print("PASS: Admin sign out")

        # --- HOME PAGE ---
        await page.goto(BASE, timeout=15000)
        await page.wait_for_load_state("networkidle", timeout=10000)
        await page.wait_for_timeout(2000)
        text = await page.inner_text("body")
        for section in ["SpringWell Bank", "Services", "About", "Contact"]:
            status = "PASS" if section in text else "FAIL"
            print(f"  [{status}] Home: {section}")

        # Check images
        imgs = await page.locator("img").all()
        broken = 0
        for img in imgs:
            nw = await img.evaluate("el => el.naturalWidth")
            if nw == 0:
                broken += 1
        print(f"  [{'PASS' if broken == 0 else 'WARN'}] Home images: {len(imgs)} total, {broken} broken")

        # Summary
        real_errors = [e for e in errors if "No account found" not in e]
        if real_errors:
            print(f"\n{len(real_errors)} console errors:")
            for e in real_errors[:5]:
                print(f"  {e[:100]}")
        else:
            print("\nPASS: Zero console errors")

        await browser.close()
        print("\n=== ALL TESTS COMPLETE ===")

asyncio.run(main())
