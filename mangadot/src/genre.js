load('config.js');
function execute() {
    return Response.success([
        {title: "Action", input: BASE_URL + "/search?search=Action", script: "gen.js"},
        {title: "Adventure", input: BASE_URL + "/search?search=Adventure", script: "gen.js"},
        {title: "Comedy", input: BASE_URL + "/search?search=Comedy", script: "gen.js"},
        {title: "Drama", input: BASE_URL + "/search?search=Drama", script: "gen.js"},
        {title: "Fantasy", input: BASE_URL + "/search?search=Fantasy", script: "gen.js"},
        {title: "Harem", input: BASE_URL + "/search?search=Harem", script: "gen.js"},
        {title: "Historical", input: BASE_URL + "/search?search=Historical", script: "gen.js"},
        {title: "Horror", input: BASE_URL + "/search?search=Horror", script: "gen.js"},
        {title: "Isekai", input: BASE_URL + "/search?search=Isekai", script: "gen.js"},
        {title: "Martial Arts", input: BASE_URL + "/search?search=Martial+Arts", script: "gen.js"},
        {title: "Mystery", input: BASE_URL + "/search?search=Mystery", script: "gen.js"},
        {title: "Psychological", input: BASE_URL + "/search?search=Psychological", script: "gen.js"},
        {title: "Romance", input: BASE_URL + "/search?search=Romance", script: "gen.js"},
        {title: "School Life", input: BASE_URL + "/search?search=School+Life", script: "gen.js"},
        {title: "Sci-Fi", input: BASE_URL + "/search?search=Sci-Fi", script: "gen.js"},
        {title: "Seinen", input: BASE_URL + "/search?search=Seinen", script: "gen.js"},
        {title: "Shounen", input: BASE_URL + "/search?search=Shounen", script: "gen.js"},
        {title: "Slice of Life", input: BASE_URL + "/search?search=Slice+of+Life", script: "gen.js"},
        {title: "Sports", input: BASE_URL + "/search?search=Sports", script: "gen.js"},
        {title: "Supernatural", input: BASE_URL + "/search?search=Supernatural", script: "gen.js"},
        {title: "Thriller", input: BASE_URL + "/search?search=Thriller", script: "gen.js"},
        {title: "Tragedy", input: BASE_URL + "/search?search=Tragedy", script: "gen.js"}
    ]);
}
