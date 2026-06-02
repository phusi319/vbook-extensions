load('config.js');
function execute(url) {
    var requestUrl = url;
    if (url.indexOf('http') !== 0) {
        requestUrl = BASE_URL + url;
    }
    var doc = Http.get(requestUrl).html();

    var chapLinks = doc.select('a.relative.block[href^=/chapter/]');
    var data = [];
    var seen = {};

    for (var i = 0; i < chapLinks.size(); i++) {
        var chapEl = chapLinks.get(i);
        var chapHref = chapEl.attr('href');

        // Remove query params
        var cleanHref = chapHref;
        var qIdx = chapHref.indexOf('?');
        if (qIdx !== -1) {
            cleanHref = chapHref.substring(0, qIdx);
        }

        if (seen[cleanHref]) continue;
        seen[cleanHref] = true;

        // Chapter number
        var chapName = '';
        var chapMonos = chapEl.select('span.font-mono');
        for (var m = 0; m < chapMonos.size(); m++) {
            var monoText = chapMonos.get(m).text().trim();
            if (monoText.indexOf('Ch') > -1) {
                chapName = monoText;
                break;
            }
        }

        // Chapter title
        var chapTitle = '';
        var titleEl = chapEl.select('span.font-medium').first();
        if (titleEl) {
            chapTitle = titleEl.text().trim();
        }

        if (chapName && chapTitle) {
            chapName = chapName + ' - ' + chapTitle;
        } else if (!chapName && chapTitle) {
            chapName = chapTitle;
        } else if (!chapName) {
            chapName = 'Chapter ' + (i + 1);
        }

        // Group
        var groupName = '';
        var groupEl = chapEl.select('a[href^=/group/]').first();
        if (groupEl) {
            groupName = groupEl.text().trim();
        }
        if (groupName) {
            chapName = chapName + ' [' + groupName + ']';
        }

        data.push({
            name: chapName,
            url: BASE_URL + cleanHref,
            host: BASE_URL
        });
    }

    // Reverse: chương cũ nhất lên đầu
    return Response.success(data.reverse());
}
