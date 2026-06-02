load('config.js');

/**
 * toc.js — Return flat chapter list.
 * Uses fetch() for API call (bypass CF).
 */
function execute(url) {
    var requestUrl = url;
    if (url.indexOf('http') !== 0) {
        requestUrl = BASE_URL + url;
    }

    var mangaId = '';
    var idMatch = requestUrl.match(/\/manga\/(\d+)/);
    if (idMatch) mangaId = idMatch[1];

    if (!mangaId) return null;

    var data = [];
    var apiUrl = BASE_URL + '/api/manga/' + mangaId + '/chapters/list';

    try {
        var resp = fetch(apiUrl);
        if (resp.ok) {
            var chapList = resp.json();
            if (chapList && chapList.length) {
                for (var i = 0; i < chapList.length; i++) {
                    var ch = chapList[i];
                    var chapNum = ch.chapter_number;
                    var chapTitle = ch.chapter_title || '';
                    var chapId = ch.id;
                    var groupName = ch.group_name || ch.scanlator_name || '';

                    var chapName = 'Ch. ' + chapNum;
                    if (chapTitle && chapTitle.indexOf('Chapter') !== 0 && chapTitle.indexOf('Episode') !== 0) {
                        chapName = chapName + ' - ' + chapTitle;
                    }
                    if (groupName && String(groupName) !== 'null') {
                        chapName = chapName + ' [' + groupName + ']';
                    }

                    var sourceParam = ch.source ? '?source=' + ch.source : '';

                    data.push({
                        name: String(chapName),
                        url: BASE_URL + '/chapter/' + chapId + sourceParam,
                        host: BASE_URL
                    });
                }
            }
        }
    } catch (e) {}

    if (data.length === 0) return null;

    return Response.success(data);
}
