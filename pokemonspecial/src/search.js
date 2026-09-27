load('config.js');

function execute(key, page) {
    if (!page) page = '1';
    if (page !== '1') return Response.success([]);

    var storyArcs = {
        main: [
            {value:"rgb", text:"CHƯƠNG 001>040 - RED GREEN BLUE"},
            {value:"yel", text:"CHƯƠNG 041>090 - YELLOW"},
            {value:"gsc", text:"CHƯƠNG 091>180 - GOLD SILVER CRYSTAL"},
            {value:"rs",  text:"CHƯƠNG 181>267 - RUBY SAPPHIRE"},
            {value:"frlg",text:"CHƯƠNG 268>302 - FIRE RED LEAF GREEN"},
            {value:"rald",text:"CHƯƠNG 303>337 - EMERALD"},
            {value:"dp",  text:"CHƯƠNG 338>416 - DIAMOND PEARL"},
            {value:"pla", text:"CHƯƠNG 417>441 - PLATINUM"},
            {value:"hgss",text:"CHƯƠNG 442>460 - HEART GOLD SOUL SILVER"},
            {value:"bw",  text:"CHƯƠNG 461>524 - BLACK WHITE"},
            {value:"b2w2",text:"CHƯƠNG 525>548 - BLACK 2 WHITE 2"},
            {value:"xy",  text:"CHƯƠNG 549>595 - X Y"},
            {value:"oras",text:"CHƯƠNG 596>617 - OMEGA RUBY ALPHA SAPPHIRE"},
            {value:"sm",  text:"CHƯƠNG 618>654 - SUN MOON"},
            {value:"swsh",text:"CHƯƠNG 655>697 - SWORD SHIELD"},
            {value:"sv",  text:"CHƯƠNG 698>??? - SCARLET VIOLET"}
        ],
        champ: [
            {value:"champ",text:"POKÉMON FESTIVAL OF CHAMPIONS"}
        ]
    };

    var defaultCover = "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEi4KF2_qBF9ST1f78iysKGiE5EKMc8r6K9aUGEDIX0INOpN6rDz1MAuRTxpXnZ0GWe5vhYY7uJN1aSiAyVXnaaCoN6M6oubnYR9069YzpLfiRpapUZIHBeyW6uqm22Kj4SFHNEmwo0OKnkbfiykT67e60QhFfMro_gn7bsIx2AFH3lXkUSHbSxVsKpmgd6O/w1200-h630-p-k-no-nu/000.jpg";
    var mangas = [];
    var searchKey = key.toLowerCase();

    // Duyệt qua cả main và champ
    var allArcs = [];
    for (var i = 0; i < storyArcs.main.length; i++) {
        var arc = storyArcs.main[i];
        allArcs.push({
            name: "Pokémon Đặc Biệt - " + arc.text,
            link: arc.value,
            cover: defaultCover,
            description: arc.text
        });
    }
    for (var i = 0; i < storyArcs.champ.length; i++) {
        var arc = storyArcs.champ[i];
        allArcs.push({
            name: arc.text,
            link: arc.value,
            cover: defaultCover,
            description: arc.text
        });
    }

    for (var i = 0; i < allArcs.length; i++) {
        var arc = allArcs[i];
        if (arc.name.toLowerCase().indexOf(searchKey) !== -1) {
            arc.host = BASE_URL;
            mangas.push(arc);
        }
    }

    return Response.success(mangas);
}
