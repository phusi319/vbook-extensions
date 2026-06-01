load('config.js');

function execute(url) {
    var doc = fetch(url).html();
    if (doc) {
        var imgs = doc.select(".content_detail_manga img, .content_detail img");
        var data = [];
        for (var i = 0; i < imgs.size(); i++) {
            var e = imgs.get(i);
            var src = e.attr("src");
            if (!src || src.length === 0) {
                src = e.attr("data-src");
            }
            if (src && src.length > 0) {
                // Filter out non-chapter images (e.g., logo, recommended manga covers)
                if (src.indexOf("/ebook/") === -1 && src.indexOf("logo") === -1) {
                    data.push({
                        link: src,
                        fallback: [src]
                    });
                }
            }
        }
        if (data.length > 0) {
            return Response.success(data);
        }
    }
    return null;
}
