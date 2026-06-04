load('config.js');

function execute() {
    var data = fetchApi("/genres");
    if (data && data.success && data.data) {
        var results = [];
        data.data.forEach(function(item) {
            results.push({
                title: item.name,
                input: "/manga?genre=" + item.id + "&sort=updated_at",
                script: "gen.js"
            });
        });
        return Response.success(results);
    }
    return null;
}
