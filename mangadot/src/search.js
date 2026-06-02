load('config.js');

/**
 * search.js — Search manga via .data turbo-stream endpoint.
 * Falls back to HTML scraping if turbo fails.
 *
 * @param {string} key - Search query
 * @param {string} page - Page number for pagination
 */
function execute(key, page) {
    if (!page) page = '1';

    // Try turbo-stream .data approach
    var dataUrl = BASE_URL + '/search.data?search=' + encodeURIComponent(key);
    if (page && page !== '1') {
        dataUrl = dataUrl + '&page=' + page;
    }

    try {
        var turbo = fetchTurbo(dataUrl);
        if (turbo) {
            var results = findInTurbo(turbo, 'results');
            if (results && Array.isArray(results)) {
                var data = extractMangaList(turbo);
                if (data.length > 0) {
                    // Check pagination
                    var nextPage = '';
                    var pagination = findInTurbo(turbo, 'pagination');
                    if (pagination) {
                        var currentPage = pagination.current_page || 1;
                        var totalPages = pagination.total_pages || 1;
                        if (currentPage < totalPages) {
                            nextPage = String(currentPage + 1);
                        }
                    }

                    // Default: if we got results, allow loading next page
                    if (!nextPage && data.length >= 20) {
                        var p = parseInt(page, 10);
                        nextPage = String(p + 1);
                    }

                    return Response.success(data, nextPage);
                }
            }
        }
    } catch (e) {
        // Fall through to HTML scraping
    }

    // Fallback: HTML scraping
    var htmlUrl = BASE_URL + '/search?search=' + encodeURIComponent(key) + '&page=' + page;
    var doc = Http.get(htmlUrl).html();

    var el = doc.select('a.group[href^=/manga/]');
    var data = [];
    for (var i = 0; i < el.size(); i++) {
        var e = el.get(i);
        var link = e.attr('href');
        var title = e.select('.line-clamp-2').text();
        var coverEl = e.select('img').first();
        var cover = '';
        if (coverEl) {
            cover = coverEl.attr('src');
            if (!cover) cover = coverEl.attr('data-src');
            if (cover && cover.indexOf('http') !== 0) {
                cover = BASE_URL + cover;
            }
        }

        if (title && link) {
            data.push({
                name: title,
                link: BASE_URL + link,
                cover: cover,
                description: '',
                host: BASE_URL
            });
        }
    }

    var next = '';
    if (data.length > 0) {
        next = String(parseInt(page, 10) + 1);
    }

    return Response.success(data, next);
}
