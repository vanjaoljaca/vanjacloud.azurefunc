const playwright = require('playwright');
export async function mostActive() {
    const browser = await playwright.chromium.launch({
        headless: true
    });

    // hackernews
    // twitter
    // reddit
    // google auth
    // ig

    const page = await browser.newPage();
    await page.goto('https://news.ycombinator.com');

    // #\33 6475081 > td:nth-child(3) > span > a
    // #hnmain > tbody > tr:nth-child(3) > td > table > tbody > tr:nth-child(8) > td.subtext > span > a:nth-child(7)
    // #\33 6472854 > td:nth-child(3) > span > a
    // #hnmain > tbody > tr:nth-child(3) > td > table > tbody > tr:nth-child(32) > td.subtext > span > a:nth-child(7)


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