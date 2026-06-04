load('config.js');

function execute(url) {
    // Parse manga ID from URL
    var mangaId = "";
    var match = url.match(/\/manga\/(\d+)-/);
    if (match) {
        mangaId = match[1];
    } else {
        match = url.match(/\/manga\/(\d+)/);
        if (match) mangaId = match[1];
    }
    
    if (!mangaId) return null;
    
    var requestPath = "/manga/" + mangaId + "?include=stats,genres,groups";
    var data = fetchApi(requestPath);
    
    if (data && data.success && data.data) {
        var item = data.data;
        var coverUrl = item.coverUrl || (item.cover ? "https://u.truyen.moe/uploads/covers/" + item.cover : "");
        
        var genres = [];
        if (item.genres) {
            item.genres.forEach(function(g) {
                genres.push({
                    title: g.name,
                    input: "/manga?genre=" + g.id + "&sort=updated_at",
                    script: "gen.js"
                });
            });
        }
        
        var detailInfo = "";
        if (item.author) detailInfo += "Tác giả: " + item.author + "<br>";
        if (item.groupName) detailInfo += "Nhóm dịch: " + item.groupName + "<br>";
        if (item.stats) {
            if (item.stats.totalViews) detailInfo += "Lượt xem: " + item.stats.totalViews + "<br>";
            if (item.stats.bookmarkCount) detailInfo += "Theo dõi: " + item.stats.bookmarkCount + "<br>";
        }
        if (item.updatedAt) {
            var d = new Date(item.updatedAt);
            var dateStr = ("0" + d.getDate()).slice(-2) + "/" + ("0" + (d.getMonth() + 1)).slice(-2) + "/" + d.getFullYear();
            detailInfo += "Cập nhật: " + dateStr;
        }
        
        var ongoing = item.status !== 'completed';
        
        return Response.success({
            name: item.title,
            cover: coverUrl,
            author: item.author || "Đang cập nhật",
            description: item.description || "",
            detail: detailInfo,
            ongoing: ongoing,
            host: BASE_URL,
            genres: genres
        });
    }
    
    return null;
}
