load('config.js');

function execute(url) {
    var storyArcs = {
        "rgb": "CHƯƠNG 001>040 - RED GREEN BLUE",
        "yel": "CHƯƠNG 041>090 - YELLOW",
        "gsc": "CHƯƠNG 091>180 - GOLD SILVER CRYSTAL",
        "rs":  "CHƯƠNG 181>267 - RUBY SAPPHIRE",
        "frlg":"CHƯƠNG 268>302 - FIRE RED LEAF GREEN",
        "rald":"CHƯƠNG 303>337 - EMERALD",
        "dp":  "CHƯƠNG 338>416 - DIAMOND PEARL",
        "pla": "CHƯƠNG 417>441 - PLATINUM",
        "hgss":"CHƯƠNG 442>460 - HEART GOLD SOUL SILVER",
        "bw":  "CHƯƠNG 461>524 - BLACK WHITE",
        "b2w2":"CHƯƠNG 525>548 - BLACK 2 WHITE 2",
        "xy":  "CHƯƠNG 549>595 - X Y",
        "oras":"CHƯƠNG 596>617 - OMEGA RUBY ALPHA SAPPHIRE",
        "sm":  "CHƯƠNG 618>654 - SUN MOON",
        "swsh":"CHƯƠNG 655>697 - SWORD SHIELD",
        "sv":  "CHƯƠNG 698>??? - SCARLET VIOLET",
        "champ":"POKÉMON FESTIVAL OF CHAMPIONS"
    };

    var defaultCover = "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEi4KF2_qBF9ST1f78iysKGiE5EKMc8r6K9aUGEDIX0INOpN6rDz1MAuRTxpXnZ0GWe5vhYY7uJN1aSiAyVXnaaCoN6M6oubnYR9069YzpLfiRpapUZIHBeyW6uqm22Kj4SFHNEmwo0OKnkbfiykT67e60QhFfMro_gn7bsIx2AFH3lXkUSHbSxVsKpmgd6O/w1200-h630-p-k-no-nu/000.jpg";
    var name = storyArcs[url] || "Pokémon Đặc Biệt";
    if (url !== 'champ' && name !== "Pokémon Đặc Biệt") {
        name = "Pokémon Đặc Biệt - " + name;
    }

    return Response.success({
        name: name,
        cover: defaultCover,
        author: "Hidenori Kusaka, Satoshi Yamamoto",
        description: "Truyện tranh " + name,
        detail: "Manga: " + name,
        host: BASE_URL,
        ongoing: true
    });
}
