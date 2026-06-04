load('config.js');

function execute(url) {
    url = String(url);
    if (url.indexOf('http') !== 0) {
        if (url.indexOf('//') === 0) {
            url = 'https:' + url;
        } else if (url.indexOf('/') === 0) {
            url = BASE_URL + url;
        } else {
            url = BASE_URL + '/' + url;
        }
    }
    // Normalize domain to BASE_URL
    url = url.replace(/^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:\/\n?]+)/i, BASE_URL);

    var doc = null;
    var errorMsg = "Unknown";
    try {
        doc = fetch(url).html();
    } catch (e) {
        errorMsg = String(e);
    }
    
    if (!doc) {
        return Response.success({
            name: "Lỗi Fetch/Bị Chặn",
            cover: "",
            host: BASE_URL,
            author: "",
            description: "Không thể fetch URL: " + url + "<br>Lỗi: " + errorMsg,
            detail: "Debug URL",
            ongoing: true,
            genres: []
        });
    }

    var name = '';
    var h1 = doc.select('h1[itemprop=name]').first();
    if (h1) name = h1.text();
    if (!name) {
        return Response.success({
            name: "Lỗi Parsing H1",
            cover: "",
            host: BASE_URL,
            author: "",
            description: "URL đã fetch: " + url + "<br>HTML trả về (500 ký tự đầu): " + doc.html().substring(0, 500).replace(/</g, "&lt;").replace(/>/g, "&gt;"),
            detail: "Debug HTML",
            ongoing: true,
            genres: []
        });
    }

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
        var label = String(item.select('.name').text()).replace(/\s+/g, ' ').trim();
        var valueNode = item.select('p').last();
        if (!valueNode) continue;
        var value = String(valueNode.html()).replace(/\s+/g, ' ').trim();
        var textVal = String(valueNode.text()).replace(/\s+/g, ' ').trim();
        if (!label || !value || label === textVal) continue;
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
