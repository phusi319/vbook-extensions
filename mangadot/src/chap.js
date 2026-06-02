load('config.js');

/**
 * chap.js — Extract chapter images.
 * Strategy:
 *   1. Fetch HTML, get img.reader-image tags
 *   2. Some images have src (lazy-loaded ones), some don't (first few pages)
 *   3. Detect the URL pattern from images that DO have src, then reconstruct missing ones
 *   4. If that fails, try extracting from __reactRouterContext turbo data in script tags
 *
 * @param {string} url - Chapter URL like https://mangadot.net/chapter/57963
 */
function execute(url) {
    var requestUrl = url;
    if (url.indexOf('http') !== 0) {
        requestUrl = BASE_URL + url;
    }

    var doc = Http.get(requestUrl).html();
    var data = [];

    // Collect all reader images with their page indices
    var imgs = doc.select('img.reader-image');
    var totalPages = imgs.size();
    var imageMap = {}; // pageIndex -> src
    var patternBase = '';
    var patternExt = '';

    for (var i = 0; i < imgs.size(); i++) {
        var e = imgs.get(i);
        var src = e.attr('src');

        // Clean up retry params
        if (src) {
            var retryIdx = src.indexOf('?_retry');
            if (retryIdx > -1) {
                src = src.substring(0, retryIdx);
            }
        }

        if (src && src.length > 0 && src.indexOf('/chapters/') > -1) {
            imageMap[i] = src;

            // Extract pattern: /chapters/manga_351/chapter_1/  and extension
            if (!patternBase) {
                var lastSlash = src.lastIndexOf('/');
                if (lastSlash > -1) {
                    patternBase = src.substring(0, lastSlash + 1);
                    var lastDot = src.lastIndexOf('.');
                    if (lastDot > lastSlash) {
                        patternExt = src.substring(lastDot);
                    }
                }
            }
        } else if (src && src.length > 0) {
            // Non-chapter image (could be external), still collect it
            imageMap[i] = src;
        }
    }

    // If we found a pattern, reconstruct all pages
    if (patternBase && patternExt && totalPages > 0) {
        for (var p = 0; p < totalPages; p++) {
            var imgSrc;
            if (imageMap[p]) {
                imgSrc = imageMap[p];
            } else {
                // Reconstruct: pages are 1-indexed with zero-padding to 3 digits
                var pageNum = p + 1;
                var padded = String(pageNum);
                while (padded.length < 3) padded = '0' + padded;
                imgSrc = patternBase + padded + patternExt;
            }

            if (imgSrc.indexOf('http') !== 0) {
                imgSrc = BASE_URL + imgSrc;
            }
            data.push(imgSrc);
        }
    } else {
        // No pattern found — just collect whatever src attributes we have
        for (var q = 0; q < imgs.size(); q++) {
            var imgEl = imgs.get(q);
            var imgSrc2 = imgEl.attr('src');
            if (!imgSrc2 || imgSrc2.length === 0) {
                imgSrc2 = imgEl.attr('data-src');
            }
            if (imgSrc2 && imgSrc2.length > 0) {
                // Clean up retry params
                var retryIdx2 = imgSrc2.indexOf('?_retry');
                if (retryIdx2 > -1) {
                    imgSrc2 = imgSrc2.substring(0, retryIdx2);
                }
                if (imgSrc2.indexOf('http') !== 0) {
                    imgSrc2 = BASE_URL + imgSrc2;
                }
                data.push(imgSrc2);
            }
        }
    }

    // Fallback: try div[data-page] img
    if (data.length === 0) {
        var pageImgs = doc.select('div[data-page] img');
        for (var j = 0; j < pageImgs.size(); j++) {
            var pe = pageImgs.get(j);
            var psrc = pe.attr('src');
            if (!psrc || psrc.length === 0) {
                psrc = pe.attr('data-src');
            }
            if (psrc && psrc.length > 0) {
                var retryIdx3 = psrc.indexOf('?_retry');
                if (retryIdx3 > -1) {
                    psrc = psrc.substring(0, retryIdx3);
                }
                if (psrc.indexOf('http') !== 0) {
                    psrc = BASE_URL + psrc;
                }
                data.push(psrc);
            }
        }
    }

    // Fallback: try extracting from __reactRouterContext script
    if (data.length === 0) {
        var scripts = doc.select('script');
        for (var s = 0; s < scripts.size(); s++) {
            var scriptText = scripts.get(s).html();
            if (scriptText.indexOf('__reactRouterContext') > -1 && scriptText.indexOf('/chapters/') > -1) {
                // Extract chapter image paths using regex-like manual parsing
                var searchStr = '/chapters/';
                var pos = 0;
                while (true) {
                    var found = scriptText.indexOf(searchStr, pos);
                    if (found === -1) break;
                    // Find the end of the URL (next quote or backslash-quote)
                    var end = found;
                    while (end < scriptText.length()) {
                        var ch = scriptText.charAt(end);
                        if (ch === '"' || ch === "'" || ch === '\\') break;
                        end++;
                    }
                    var imgPath = scriptText.substring(found, end);
                    if (imgPath.length > 10) {
                        var fullUrl = BASE_URL + imgPath;
                        // Avoid duplicates
                        var isDup = false;
                        for (var dd = 0; dd < data.length; dd++) {
                            if (data[dd] === fullUrl) { isDup = true; break; }
                        }
                        if (!isDup) data.push(fullUrl);
                    }
                    pos = end + 1;
                }
                break;
            }
        }
    }

    return Response.success(data);
}
