load('config.js');

/**
 * detail.js — Fetch manga detail.
 * Uses .data turbo-stream for metadata (title, cover, author, description, status, genres).
 * Uses HTML scraping for chapter list (not available in .data).
 *
 * @param {string} url - Manga page URL like https://mangadot.net/manga/351
 */
function execute(url) {
    var requestUrl = url;
    if (url.indexOf('http') !== 0) {
        requestUrl = BASE_URL + url;
    }

    var name = '';
    var cover = '';
    var author = '';
    var description = '';
    var ongoing = true;
    var genres = [];

    // Try .data turbo-stream for metadata
    var dataUrl = requestUrl + '.data';
    var turboOk = false;

    try {
        var turbo = fetchTurbo(dataUrl);
        if (turbo) {
            var manga = findInTurbo(turbo, 'manga');
            if (manga && typeof manga === 'object') {
                turboOk = true;

                name = manga.title || '';
                description = manga.description || '';

                // Cover
                var photo = manga.photo || '';
                if (photo) {
                    cover = photo.indexOf('http') === 0 ? photo : BASE_URL + photo;
                }

                // Authors
                author = parseAuthors(manga.authors);
                if (!author) {
                    author = parseAuthors(manga.artists);
                }

                // Status
                var status = manga.status || '';
                if (typeof status === 'string') {
                    var sl = status.toLowerCase();
                    if (sl.indexOf('completed') > -1 || sl.indexOf('hoan') > -1 || sl.indexOf('cancelled') > -1) {
                        ongoing = false;
                    }
                }

                // Genres
                var genreArr = manga.genres;
                if (genreArr && Array.isArray(genreArr)) {
                    for (var g = 0; g < genreArr.length; g++) {
                        var gName = genreArr[g];
                        if (typeof gName === 'string' && gName.length > 0 && gName.length < 30) {
                            genres.push({
                                title: gName,
                                input: BASE_URL + '/search?genres=' + encodeURIComponent(gName),
                                script: 'gen.js'
                            });
                        }
                    }
                }
            }
        }
    } catch (e) {}

    // Ultimate fallback for metadata if turbo fails (guarantees Add Bookshelf works)
    if (!name) {
        try {
            var doc = Http.get(requestUrl).html();
            var h1 = doc.select('h1').first();
            if (h1) name = h1.text().trim();
            
            var imgs = doc.select('img');
            for (var i = 0; i < imgs.size(); i++) {
                var src = imgs.get(i).attr('src');
                if (src && src.indexOf('mangadotnet') === -1) {
                    cover = src;
                    break;
                }
            }
            if (cover && cover.indexOf('http') !== 0) cover = BASE_URL + cover;
            
            var p = doc.select('.line-clamp-6').first();
            if (!p) p = doc.select('p').first();
            if (p) description = p.text().trim();
        } catch (e) {}
    }

    if (!name) name = "Unknown"; // prevent Add Bookshelf crash at all costs
    if (!cover) cover = "";

    return Response.success({
        name: name,
        cover: cover,
        author: author,
        description: description,
        detail: author,
        host: BASE_URL,
        ongoing: ongoing,
        genres: genres
    });
}
