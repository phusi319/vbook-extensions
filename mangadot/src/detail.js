load('config.js');
function execute(url) {
    var requestUrl = url;
    if (url.indexOf('http') !== 0) {
        requestUrl = BASE_URL + url;
    }
    var doc = Http.get(requestUrl).html();

    // Title
    var name = '';
    var h1 = doc.select('h1').first();
    if (h1) name = h1.text().trim();

    // Cover image (inside shrink-0 div)
    var cover = '';
    var coverEl = doc.select('div.shrink-0 img').first();
    if (coverEl) {
        cover = coverEl.attr('src');
        if (cover && cover.indexOf('http') !== 0) {
            cover = BASE_URL + cover;
        }
    }

    // Author
    var author = '';
    var authorEl = doc.select('a[href^=/search?author=]').first();
    if (authorEl) author = authorEl.text().trim();

    // Description
    var description = '';
    var descEl = doc.select('div.leading-\\[1\\.7\\]').first();
    if (descEl) {
        description = descEl.text().trim();
    } else {
        // Fallback: tìm div text-sm chứa text dài
        var allDivs = doc.select('div.text-sm');
        for (var d = 0; d < allDivs.size(); d++) {
            var txt = allDivs.get(d).text().trim();
            if (txt.length > 50) {
                description = txt;
                break;
            }
        }
    }

    // Status
    var ongoing = true;
    var statusEl = doc.select('span.rounded-full.font-bold').first();
    if (statusEl) {
        var statusText = statusEl.text().toLowerCase();
        if (statusText.indexOf('completed') > -1 || statusText.indexOf('hoan') > -1) {
            ongoing = false;
        }
    }

    // Genres
    var genres = [];
    var genreEls = doc.select('a.rounded-full[href^=/search]');
    for (var g = 0; g < genreEls.size(); g++) {
        var ge = genreEls.get(g);
        var genreTitle = ge.text().trim();
        if (genreTitle && genreTitle.length > 0 && genreTitle.length < 30) {
            genres.push({
                title: genreTitle,
                input: BASE_URL + ge.attr('href'),
                script: "gen.js"
            });
        }
    }

    // Chapters - parse from SSR HTML
    // Each chapter: a.relative.block[href^=/chapter/]
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

        // Chapter title: span.truncate.font-medium
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
    var episodes = [];
    for (var group in sourceMap) {
        if (sourceMap.hasOwnProperty(group)) {
            episodes.push({
                title: group,
                urls: sourceMap[group].reverse()
            });
        }
    }

    // Fallback nếu không parse được group
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
