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

    // Bước 1: Tải trang bằng fetchHtml (có browser fallback cho Cloudflare)
    var doc = fetchHtml(url);
    if (!doc) return null;

    // Bước 2: Thử lấy ảnh từ HTML (cách cũ — hoạt động tốt cho nhiều truyện)
    var data = [];
    var imgs = doc.select('.reading-detail .page-chapter img');
    for (var i = 0; i < imgs.size(); i++) {
        var e = imgs.get(i);
        var link = e.attr('data-original');
        if (!link || link === '') link = e.attr('src');
        if (!link || link === '') continue;
        // Bỏ qua ảnh placeholder base64
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

    // Nếu đã có ảnh thật → trả về luôn
    if (data.length > 0) return Response.success(data);

    // Bước 3: Không có ảnh → trang dùng AJAX load.
    // Lấy chapterId từ HTML
    var pageText = doc.html();
    var chapterId = extractBetween(pageText, 'gOpts.chapterId = ', ';');
    if (!chapterId) chapterId = extractBetween(pageText, 'CHAPTER_ID = ', ';');
    if (!chapterId) chapterId = extractBetween(pageText, 'CHAPTER_ID=', ';');

    if (chapterId) {
        chapterId = chapterId.replace(/[^0-9]/g, '');

        // Thử gọi AJAX endpoint đơn giản trước
        var ajaxData = postAjax(BASE_URL + '/ajax/image/list/chap/' + chapterId + '?cache=0');

        // Nếu không được, thử với tham số fell
        if (!ajaxData || !ajaxData.html) {
            var tnt = extractBetween(pageText, 'TNT = "', '"');
            if (!tnt) tnt = extractBetween(pageText, "TNT=\"", '"');
            if (tnt) {
                ajaxData = postAjax(BASE_URL + '/ajax/image/list/chap/' + chapterId + '?fell=123' + tnt);
            }
        }

        if (ajaxData && ajaxData.status && ajaxData.html) {
            data = parseImagesFromHtml(ajaxData.html);
        }
    }

    if (data.length > 0) return Response.success(data);
    return null;
}

// Trích xuất chuỗi giữa 2 marker (thay regex, tương thích Rhino 100%)
function extractBetween(text, startMarker, endMarker) {
    var startIdx = text.indexOf(startMarker);
    if (startIdx === -1) return null;
    startIdx = startIdx + startMarker.length;
    var endIdx = text.indexOf(endMarker, startIdx);
    if (endIdx === -1) return null;
    var result = text.substring(startIdx, endIdx);
    // Trim khoảng trắng
    while (result.charAt(0) === ' ') result = result.substring(1);
    while (result.charAt(result.length - 1) === ' ') result = result.substring(0, result.length - 1);
    return result;
}

// Gọi POST AJAX (thử fetch trước, fallback Http.post)
function postAjax(url) {
    try {
        var resp = fetch(url, {method: "POST"});
        if (resp.ok) {
            var text = resp.text();
            if (text) return JSON.parse(text);
        }
    } catch (e) {}
    try {
        var res = Http.post(url).string();
        if (res) return JSON.parse(res);
    } catch (e) {}
    return null;
}

// Parse URL ảnh từ HTML string bằng split (không dùng regex exec, tương thích Rhino)
function parseImagesFromHtml(html) {
    var data = [];
    var seen = {};

    // Ưu tiên data-original
    var parts = html.split('data-original="');
    for (var i = 1; i < parts.length; i++) {
        var endIdx = parts[i].indexOf('"');
        if (endIdx > 0) {
            var imgUrl = parts[i].substring(0, endIdx);
            if (imgUrl.indexOf('data:image') === 0) continue;
            if (imgUrl.indexOf('//') === 0) imgUrl = 'https:' + imgUrl;
            if (imgUrl.length > 10 && !seen[imgUrl]) {
                seen[imgUrl] = true;
                data.push({link: imgUrl, fallback: [imgUrl]});
            }
        }
    }

    // Fallback: src nếu không có data-original
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
