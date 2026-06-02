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
    } catch (e) {
        // Fall through to HTML
    }

    // Get HTML page for chapters (and fallback metadata)
    var doc = Http.get(requestUrl).html();

    // Fallback metadata from HTML if turbo failed
    if (!turboOk) {
        var h1 = doc.select('h1').first();
        if (h1) name = h1.text().trim();

        var coverEl = doc.select('div.shrink-0 img').first();
        if (coverEl) {
            cover = coverEl.attr('src');
            if (cover && cover.indexOf('http') !== 0) cover = BASE_URL + cover;
        }

        var authorEl = doc.select('a[href^=/search?author=]').first();
        if (authorEl) author = authorEl.text().trim();

        var descEl = doc.select('div.leading-\\[1\\.7\\]').first();
        if (descEl) {
            description = descEl.text().trim();
        } else {
            var allDivs = doc.select('div.text-sm');
            for (var d = 0; d < allDivs.size(); d++) {
                var txt = allDivs.get(d).text().trim();
                if (txt.length > 50) {
                    description = txt;
                    break;
                }
            }
        }

        var statusEl = doc.select('span.rounded-full.font-bold').first();
        if (statusEl) {
            var statusText = statusEl.text().toLowerCase();
            if (statusText.indexOf('completed') > -1 || statusText.indexOf('hoan') > -1) {
                ongoing = false;
            }
        }

        var genreEls = doc.select('a.rounded-full[href^=/search]');
        for (var ge = 0; ge < genreEls.size(); ge++) {
            var gEl = genreEls.get(ge);
            var genreTitle = gEl.text().trim();
            if (genreTitle && genreTitle.length > 0 && genreTitle.length < 30) {
                genres.push({
                    title: genreTitle,
                    input: BASE_URL + gEl.attr('href'),
                    script: 'gen.js'
                });
            }
        }
    }

    // Parse chapters from HTML
    var chapLinks = doc.select('a.relative.block[href^=/chapter/]');
    var sourceMap = {};

    for (var i = 0; i < chapLinks.size(); i++) {
        var chapEl = chapLinks.get(i);
        var chapHref = chapEl.attr('href');

        // Remove query params (?source=user)
        var cleanHref = chapHref;
        var qIdx = chapHref.indexOf('?');
        if (qIdx !== -1) {
            cleanHref = chapHref.substring(0, qIdx);
        }

        // Chapter number: span.font-mono containing "Ch."
        var chapName = '';
        var chapMonos = chapEl.select('span.font-mono');
        for (var m = 0; m < chapMonos.size(); m++) {
            var monoText = chapMonos.get(m).text().trim();
            if (monoText.indexOf('Ch') > -1) {
                chapName = monoText;
                break;
            }
        }

        // Chapter title: span.font-medium
        var chapTitle = '';
        var titleEl = chapEl.select('span.font-medium').first();
        if (titleEl) {
            chapTitle = titleEl.text().trim();
        }

        if (chapName && chapTitle) {
            chapName = chapName + ' - ' + chapTitle;
        } else if (!chapName && chapTitle) {
            chapName = chapTitle;
        } else if (!chapName) {
            chapName = 'Chapter ' + (i + 1);
        }

        // Group/Source: a[href^=/group/]
        var groupName = 'Default';
        var groupEl = chapEl.select('a[href^=/group/]').first();
        if (groupEl) {
            groupName = groupEl.text().trim();
        }

        if (!sourceMap[groupName]) {
            sourceMap[groupName] = [];
        }

        sourceMap[groupName].push({
            name: chapName,
            url: BASE_URL + cleanHref,
            host: BASE_URL
        });
    }

    // Convert to episodes (tabs by source group)
    for (var group in sourceMap) {
        if (sourceMap.hasOwnProperty(group)) {
            episodes.push({
                title: group,
                urls: sourceMap[group].reverse()
            });
        }
    }

    // Fallback if no groups were parsed
    if (episodes.length === 0 && chapLinks.size() > 0) {
        var fallbackList = [];
        for (var j = 0; j < chapLinks.size(); j++) {
            var fe = chapLinks.get(j);
            var fHref = fe.attr('href');
            var fqIdx = fHref.indexOf('?');
            if (fqIdx !== -1) fHref = fHref.substring(0, fqIdx);

            var fName = fe.text().trim();
            if (fName && fName.length > 0) {
                fallbackList.push({
                    name: fName,
                    url: BASE_URL + fHref,
                    host: BASE_URL
                });
            }
        }
        if (fallbackList.length > 0) {
            episodes.push({
                title: "All Chapters",
                urls: fallbackList.reverse()
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
