load('config.js');
function execute(url) {
    var requestUrl = url;
    if (url.indexOf('http') !== 0) {
        requestUrl = BASE_URL + url;
    }
    var doc = Http.get(requestUrl).html();

    var data = [];

    // Chapter images: img.reader-image
    var imgs = doc.select('img.reader-image');
    for (var i = 0; i < imgs.size(); i++) {
        var e = imgs.get(i);
        var src = e.attr('src');
        if (!src || src.length === 0) {
            src = e.attr('data-src');
        }
        if (src && src.length > 0) {
            if (src.indexOf('http') !== 0) {
                src = BASE_URL + src;
            }
            data.push(src);
        }
    }

    // Fallback: div[data-page] img
    if (data.length === 0) {
        var pageImgs = doc.select('div[data-page] img');
        for (var j = 0; j < pageImgs.size(); j++) {
            var pe = pageImgs.get(j);
            var psrc = pe.attr('src');
            if (!psrc || psrc.length === 0) {
                psrc = pe.attr('data-src');
            }
            if (psrc && psrc.length > 0) {
                if (psrc.indexOf('http') !== 0) {
                    psrc = BASE_URL + psrc;
                }
                data.push(psrc);
            }
        }
    }

    return Response.success(data);
}
