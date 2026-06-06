// ============================================================================
// TOC — Danh sách chương
// ============================================================================

load('config.js');

/**
 * Parse danh sách chương từ trang chi tiết.
 * ⚠️ PHẢI trả chương CŨ NHẤT ĐẦU TIÊN (duyệt ngược nếu cần).
 *
 * ln.hako.vn structure:
 * - Chapters grouped by volumes (section.volume-list)
 * - Each volume has ul.list-chapters.at-series
 * - Each chapter: li > .chapter-name > a
 * - Chapters appear newest first on page, need to reverse
 */
function execute(url) {
    url = normalizeUrl(url);

    var doc = fetchHtml(url);
    if (!doc) return null;

    // Lấy tất cả chapter links trong list-chapters
    var chapterEls = doc.select('ul.list-chapters.at-series li .chapter-name a');
    if (!chapterEls || chapterEls.size() === 0) {
        // Fallback: try broader selector
        chapterEls = doc.select('.list-chapters .chapter-name a');
    }
    if (!chapterEls || chapterEls.size() === 0) return null;

    var chapters = [];
    // ⚠️ Duyệt NGƯỢC — chương cũ nhất đầu tiên
    for (var i = chapterEls.size() - 1; i >= 0; i--) {
        var el = chapterEls.get(i);
        var chapName = el.text().trim();
        var chapUrl = normalizeUrl(el.attr('href'));

        if (chapName && chapUrl) {
            chapters.push({
                name: chapName,
                url: chapUrl,
                host: BASE_URL
            });
        }
    }

    return chapters.length > 0 ? Response.success(chapters) : null;
}
