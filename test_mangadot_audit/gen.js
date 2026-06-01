function execute(url, page) {
    if (!page) page = '1';
    var doc = Http.get(url + "?page=" + page).html();
    
    var el = doc.select('a[href*="/manga/"]');
    var data = [];
    for (var i = 0; i < el.size(); i++) {
        var e = el.get(i);
        var title = e.select('.line-clamp-2').text();
        var link = e.attr('href');
        var cover = e.select('img').first().attr('src');
        if (!cover) cover = e.select('img').first().attr('data-src');
        
        if (title && link) {
            data.push({
                name: title,
                link: link,
                cover: cover,
                description: e.select('.absolute.bottom-1\\.5.right-1\\.5').text()
            });
        }
    }
    
    var next = parseInt(page) + 1;
    return Response.success(data, next.toString());
}
