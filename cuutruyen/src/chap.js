load('config.js');

function execute(url) {
    // url could be the API_URL directly because toc.js returns API_URL + "/chapters/" + item.id
    var requestUrl = url;
    if (url.indexOf(API_URL) === -1) {
        var match = /chapters\/(\d+)\/?/.exec(url);
        if (match) {
            requestUrl = API_URL + "/chapters/" + match[1];
        }
    }

    var json = fetchApi(requestUrl);

    if (json && json.data && json.data.pages) {
        var images = [];
        json.data.pages.forEach(item => {
            images.push(item.image_url);
        });
        return Response.success(images);
    }

    return null;
}
