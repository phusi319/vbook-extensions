load('config.js');
function execute(url) {
    var doc = Http.get(url).html();
    var el = doc.select('a[href*="/chapter/"]');
    var data = [];
    var seen = {};
    
    for (var i = 0; i < el.size(); i++) {
        var e = el.get(i);
        var text = e.text().trim();
        var href = e.attr('href');
        
        // Cấu trúc Mangadot: Thẻ <a> bọc ngoài thường rỗng
        if (!text && href && href.indexOf('start reading') === -1) {
            // Lấy group name
            var desktopRow = e.nextElementSibling(); // Element liền kề
            var groupName = "";
            if (desktopRow) {
                var groupEl = desktopRow.select('a[href*="/group/"]').first();
                if (groupEl) groupName = groupEl.text().trim();
                
                // Tên chapter thường nằm ở row mobile bên dưới nó
                var mobileRow = desktopRow.nextElementSibling();
                var chapName = "";
                if (mobileRow) {
                    var nameEl = mobileRow.select('.font-mono.text-white\\/55').first();
                    if (nameEl) chapName = nameEl.text().trim();
                }
                
                if (chapName) {
                    var fullName = chapName;
                    if (groupName) fullName += " [" + groupName + "]";
                    
                    if (!seen[href]) {
                        seen[href] = true;
                        data.push({
                            name: fullName,
                            url: href,
                            host: "https://mangadot.net"
                        });
                    }
                }
            }
        }
    }
    
    // Nếu thuật toán trên thất bại (fallback cho các truyện ít chapter/giao diện cũ)
    if (data.length === 0) {
        for (var i = 0; i < el.size(); i++) {
            var e = el.get(i);
            var text = e.text().trim();
            if (text && text.toLowerCase().indexOf("start reading") === -1 && text.toLowerCase().indexOf("upload") === -1) {
                data.push({
                    name: text,
                    url: e.attr('href'),
                    host: "https://mangadot.net"
                });
            }
        }
    }
    
    return Response.success(data.reverse()); // Reverse để chapter 1 lên đầu
}
