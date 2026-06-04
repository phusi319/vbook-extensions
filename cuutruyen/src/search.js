load('config.js');

function execute(key, page) {
    if (!page) page = '1';
    
    var requestUrl = API_URL + "/mangas/quick_search?q=" + key;
    var json = fetchApi(requestUrl);

    if (json && json.data) {
        var metadata = json._metadata;
        var next = '';
        if (metadata && metadata.current_page < metadata.total_pages) {
            next = (metadata.current_page + 1).toString();
        }

        var novels = [];
        json.data.forEach(item => {
            novels.push({
                name: item.name,
                link: BASE_URL + "/mangas/" + item.id,
                cover: item.cover_url,
                description: item.newest_chapter_number ? "Chapter " + item.newest_chapter_number : "",
                host: BASE_URL
            });
        });

        return Response.success(novels, next);
    }

    return null;
}
