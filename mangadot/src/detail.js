function execute(url) {
    var BASE_URL = 'https://mangadot.net';
    var requestUrl = url.replace(/\/$/, "");
    
    // Extract Manga ID: /manga/351 -> 351
    var mangaIdMatch = requestUrl.match(/\/manga\/(\d+)/);
    var mangaId = mangaIdMatch ? mangaIdMatch[1] : '';

    var dataUrl = requestUrl + '.data';
    var name = '', cover = '', author = '', description = '', ongoing = true, genres = [];
    var turboOk = false;

    try {
        var turbo = fetchTurbo(dataUrl);
        if (turbo) {
            var manga = findInTurbo(turbo, 'manga');
            if (manga && typeof manga === 'object') {
                turboOk = true;
                if (manga.title) name = manga.title;
                if (manga.description) description = manga.description;
                if (manga.photo) cover = BASE_URL + manga.photo;
                if (manga.status && manga.status.toLowerCase().indexOf('completed') !== -1) {
                    ongoing = false;
                }
                
                if (manga.authors) {
                    try {
                        var parsedAuthors = JSON.parse(manga.authors);
                        if (Array.isArray(parsedAuthors)) author = parsedAuthors.join(', ');
                    } catch(e) {}
                }

                if (manga.genres && Array.isArray(manga.genres)) {
                    for (var g = 0; g < manga.genres.length; g++) {
                        if (typeof manga.genres[g] === 'string') {
                            genres.push({
                                title: manga.genres[g],
                                link: BASE_URL + '/search?genres=' + encodeURIComponent(manga.genres[g])
                            });
                        }
                    }
                }
            }
        }
    } catch (e) {
        // Fallback
    }

    if (!turboOk) {
        var doc = Http.get(requestUrl).html();
        var titleEl = doc.select('h1').first();
        if (titleEl) name = titleEl.text().trim();

        var descEl = doc.select('div.prose').first();
        if (descEl) description = descEl.text().trim();

        var imgEl = doc.select('img[src*=/uploads/]').first();
        if (imgEl) cover = BASE_URL + imgEl.attr('src');
    }

    // Chapters via API
    var episodes = [];
    var sourceMap = {};

    if (mangaId) {
        var apiChapUrl = BASE_URL + '/api/manga/' + mangaId + '/chapters/list';
        var chapJson = Http.get(apiChapUrl).string();
        if (chapJson) {
            try {
                var list = JSON.parse(chapJson);
                if (Array.isArray(list)) {
                    for (var i = 0; i < list.length; i++) {
                        var ch = list[i];
                        var groupName = ch.group_name || 'Mặc định';
                        
                        var chapName = '';
                        if (ch.chapter_number != null) {
                            chapName = 'Chapter ' + ch.chapter_number;
                        } else {
                            chapName = 'Chapter ' + (i + 1);
                        }
                        
                        if (ch.chapter_title && ch.chapter_title !== chapName) {
                            if (ch.chapter_title.indexOf('Chapter') > -1 || ch.chapter_title.indexOf('Ch.') > -1) {
                                chapName = ch.chapter_title;
                            } else {
                                chapName += ' - ' + ch.chapter_title;
                            }
                        }
                        
                        if (!sourceMap[groupName]) {
                            sourceMap[groupName] = [];
                        }
                        
                        var chUrl = BASE_URL + '/chapter/' + ch.id + (ch.source ? '?source=' + ch.source : '');
                        sourceMap[groupName].push({
                            name: chapName,
                            url: chUrl,
                            host: BASE_URL
                        });
                    }
                }
            } catch(e) {}
        }
    }

    for (var group in sourceMap) {
        if (sourceMap.hasOwnProperty(group)) {
            episodes.push({
                title: group,
                urls: sourceMap[group].reverse()
            });
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
