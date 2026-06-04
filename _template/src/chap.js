// ============================================================================
// chap.js — Nội dung chương (danh sách ảnh)
// ============================================================================
// Tham số:
//   - url: URL trang đọc chương
//
// Trả về: Response.success(imageList)
//   - imageList: [{link: "url", fallback: ["url"]}]
//   - Hoặc đơn giản: [url1, url2, ...]
//
// Tips:
//   - Nhiều trang dùng lazy-load: ảnh thật nằm trong data-original, data-src,
//     data-cdn, data-sv1 thay vì src
//   - Lọc bỏ ảnh rác (logo, avatar, thumbnail đề cử) bằng cách kiểm tra URL
//   - Nếu trang có DRM/mã hóa ảnh → cần thêm image.js (xem cuutruyen, moetruyen)
//
// TODO: Đổi selector và thuộc tính ảnh (đánh dấu ★) cho phù hợp trang của bạn.

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

    var data = [];

    // TODO ★: Đổi selector chứa ảnh chương
    // Selector phổ biến:
    //   - '.reading-detail .page-chapter img'    (nettruyen)
    //   - '.chapter_content img.lazy'            (truyenqq)
    //   - '.content_detail_manga img'            (foxtruyen)
    var imgs = doc.select('.reading-detail .page-chapter img');

    for (var i = 0; i < imgs.size(); i++) {
        var el = imgs.get(i);

        // TODO ★: Đổi thứ tự ưu tiên thuộc tính ảnh cho phù hợp
        // Thử data-original / data-src / data-cdn trước (lazy load), rồi mới src
        var src = el.attr('data-original')
               || el.attr('data-src')
               || el.attr('data-cdn')
               || el.attr('src')
               || '';

        if (!src || src.length === 0) continue;

        // Chuẩn hóa URL ảnh
        if (src.indexOf('http') !== 0) {
            if (src.indexOf('//') === 0) src = 'https:' + src;
            else if (src.indexOf('/') === 0) src = BASE_URL + src;
        }

        // Lọc bỏ ảnh rác (logo, icon, thumbnail...)
        var srcLower = src.toLowerCase();
        if (srcLower.indexOf('/logo') !== -1) continue;
        if (srcLower.indexOf('/icon') !== -1) continue;
        if (srcLower.indexOf('/avatar') !== -1) continue;
        if (srcLower.indexOf('loading.') !== -1) continue;

        data.push({
            link: src,
            fallback: [src]
        });
    }

    return Response.success(data);
}
