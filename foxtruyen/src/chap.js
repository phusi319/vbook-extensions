load('config.js');

function execute(url) {
    let response = fetch(url);
    if (response.ok) {
        let doc = response.html();
        let data = [];

        // Comic/Manga: images inside .content_detail_manga or .content_detail
        let imgs = doc.select(".content_detail_manga img, .content_detail img");
        for (let i = 0; i < imgs.size(); i++) {
            let e = imgs.get(i);
            let src = e.attr("src");
            if (!src || src.length === 0) {
                src = e.attr("data-src");
            }
            // Only include actual manga images (from hinhgg.com CDN)
            if (src && src.length > 0 && src.indexOf("hinhgg.com") > -1) {
                data.push({
                    link: src,
                    fallback: []
                });
            }
        }

        if (data.length > 0) {
            return Response.success(data);
        }

        return null;
    }
    return null;
}
