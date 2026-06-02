load('config.js');

/**
 * gen.js — Load manga listing from .data endpoints.
 * Handles: view-all/latest-updates, view-all/popular, view-all/completed, search?genres=...
 * Falls back to HTML scraping if turbo parsing fails.
 *
 * @param {string} url - The page URL (absolute or relative)
 * @param {string} page - Page number or cursor for pagination
 */
function execute(url, page) {
    var requestUrl = url;
    if (url.indexOf('http') !== 0) {
        requestUrl = BASE_URL + url;
    }

    // Try turbo-stream .data approach first
    var dataUrl = requestUrl;

    // Build the .data URL: insert .data before query string
    var qIdx = requestUrl.indexOf('?');
    if (qIdx !== -1) {
        dataUrl = requestUrl.substring(0, qIdx) + '.data' + requestUrl.substring(qIdx);
    } else {
        dataUrl = requestUrl + '.data';
    }

    // Add pagination
    if (page && page !== '1' && page !== '') {
        if (dataUrl.indexOf('?') !== -1) {
            dataUrl = dataUrl + '&page=' + page;
        } else {
            dataUrl = dataUrl + '?page=' + page;
        }
    }

    try {
        var turbo = fetchTurbo(dataUrl);
        if (turbo) {
            var data = extractMangaList(turbo);
            if (data.length > 0) {
                // Determine next page
                var nextPage = '';
                var pagination = findInTurbo(turbo, 'pagination');
                if (pagination) {
                    var currentPage = pagination.current_page || 1;
                    var totalPages = pagination.total_pages || 1;
                    if (currentPage < totalPages) {
                        nextPage = String(currentPage + 1);
                    }
                }

                // If no pagination object, check for next_cursor
                if (!nextPage) {
                    var nextCursor = findInTurbo(turbo, 'next_cursor');
                    if (nextCursor) {
                        nextPage = String(nextCursor);
                    }
                }

                // Default: increment page if we got a full page of results
                if (!nextPage && data.length >= 20) {
                    var p = parseInt(page || '1', 10);
                    nextPage = String(p + 1);
                }

                return Response.success(data, nextPage);
            }
        }
    } catch (e) {
        // Fall through to HTML scraping
    }

    // Fallback: HTML scraping
    return fallbackHtml(requestUrl, page);
}

function fallbackHtml(requestUrl, page) {
    if (!page) page = '1';

    var htmlUrl = requestUrl;
    if (htmlUrl.indexOf('?') !== -1) {
        htmlUrl = htmlUrl + '&page=' + page;
    } else {
        htmlUrl = htmlUrl + '?page=' + page;
    }

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
