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

    // Bước 1: Tải trang HTML
    var doc = fetchHtml(url);
    if (!doc) return null;

    // Bước 2: Lấy CHAPTER_ID
    // Cách A: Từ <option selected data-id="...">
    var chapterId = '';
    try {
        var selectedOpt = doc.select('option[selected]');
        if (selectedOpt.size() > 0) {
            chapterId = selectedOpt.first().attr('data-id');
        }
    } catch (e) {}

    // Cách B: Từ JavaScript trong HTML (gOpts.chapterId hoặc CHAPTER_ID)
    if (!chapterId || chapterId === '') {
        try {
            var scripts = doc.select('script');
            for (var i = 0; i < scripts.size(); i++) {
                var scriptText = scripts.get(i).html();
                if (scriptText.indexOf('CHAPTER_ID') > -1) {
                    var cidStr = extractBetween(scriptText, 'CHAPTER_ID', ';');
                    if (cidStr) {
                        chapterId = keepDigits(cidStr);
                        break;
                    }
                }
            }
        } catch (e) {}
    }

    // Bước 3: Nếu có CHAPTER_ID → gọi AJAX API (luôn ưu tiên, ảnh sạch nhất)
    if (chapterId && chapterId !== '') {
        var ajaxUrl = BASE_URL + '/ajax/image/list/chap/' + chapterId + '?cache=0';
        var ajaxImages = tryAjaxGetImages(ajaxUrl);
        if (ajaxImages && ajaxImages.length > 0) {
            return Response.success(ajaxImages);
        }
    }

    // Bước 4: Fallback — parse ảnh từ HTML tĩnh (lọc quảng cáo)
    var data = [];
    var imgs = doc.select('.reading-detail .page-chapter img');
    for (var i = 0; i < imgs.size(); i++) {
        var e = imgs.get(i);
        var link = e.attr('data-original');
        if (!link || link === '') link = e.attr('data-src');
        if (!link || link === '') link = e.attr('src');
        if (!link || link === '') continue;
        if (link.indexOf('data:image') === 0) continue;
        if (isAdUrl(link)) continue;
        if (link.indexOf('//') === 0) link = 'https:' + link;

        data.push({link: link, fallback: [link]});
    }

    if (data.length > 0) return Response.success(data);
    return null;
}

// Gọi AJAX API bằng Http.get (đã xác nhận server chấp nhận GET)
function tryAjaxGetImages(ajaxUrl) {
    var jsonText = '';

    // Cách 1: Http.get().string() — chuẩn VBook
    try {
        jsonText = Http.get(ajaxUrl).string();
    } catch (e) {}

    // Cách 2: fetch() — fallback
    if (!jsonText || jsonText === '') {
        try {
            var resp = fetch(ajaxUrl);
            if (resp.ok) jsonText = resp.text();
        } catch (e) {}
    }

    if (!jsonText || jsonText === '') return null;

    try {
        var json = JSON.parse(jsonText);
        if (!json || !json.status || !json.html) return null;
        return parseImagesFromHtml(json.html);
    } catch (e) {}

    return null;
}

// Parse URL ảnh từ HTML string (dùng split, tương thích Rhino 100%)
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
            if (isAdUrl(imgUrl)) continue;
            if (imgUrl.indexOf('//') === 0) imgUrl = 'https:' + imgUrl;
            if (imgUrl.length > 10 && !seen[imgUrl]) {
                seen[imgUrl] = true;
                data.push({link: imgUrl, fallback: [imgUrl]});
            }
        }
    }

    return data;
}

// Lọc URL quảng cáo
function isAdUrl(url) {
    if (url.indexOf('prntscr.com') > -1) return true;
    if (url.indexOf('imgur.com') > -1) return true;
    if (url.indexOf('/uploads/tmp/') > -1) return true;
    if (url.indexOf('x.gd') > -1) return true;
    return false;
}

// Giữ lại chỉ chữ số (tương thích Rhino, không dùng regex)
function keepDigits(str) {
    var result = '';
    for (var i = 0; i < str.length; i++) {
        var c = str.charAt(i);
        if (c >= '0' && c <= '9') result = result + c;
    }
    return result;
}

// Trích xuất chuỗi giữa 2 marker
function extractBetween(text, startMarker, endMarker) {
    var startIdx = text.indexOf(startMarker);
    if (startIdx === -1) return null;
    startIdx = startIdx + startMarker.length;
    var endIdx = text.indexOf(endMarker, startIdx);
    if (endIdx === -1) return null;
    return text.substring(startIdx, endIdx);
}
