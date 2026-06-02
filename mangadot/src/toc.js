function execute(url) {
    var BASE_URL = 'https://mangadot.net';
    var requestUrl = url.replace(/\/$/, "");
    
    // Extract Manga ID: /manga/351 -> 351
    var mangaIdMatch = requestUrl.match(/\/manga\/(\d+)/);
    var mangaId = mangaIdMatch ? mangaIdMatch[1] : '';

    var chapters = [];

    if (mangaId) {
        var apiChapUrl = BASE_URL + '/api/manga/' + mangaId + '/chapters/list';
        var chapJson = Http.get(apiChapUrl).string();
        if (chapJson) {
            try {
                var list = JSON.parse(chapJson);
                if (Array.isArray(list)) {
                    for (var i = 0; i < list.length; i++) {
                        var ch = list[i];
                        
                        var chapName = '';
                        if (ch.chapter_number != null) {
                            chapName = 'Chapter ' + ch.chapter_number;
                        } else {
                            chapName = 'Chapter ' + (i + 1);
                        }
                        
                        if (ch.chapter_title && ch.chapter_title !== chapName) {
                            if (ch.chapter_title.indexOf('Chapter') > -1 || ch.chapter_title.indexOf('Ch.') > -1) {
                                chapName = ch.chapter_title;
                            } else {
                                chapName += ' - ' + ch.chapter_title;
                            }
                        }
                        
                        var chUrl = BASE_URL + '/chapter/' + ch.id + (ch.source ? '?source=' + ch.source : '');
                        chapters.push({
                            name: chapName,
                            url: chUrl,
                            host: BASE_URL
                        });
                    }
                }
            } catch(e) {}
        }
    }

    return Response.success(chapters.reverse());
}
