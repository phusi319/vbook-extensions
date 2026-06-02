load('config.js');

function execute(url) {
    var requestUrl = url;
    if (url.indexOf('http') !== 0) {
        requestUrl = BASE_URL + url;
    }

    var doc = Http.get(requestUrl).html();
    if (doc) {
        var name = '';
        var cover = '';
        var author = '';
        var description = '';
        var ongoing = true;
        var detail = '';

        // Title
        var h1 = doc.select('h1').first();
        if (h1) name = h1.text().trim();

        // Cover image
        var imgs = doc.select('img');
        for (var i = 0; i < imgs.size(); i++) {
            var src = imgs.get(i).attr('src');
            if (src && src.indexOf('/uploads/') > -1) {
                cover = src;
                break;
            }
        }
        if (cover && cover.indexOf('http') !== 0) cover = BASE_URL + cover;

        // Description
        var descEl = doc.select('.line-clamp-6').first();
        if (!descEl) descEl = doc.select('p').first();
        if (descEl) description = descEl.text().trim();

        // Detail info
        if (name) detail = name;

        if (!name) return null;

        return Response.success({
            name: name,
            cover: cover,
            author: author,
            description: description,
            detail: detail,
            host: BASE_URL,
            ongoing: ongoing
        });
    }

    return null;
}
