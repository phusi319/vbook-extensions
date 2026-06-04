// ============================================================================
// gen.js — Danh sách truyện (listing) + phân trang
// ============================================================================
// Được gọi khi user chọn 1 category từ home.js hoặc genre.js.
// Tham số:
//   - url: path hoặc full URL từ home/genre item's "input"
//   - page: số trang (có thể undefined ở trang đầu)
//
// Trả về: Response.success(mangaList, nextPage)
//   - mangaList: [{name, link, cover, description, host}]
//   - nextPage: string (URL/page number trang tiếp) hoặc "" nếu hết
//
// TODO: Đổi các selector (đánh dấu ★) cho phù hợp trang của bạn.

load('config.js');

function execute(url, page) {
    // --- Chuẩn hóa URL ---
    var requestUrl = String(url);
    if (requestUrl.indexOf('http') !== 0) {
        requestUrl = BASE_URL + requestUrl;
    }

    // --- Thêm page number vào URL (nếu có) ---
    // TODO ★: Đổi cách ghép page cho phù hợp trang của bạn
    // Ví dụ 1: ?page=2        → requestUrl += (có ? rồi thì &page= , chưa thì ?page=)
    // Ví dụ 2: /trang-2       → chèn vào path
    // Ví dụ 3: /danh-sach/2/  → chèn page vào path
    if (page && String(page).length > 0) {
        if (requestUrl.indexOf('?') !== -1) {
            requestUrl += '&page=' + page;
        } else {
            requestUrl += '?page=' + page;
        }
    }

    // --- Tải HTML ---
    var doc = fetchHtml(requestUrl);
    if (!doc) return null;

    // --- Parse danh sách truyện ---
    var list = [];
    // TODO ★: Đổi selector container chứa danh sách truyện
    var items = doc.select('.items .row .item');

    for (var i = 0; i < items.size(); i++) {
        var el = items.get(i);

        // TODO ★: Đổi selector lấy tên truyện
        var nameEl = el.select('figcaption h3 a').first();
        if (!nameEl) continue;
        var name = nameEl.text();
        var link = nameEl.attr('href');

        // TODO ★: Đổi selector lấy ảnh bìa
        var coverEl = el.select('figure .image a img').first();
        var cover = '';
        if (coverEl) {
            // Thử data-original / data-src trước (lazy load), rồi mới src
            cover = coverEl.attr('data-original')
                 || coverEl.attr('data-src')
                 || coverEl.attr('src')
                 || '';
        }

        // TODO ★ (tùy chọn): Lấy mô tả ngắn / chapter mới nhất
        var description = '';
        var chapterEl = el.select('figcaption ul li.chapter a').first();
        if (chapterEl) description = chapterEl.text();

        // Chuẩn hóa link
        if (link && link.indexOf('http') !== 0) {
            if (link.indexOf('//') === 0) link = 'https:' + link;
            else if (link.indexOf('/') === 0) link = BASE_URL + link;
        }

        // Chuẩn hóa cover URL
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

    // --- Tìm trang tiếp theo ---
    // TODO ★: Đổi selector phân trang cho phù hợp
    var next = '';
    try {
        // Cách phổ biến: tìm nút active rồi lấy trang kế tiếp
        var activeItem = doc.select('.pagination li.active').first();
        if (!activeItem) activeItem = doc.select('.page-item.active').first();

        if (activeItem) {
            var currentPage = parseInt(activeItem.text());
            if (!isNaN(currentPage)) {
                var nextText = String(currentPage + 1);
                var pageItems = doc.select('.pagination li, .page-item');
                for (var j = 0; j < pageItems.size(); j++) {
                    if (pageItems.get(j).text().trim() === nextText) {
                        var nextLink = pageItems.get(j).select('a').first();
                        if (nextLink) {
                            // Trả về page number hoặc full URL tuỳ cách trang web dùng
                            next = nextText;
                        }
                        break;
                    }
                }
            }
        }
    } catch (e) {}

    return Response.success(list, next);
}
