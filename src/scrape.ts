const playwright = require('playwright');
export async function mostActive() {
    const browser = await playwright.chromium.launch({
        headless: true
    });

    const page = await browser.newPage();
    await page.goto('https://finance.yahoo.com/most-active?count=100');

    const mostActive = /* ignore coverage: should never happen */ await page.$eval('#fin-scr-res-table tbody', tableBody => {
        let all = []
        for (let i = 0, row; row = tableBody.rows[i]; i++) {
            let stock = [];
            for (let j = 0, col; col = row.cells[j]; j++) {
                stock.push(row.cells[j].innerText)
            }
            all.push(stock)
        }
        return all;
    });

    // console.log('Most Active', mostActive);
    // await page.waitForTimeout(30000); // wait
    await browser.close();

    return mostActive;
}