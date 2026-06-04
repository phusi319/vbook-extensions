load('config.js');

function execute(url) {
    var chapterId = "";
    var match = url.match(/\/chapter\/(\d+)/);
    if (match) {
        chapterId = match[1];
    }
    if (!chapterId) return null;
    
    // 1. Get total pages for this chapter by fetching chapter info
    // But wait, there is no direct /chapters/{id} info endpoint in the API docs?
    // Let's try to fetch page-access for page 0 to see how many pages it returns, 
    // Wait, the page-access API doesn't return total pages. 
    // We can just fetch pageIndexes [0,1,2,3,4], then [5,6,7,8,9] until we get no pages or success=false
    
    var images = [];
    var chunk = 5; // maxWindow is 5
    var currentIndex = 0;
    var hasMore = true;
    
    while (hasMore) {
        var pageIndexes = [];
        for (var i = 0; i < chunk; i++) {
            pageIndexes.push(currentIndex + i);
        }
        
        var requestUrl = API_URL + "/chapters/" + chapterId + "/page-access";
        var headers = {
            'Origin': 'https://moetruyen.net',
            'User-Agent': 'Mozilla/5.0',
            'Content-Type': 'application/json'
        };
        
        var response = fetch(requestUrl, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify({ pageIndexes: pageIndexes })
        });
        
        if (response.ok) {
            var data = response.json();
            if (data && data.success && data.data && data.data.pages && data.data.pages.length > 0) {
                var pages = data.data.pages;
                for (var j = 0; j < pages.length; j++) {
                    var p = pages[j];
                    // Link format: downloadUrl [SPACE] grantJSON_string
                    images.push({
                        link: p.downloadUrl + " " + JSON.stringify(p.grant),
                        script: "image.js"
                    });
                }
                currentIndex += pages.length;
                if (pages.length < chunk) {
                    hasMore = false; // Last chunk
                }
            } else {
                hasMore = false;
            }
        } else {
            hasMore = false; // Error or end
        }
    }
    
    if (images.length > 0) {
        return Response.success(images);
    }
    
    return null;
}
