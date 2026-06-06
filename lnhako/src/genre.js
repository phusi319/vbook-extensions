// ============================================================================
// GENRE — Danh sách thể loại
// ============================================================================

load('config.js');

/**
 * Parse danh sách thể loại từ trang danh-sach.
 * ln.hako.vn hiển thị genre trên trang /danh-sach dưới dạng link /the-loai/{slug}
 */
function execute() {
    var doc = fetchHtml(BASE_URL + '/danh-sach');
    if (!doc) return null;

    var links = doc.select('a[href*="/the-loai/"]');
    if (!links || links.size() === 0) return null;

    var result = [];
    var seen = {};
    for (var i = 0; i < links.size(); i++) {
        var a = links.get(i);
        var title = a.text().trim();
        var href = a.attr('href').trim();
        if (title && href && !seen[href]) {
            seen[href] = true;
            result.push({
                title: title,
                input: normalizeUrl(href),
                script: "gen.js"
            });
        }
    }

    return result.length > 0 ? Response.success(result) : null;
}
