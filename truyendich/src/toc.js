load('config.js');

function execute(url) {
    var slug = url.split('/').pop();
    if (!slug) return null;

    var data = [];
    var page = 1;
    var size = 200;

    while (true) {
        var apiUrl = BASE_URL + "/api/novels/" + slug + "/chapters?page=" + page + "&size=" + size;
        var response = fetch(apiUrl);
        if (!response.ok) break;

        var json = response.json();
        var items = json.items;
        if (!items || items.length === 0) break;

        for (var i = 0; i < items.length; i++) {
            var item = items[i];
            var title = "Chương " + item.chapter_number;
            if (item.title) {
                title += ": " + item.title;
            }

            data.push({
                name: title,
                url: BASE_URL + "/api/novels/" + slug + "/chapters/" + item.chapter_number,
                host: BASE_URL
            });
        }

        if (items.length < size) {
            break;
        }
        page++;
    }

    if (data.length === 0) return null;

    return Response.success(data);
}
