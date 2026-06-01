load('config.js');
function execute(url) {
    var doc = Http.get(url).html();
    var el = doc.select('img.object-cover'); // Depending on chapter HTML structure
    var data = [];
    
    // We might need to inspect chapter.html to be sure
    // Let's grab all images that have data-src or src and look like manga pages
    var imgs = doc.select('img');
    for (var i = 0; i < imgs.size(); i++) {
        var e = imgs.get(i);
        var src = e.attr('data-src') || e.attr('src');
        if (src && (src.indexOf('uploads') !== -1 || src.indexOf('mangadex') !== -1)) {
            data.push(src);
        }
    }
    
    return Response.success(data);
}
