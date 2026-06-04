load('config.js');

/**
 * detail.js — Fetch manga detail using fetch() (bypass CF).
 * Same pattern as foxtruyen which works perfectly.
 */
function execute(url) {
    var requestUrl = url;
    if (url.indexOf('http') !== 0) {
        requestUrl = BASE_URL + url;
    }

    // Try turbo data first (via fetch which bypasses CF)
    var mangaId = '';
    var idMatch = requestUrl.match(/\/manga\/(\d+)/);
    if (idMatch) mangaId = idMatch[1];

    if (mangaId) {
        var dataUrl = BASE_URL + '/manga/' + mangaId + '.data';
        try {
            var resp = fetch(dataUrl);
            if (resp.ok) {
                var text = resp.text();
                if (text) {
                    var turbo = parseTurbo(text);
                    var manga = findInTurbo(turbo, 'manga');
                    if (manga && manga.title) {
                        var name = String(manga.title || '');
                        var cover = String(manga.photo || '');
                        if (cover && cover.indexOf('http') !== 0) cover = BASE_URL + cover;
                        var author = parseAuthors(manga.authors);
                        var desc = String(manga.description || '');
                        var status = String(manga.status || '');
                        var ongoing = status.toLowerCase().indexOf('complet') === -1;

                        var genres = [];
                        if (manga.genres && manga.genres.length) {
                            for (var i = 0; i < manga.genres.length; i++) {
                                var g = String(manga.genres[i] || '');
                                if (g) {
                                    genres.push({
                                        title: g,
                                        input: BASE_URL + '/search?genres=' + encodeURIComponent(g),
                                        script: 'gen.js'
                                    });
                                }
                            }
                        }

                        var detailStr = author;
                        var updated = String(manga.last_chapter_date || '');
                        if (updated) {
                            var dateParts = updated.split(' ')[0].split('-');
                            if (dateParts.length === 3) {
                                detailStr += (detailStr ? '<br>' : '') + '<b>Cập nhật:</b> ' + dateParts[2] + '/' + dateParts[1] + '/' + dateParts[0];
                            } else {
                                detailStr += (detailStr ? '<br>' : '') + '<b>Cập nhật:</b> ' + updated.split(' ')[0];
                            }
                        }

                        return Response.success({
                            name: name,
                            cover: cover,
                            author: author,
                            description: desc,
                            detail: detailStr,
                            host: BASE_URL,
                            ongoing: ongoing,
                            genres: genres
                        });
                    }
                }
            }
        } catch (e) {}
    }

    // Fallback: HTML scraping via fetch
    try {
        var doc = fetch(requestUrl).html();
        if (doc) {
            var name = '';
            var h1 = doc.select('h1').first();
            if (h1) name = h1.text();

            var cover = '';
            var imgs = doc.select('img');
            for (var i = 0; i < imgs.size(); i++) {
                var src = imgs.get(i).attr('src');
                if (src && src.indexOf('/uploads/') > -1) {
                    cover = src;
                    break;
                }
            }
            if (cover && cover.indexOf('http') !== 0) cover = BASE_URL + cover;

            if (!name) return null;

            return Response.success({
                name: name,
                cover: cover,
                author: '',
                description: '',
                detail: name,
                host: BASE_URL,
                ongoing: true
            });
        }
    } catch (e) {}

    return null;
}
