load('config.js');

function execute(url, page) {
    if (!page) page = '1';
    var pageNum = parseInt(page);

    var requestUrl = url;
    if (requestUrl.indexOf('page=') >= 0) {
        requestUrl = requestUrl.replace(/page=\d+/, 'page=' + pageNum);
    } else {
        requestUrl += (requestUrl.indexOf('?') >= 0 ? '&' : '?') + 'page=' + pageNum;
    }

    var json = fetchApi(requestUrl);
    if (json && json.data) {
        var novels = [];
        var items = Array.isArray(json.data) ? json.data : [];

        items.forEach(function(item) {
            novels.push(mapManga(item));
        });

        var next = '';
        if (json.meta && json.meta.pagination) {
            var pag = json.meta.pagination;
            if (pag.page < pag.totalPages) {
                next = (pag.page + 1).toString();
            }
        }

        return Response.success(novels, next);
    }
    return null;
}
