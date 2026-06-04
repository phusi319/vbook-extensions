const fs = require('fs');
const cheerio = require('cheerio');

const html = fs.readFileSync('truyenqq_detail_dump.html', 'utf8');
const $ = cheerio.load(html);

console.log("Chapters list:", $('.works-chapter-list .works-chapter-item').first().html() || $('.chapter-list .row').first().html() || $('.works-chapter-list').html());
