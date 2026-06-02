load('config.js');

/**
 * toc.js — Return flat chapter list from API.
 * Uses /api/manga/{id}/chapters/list for clean JSON data.
 *
 * @param {string} url - Manga page URL like https://mangadot.net/manga/351
 */
function execute(url) {
    var requestUrl = url;
    if (url.indexOf('http') !== 0) {
        requestUrl = BASE_URL + url;
    }

    // Extract manga ID from URL
    var mangaId = '';
    var idMatch = requestUrl.match(/\/manga\/(\d+)/);
    if (idMatch) {
        mangaId = idMatch[1];
    }

    var data = [];

    if (mangaId) {
        try {
            var resp = fetch(BASE_URL + '/api/manga/' + mangaId + '/chapters/list');
            if (resp.ok) {
                var chapList = resp.json();
                if (chapList && Array.isArray(chapList)) {
                    for (var i = 0; i < chapList.length; i++) {
                        var ch = chapList[i];
                        var chapNum = ch.chapter_number;
                        var chapTitle = ch.chapter_title || '';
                        var chapId = ch.id;
                        var groupName = ch.group_name || ch.scanlator_name || '';

                        // Build chapter display name
                        var chapName = 'Ch. ' + chapNum;
                        if (chapTitle && chapTitle.indexOf('Chapter') !== 0 && chapTitle.indexOf('Episode') !== 0) {
                            chapName = chapName + ' - ' + chapTitle;
                        }
                        if (groupName && groupName !== 'null') {
                            chapName = chapName + ' [' + groupName + ']';
                        }

                        data.push({
                            name: chapName,
                            url: BASE_URL + '/chapter/' + chapId,
                            host: BASE_URL
                        });
                    }
                }
            }
        } catch (e) {
            // API failed
        }
    }

    return Response.success(data);
}
