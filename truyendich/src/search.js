load('config.js');

function execute(key, page) {
    if (!page) page = '1';

    var apiUrl = BASE_URL + "/api/novels/search?q=" + encodeURIComponent(key) + "&page=" + page;
    var response = fetch(apiUrl);

    if (response.ok) {
        var json = response.json();
        var items = json.items;

        if (items && items.length > 0) {
            var data = [];
            for (var i = 0; i < items.length; i++) {
                var item = items[i];
                var cover = item.image_url;
                if (cover && cover.indexOf('http') !== 0) cover = BASE_URL + cover;
                
                var desc = "";
                if (item.author) desc += item.author;
                if (item.latest_chapter_number) desc += (desc ? ' - ' : '') + "Chương " + item.latest_chapter_number;

                data.push({
                    name: item.title,
                    link: BASE_URL + "/doc-truyen/" + item.slug,
                    cover: cover,
                    description: desc,
                    host: BASE_URL
                });
            }

            var next = "";
            var totalPages = Math.ceil(json.total / json.size);
            if (parseInt(page) < totalPages) {
                next = (parseInt(page) + 1) + "";
            }

            return Response.success(data, next);
        }
    }
    
    return null;
}
