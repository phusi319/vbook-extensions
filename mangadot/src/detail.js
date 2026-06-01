load('config.js');
function execute(url) {
    var doc = Http.get(url).html();
    
    // Lấy thông tin truyện
    var name = doc.select('h1').first().text().trim();
    var cover = doc.select('img').first().attr('src');
    var author = doc.select('a[href*="/authors/"]').text() || "Unknown";
    var description = doc.select('p').first().text().trim();

    // Parse chapters theo từng source
    var sourceMap = {};
    var el = doc.select('a[href*="/chapter/"]');
    
    for (var i = 0; i < el.size(); i++) {
        var e = el.get(i);
        var text = e.text().trim();
        var href = e.attr('href');
        
        // Bỏ qua các link Start Reading
        if (!text && href && href.indexOf('start reading') === -1) {
            var desktopRow = e.nextElementSibling();
            var groupName = "Other"; // Mặc định nếu không tìm thấy tên nhóm
            
            if (desktopRow) {
                var groupEl = desktopRow.select('a[href*="/group/"]').first();
                if (groupEl) groupName = groupEl.text().trim();
                
                var mobileRow = desktopRow.nextElementSibling();
                var chapName = "";
                if (mobileRow) {
                    var nameEl = mobileRow.select('.font-mono.text-white\\/55').first();
                    if (nameEl) chapName = nameEl.text().trim();
                }
                
                if (chapName) {
                    if (!sourceMap[groupName]) {
                        sourceMap[groupName] = [];
                    }
                    
                    // Tránh trùng lặp trong cùng 1 source
                    var isDuplicate = false;
                    for (var j = 0; j < sourceMap[groupName].length; j++) {
                        if (sourceMap[groupName][j].url === href) {
                            isDuplicate = true;
                            break;
                        }
                    }
                    
                    if (!isDuplicate) {
                        sourceMap[groupName].push({
                            name: chapName,
                            url: href,
                            host: "https://mangadot.net"
                        });
                    }
                }
            }
        }
    }
    
    // Chuyển map thành mảng episodes cho vBook (dạng Tab/Server)
    var episodes = [];
    for (var group in sourceMap) {
        if (sourceMap.hasOwnProperty(group)) {
            // Đảo ngược list để chap 1 lên trên
            episodes.push({
                title: group,
                urls: sourceMap[group].reverse()
            });
        }
    }
    
    // Fallback nếu không parse được group nào (giao diện cũ)
    if (episodes.length === 0) {
        var fallbackList = [];
        for (var i = 0; i < el.size(); i++) {
            var e = el.get(i);
            var text = e.text().trim();
            if (text && text.toLowerCase().indexOf("start reading") === -1 && text.toLowerCase().indexOf("upload") === -1) {
                fallbackList.push({
                    name: text,
                    url: e.attr('href'),
                    host: "https://mangadot.net"
                });
            }
        }
        if (fallbackList.length > 0) {
            episodes.push({
                title: "All Chapters",
                urls: fallbackList.reverse()
            });
        }
    }

    return Response.success({
        name: name,
        cover: cover,
        author: author,
        description: description,
        detail: "Manga",
        host: "https://mangadot.net",
        episodes: episodes // Trả về dạng multi-server (tabs)
    });
}
