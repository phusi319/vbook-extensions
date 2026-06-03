load('config.js');

function execute(url) {
    // Normalize domain to BASE_URL
    url = url.replace(/^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:\/\n?]+)/i, BASE_URL);

    var doc = fetch(url).html();
    if (!doc) return null;

    var imgs = doc.select('.chapter_content img.lazy');
    var data = [];
    for (var i = 0; i < imgs.size(); i++) {
        var e = imgs.get(i);
        var src = e.attr('src');
        var fallbackUrl = e.attr('data-original');

        // CDN domain rewrites
        if (fallbackUrl) {
            if (fallbackUrl.indexOf('mangaqq.net') > -1 || fallbackUrl.indexOf('cdnqq.xyz') > -1) {
                fallbackUrl = fallbackUrl.replace('mangaqq.net', 'i200.truyenvua.com');
                fallbackUrl = fallbackUrl.replace('cdnqq.xyz', 'i200.truyenvua.com');
            } else if (fallbackUrl.indexOf('mangaqq.com') > -1) {
                fallbackUrl = fallbackUrl.replace('mangaqq.com', 'i216.truyenvua.com');
            } else if (fallbackUrl.indexOf('trangshop.net') > -1 || fallbackUrl.indexOf('photruyen.com') > -1 || fallbackUrl.indexOf('tintruyen.com') > -1) {
                fallbackUrl = fallbackUrl.replace('photruyen.com', 'i109.truyenvua.com');
                fallbackUrl = fallbackUrl.replace('tintruyen.com', 'i109.truyenvua.com');
                fallbackUrl = fallbackUrl.replace('trangshop.net', 'i109.truyenvua.com');
            } else if (fallbackUrl.indexOf('tintruyen.net') > -1) {
                fallbackUrl = fallbackUrl.replace('//tintruyen.net', '//i138.truyenvua.com');
                fallbackUrl = fallbackUrl.replace('//i125.tintruyen.net', '//i125.truyenvua.com');
            } else if (fallbackUrl.indexOf('qqtaku.com') > -1) {
                fallbackUrl = fallbackUrl.replace('qqtaku.com', 'i125.truyenvua.com');
            }
        }

        data.push({
            link: src,
            fallback: fallbackUrl ? [fallbackUrl] : []
        });
    }

    if (data.length === 0) return null;
    return Response.success(data);
}
