load('config.js');

function execute(url) {
    var apiUrl = BASE_URL + "/feeds/posts/summary/-/" + encodeURIComponent(url) + "?max-results=1000&alt=json";
    
    try {
        var str = Http.get(apiUrl).string();
        if (!str) {
            return Response.success([{name: "Lỗi: Http.get rỗng", url: apiUrl, host: BASE_URL}]);
        }
        var res = JSON.parse(str);
        var list = [];
        
        if (res && res.feed && res.feed.entry) {
            var entries = res.feed.entry;
            // Blogger trả về mới nhất trước, VBook cần cũ nhất trước
            for (var i = entries.length - 1; i >= 0; i--) {
                var entry = entries[i];
                var title = (entry.title && entry.title.$t) ? entry.title.$t : ('Chương ' + (entries.length - i));
                var link = "";
                for (var j = 0; j < entry.link.length; j++) {
                    if (entry.link[j].rel === "alternate") {
                        link = entry.link[j].href;
                        break;
                    }
                }
                if (link) {
                    list.push({
                        name: title,
                        url: link,
                        host: BASE_URL
                    });
                }
            }
            return Response.success(list);
        } else {
            return Response.success([{name: "Lỗi: res.feed.entry trống. Nội dung: " + str.substring(0, 50), url: apiUrl, host: BASE_URL}]);
        }
    } catch(e) {
        return Response.success([{name: "Lỗi Catch: " + e, url: apiUrl, host: BASE_URL}]);
    }
}
