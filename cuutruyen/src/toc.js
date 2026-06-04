load('config.js');

function execute(url) {
    var match = /mangas\/(\d+)\/?/.exec(url);
    if (!match) return null;
    var chapterId = match[1];

    var chapters = [];
    var page = 1;
    
    // Fetch all pages of chapters
    while (true) {
        var json = fetchApi(API_URL + "/mangas/" + chapterId + "/chapters?page=" + page + "&per_page=100");
        if (!json || !json.data || json.data.length === 0) break;
        
        json.data.forEach(item => {
            var chapterName = "Chapter " + item.number;
            if (item.name) {
                chapterName += " - " + item.name;
            }
            
            chapters.push({
                name: chapterName,
                url: API_URL + "/chapters/" + item.id,
                host: BASE_URL
            });
        });
        
        var metadata = json._metadata;
        if (metadata && metadata.current_page < metadata.total_pages) {
            page++;
        } else {
            break;
        }
    }

    // CuuTruyen API usually returns chapters sorted from newest to oldest or oldest to newest.
    // vBook expects oldest first (Chapter 1 -> Chapter N). 
    // If the first chapter has a higher number than the last, reverse it.
    if (chapters.length > 1) {
        var firstMatch = chapters[0].name.match(/Chapter ([\d\.]+)/);
        var lastMatch = chapters[chapters.length - 1].name.match(/Chapter ([\d\.]+)/);
        if (firstMatch && lastMatch) {
            var firstNum = parseFloat(firstMatch[1]);
            var lastNum = parseFloat(lastMatch[1]);
            if (firstNum > lastNum) {
                chapters.reverse();
            }
        }
    }

    if (chapters.length > 0) {
        return Response.success(chapters);
    }

    return null;
}
