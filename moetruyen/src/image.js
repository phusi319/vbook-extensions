/**
 * image.js — IMGX Image Decoder for MoeTruyen
 *
 * Receives: "downloadUrl {grant, storageKey}" from chap.js
 * 
 * For v2: Decodes locally (XOR + unshuffle)
 * For v3: Sends to Worker for AES-256-GCM decryption
 */

load('config.js');

var IMGX_HEADER_BYTES = 13;

// ==================== Base64 ====================

var B64_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
var B64_LOOKUP = {};
for (var _i = 0; _i < B64_CHARS.length; _i++) B64_LOOKUP[B64_CHARS.charAt(_i)] = _i;

function b64decode(str) {
    str = str.replace(/[\s=]+/g, '');
    var len = str.length;
    var bytes = [];
    for (var i = 0; i < len; i += 4) {
        var a = B64_LOOKUP[str.charAt(i)] || 0;
        var b = B64_LOOKUP[str.charAt(i + 1)] || 0;
        var c = (i + 2 < len) ? (B64_LOOKUP[str.charAt(i + 2)] || 0) : -1;
        var d = (i + 3 < len) ? (B64_LOOKUP[str.charAt(i + 3)] || 0) : -1;
        bytes.push((a << 2) | (b >> 4));
        if (c !== -1) bytes.push(((b & 0xF) << 4) | (c >> 2));
        if (d !== -1) bytes.push(((c & 0x3) << 6) | d);
    }
    return bytes;
}

function b64encode(bytes) {
    var result = [];
    var len = bytes.length;
    for (var i = 0; i < len; i += 3) {
        var b0 = bytes[i];
        var b1 = (i + 1 < len) ? bytes[i + 1] : 0;
        var b2 = (i + 2 < len) ? bytes[i + 2] : 0;
        result.push(B64_CHARS.charAt(b0 >> 2));
        result.push(B64_CHARS.charAt(((b0 & 0x3) << 4) | (b1 >> 4)));
        result.push((i + 1 < len) ? B64_CHARS.charAt(((b1 & 0xF) << 2) | (b2 >> 6)) : '=');
        result.push((i + 2 < len) ? B64_CHARS.charAt(b2 & 0x3F) : '=');
    }
    return result.join('');
}

function b64urlDecode(str) {
    str = str.replace(/-/g, '+').replace(/_/g, '/');
    return b64decode(str);
}

// ==================== UTF-8 encode ====================

function utf8encode(str) {
    var bytes = [];
    for (var i = 0; i < str.length; i++) {
        var c = str.charCodeAt(i);
        if (c < 0x80) {
            bytes.push(c);
        } else if (c < 0x800) {
            bytes.push(0xC0 | (c >> 6));
            bytes.push(0x80 | (c & 0x3F));
        } else {
            bytes.push(0xE0 | (c >> 12));
            bytes.push(0x80 | ((c >> 6) & 0x3F));
            bytes.push(0x80 | (c & 0x3F));
        }
    }
    return bytes;
}

// ==================== FNV-1a 32-bit ====================

function fnv1a32(bytes) {
    var hash = 0x811c9dc5;
    for (var i = 0; i < bytes.length; i++) {
        hash ^= bytes[i] & 0xFF;
        hash = Math.imul(hash, 0x01000193) >>> 0;
    }
    return hash || 0x9e3779b9;
}

// ==================== XorShift32 PRNG ====================

function nextXS32(v) {
    var x = v >>> 0;
    x ^= (x << 13) >>> 0;
    x ^= x >>> 17;
    x ^= (x << 5) >>> 0;
    return x >>> 0;
}

// ==================== Grant Key Unwrap ====================

function unwrapKey(grant, storageKey, keyField) {
    var sk = storageKey.replace(/^\s+|\s+$/g, '').replace(/^\/+/, '');
    var material = [
        'IMGX-GRANT-WRAP-v1', grant.version, grant.algorithm,
        grant.imageId, grant.issuedAt, grant.expiresAt,
        grant.nonce, grant.keyNonce, grant.signature, sk
    ].join('.');

    var wrapped = b64urlDecode(grant[keyField]);
    var matBytes = utf8encode(material);
    var seed = fnv1a32(matBytes);
    var key = new Array(wrapped.length);

    for (var i = 0; i < wrapped.length; i++) {
        if (i % 4 === 0) seed = nextXS32((seed + i + 0x9e3779b9) >>> 0);
        var maskByte = (seed >>> ((i % 4) * 8)) & 0xFF;
        key[i] = (wrapped[i] ^ maskByte) & 0xFF;
    }
    return key;
}

// ==================== IMGX v2 Decode ====================

function decodeImgxV2(bytes, grant, storageKey) {
    if (bytes.length <= IMGX_HEADER_BYTES) return null;
    if (bytes[0] !== 0x49 || bytes[1] !== 0x4D || bytes[2] !== 0x47 || bytes[3] !== 0x58) return null;
    if (bytes[4] !== 2) return null;

    var key = unwrapKey(grant, storageKey, 'wrappedDecodeKey');
    var pLen = bytes.length - IMGX_HEADER_BYTES;
    var p = new Array(pLen);
    for (var i = 0; i < pLen; i++) p[i] = bytes[IMGX_HEADER_BYTES + i];

    // Unshuffle (reverse Fisher-Yates)
    var keySeed = ((key[0] << 24) | (key[1] << 16) | (key[2] << 8) | key[3]) >>> 0;
    if (keySeed === 0) keySeed = 0x9e3779b9;
    var swaps = new Array(pLen);
    var s = keySeed;
    for (var i = pLen - 1; i > 0; i--) {
        s = nextXS32(s);
        swaps[i] = s % (i + 1);
    }
    for (var i = 1; i < pLen; i++) {
        var j = swaps[i];
        if (i !== j) { var tmp = p[i]; p[i] = p[j]; p[j] = tmp; }
    }

    // XOR with key
    var kLen = key.length;
    for (var i = 0; i < pLen; i++) p[i] = (p[i] ^ key[i % kLen]) & 0xFF;

    return p;
}

// ==================== IMGX v3 Decode via Worker ====================

function decodeImgxV3ViaWorker(downloadUrl, grant, storageKey) {
    var bodyStr = JSON.stringify({
        downloadUrl: downloadUrl,
        grant: grant,
        storageKey: storageKey
    });

    // POST to Worker
    try {
        var resp = fetch(WORKER_URL + "/decode", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: bodyStr
        });
        if (resp.ok) {
            var imgB64 = resp.base64();
            var image = Graphics.createImage(imgB64);
            if (image) {
                var canvas = Graphics.createCanvas(image.width, image.height);
                canvas.drawImage(image, 0, 0, image.width, image.height, 0, 0, image.width, image.height);
                return canvas.capture();
            }
        }
    } catch (e) {}

    try {
        var res = Http.post(WORKER_URL + "/decode").headers({
            "Content-Type": "application/json"
        }).body(bodyStr);
        if (res.status() === 200) {
            var imgB64_2 = res.base64();
            var image2 = Graphics.createImage(imgB64_2);
            if (image2) {
                var canvas2 = Graphics.createCanvas(image2.width, image2.height);
                canvas2.drawImage(image2, 0, 0, image2.width, image2.height, 0, 0, image2.width, image2.height);
                return canvas2.capture();
            }
        }
    } catch (e) {}

    return null;
}

// ==================== Main ====================

function execute(url) {
    var spaceIdx = url.indexOf(' ');
    if (spaceIdx < 0) return null;

    var downloadUrl = url.substring(0, spaceIdx);
    var data = JSON.parse(url.substring(spaceIdx + 1));

    // Download IMGX binary to check version
    var imgBytes = null;
    try {
        var response = fetch(downloadUrl);
        if (response.ok) {
            imgBytes = b64decode(response.base64());
        }
    } catch (e) {}

    if (!imgBytes) {
        try {
            var res = Http.get(downloadUrl).headers({"User-Agent": "Mozilla/5.0"});
            if (res.status() === 200) {
                imgBytes = b64decode(res.base64());
            }
        } catch (e) {}
    }

    if (!imgBytes || imgBytes.length <= IMGX_HEADER_BYTES) return null;

    var version = imgBytes[4];

    // V2: Decode locally
    if (version === 2 && data.grant && data.grant.wrappedDecodeKey) {
        var webpBytes = decodeImgxV2(imgBytes, data.grant, data.storageKey);
        if (!webpBytes) return null;

        var webpB64 = b64encode(webpBytes);
        var image = Graphics.createImage(webpB64);
        if (!image) return null;
        var canvas = Graphics.createCanvas(image.width, image.height);
        canvas.drawImage(image, 0, 0, image.width, image.height, 0, 0, image.width, image.height);
        return canvas.capture();
    }

    // V3: Send to Worker for AES-256-GCM decryption
    if (version === 3 && data.grant && data.grant.wrappedContentKey) {
        return decodeImgxV3ViaWorker(data.downloadUrl || downloadUrl, data.grant, data.storageKey);
    }

    // V3 without wrappedContentKey — try Worker anyway (it may fail)
    if (version === 3) {
        return decodeImgxV3ViaWorker(data.downloadUrl || downloadUrl, data.grant, data.storageKey);
    }

    return null;
}
