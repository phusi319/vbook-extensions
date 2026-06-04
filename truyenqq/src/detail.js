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
    url = url.replace(/^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:\/\n?]+)/i, BASE_URL);

    var doc = fetchHtml(url);
    
    if (!doc) {
        return Response.success({
            name: "Lỗi Tải Trang / Bị Chặn (v19)",
            cover: "",
            host: BASE_URL,
            author: "",
            description: "Không thể tải trang truyện. Vui lòng mở Web View để xác nhận Captcha.",
            detail: "Debug URL: " + url,
            ongoing: true,
            genres: []
        });
    }

    var name = '';
    var h1 = doc.select('h1[itemprop=name]').first();
    if (h1) name = h1.text();
    if (!name) {
        return Response.success({
            name: "Lỗi Parsing / Bị Chặn (v19)",
            cover: "",
            host: BASE_URL,
            author: "",
            description: "Không thể trích xuất tên truyện. Có thể do chặn Cloudflare.",
            detail: "Debug URL: " + url,
            ongoing: true,
            genres: []
        });
    }

    var cover = '';
    var coverEl = doc.select('.book_avatar img').first();
    if (coverEl) cover = coverEl.attr('src');
    if (cover && cover.indexOf('http') !== 0) {
        if (cover.indexOf('//') === 0) cover = 'https:' + cover;
        else cover = BASE_URL + cover;
    }

    var author = '';
    var authorEl = doc.select('.book_info .author a.org').first();
    if (authorEl) author = authorEl.text();

    var description = '';
    var descEl = doc.select('div.story-detail-info').first();
    if (descEl) description = descEl.html();

    var ongoing = true;
    var statusEl = doc.select('.book_info .status').first();
    if (statusEl) ongoing = statusEl.text().indexOf('Hoàn Thành') === -1;

    // Detail info
    var lines = [];
    var infoItems = doc.select('.book_info .list-info li');
    for (var i = 0; i < infoItems.size(); i++) {
        var item = infoItems.get(i);
        var label = String(item.select('.name').text()).replace(/\s+/g, ' ').trim();
        var valueNode = item.select('p').last();
        if (!valueNode) continue;
        var value = String(valueNode.text()).replace(/\s+/g, ' ').trim();
        if (label && value && label !== value) {
            lines.push('<b>' + label + ':</b> ' + value);
        }
    }
    var detail = lines.join('<br>');

    // Genres
    var genres = [];
    var genreEls = doc.select('.book_info .list01 a');
    for (var i = 0; i < genreEls.size(); i++) {
        var g = genreEls.get(i);
        genres.push({
            title: g.text(),
            input: BASE_URL + g.attr('href'),
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
