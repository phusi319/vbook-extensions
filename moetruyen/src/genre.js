load('config.js');

function execute() {
    var json = fetchApi(API_URL + "/v2/genres");
    if (json && json.data) {
        var genres = [];
        json.data.forEach(function(g) {
            genres.push({
                title: g.name,
                input: API_URL + "/v2/manga?genre=" + g.id + "&sort=updated_at&limit=30",
                script: "gen.js"
            });
        });
        return Response.success(genres);
    }
    return null;
}
