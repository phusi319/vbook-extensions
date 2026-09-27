load('config.js');

function execute(url) {
    var doc = fetch(url).html();
    var els = doc.select(".post-body img");
    var data = [];
    
    for (var i = 0; i < els.size(); i++) {
        var e = els.get(i);
        var src = e.attr("data-original");
        if (!src) src = e.attr("data-src");
        if (!src) src = e.attr("src");
        
        if (src) {
            data.push(src);
        }
    }
    
    return Response.success(data);
}
