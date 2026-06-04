var API_URL = "https://moe.suicaodex.com";
var BASE_URL = "https://moetruyen.net";

function fetchApi(url) {
    try {
        var res = Http.get(url).headers({
            "Origin": BASE_URL,
            "User-Agent": "Mozilla/5.0"
        });
        if (res.status() === 200) {
            return JSON.parse(res.string());
        }
    } catch (e) {}
    return null;
}

function postApi(url, body) {
    try {
        var res = Http.post(url).headers({
            "Origin": BASE_URL,
            "Content-Type": "application/json",
            "User-Agent": "Mozilla/5.0"
        }).body(JSON.stringify(body));
        if (res.status() === 200) {
            return JSON.parse(res.string());
        }
    } catch (e) {}
    return null;
}

function parseMangaId(url) {
    var match = /\/manga\/(\d+)/.exec(url);
    return match ? match[1] : null;
}

function parseChapterId(url) {
    var match = /\/chapter\/(\d+)/.exec(url);
    return match ? match[1] : null;
}

function mapManga(item) {
    return {
        name: item.title,
        link: BASE_URL + "/manga/" + item.id + "-" + item.slug,
        cover: item.coverUrl || "",
        description: item.latestChapterNumberText ? "Ch. " + item.latestChapterNumberText : "",
        host: BASE_URL
    };
}

function formatDate(isoDate) {
    if (!isoDate) return "";
    var parts = isoDate.split("T")[0].split("-");
    if (parts.length === 3) return parts[2] + "/" + parts[1] + "/" + parts[0];
    return "";
}

function statusText(status) {
    var map = {
        "ongoing": "Đang tiến hành",
        "completed": "Hoàn thành",
        "hiatus": "Tạm ngưng",
        "cancelled": "Đã hủy",
        "unknown": "Không rõ"
    };
    return map[status] || status || "Không rõ";
}
