load('config.js');

/**
 * chap.js — Extract chapter images.
 * Uses the REST API /api/uploads/{id}/images
 *
 * @param {string} url - Chapter URL like https://mangadot.net/chapter/57963
 */
function execute(url) {
    var requestUrl = url;
    if (url.indexOf('http') !== 0) {
        requestUrl = BASE_URL + url;
    }

    var chapterId = '';
    var source = '';
    var idMatch = requestUrl.match(/\/chapter\/(\d+)/);
    if (idMatch) {
        chapterId = idMatch[1];
    } else {
        // Handle URLs with query params if any
        var parts = requestUrl.split('?')[0].split('/');
        chapterId = parts[parts.length - 1];
    }

    var sourceMatch = requestUrl.match(/[\?&]source=([^&]+)/);
    if (sourceMatch) {
        source = sourceMatch[1];
    }

    var data = [];

    if (chapterId) {
        try {
            var apiUrl = '';
            if (source === 'user') {
                apiUrl = BASE_URL + '/api/uploads/' + chapterId + '/images';
            } else {
                apiUrl = BASE_URL + '/api/chapters/' + chapterId + '/images';
            }
            
            var resp = fetch(apiUrl);
            
            if (resp.ok) {
                var json = resp.json();
                if (json && json.images && Array.isArray(json.images)) {
                    for (var i = 0; i < json.images.length; i++) {
                        var imgObj = json.images[i];
                        var imgSrc = imgObj.url;
                        if (imgSrc) {
                            if (imgSrc.indexOf('http') !== 0) {
                                imgSrc = BASE_URL + imgSrc;
                            }
                            data.push(imgSrc);
                        }
                    }
                }
            }
        } catch (e) {
            // API failed
        }
    }

    return Response.success(data);
}
