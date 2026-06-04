load('config.js');

function execute() {
    var tags = [
        "có màu", "manga", "manhua", "manhwa", "oneshot", "webtoon",
        "comedy", "romance", "drama", "slice of life", "hài hước",
        "đời thường", "fantasy", "romcom", "lãng mạn", "học đường",
        "school life", "hành động", "shounen", "action", "siêu nhiên",
        "supernatural", "seinen", "tâm lý", "ecchi", "phiêu lưu",
        "bí ẩn", "adventure", "psychological", "yuri", "bi kịch"
    ];
    
    var res = [];
    for (var i = 0; i < tags.length; i++) {
        var tag = tags[i];
        res.push({
            title: tag.charAt(0).toUpperCase() + tag.slice(1),
            input: API_URL + "/mangas/search?tags=\"" + tag + "\"",
            script: "gen.js"
        });
    }
    
    return Response.success(res);
}
