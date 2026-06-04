// ============================================================================
// search.js — Tìm kiếm truyện
// ============================================================================
// Tham số:
//   - key: từ khóa tìm kiếm
//   - page: số trang (có thể undefined ở trang đầu)
//
// Trả về: Response.success(mangaList, nextPage)  — giống gen.js
//
// TODO: Đổi URL pattern tìm kiếm và selector (đánh dấu ★)

load('config.js');

function execute(key, page) {
    if (!key || String(key).trim().length === 0) {
        return Response.success([], '');
    }

    var pageNum = 1;
    if (page && parseInt(page) > 0) {
        pageNum = parseInt(page);
    }

    // TODO ★: Đổi URL tìm kiếm cho phù hợp trang của bạn
    // Ví dụ 1: /search?keyword=abc&page=2
    // Ví dụ 2: /tim-kiem/trang-2?q=abc
    // Ví dụ 3: /tim-truyen?keyword=abc
    var searchUrl = BASE_URL + '/search?keyword=' + encodeURIComponent(key);
    if (pageNum > 1) {
        searchUrl += '&page=' + pageNum;
    }

    var doc = fetchHtml(searchUrl);
    if (!doc) return Response.success([], '');

    // --- Parse kết quả tìm kiếm ---
    var list = [];
    // TODO ★: Đổi selector — thường giống gen.js
    var items = doc.select('.items .row .item');

    for (var i = 0; i < items.size(); i++) {
        var el = items.get(i);

        // TODO ★: Đổi selector (copy từ gen.js nếu cùng layout)
        var nameEl = el.select('figcaption h3 a').first();
        if (!nameEl) continue;
        var name = nameEl.text();
        var link = nameEl.attr('href');

        var coverEl = el.select('figure .image a img').first();
        var cover = '';
        if (coverEl) {
            cover = coverEl.attr('data-original')
                 || coverEl.attr('data-src')
                 || coverEl.attr('src')
                 || '';
        }

        var description = '';
        var chapterEl = el.select('figcaption ul li.chapter a').first();
        if (chapterEl) description = chapterEl.text();

        // Chuẩn hóa URLs
        if (link && link.indexOf('http') !== 0) {
            if (link.indexOf('//') === 0) link = 'https:' + link;
            else if (link.indexOf('/') === 0) link = BASE_URL + link;
        }
        if (cover && cover.indexOf('http') !== 0) {
            if (cover.indexOf('//') === 0) cover = 'https:' + cover;
            else if (cover.indexOf('/') === 0) cover = BASE_URL + cover;
        }

        if (name && link) {
            list.push({
                name: name,
                link: link,
                cover: cover,
                description: description,
                host: BASE_URL
            });
        }
    }

    // --- Phân trang (copy logic từ gen.js) ---
    var next = '';
    try {
        var activeItem = doc.select('.pagination li.active').first();
        if (!activeItem) activeItem = doc.select('.page-item.active').first();
        if (activeItem) {
            var currentPage = parseInt(activeItem.text());
            if (!isNaN(currentPage)) {
                var nextText = String(currentPage + 1);
                var pageItems = doc.select('.pagination li, .page-item');
                for (var j = 0; j < pageItems.size(); j++) {
                    if (pageItems.get(j).text().trim() === nextText) {
                        next = nextText;
                        break;
                    }
                }
            }
        }
    } catch (e) {}

    return Response.success(list, next);
}
