// ============================================================================
// GEN — Listing truyện + Phân trang
// ============================================================================

load('config.js');

/**
 * Load danh sách truyện từ URL (thể loại, mới nhất, phổ biến, ...)
 *
 * ln.hako.vn structure:
 * - Each item is a .thumb-item-flow div
 * - Cover image is in .content.img-in-ratio[data-bg] (background image)
 * - Series title link is in .thumb_attr.series-title a
 * - Pagination uses .pagination_wrap with .paging_item elements
 */
function execute(url, page) {
    var targetUrl = url;
    if (page && page !== '') {
        targetUrl = page;
    }

    var doc = fetchHtml(targetUrl);
    if (!doc) return null;

    // Parse danh sách truyện
    var items = doc.select('.thumb-item-flow');
    if (!items || items.size() === 0) return null;

    var result = [];
    for (var i = 0; i < items.size(); i++) {
        var item = items.get(i);

        // Series title link — đây là link tới trang chi tiết truyện
        var seriesTitleEl = item.select('.thumb_attr.series-title a').first();
        if (!seriesTitleEl) continue;

        var name = seriesTitleEl.text().trim();
        var link = normalizeUrl(seriesTitleEl.attr('href'));

        // Cover image — dùng data-bg attribute trên div.content.img-in-ratio
        var cover = '';
        var coverDiv = item.select('.content.img-in-ratio').first();
        if (coverDiv) {
            cover = coverDiv.attr('data-bg');
            if (!cover) {
                // Fallback: extract from style attribute
                cover = extractBgUrl(coverDiv.attr('style'));
            }
        }

        // Description — lấy từ chapter title (chương mới nhất)
        var description = '';
        var chapTitle = item.select('.thumb_attr.chapter-title a').first();
        if (chapTitle) {
            description = chapTitle.text().trim();
        }

        if (name && link) {
            result.push({
                name: name,
                link: link,
                cover: cover,
                description: description,
                host: BASE_URL
            });
        }
    }

    if (result.length === 0) return null;

    // Tìm trang tiếp theo
    var nextPage = '';
    var currentPageEl = doc.select('.pagination_wrap .paging_item.current').first();
    if (currentPageEl) {
        // Tìm element tiếp theo sau current
        var allPages = doc.select('.pagination_wrap .paging_item.page_num');
        var foundCurrent = false;
        for (var j = 0; j < allPages.size(); j++) {
            var pageEl = allPages.get(j);
            if (foundCurrent) {
                var nextHref = pageEl.attr('href');
                if (nextHref) {
                    nextPage = normalizeUrl(nextHref);
                }
                break;
            }
            if (pageEl.hasClass('current')) {
                foundCurrent = true;
            }
        }
    }

    return Response.success(result, nextPage);
}
