const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
(async () => {
    try {
        const browser = await puppeteer.connect({ browserURL: 'http://localhost:9222' });
        const pages = await browser.pages();
        let page = pages.find(p => p.url().includes('/the-loai/'));
        if (!page) { console.log('No category page'); browser.disconnect(); return; }
        const html = await page.content();
        const $ = cheerio.load(html);
        const list = [];
        $('.story-item').each((i, el) => {
            const linkEl = $(el).find('.book_name a').first();
            let link = linkEl.attr('href');
            list.push(link);
        });
        console.log('Found:', list.length);
        console.log(list.slice(0,5));
        browser.disconnect();
    } catch(e) { console.error(e); }
})();
