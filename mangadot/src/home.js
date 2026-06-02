load('config.js');
function execute() {
    return Response.success([
        {title: "Latest Updates", input: BASE_URL + "/latest-updates", script: "gen.js"},
        {title: "Action", input: BASE_URL + "/search?search=Action", script: "gen.js"},
        {title: "Adventure", input: BASE_URL + "/search?search=Adventure", script: "gen.js"},
        {title: "Romance", input: BASE_URL + "/search?search=Romance", script: "gen.js"},
        {title: "Fantasy", input: BASE_URL + "/search?search=Fantasy", script: "gen.js"},
        {title: "Comedy", input: BASE_URL + "/search?search=Comedy", script: "gen.js"}
    ]);
}
