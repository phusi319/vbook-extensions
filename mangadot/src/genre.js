load('config.js');
function execute() {
    var genres = [
        "Action", "Adventure", "Comedy", "Drama", "Ecchi", "Fantasy",
        "Harem", "Historical", "Horror", "Isekai", "Josei", "Martial Arts",
        "Mature", "Mecha", "Mystery", "Psychological", "Romance",
        "School Life", "Sci-Fi", "Seinen", "Shoujo", "Shounen",
        "Slice of Life", "Sports", "Supernatural", "Thriller", "Tragedy",
        "Yaoi", "Yuri"
    ];

    var result = [];
    for (var i = 0; i < genres.length; i++) {
        result.push({
            title: genres[i],
            input: BASE_URL + "/search?genres=" + encodeURIComponent(genres[i]),
            script: "gen.js"
        });
    }
    return Response.success(result);
}
