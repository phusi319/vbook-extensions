/**
 * image.js — IMGX Image Decoder for MoeTruyen
 *
 * Receives: "downloadUrl {grant, storageKey}" from chap.js
 * Downloads .bin file, decodes IMGX format, returns decoded webp image.
 *
 * IMGX v2 format:
 *   Header: 4 bytes magic "IMGX" + 1 byte version + 4 bytes width (BE) + 4 bytes height (BE) = 13 bytes
 *   Payload: shuffled + XOR encrypted webp data
 *
 * Decode steps:
 *   1. Unwrap decode key from grant (XOR with mask derived from grant fields)
 *   2. Unshuffle payload bytes (reverse Fisher-Yates using XorShift32 PRNG)
 *   3. XOR payload with decode key (repeating)
 *   4. Result is raw webp
 */

var IMGX_HEADER_BYTES = 13;
var IMGX_KEY_BYTES = 32;

// ==================== Base64URL ====================

function base64UrlToBytes(value) {
    var normalized = value.replace(/-/g, '+').replace(/_/g, '/');
    while (normalized.length % 4 !== 0) normalized += '=';
    var decoder = java.util.Base64.getDecoder();
    return decoder.decode(normalized);
}

// ==================== FNV-1a 32-bit ====================

function fnv1a32(bytes) {
    var hash = 0x811c9dc5;
    for (var i = 0; i < bytes.length; i++) {
        hash ^= (bytes[i] & 0xFF);
        hash = Math.imul(hash, 0x01000193) >>> 0;
    }
    return hash || 0x9e3779b9;
}

// ==================== XorShift32 PRNG ====================

function nextXorShift32(value) {
    var x = value >>> 0;
    x ^= (x << 13) >>> 0;
    x ^= x >>> 17;
    x ^= (x << 5) >>> 0;
    return x >>> 0;
}

// ==================== Grant Key Unwrap ====================

function normalizeStorageKey(storageKey) {
    return storageKey.replace(/^\s+|\s+$/g, '').replace(/^\/+/, '');
}

function createGrantKeyWrapMaterial(grant, storageKey) {
    return [
        'IMGX-GRANT-WRAP-v1',
        grant.version,
        grant.algorithm,
        grant.imageId,
        grant.issuedAt,
        grant.expiresAt,
        grant.nonce,
        grant.keyNonce,
        grant.signature,
        normalizeStorageKey(storageKey)
    ].join('.');
}

function createGrantKeyMask(material, byteLength) {
    var mask = new Array(byteLength);
    var materialBytes = new java.lang.String(material).getBytes('UTF-8');
    var seed = fnv1a32(materialBytes);

    for (var i = 0; i < byteLength; i++) {
        if (i % 4 === 0) {
            seed = nextXorShift32((seed + i + 0x9e3779b9) >>> 0);
        }
        mask[i] = (seed >>> ((i % 4) * 8)) & 0xFF;
    }
    return mask;
}

function unwrapDecodeKey(grant, storageKey) {
    var material = createGrantKeyWrapMaterial(grant, storageKey);
    var wrapped = base64UrlToBytes(grant.wrappedDecodeKey);
    var mask = createGrantKeyMask(material, wrapped.length);
    var decodeKey = new Array(wrapped.length);

    for (var i = 0; i < wrapped.length; i++) {
        decodeKey[i] = ((wrapped[i] & 0xFF) ^ mask[i]) & 0xFF;
    }
    return decodeKey;
}

// ==================== IMGX Decode ====================

function seedFromKey(key) {
    if (key.length < 4) return 0x9e3779b9;
    var seed = ((key[0] & 0xFF) << 24) | ((key[1] & 0xFF) << 16) | ((key[2] & 0xFF) << 8) | (key[3] & 0xFF);
    seed = seed >>> 0;
    return seed || 0x9e3779b9;
}

function decodeImgx(imgBytes, grant, storageKey) {
    // Verify magic
    if (imgBytes.length <= IMGX_HEADER_BYTES) return null;
    if ((imgBytes[0] & 0xFF) !== 0x49 || (imgBytes[1] & 0xFF) !== 0x4D ||
        (imgBytes[2] & 0xFF) !== 0x47 || (imgBytes[3] & 0xFF) !== 0x58) return null;

    // Unwrap decode key
    var decodeKey = unwrapDecodeKey(grant, storageKey);

    // Extract payload (skip 13-byte header)
    var payloadLen = imgBytes.length - IMGX_HEADER_BYTES;
    var payload = new Array(payloadLen);
    for (var i = 0; i < payloadLen; i++) {
        payload[i] = imgBytes[IMGX_HEADER_BYTES + i] & 0xFF;
    }

    // Step 1: Unshuffle (reverse Fisher-Yates)
    var keySeed = seedFromKey(decodeKey);
    // Forward pass: generate swap indices
    var swaps = new Array(payloadLen);
    var s = keySeed;
    for (var i = payloadLen - 1; i > 0; i--) {
        s = nextXorShift32(s);
        swaps[i] = s % (i + 1);
    }
    // Reverse pass: undo swaps
    for (var i = 1; i < payloadLen; i++) {
        if (i !== swaps[i]) {
            var tmp = payload[i];
            payload[i] = payload[swaps[i]];
            payload[swaps[i]] = tmp;
        }
    }

    // Step 2: XOR with decode key
    for (var i = 0; i < payloadLen; i++) {
        payload[i] = (payload[i] ^ decodeKey[i % decodeKey.length]) & 0xFF;
    }

    // Convert payload to Java byte array
    var result = java.lang.reflect.Array.newInstance(java.lang.Byte.TYPE, payloadLen);
    for (var i = 0; i < payloadLen; i++) {
        result[i] = (payload[i] > 127) ? (payload[i] - 256) : payload[i];
    }
    return result;
}

// ==================== Main Entry ====================

function execute(url) {
    // Parse downloadUrl and decode data
    var spaceIdx = url.indexOf(' ');
    if (spaceIdx < 0) return null;

    var downloadUrl = url.substring(0, spaceIdx);
    var dataJson = url.substring(spaceIdx + 1);
    var data = JSON.parse(dataJson);

    // Download .bin file
    var response = fetch(downloadUrl);
    if (!response.ok) return null;

    var imgBase64 = response.base64();
    var decoder = java.util.Base64.getDecoder();
    var imgBytes = decoder.decode(imgBase64);

    // Decode IMGX
    var webpBytes = decodeImgx(imgBytes, data.grant, data.storageKey);
    if (!webpBytes) return null;

    // Encode decoded webp as base64 and create image
    var encoder = java.util.Base64.getEncoder();
    var webpBase64 = encoder.encodeToString(webpBytes);

    var image = Graphics.createImage(webpBase64);
    var canvas = Graphics.createCanvas(image.width, image.height);
    canvas.drawImage(image, 0, 0, image.width, image.height, 0, 0, image.width, image.height);
    return canvas.capture();
}
