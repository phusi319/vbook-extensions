load('config.js');

function execute(url) {
    // Normalize domain to BASE_URL
    url = url.replace(/^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:\/\n?]+)/i, BASE_URL);

    var doc = fetch(url).html();
    if (!doc) return null;

    var name = '';
    var h1 = doc.select('h1[itemprop=name]').first();
    if (h1) name = h1.text();
    if (!name) return null;

    // Cover
    var cover = '';
    var coverEl = doc.select('.book_avatar img').first();
    if (coverEl) {
        cover = coverEl.attr('src');
        if (cover && cover.indexOf('//') === 0) cover = 'https:' + cover;
    }

    // Author
    var author = '';
    var authorEl = doc.select('.book_info .author a.org').first();
    if (authorEl) author = authorEl.text();

    // Description
    var description = '';
    var descEl = doc.select('div.story-detail-info').first();
    if (descEl) description = descEl.html();

    // Status
    var ongoing = true;
    var statusEl = doc.select('.book_info .status').first();
    if (statusEl) {
        ongoing = statusEl.text().indexOf('Hoàn Thành') === -1;
    }

    // Detail info
    var lines = [];
    var infoItems = doc.select('.book_info .list-info li');
    for (var i = 0; i < infoItems.size(); i++) {
        var item = infoItems.get(i);
        var label = item.select('.name').text().replace(/\s+/g, ' ').trim();
        var valueNode = item.select('p').last();
        if (!valueNode) continue;
        var value = valueNode.html().replace(/\s+/g, ' ').trim();
        if (!label || !value || label === valueNode.text().replace(/\s+/g, ' ').trim()) continue;
        lines.push('<b>' + label + ':</b> ' + value);
    }
    var detail = lines.join('<br>');

    // Genres
    var genres = [];
    var genreEls = doc.select('.book_info .list01 a');
    for (var i = 0; i < genreEls.size(); i++) {
        var ge = genreEls.get(i);
        genres.push({
            title: ge.text(),
            input: ge.attr('href'),
            script: 'gen.js'
        });
    }

    return Response.success({
        name: name,
        cover: cover,
        host: BASE_URL,
        author: author,
        description: description,
        detail: detail,
        ongoing: ongoing,
        genres: genres
    });
}
