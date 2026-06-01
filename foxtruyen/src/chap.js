load('config.js');

function execute(url) {
    let response = fetch(url);
    if (response.ok) {
        let doc = response.html();

        let images = [];
        doc.select(".content_detail_manga img, .content_detail img").forEach(function(e) {
            let src = e.attr("src");
            if (!src || src.length === 0) {
                src = e.attr("data-src");
            }
            if (src && src.length > 0
                && src.indexOf("loading.jpg") === -1
                && src.indexOf("pixel") === -1
                && src.indexOf("1x1") === -1
                && src.indexOf("banner") === -1
                && src.indexOf("data-cl-spot") === -1) {
                if (src.indexOf("hinhgg.com") !== -1) {
                    images.push(src);
                }
            }
        });

        if (images.length > 0) {
            let content = "";
            images.forEach(function(img) {
                content += '<img src="' + img + '">\n';
            });
            return Response.success(content);
        }

        let article = doc.select(".content_detail, .box_content, article").first();
        if (article) {
            let txt = article.html();
            txt = txt.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "");
            txt = txt.replace(/<ins[^>]*>[\s\S]*?<\/ins>/gi, "");
            txt = txt.replace(/<div[^>]*data-cl-spot[^>]*>[\s\S]*?<\/div>/gi, "");
            return Response.success(txt);
        }

        return null;
    }
    return null;
}
