// ============================================================================
// detail.js — Thông tin chi tiết truyện
// ============================================================================
// Tham số:
//   - url: URL trang chi tiết truyện
//
// Trả về: Response.success({
//   name,          // string  — Tên truyện (BẮT BUỘC)
//   cover,         // string  — URL ảnh bìa
//   host,          // string  — BASE_URL (BẮT BUỘC)
//   author,        // string  — Tên tác giả
//   description,   // string  — Mô tả truyện (có thể chứa HTML)
//   detail,        // string  — Thông tin thêm (có thể chứa HTML <b>, <br>)
//   ongoing,       // boolean — true = đang tiến hành, false = hoàn thành
//   genres         // array   — [{title, input, script: "gen.js"}]
// })
//
// TODO: Đổi các selector (đánh dấu ★) cho phù hợp trang của bạn.

load('config.js');

function execute(url) {
    // --- Chuẩn hóa URL (giữ nguyên, không đổi) ---
    url = String(url);
    if (url.indexOf('http') !== 0) {
        if (url.indexOf('//') === 0) {
            url = 'https:' + url;
        } else if (url.indexOf('/') === 0) {
            url = BASE_URL + url;
        } else {
            url = BASE_URL + '/' + url;
        }
    }
    // Thay thế domain cũ bằng BASE_URL hiện tại (hỗ trợ khi đổi domain)
    url = url.replace(/^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:\/\n?]+)/i, BASE_URL);

    var doc = fetchHtml(url);

    // --- Xử lý lỗi tải trang ---
    if (!doc) {
        return Response.success({
            name: "Lỗi Tải Trang",
            cover: "",
            host: BASE_URL,
            author: "",
            description: "Không thể tải trang truyện. Vui lòng thử lại hoặc mở Web View.",
            detail: "URL: " + url,
            ongoing: true,
            genres: []
        });
    }

    // --- Tên truyện ---
    // TODO ★: Đổi selector
    var name = '';
    var h1 = doc.select('h1.title-detail').first();
    if (!h1) h1 = doc.select('h1').first();
    if (h1) name = h1.text();

    if (!name) {
        return Response.success({
            name: "Lỗi Parsing",
            cover: "",
            host: BASE_URL,
            author: "",
            description: "Không thể trích xuất tên truyện. Có thể do chặn Cloudflare.",
            detail: "URL: " + url,
            ongoing: true,
            genres: []
        });
    }

    // --- Ảnh bìa ---
    // TODO ★: Đổi selector
    var cover = '';
    var coverEl = doc.select('.detail-info .col-image img').first();
    if (!coverEl) coverEl = doc.select('.book_avatar img').first();
    if (!coverEl) coverEl = doc.select('img.cover').first();
    if (coverEl) {
        cover = coverEl.attr('data-original')
             || coverEl.attr('data-src')
             || coverEl.attr('src')
             || '';
    }
    // Chuẩn hóa cover URL
    if (cover && cover.indexOf('http') !== 0) {
        if (cover.indexOf('//') === 0) cover = 'https:' + cover;
        else if (cover.indexOf('/') === 0) cover = BASE_URL + cover;
    }

    // --- Tác giả ---
    // TODO ★: Đổi selector
    // Tip: Dùng CSS selector thay vì so sánh text tiếng Việt (tránh lỗi encoding)
    var author = '';
    var authorEl = doc.select('.list-info .author .col-xs-8').first();
    if (!authorEl) authorEl = doc.select('.author a').first();
    if (authorEl) author = authorEl.text();

    // --- Mô tả ---
    // TODO ★: Đổi selector
    var description = '';
    var descEl = doc.select('.detail-content p').first();
    if (!descEl) descEl = doc.select('.story-detail-info').first();
    if (descEl) description = descEl.html();

    // --- Trạng thái (ongoing/hoàn thành) ---
    // TODO ★: Đổi selector
    var ongoing = true;
    var statusEl = doc.select('.list-info li.status .col-xs-8').first();
    if (!statusEl) statusEl = doc.select('.status').first();
    if (statusEl) {
        var statusText = statusEl.text().toLowerCase();
        // Kiểm tra bằng indexOf thay vì === (an toàn hơn với Unicode)
        if (statusText.indexOf('hoan') > -1 || statusText.indexOf('full') > -1) {
            ongoing = false;
        }
    }

    // --- Thông tin chi tiết (detail) ---
    // TODO ★: Đổi selector
    var lines = [];
    var infoItems = doc.select('.list-info li');
    for (var i = 0; i < infoItems.size(); i++) {
        var item = infoItems.get(i);
        var label = String(item.select('.name').text()).replace(/\s+/g, ' ').trim();
        var valueNode = item.select('p.col-xs-8').first();
        if (!valueNode) continue;
        var value = String(valueNode.text()).replace(/\s+/g, ' ').trim();
        if (label && value && label !== value) {
            lines.push('<b>' + label + ':</b> ' + value);
        }
    }
    var detail = lines.join('<br>');

    // --- Thể loại ---
    // TODO ★: Đổi selector
    var genres = [];
    var genreEls = doc.select('.list-info li.kind .col-xs-8 a');
    if (genreEls.size() === 0) genreEls = doc.select('.genres a, .genre a');
    for (var i = 0; i < genreEls.size(); i++) {
        var g = genreEls.get(i);
        var href = g.attr('href');
        if (href.indexOf('http') === 0) {
            href = href.replace(/^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:\/\n?]+)/i, '');
        }
        genres.push({
            title: g.text(),
            input: href,
            script: 'gen.js'
        });
    }

    return Response.success({
        name: name,
        cover: cover,
        host: BASE_URL,
        author: author,
        description: description,
        detail: detail,
        ongoing: ongoing,
        genres: genres
    });
}
