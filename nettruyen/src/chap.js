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
    // Bước 1: Tải trang bằng fetchHtml (có browser fallback)
    // ==============================================================
    var doc = fetchHtml(url);
    if (!doc) return null;

    // ==============================================================
    // Bước 2: Thử lấy ảnh từ HTML trực tiếp (trang có data-original)
    // ==============================================================
    var data = [];
    var imgs = doc.select('.reading-detail .page-chapter img');
    for (var i = 0; i < imgs.size(); i++) {
        var e = imgs.get(i);
        var link = e.attr('data-original');
        if (!link || link === '') link = e.attr('src');
        if (!link || link === '') continue;
        if (link.indexOf('data:image') === 0) continue;
        if (link.indexOf('//') === 0) link = 'https:' + link;

        var src = e.attr('src');
        if (!src || src === '' || src.indexOf('data:image') === 0) src = link;
        if (src.indexOf('//') === 0) src = 'https:' + src;

        data.push({
            link: src,
            fallback: link !== src ? [link] : []
        });
    }

    if (data.length > 0) return Response.success(data);

    // ==============================================================
    // Bước 3: Không có ảnh thật → AJAX load
    // Trích xuất CHAPTER_ID từ HTML source
    // ==============================================================
    var pageText = doc.html();
    var chapterId = extractBetween(pageText, 'gOpts.chapterId', ';');
    if (!chapterId) chapterId = extractBetween(pageText, 'CHAPTER_ID', ';');

    if (chapterId) {
        // Lọc chỉ giữ lại số
        var cleanId = '';
        for (var k = 0; k < chapterId.length; k++) {
            var c = chapterId.charAt(k);
            if (c >= '0' && c <= '9') cleanId = cleanId + c;
        }
        chapterId = cleanId;
    }

    if (!chapterId || chapterId === '') return null;

    // ==============================================================
    // Bước 4: Gọi AJAX POST API lấy ảnh
    // Dùng Http.post().params({}) theo chuẩn VBook API
    // ==============================================================
    var ajaxUrl = BASE_URL + '/ajax/image/list/chap/' + chapterId;
    var ajaxHtml = '';

    // Cách 1: Http.post với params (chuẩn VBook)
    try {
        var res = Http.post(ajaxUrl).params({"cache": "0"}).string();
        if (res) {
            var json = JSON.parse(res);
            if (json && json.status && json.html) {
                ajaxHtml = json.html;
            }
        }
    } catch (e) {}

    // Cách 2: fetch() POST fallback
    if (!ajaxHtml || ajaxHtml === '') {
        try {
            var resp = fetch(ajaxUrl + '?cache=0', {method: "POST"});
            if (resp.ok) {
                var text = resp.text();
                if (text) {
                    var json2 = JSON.parse(text);
                    if (json2 && json2.status && json2.html) {
                        ajaxHtml = json2.html;
                    }
                }
            }
        } catch (e) {}
    }

    // Cách 3: Http.get fallback (một số server chấp nhận GET)
    if (!ajaxHtml || ajaxHtml === '') {
        try {
            var getRes = Http.get(ajaxUrl + '?cache=0').string();
            if (getRes) {
                var json3 = JSON.parse(getRes);
                if (json3 && json3.status && json3.html) {
                    ajaxHtml = json3.html;
                }
            }
        } catch (e) {}
    }

    if (!ajaxHtml || ajaxHtml === '') return null;

    // ==============================================================
    // Bước 5: Parse URL ảnh từ AJAX response HTML
    // ==============================================================
    data = parseImagesFromHtml(ajaxHtml);

    if (data.length > 0) return Response.success(data);
    return null;
}

// Parse URL ảnh từ HTML string bằng split (tương thích Rhino 100%)
function parseImagesFromHtml(html) {
    var data = [];
    var seen = {};

    // Tách theo data-original="URL"
    var parts = html.split('data-original="');
    for (var i = 1; i < parts.length; i++) {
        var endIdx = parts[i].indexOf('"');
        if (endIdx > 0) {
            var imgUrl = parts[i].substring(0, endIdx);
            if (imgUrl.indexOf('data:image') === 0) continue;
            // Bỏ qua ảnh quảng cáo (prntscr, imgur, v.v.)
            if (imgUrl.indexOf('prntscr.com') > -1) continue;
            if (imgUrl.indexOf('imgur.com') > -1) continue;
            if (imgUrl.indexOf('//') === 0) imgUrl = 'https:' + imgUrl;
            if (imgUrl.length > 10 && !seen[imgUrl]) {
                seen[imgUrl] = true;
                data.push({link: imgUrl, fallback: [imgUrl]});
            }
        }
    }

    // Fallback: tách theo src="URL" nếu không có data-original
    if (data.length === 0) {
        parts = html.split('page-chapter');
        for (var i = 1; i < parts.length; i++) {
            var srcIdx = parts[i].indexOf('src="');
            if (srcIdx > -1) {
                var srcStart = srcIdx + 5;
                var srcEnd = parts[i].indexOf('"', srcStart);
                if (srcEnd > srcStart) {
                    var imgUrl = parts[i].substring(srcStart, srcEnd);
                    if (imgUrl.indexOf('data:image') === 0) continue;
                    if (imgUrl.indexOf('prntscr.com') > -1) continue;
                    if (imgUrl.indexOf('imgur.com') > -1) continue;
                    if (imgUrl.indexOf('//') === 0) imgUrl = 'https:' + imgUrl;
                    if (imgUrl.length > 10 && !seen[imgUrl]) {
                        seen[imgUrl] = true;
                        data.push({link: imgUrl, fallback: [imgUrl]});
                    }
                }
            }
        }
    }

    return data;
}

// Trích xuất giá trị giữa startMarker và endMarker
function extractBetween(text, startMarker, endMarker) {
    var startIdx = text.indexOf(startMarker);
    if (startIdx === -1) return null;
    startIdx = startIdx + startMarker.length;
    var endIdx = text.indexOf(endMarker, startIdx);
    if (endIdx === -1) return null;
    return text.substring(startIdx, endIdx);
}
