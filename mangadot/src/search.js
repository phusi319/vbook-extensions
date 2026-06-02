load('config.js');

/**
 * search.js — Search manga via REST API.
 * Uses /api/search endpoint which returns manga_list directly.
 */
function execute(key, page) {
    if (!page) page = '1';

    var apiUrl = BASE_URL + '/api/search?search=' + encodeURIComponent(key);
    if (page && page !== '1') {
        apiUrl = apiUrl + '&page=' + page;
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
                    var nextPage = '';
                    if (json.pagination) {
                        var cp = json.pagination.current_page || 1;
                        var tp = json.pagination.total_pages || 1;
                        if (cp < tp) nextPage = String(cp + 1);
                    }
                    if (!nextPage && data.length >= 20) {
                        nextPage = String(parseInt(page, 10) + 1);
                    }
                    return Response.success(data, nextPage);
                }
            }
        }
    } catch (e) {}

    return null;
}
