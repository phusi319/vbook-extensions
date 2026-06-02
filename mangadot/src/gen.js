load('config.js');

/**
 * gen.js — Load manga listing.
 * 
 * Handles:
 *   - /view-all/latest-updates, /view-all/popular, etc. → turbo .data
 *   - /search?genres=Action, etc. → /api/search REST API
 *   - /api/search?... → direct REST API
 *
 * Uses fetch() throughout (bypass CF).
 */
function execute(url, page) {
    var requestUrl = url;
    if (url.indexOf('http') !== 0) {
        requestUrl = BASE_URL + url;
    }

    // Map view-all pages that don't work via turbo to API search
    if (requestUrl.indexOf('/view-all/new-series') > -1) {
        return searchApi(BASE_URL + '/search?sortBy=date_added&sortOrder=desc', page);
    }
    if (requestUrl.indexOf('/view-all/completed') > -1) {
        return searchApi(BASE_URL + '/search?status=Completed', page);
    }

    // Detect if this is a search/genre URL → use REST API
    if (requestUrl.indexOf('/search') > -1) {
        return searchApi(requestUrl, page);
    }

    // For view-all pages (latest-updates, popular) → turbo .data
    return viewAllTurbo(requestUrl, page);
}

/**
 * Handle /search?genres=... using REST API
 */
function searchApi(requestUrl, page) {
    // Extract query params from the URL
    var qIdx = requestUrl.indexOf('?');
    var queryStr = qIdx > -1 ? requestUrl.substring(qIdx + 1) : '';
    
    // Build API URL
    var apiUrl = BASE_URL + '/api/search';
    if (queryStr) {
        apiUrl = apiUrl + '?' + queryStr;
    }

    // Add pagination
    if (page && page !== '1' && page !== '') {
        if (apiUrl.indexOf('?') !== -1) {
            apiUrl = apiUrl + '&page=' + page;
        } else {
            apiUrl = apiUrl + '?page=' + page;
        }
    }

    try {
        var resp = fetch(apiUrl);
        if (resp.ok) {
            var json = resp.json();
            var list = json.manga_list || json.results;
            
            if (list && list.length) {
                var data = [];
                for (var i = 0; i < list.length; i++) {
                    var m = list[i];
                    if (!m || !m.title || !m.id) continue;

                    var cover = String(m.photo || '');
                    if (cover && cover.indexOf('http') !== 0) {
                        cover = BASE_URL + cover;
                    }

                    var desc = String(m.description || '');
                    if (m.chapter_count) {
                        desc = 'Ch. ' + m.chapter_count + (desc ? ' — ' + desc : '');
                    }

                    data.push({
                        name: String(m.title),
                        link: BASE_URL + '/manga/' + m.id,
                        cover: cover,
                        description: desc,
                        host: BASE_URL
                    });
                }

                if (data.length > 0) {
                    // Pagination
                    var nextPage = '';
                    if (json.pagination) {
                        var cp = json.pagination.current_page || 1;
                        var tp = json.pagination.total_pages || 1;
                        if (cp < tp) nextPage = String(cp + 1);
                    }
                    if (!nextPage && data.length >= 20) {
                        var p = parseInt(page || '1', 10);
                        nextPage = String(p + 1);
                    }
                    return Response.success(data, nextPage);
                }
            }
        }
    } catch (e) {}

    return null;
}

/**
 * Handle /view-all/... pages using turbo .data
 */
function viewAllTurbo(requestUrl, page) {
    var dataUrl = requestUrl + '.data';

    if (page && page !== '1' && page !== '') {
        dataUrl = dataUrl + '?page=' + page;
    }

    try {
        var resp = fetch(dataUrl);
        if (resp.ok) {
            var text = resp.text();
            if (text) {
                var turbo = parseTurbo(text);
                if (turbo) {
                    var data = extractMangaList(turbo);
                    if (data.length > 0) {
                        var nextPage = '';
                        var pagination = findInTurbo(turbo, 'pagination');
                        if (pagination) {
                            var cp = pagination.current_page || 1;
                            var tp = pagination.total_pages || 1;
                            if (cp < tp) nextPage = String(cp + 1);
                        }
                        if (!nextPage) {
                            var nc = findInTurbo(turbo, 'next_cursor');
                            if (nc) nextPage = String(nc);
                        }
                        if (!nextPage && data.length >= 20) {
                            var p = parseInt(page || '1', 10);
                            nextPage = String(p + 1);
                        }
                        return Response.success(data, nextPage);
                    }
                }
            }
        }
    } catch (e) {}

    // Fallback: try REST API for view-all as well
    try {
        var apiPath = requestUrl.replace(BASE_URL, '');
        var resp2 = fetch(BASE_URL + '/api' + apiPath + (page ? '?page=' + page : ''));
        if (resp2.ok) {
            var json = resp2.json();
            var list = json.manga_list || json.results || json.data;
            if (list && list.length) {
                var data = [];
                for (var i = 0; i < list.length; i++) {
                    var m = list[i];
                    if (!m || !m.title || !m.id) continue;
                    var cover = String(m.photo || '');
                    if (cover && cover.indexOf('http') !== 0) cover = BASE_URL + cover;
                    data.push({
                        name: String(m.title),
                        link: BASE_URL + '/manga/' + m.id,
                        cover: cover,
                        description: m.chapter_count ? 'Ch. ' + m.chapter_count : '',
                        host: BASE_URL
                    });
                }
                if (data.length > 0) {
                    var np = data.length >= 20 ? String(parseInt(page || '1', 10) + 1) : '';
                    return Response.success(data, np);
                }
            }
        }
    } catch (e) {}

    return null;
}
