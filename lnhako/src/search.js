// ============================================================================
// SEARCH — Tìm kiếm truyện
// ============================================================================

load('config.js');

/**
 * Tìm kiếm truyện theo keyword.
 * ln.hako.vn search URL: /tim-kiem?keywords={keyword}
 * Kết quả search dùng cùng format .thumb-item-flow như trang listing
 */
function execute(keyword, page) {
    var targetUrl;
    if (page && page !== '') {
        targetUrl = page;
    } else {
        targetUrl = BASE_URL + '/tim-kiem?keywords=' + encodeURIComponent(keyword);
    }

    var doc = fetchHtml(targetUrl);
    if (!doc) return null;

    // Parse kết quả — giống gen.js
    var items = doc.select('.thumb-item-flow');
    if (!items || items.size() === 0) return null;

    var result = [];
    for (var i = 0; i < items.size(); i++) {
        var item = items.get(i);

        var seriesTitleEl = item.select('.thumb_attr.series-title a').first();
        if (!seriesTitleEl) continue;

        var name = seriesTitleEl.text().trim();
        var link = normalizeUrl(seriesTitleEl.attr('href'));

        var cover = '';
        var coverDiv = item.select('.content.img-in-ratio').first();
        if (coverDiv) {
            cover = coverDiv.attr('data-bg');
            if (!cover) {
                cover = extractBgUrl(coverDiv.attr('style'));
            }
        }

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

    // Pagination
    var nextPage = '';
    var currentPageEl = doc.select('.pagination_wrap .paging_item.current').first();
    if (currentPageEl) {
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
