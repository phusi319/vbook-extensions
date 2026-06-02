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
    var episodes = [];

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

    // Extract manga ID from URL: /manga/{id}
    var mangaId = '';
    var idMatch = requestUrl.match(/\/manga\/(\d+)/);
    if (idMatch) {
        mangaId = idMatch[1];
    }

    // Fetch chapters from API
    if (mangaId) {
        try {
            var apiUrl = BASE_URL + '/api/manga/' + mangaId + '/chapters/list';
            var chapList = null;
            try {
                var str = Http.get(apiUrl).string();
                if (str && (str.indexOf('[{') === 0 || str.indexOf('[]') === 0)) {
                    chapList = JSON.parse(str);
                }
            } catch (e) {}
            
            if (!chapList) {
                var chapResp = fetch(apiUrl);
                if (chapResp.ok) chapList = chapResp.json();
            }

            if (chapList && Array.isArray(chapList)) {
                var sourceMap = {};

                    for (var i = 0; i < chapList.length; i++) {
                        var ch = chapList[i];
                        var chapNum = ch.chapter_number;
                        var chapTitle = ch.chapter_title || '';
                        var chapId = ch.id;
                        var groupName = ch.group_name || ch.scanlator_name || 'Default';
                        if (!groupName || groupName === 'null') groupName = 'Default';

                        // Build chapter display name
                        var chapName = 'Ch. ' + chapNum;
                        if (chapTitle && chapTitle.indexOf('Chapter') !== 0 && chapTitle.indexOf('Episode') !== 0) {
                            chapName = chapName + ' - ' + chapTitle;
                        }

                        if (!sourceMap[groupName]) {
                            sourceMap[groupName] = [];
                        }

                        var sourceParam = ch.source ? '?source=' + ch.source : '';

                        sourceMap[groupName].push({
                            name: chapName,
                            url: BASE_URL + '/chapter/' + chapId + sourceParam,
                            host: BASE_URL
                        });
                    }

                    // Convert to episodes (tabs by source group)
                    for (var group in sourceMap) {
                        if (sourceMap.hasOwnProperty(group)) {
                            episodes.push({
                                title: group,
                                urls: sourceMap[group]
                            });
                        }
                }
            }
        } catch (e) {
            // Chapter API failed
        }
    }

    return Response.success({
        name: name,
        cover: cover,
        author: author,
        description: description,
        host: BASE_URL,
        ongoing: ongoing,
        genres: genres,
        episodes: episodes
    });
}
