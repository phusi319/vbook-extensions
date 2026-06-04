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
            name: "Lỗi Tải Trang / Bị Chặn (v1)",
            cover: "",
            host: BASE_URL,
            author: "",
            description: "Không thể tải trang truyện. Vui lòng mở Web View để xác nhận Captcha.",
            detail: "Debug URL: " + url,
            ongoing: true,
            genres: []
        });
    }

    // Title
    var name = '';
    var h1 = doc.select('h1.title-detail').first();
    if (h1) name = h1.text();
    if (!name) {
        return Response.success({
            name: "Lỗi Parsing / Bị Chặn (v1)",
            cover: "",
            host: BASE_URL,
            author: "",
            description: "Không thể trích xuất tên truyện. Có thể do chặn Cloudflare.",
            detail: "Debug URL: " + url,
            ongoing: true,
            genres: []
        });
    }

    // Cover image
    var cover = '';
    var coverEl = doc.select('#item-detail .detail-info .col-image img').first();
    if (coverEl) cover = coverEl.attr('src');
    if (!cover) {
        coverEl = doc.select('#item-detail .detail-info img').first();
        if (coverEl) cover = coverEl.attr('src');
    }
    if (cover && cover.indexOf('http') !== 0) {
        if (cover.indexOf('//') === 0) cover = 'https:' + cover;
        else cover = BASE_URL + cover;
    }

    // Author
    var author = '';
    var authorEl = doc.select('.list-info .author .col-xs-8').first();
    if (!authorEl) authorEl = doc.select('.list-info li.author p.col-xs-8').first();
    if (authorEl) author = authorEl.text();

    // Description
    var description = '';
    var descEl = doc.select('.detail-content p').first();
    if (descEl) description = descEl.html();

    // Status
    var ongoing = true;
    var statusEl = doc.select('.list-info li.status .col-xs-8').first();
    if (statusEl) {
        var statusText = statusEl.text();
        ongoing = statusText.indexOf('Hoàn thành') === -1 && statusText.indexOf('Hoàn Thành') === -1;
    }

    // Detail info
    var lines = [];
    var infoItems = doc.select('.list-info li');
    for (var i = 0; i < infoItems.size(); i++) {
        var item = infoItems.get(i);
        var label = String(item.select('.name').text()).replace(/\s+/g, ' ').trim();
        var valueNode = item.select('p.col-xs-8').first();
        if (!valueNode) continue;
        var value = String(valueNode.text()).replace(/\s+/g, ' ').trim();
        if (label && value && label !== value) {
            lines.push('<b>' + label + ':</b> ' + value);
        }
    }

    var timeEl = doc.select("time.small").first();
    if (timeEl) {
        var updated = String(timeEl.text()).trim();
        if (updated) {
            lines.push('<b>Cập nhật:</b> ' + updated);
        }
    }

    var detail = lines.join('<br>');

    // Genres
    var genres = [];
    var genreEls = doc.select('.list-info li.kind .col-xs-8 a');
    for (var i = 0; i < genreEls.size(); i++) {
        var g = genreEls.get(i);
        var href = g.attr('href');
        if (href.indexOf('http') === 0) {
            href = href.replace(/^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:\/\n?]+)/i, "");
        }
        genres.push({
            title: g.text(),
            input: href,
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
