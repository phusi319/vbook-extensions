function execute(url) {
    var parts = url.split(" ");
    var imgUrl = parts[0];
    var grantStr = url.substring(imgUrl.length + 1);
    
    var response = fetch(imgUrl);
    if (!response.ok) return null;

    try {
        var base64str = response.base64();
        // Decode base64 to byte[]
        var androidBase64 = null;
        try { androidBase64 = android.util.Base64; } catch (e) {}
        if (!androidBase64) return null;
        
        var imgBytes = androidBase64.decode(base64str, 0); // Base64.DEFAULT = 0
        var len = imgBytes.length;
        
        // Ensure IMGX header
        if (len < 13 || imgBytes[0] !== 0x49 || imgBytes[1] !== 0x4d || imgBytes[2] !== 0x47 || imgBytes[3] !== 0x58) {
            // Not IMGX, return directly
            var image = Graphics.createImage(base64str);
            var canvas = Graphics.createCanvas(image.width, image.height);
            canvas.drawImage(image, 0, 0, image.width, image.height, 0, 0, image.width, image.height);
            return canvas.capture();
        }
        
        var grant = JSON.parse(grantStr);
        // parse storageKey from url: https://i.truyen.moe/chapters/manga-1/ch-183/001.bin?t=...
        var storageKeyMatch = imgUrl.match(/i\.truyen\.moe\/(chapters\/[^\?]+)/);
        if (!storageKeyMatch) return null;
        var storageKey = storageKeyMatch[1];
        
        // Unwrap key
        var MessageDigest = java.security.MessageDigest;
        var md = MessageDigest.getInstance("SHA-256");
        
        function getUnsigned(b) { return b < 0 ? b + 256 : b; }
        
        function sha256Base64Url(bytes) {
            md.reset();
            md.update(bytes);
            var hashBytes = md.digest();
            var b64 = androidBase64.encodeToString(hashBytes, 11); // NO_PADDING=1 | NO_WRAP=2 | URL_SAFE=8 => 11
            return b64.replace(/\s/g, ''); // strip any newlines
        }
        
        function utf8ToBytes(str) {
            var StringClass = java.lang.String;
            var jStr = new StringClass(str);
            return jStr.getBytes("UTF-8");
        }
        
        function base64UrlToBytes(str) {
            return androidBase64.decode(str, 8); // URL_SAFE
        }
        
        function fnv1a32(bytes) {
            var hash = 0x811c9dc5;
            for (var i = 0; i < bytes.length; i++) {
                hash ^= getUnsigned(bytes[i]);
                hash = Math.imul(hash, 0x01000193) >>> 0;
            }
            return hash || 0x9e3779b9;
        }
        
        function nextXorShift32(value) {
            var x = value >>> 0;
            x ^= (x << 13) >>> 0;
            x ^= x >>> 17;
            x ^= (x << 5) >>> 0;
            return x >>> 0;
        }
        
        var wrapMaterial = ['IMGX-GRANT-WRAP-v1', grant.version, grant.algorithm, grant.imageId, grant.issuedAt, grant.expiresAt, grant.nonce, grant.keyNonce, grant.signature, storageKey].map(String).join('.');
        var materialBytes = utf8ToBytes(wrapMaterial);
        
        var wrapped = base64UrlToBytes(grant.wrappedDecodeKey);
        var mask = new Int8Array(32);
        var seed = fnv1a32(materialBytes);
        
        for (var i = 0; i < 32; i++) {
            if (i % 4 === 0) seed = nextXorShift32((seed + i + 0x9e3779b9) >>> 0);
            mask[i] = (seed >>> ((i % 4) * 8)) & 0xff;
        }
        
        var decodeKey = new Int8Array(wrapped.length);
        for (var i = 0; i < wrapped.length; i++) {
            decodeKey[i] = wrapped[i] ^ mask[i];
        }
        
        // Verify hash
        if (sha256Base64Url(decodeKey) !== grant.keyHash) {
            return null; // Key hash mismatch
        }
        
        // Decode payload
        var headerLen = 13;
        var payloadLen = len - headerLen;
        var payload = new Int8Array(payloadLen);
        for (var i = 0; i < payloadLen; i++) payload[i] = imgBytes[i + headerLen];
        
        // Read keySeed from decodeKey (first 4 bytes as little-endian uint32)
        var k0 = getUnsigned(decodeKey[0]), k1 = getUnsigned(decodeKey[1]), k2 = getUnsigned(decodeKey[2]), k3 = getUnsigned(decodeKey[3]);
        var keySeed = (k0 | (k1 << 8) | (k2 << 16) | (k3 << 24)) >>> 0;
        if (keySeed === 0) keySeed = 0x9e3779b9;
        
        var swaps = new Int32Array(payloadLen);
        var s = keySeed;
        for (var i = payloadLen - 1; i > 0; i--) {
            s = nextXorShift32(s);
            swaps[i] = s % (i + 1);
        }
        
        for (var i = 1; i < payloadLen; i++) {
            var swapIdx = swaps[i];
            if (i !== swapIdx) {
                var tmp = payload[i];
                payload[i] = payload[swapIdx];
                payload[swapIdx] = tmp;
            }
        }
        
        for (var i = 0; i < payloadLen; i++) {
            payload[i] ^= decodeKey[i % decodeKey.length];
        }
        
        // Convert payload back to base64 for vBook image
        var finalBase64 = androidBase64.encodeToString(payload, 2); // NO_WRAP = 2
        var image = Graphics.createImage(finalBase64);
        var canvas = Graphics.createCanvas(image.width, image.height);
        canvas.drawImage(image, 0, 0, image.width, image.height, 0, 0, image.width, image.height);
        return canvas.capture();
        
    } catch (e) {
        return null;
    }
}
