// ============================================================================
// toc.js — Danh sách chương (Table of Contents)
// ============================================================================
// Tham số:
//   - url: URL trang chi tiết truyện (giống detail.js)
//
// Trả về: Response.success([{name, url, host}])
//
// ⚠️ QUAN TRỌNG: VBook yêu cầu chương CŨ NHẤT (Chapter 1) ở ĐẦU mảng.
// Hầu hết trang web liệt kê chương MỚI NHẤT lên đầu → phải đảo ngược!
//
// TODO: Đổi selector (đánh dấu ★) cho phù hợp trang của bạn.

load('config.js');

function execute(url) {
    // --- Chuẩn hóa URL (giống detail.js) ---
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
    url = url.replace(/^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:\/\n?]+)/i, BASE_URL);

    var doc = fetchHtml(url);
    if (!doc) return null;

    var list = [];

    // TODO ★: Đổi selector lấy danh sách link chương
    // Selector phổ biến:
    //   - '#nt_listchapter ul li .chapter a'  (nettruyen)
    //   - '.works-chapter-list a'             (truyenqq)
    //   - '.fx-chap-list .fx-chap-item a'     (foxtruyen)
    //   - '.list-chapter li a'                (generic)
    var chapterLinks = doc.select('#nt_listchapter ul li .chapter a');

    // ⚠️ Duyệt NGƯỢC (size-1 → 0) để chương cũ nhất lên đầu
    for (var i = chapterLinks.size() - 1; i >= 0; i--) {
        var el = chapterLinks.get(i);
        var chapterName = el.text().trim();
        var chapterUrl = el.attr('href');

        if (!chapterName || !chapterUrl) continue;

        // Chuẩn hóa URL
        if (chapterUrl.indexOf('http') !== 0) {
            if (chapterUrl.indexOf('//') === 0) chapterUrl = 'https:' + chapterUrl;
            else if (chapterUrl.indexOf('/') === 0) chapterUrl = BASE_URL + chapterUrl;
        }

        list.push({
            name: chapterName,
            url: chapterUrl,
            host: BASE_URL
        });
    }

    return Response.success(list);
}
