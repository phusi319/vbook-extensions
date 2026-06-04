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

    // ==============================================================
    // NetTruyen load ảnh qua AJAX POST (không nhúng trong HTML tĩnh).
    // HTML tĩnh chỉ có placeholder base64 gif.
    //
    // Chiến lược:
    //   1. AJAX API: Lấy CHAPTER_ID + TNT từ HTML → POST lấy ảnh
    //   2. Browser fallback: Headless browser chạy JS tự load ảnh
    // ==============================================================

    var data = [];

    // --- Chiến lược 1: Gọi AJAX API trực tiếp ---
    try {
        var pageHtml = Http.get(url).string();
        if (pageHtml) {
            var chapterId = '';
            var tnt = '';

            // Trích xuất CHAPTER_ID
            var cidIdx = pageHtml.indexOf('CHAPTER_ID');
            if (cidIdx > -1) {
                var cidSub = pageHtml.substring(cidIdx, cidIdx + 40);
                var cidNum = cidSub.replace(/[^0-9]/g, '');
                if (cidNum) chapterId = cidNum;
            }

            // Trích xuất TNT hash
            var tntIdx = pageHtml.indexOf('TNT');
            if (tntIdx > -1) {
                var tntSub = pageHtml.substring(tntIdx, tntIdx + 80);
                var tntStart = tntSub.indexOf('"');
                var tntEnd = tntSub.indexOf('"', tntStart + 1);
                if (tntStart > -1 && tntEnd > tntStart) {
                    tnt = tntSub.substring(tntStart + 1, tntEnd);
                }
            }

            if (chapterId && tnt) {
                // POST lấy HTML chứa ảnh
                var ajaxUrl = BASE_URL + '/ajax/image/list/chap/' + chapterId + '?fell=123' + tnt;
                var ajaxResp = null;
                try {
                    ajaxResp = Http.post(ajaxUrl).string();
                } catch (e) {}

                if (!ajaxResp) {
                    try {
                        var resp = fetch(ajaxUrl, {method: "POST"});
                        if (resp.ok) ajaxResp = resp.text();
                    } catch (e) {}
                }

                if (ajaxResp) {
                    var jsonData = JSON.parse(ajaxResp);
                    if (jsonData && jsonData.status && jsonData.html) {
                        // Parse URL ảnh từ HTML bằng regex
                        // Tìm tất cả data-original="URL" hoặc src="URL" trong .page-chapter img
                        var imgHtml = jsonData.html;

                        // Ưu tiên data-original (ảnh gốc)
                        var re = /data-original="([^"]+)"/g;
                        var match;
                        var found = {};
                        while ((match = re.exec(imgHtml)) !== null) {
                            var imgUrl = match[1];
                            if (imgUrl.indexOf('data:image') === 0) continue;
                            if (imgUrl.indexOf('//') === 0) imgUrl = 'https:' + imgUrl;
                            if (!found[imgUrl]) {
                                found[imgUrl] = true;
                                data.push({
                                    link: imgUrl,
                                    fallback: [imgUrl]
                                });
                            }
                        }

                        // Nếu không có data-original, thử src
                        if (data.length === 0) {
                            var reSrc = /page-chapter[^>]*>[\s\S]*?<img[^>]+src="([^"]+)"/g;
                            while ((match = reSrc.exec(imgHtml)) !== null) {
                                var imgUrl = match[1];
                                if (imgUrl.indexOf('data:image') === 0) continue;
                                if (imgUrl.indexOf('//') === 0) imgUrl = 'https:' + imgUrl;
                                if (!found[imgUrl]) {
                                    found[imgUrl] = true;
                                    data.push({
                                        link: imgUrl,
                                        fallback: [imgUrl]
                                    });
                                }
                            }
                        }
                    }
                }
            }
        }
    } catch (e) {}

    // --- Chiến lược 2: Browser fallback ---
    if (data.length === 0) {
        try {
            var browser = Engine.newBrowser();
            var browserDoc = browser.launch(url, 8000);
            browser.close();

            if (browserDoc) {
                var imgs = browserDoc.select('.page-chapter img');
                for (var i = 0; i < imgs.size(); i++) {
                    var e = imgs.get(i);
                    var src = e.attr('data-original');
                    if (!src || src === '') src = e.attr('src');
                    if (!src || src === '') continue;
                    if (src.indexOf('data:image') === 0) continue;
                    if (src.indexOf('//') === 0) src = 'https:' + src;

                    data.push({
                        link: src,
                        fallback: [src]
                    });
                }
            }
        } catch (e) {}
    }

    if (data.length === 0) return null;
    return Response.success(data);
}
