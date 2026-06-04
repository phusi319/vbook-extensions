load('config.js');

function execute(url) {
    // URL format from toc.js: "chapterId|pages|mangaSlug|chapterNum"
    var parts = url.split("|");
    if (parts.length < 4) return null;

    var chapterId  = parts[0];
    var totalPages = parseInt(parts[1]) || 0;
    var mangaSlug  = parts[2];
    var chapterNum = parts[3];

    if (totalPages <= 0) totalPages = 50;

    // Step 1: Try to get page-access with wrappedContentKey via truyen.moe
    var pagesData = fetchPageAccessWithProof(mangaSlug, chapterNum, totalPages);

    // Step 2: Fallback to API (only wrappedDecodeKey for v2)
    if (!pagesData || pagesData.length === 0) {
        pagesData = fetchPageAccessApi(chapterId, totalPages);
    }

    if (!pagesData || pagesData.length === 0) return null;

    // Step 3: Build image list — send to Worker for decryption
    var images = [];
    for (var i = 0; i < pagesData.length; i++) {
        var p = pagesData[i];
        var decodeData = JSON.stringify({
            downloadUrl: p.downloadUrl,
            grant: p.grant,
            storageKey: p.storageKey
        });
        // Use Worker POST /decode via image.js
        images.push({
            link: p.downloadUrl + " " + decodeData,
            script: "image.js"
        });
    }

    if (images.length > 0) {
        return Response.success(images);
    }
    return null;
}

// ==================== Page Access via truyen.moe (with proof) ====================

function fetchPageAccessWithProof(mangaSlug, chapterNum, totalPages) {
    try {
        // Fetch chapter HTML from truyen.moe to get proof token
        var chapterUrl = "https://truyen.moe/manga/" + mangaSlug + "/chapters/" + chapterNum;
        var html = null;

        try {
            var resp = fetch(chapterUrl, {
                headers: {"User-Agent": "Mozilla/5.0 (Linux; Android 13) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36"}
            });
            if (resp.ok) html = resp.text();
        } catch (e) {}

        if (!html) {
            try {
                var res = Http.get(chapterUrl).headers({"User-Agent": "Mozilla/5.0"});
                if (res.status() === 200) html = res.string();
            } catch (e) {}
        }

        if (!html) return null;

        // Extract proof token and access URL
        var ptMatch = /data-reader-imgx-proof-token="([^"]+)"/.exec(html);
        var auMatch = /data-reader-imgx-access-url="([^"]+)"/.exec(html);
        if (!ptMatch || !auMatch) return null;

        var proofToken = ptMatch[1];
        var accessUrl = auMatch[1];
        var fullAccessUrl = "https://truyen.moe" + accessUrl;

        // Fetch pages in batches
        var allPages = [];
        var batchSize = 5;

        for (var start = 0; start < totalPages; start += batchSize) {
            var pageIndexes = [];
            for (var j = start; j < Math.min(start + batchSize, totalPages); j++) {
                pageIndexes.push(j);
            }

            var pages = callPageAccessWithProof(fullAccessUrl, accessUrl, proofToken, pageIndexes);
            if (!pages || pages.length === 0) break;

            for (var k = 0; k < pages.length; k++) {
                allPages.push(pages[k]);
            }
        }

        return allPages.length > 0 ? allPages : null;
    } catch (e) {
        return null;
    }
}

function callPageAccessWithProof(fullUrl, accessPath, proofToken, pageIndexes) {
    // Generate proof (SHA-256)
    var proofVersion = "imgx-page-access-proof-v1";
    var issuedAt = Date.now();
    var nonce = generateNonce();
    var ua = "Mozilla/5.0 (Linux; Android 13) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36";

    var proofStr = [proofVersion, proofToken, accessPath, ua, pageIndexes.join(","), issuedAt, nonce].join("\n");
    var proof = sha256Base64url(proofStr);

    if (!proof) return null;

    var proofObj = {
        version: proofVersion,
        token: proofToken,
        issuedAt: issuedAt,
        nonce: nonce,
        proof: proof
    };

    var bodyStr = JSON.stringify({
        pageIndexes: pageIndexes,
        pageAccessProof: proofObj
    });

    // Call page-access
    try {
        var resp = fetch(fullUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json",
                "User-Agent": ua,
                "X-IMGX-Reader-Proof": proof,
                "X-IMGX-Reader-Proof-Version": proofVersion
            },
            body: bodyStr
        });
        if (resp.ok) {
            var data = JSON.parse(resp.text());
            return data.pages || null;
        }
    } catch (e) {}

    try {
        var res = Http.post(fullUrl).headers({
            "Content-Type": "application/json",
            "Accept": "application/json",
            "User-Agent": ua,
            "X-IMGX-Reader-Proof": proof,
            "X-IMGX-Reader-Proof-Version": proofVersion
        }).body(bodyStr);
        if (res.status() === 200) {
            var data2 = JSON.parse(res.string());
            return data2.pages || null;
        }
    } catch (e) {}

    return null;
}

// ==================== Fallback: API page-access (v2 only) ====================

function fetchPageAccessApi(chapterId, totalPages) {
    var allPages = [];
    var batchSize = 5;

    for (var start = 0; start < totalPages; start += batchSize) {
        var pageIndexes = [];
        for (var j = start; j < Math.min(start + batchSize, totalPages); j++) {
            pageIndexes.push(j);
        }

        var apiUrl = API_URL + "/v2/chapters/" + chapterId + "/page-access";
        var bodyStr = JSON.stringify({ pageIndexes: pageIndexes });

        var pages = null;
        try {
            var resp = fetch(apiUrl, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: bodyStr
            });
            if (resp.ok) {
                var data = JSON.parse(resp.text());
                pages = data.data ? data.data.pages : data.pages;
            }
        } catch (e) {}

        if (!pages) {
            try {
                var res = Http.post(apiUrl).headers({
                    "Content-Type": "application/json"
                }).body(bodyStr);
                if (res.status() === 200) {
                    var data2 = JSON.parse(res.string());
                    pages = data2.data ? data2.data.pages : data2.pages;
                }
            } catch (e) {}
        }

        if (!pages || pages.length === 0) break;
        for (var k = 0; k < pages.length; k++) {
            allPages.push(pages[k]);
        }
    }

    return allPages.length > 0 ? allPages : null;
}

// ==================== Crypto helpers for proof ====================

function generateNonce() {
    var chars = "0123456789abcdef";
    var nonce = "";
    for (var i = 0; i < 32; i++) {
        nonce += chars.charAt(Math.floor(Math.random() * 16));
    }
    return nonce;
}

function sha256Base64url(str) {
    // Try Java MessageDigest (available in Rhino/vBook)
    try {
        var md = java.security.MessageDigest.getInstance("SHA-256");
        var bytes = new java.lang.String(str).getBytes("UTF-8");
        var digest = md.digest(bytes);
        // Convert to base64url
        var b64 = java.util.Base64.getUrlEncoder().withoutPadding().encodeToString(digest);
        return String(b64);
    } catch (e) {}

    // Try WebCrypto (unlikely in Rhino)
    try {
        var encoder = new TextEncoder();
        var data = encoder.encode(str);
        var hashBuffer = crypto.subtle.digestSync("SHA-256", data);
        // Manual base64url
        var hashArray = new Uint8Array(hashBuffer);
        return arrayToBase64url(hashArray);
    } catch (e) {}

    return null;
}

function arrayToBase64url(arr) {
    var B64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    var result = [];
    for (var i = 0; i < arr.length; i += 3) {
        var b0 = arr[i], b1 = arr[i+1] || 0, b2 = arr[i+2] || 0;
        result.push(B64.charAt(b0 >> 2));
        result.push(B64.charAt(((b0 & 3) << 4) | (b1 >> 4)));
        result.push(i+1 < arr.length ? B64.charAt(((b1 & 15) << 2) | (b2 >> 6)) : "");
        result.push(i+2 < arr.length ? B64.charAt(b2 & 63) : "");
    }
    return result.join("").replace(/\+/g,"-").replace(/\//g,"_");
}
