// ============================================================================
// CHAP — Nội dung chương (text novel)
// ============================================================================

load('config.js');

/**
 * Parse nội dung chương truyện.
 * ln.hako.vn là trang Light Novel (text), không phải comic (ảnh).
 *
 * Chapter content nằm trong div#chapter-content
 * Content gồm các thẻ <p> chứa text truyện
 *
 * Với type "novel", chap.js trả về HTML string thay vì mảng ảnh
 * Format: Response.success(htmlString)
 */
function execute(url) {
    url = normalizeUrl(url);

    var doc = fetchHtml(url);
    if (!doc) return null;

    // Lấy nội dung chương từ #chapter-content
    var contentEl = doc.select('#chapter-content').first();
    if (!contentEl) return null;

    // Loại bỏ các element không cần thiết
    // Bỏ hidden elements (p style="display: none" chứa tên chương duplicate)
    var hiddenEls = contentEl.select('[style*="display: none"], [style*="display:none"]');
    if (hiddenEls) {
        hiddenEls.remove();
    }

    // Bỏ script tags nếu có
    var scriptEls = contentEl.select('script');
    if (scriptEls) {
        scriptEls.remove();
    }

    // Bỏ quảng cáo nếu có
    var adEls = contentEl.select('[class*="ads"], [class*="ad-"], [id*="ads"]');
    if (adEls) {
        adEls.remove();
    }

    var content = contentEl.html();
    if (!content || content.trim().length === 0) return null;

    return Response.success(content);
}
