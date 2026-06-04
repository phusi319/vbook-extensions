load('config.js');

function execute(key, page) {
    var requestUrl = API_URL + "/v2/search/manga?q=" + encodeURIComponent(key) + "&limit=20";
    var json = fetchApi(requestUrl);

    if (json && json.data) {
        var novels = [];
        json.data.forEach(function(item) {
            novels.push(mapManga(item));
        });
        return Response.success(novels, '');
    }
    return null;
}
