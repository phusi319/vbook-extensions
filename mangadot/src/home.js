load('config.js');
function execute() {
    return Response.success([
        {title: "Latest Updates", input: BASE_URL + "/view-all/latest-updates", script: "gen.js"},
        {title: "Popular", input: BASE_URL + "/view-all/popular", script: "gen.js"},
        {title: "New Series", input: BASE_URL + "/view-all/new-series", script: "gen.js"},
        {title: "Completed", input: BASE_URL + "/view-all/completed", script: "gen.js"},
        {title: "Action", input: BASE_URL + "/search?genres=Action", script: "gen.js"},
        {title: "Romance", input: BASE_URL + "/search?genres=Romance", script: "gen.js"},
        {title: "Fantasy", input: BASE_URL + "/search?genres=Fantasy", script: "gen.js"},
        {title: "Comedy", input: BASE_URL + "/search?genres=Comedy", script: "gen.js"},
        {title: "Adventure", input: BASE_URL + "/search?genres=Adventure", script: "gen.js"}
    ]);
}
