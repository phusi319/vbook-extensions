load('config.js');
load('image_decode.js');

function execute(url) {
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
        var drmData = [];
        var pages = json.data.pages;
        
        pages.forEach(item => {
            drmData.push(item.drm_data.replace(/\n/g, ""));
        });
        
        var decryptData = JSON.parse(imageDecode(JSON.stringify(drmData)));

        for (var i = 0; i < pages.length; i++) {
            images.push({
                link: pages[i].image_url + " " + JSON.stringify(decryptData[i]),
                script: "image.js"
            });
        }
        return Response.success(images);
    }

    return null;
}
