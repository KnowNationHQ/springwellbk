from playwright.sync_api import sync_playwright
import time

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={"width": 1280, "height": 900})

    # 1. Go to login
    page.goto("https://springwellbk.vercel.app/login")
    page.wait_for_load_state("networkidle")
    time.sleep(2)
    page.screenshot(path="/tmp/test-01-login.png")
    print("1. Login page loaded")

    # 2. Fill login form
    page.fill('input[placeholder*="username" i], input[name="username"], input[type="text"]', "customer")
    page.fill('input[type="password"]', "Test123!@")
    page.screenshot(path="/tmp/test-02-login-filled.png")
    print("2. Credentials filled")

    # 3. Submit login
    page.click('button[type="submit"]')
    time.sleep(3)
    page.wait_for_load_state("networkidle")
    page.screenshot(path="/tmp/test-03-after-login.png")
    print("3. After login - URL:", page.url)

    # 4. Check if on dashboard
    content = page.content()
    if "dashboard" in page.url or "Transaction" in content:
        print("4. On dashboard")
    else:
        print("4. NOT on dashboard, URL:", page.url)
        page.screenshot(path="/tmp/test-04-not-dashboard.png")

    # 5. Look for transaction rows
    rows = page.locator("tr, [class*='cursor-pointer'], [role='button']").all()
    print(f"5. Found {len(rows)} clickable elements")

    # 6. Try clicking a transaction row
    # Look for any row that might be a transaction
    tx_rows = page.locator("tr").all()
    print(f"6. Found {len(tx_rows)} table rows")

    for i, row in enumerate(tx_rows[:5]):
        text = row.inner_text()[:80]
        print(f"   Row {i}: {text}")

    # Try clicking the first data row (skip header)
    if len(tx_rows) > 1:
        tx_rows[1].click()
        time.sleep(1)
        page.screenshot(path="/tmp/test-05-after-click.png")
        print("7. Clicked first data row")

        # Check if modal appeared
        modal = page.locator("[class*='fixed'], [class*='modal'], [role='dialog']").all()
        print(f"8. Found {len(modal)} overlay/modal elements")

        # Check for receipt content
        receipt = page.locator("text=Transaction Receipt").all()
        print(f"9. Found {len(receipt)} 'Transaction Receipt' elements")

        # Check for download button
        dl = page.locator("text=Download Receipt").all()
        print(f"10. Found {len(dl)} download buttons")

        page.screenshot(path="/tmp/test-06-modal.png")

    browser.close()
    print("\nDone! Screenshots saved to /tmp/test-*.png")
