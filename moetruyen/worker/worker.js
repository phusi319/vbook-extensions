/**
 * Cloudflare Worker — MoeTruyen IMGX Decoder Proxy
 *
 * Strategy: Extension passes downloadUrl + grant to Worker.
 * Worker downloads IMGX binary, decrypts it, and returns WebP.
 *
 * Endpoints:
 *   POST /decode
 *     Body: { downloadUrl, grant, storageKey }
 *     → Returns decoded WebP image
 *
 *   GET /decode?url={downloadUrl}&grant={base64json}&sk={storageKey}
 *     → Same but via GET
 *
 *   GET /health
 */

// ========== Crypto helpers ==========

function fnv1a(bytes) {
  let h = 0x811c9dc5;
  for (let i = 0; i < bytes.length; i++) {
    h ^= bytes[i]; h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h || 0x9e3779b9;
}

function xs32(v) {
  let x = v >>> 0;
  x ^= (x << 13) >>> 0; x ^= x >>> 17; x ^= (x << 5) >>> 0;
  return x >>> 0;
}

function b64urlDecode(str) {
  const s = str.replace(/-/g, "+").replace(/_/g, "/");
  const bin = atob(s.padEnd(s.length + (4 - s.length % 4) % 4, "="));
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

function utf8(str) {
  return new TextEncoder().encode(str);
}

function normSK(sk) {
  return (sk || "").trim().replace(/^\/+/, "");
}

// ========== Key unwrap ==========

function unwrapKey(grant, storageKey, field) {
  const sk = normSK(storageKey);
  const mat = [
    "IMGX-GRANT-WRAP-v1", grant.version, grant.algorithm,
    grant.imageId, grant.issuedAt, grant.expiresAt,
    grant.nonce, grant.keyNonce, grant.signature, sk
  ].map(v => v == null ? "" : String(v)).join(".");

  const wrapped = b64urlDecode(grant[field]);
  const matBytes = utf8(mat);
  let seed = fnv1a(matBytes);
  const key = new Uint8Array(wrapped.length);

  for (let i = 0; i < wrapped.length; i++) {
    if (i % 4 === 0) seed = xs32((seed + i + 0x9e3779b9) >>> 0);
    key[i] = (wrapped[i] ^ ((seed >>> ((i % 4) * 8)) & 0xFF)) & 0xFF;
  }
  return key;
}

// ========== IMGX v2 decode (XOR + unshuffle) ==========

function decodeV2(payload, key) {
  const pLen = payload.length;
  const p = new Uint8Array(payload);

  let ks = ((key[0] << 24) | (key[1] << 16) | (key[2] << 8) | key[3]) >>> 0;
  if (ks === 0) ks = 0x9e3779b9;

  const swaps = new Uint32Array(pLen);
  let s = ks;
  for (let i = pLen - 1; i > 0; i--) { s = xs32(s); swaps[i] = s % (i + 1); }
  for (let i = 1; i < pLen; i++) {
    const j = swaps[i];
    if (i !== j) { const t = p[i]; p[i] = p[j]; p[j] = t; }
  }
  for (let i = 0; i < pLen; i++) p[i] ^= key[i % key.length];

  return p;
}

// ========== IMGX v3 decode (AES-256-GCM) ==========

async function decodeV3(fileBytes, grant, storageKey) {
  const sk = normSK(storageKey);
  const contentKey = unwrapKey(grant, storageKey, "wrappedContentKey");

  const dv = new DataView(fileBytes.buffer, fileBytes.byteOffset, fileBytes.byteLength);
  const width  = dv.getUint32(5, false);
  const height = dv.getUint32(9, false);

  const iv         = fileBytes.slice(13, 25);
  const ciphertext = fileBytes.slice(25);
  const aad        = utf8(`IMGX-v3.${grant.imageId}.${sk}.${width}.${height}`);

  const cryptoKey = await crypto.subtle.importKey("raw", contentKey, { name: "AES-GCM" }, false, ["decrypt"]);
  const decrypted = await crypto.subtle.decrypt({ name: "AES-GCM", iv, additionalData: aad, tagLength: 128 }, cryptoKey, ciphertext);
  return new Uint8Array(decrypted);
}

// ========== Download and decode ==========

async function downloadAndDecode(downloadUrl, grant, storageKey) {
  const resp = await fetch(downloadUrl, {
    headers: { "User-Agent": "Mozilla/5.0" },
  });
  if (!resp.ok) throw new Error(`IMGX download ${resp.status}`);

  const fileBytes = new Uint8Array(await resp.arrayBuffer());
  if (fileBytes.length <= 13) throw new Error("IMGX too small");
  if (fileBytes[0] !== 0x49 || fileBytes[1] !== 0x4D || fileBytes[2] !== 0x47 || fileBytes[3] !== 0x58)
    throw new Error("Not IMGX");

  const version = fileBytes[4];

  if (version === 3 && grant.wrappedContentKey) {
    return await decodeV3(fileBytes, grant, storageKey);
  }

  if (version === 2 && grant.wrappedDecodeKey) {
    const key = unwrapKey(grant, storageKey, "wrappedDecodeKey");
    return decodeV2(fileBytes.slice(13), key);
  }

  throw new Error(`Unsupported IMGX v${version}`);
}

// ========== Main handler ==========

export default {
  async fetch(request) {
    const url = new URL(request.url);
    const path = url.pathname;

    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };
    if (request.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

    try {
      // POST /decode — body: { downloadUrl, grant, storageKey }
      if (path === "/decode" && request.method === "POST") {
        const body = await request.json();
        const { downloadUrl, grant, storageKey } = body;
        if (!downloadUrl || !grant || !storageKey) {
          return new Response(JSON.stringify({ error: "Missing downloadUrl, grant, or storageKey" }), {
            status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        const webp = await downloadAndDecode(downloadUrl, grant, storageKey);
        return new Response(webp, {
          headers: { ...corsHeaders, "Content-Type": "image/webp", "Cache-Control": "public, max-age=300" },
        });
      }

      // GET /decode?url=...&grant=...&sk=...
      if (path === "/decode" && request.method === "GET") {
        const downloadUrl = url.searchParams.get("url");
        const grantB64    = url.searchParams.get("grant");
        const storageKey  = url.searchParams.get("sk");

        if (!downloadUrl || !grantB64 || !storageKey) {
          return new Response(JSON.stringify({ error: "Missing url, grant, or sk params" }), {
            status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        const grant = JSON.parse(atob(grantB64));
        const webp = await downloadAndDecode(downloadUrl, grant, storageKey);
        return new Response(webp, {
          headers: { ...corsHeaders, "Content-Type": "image/webp", "Cache-Control": "public, max-age=300" },
        });
      }

      // GET /health
      if (path === "/health") {
        return new Response(JSON.stringify({ ok: true, ts: Date.now() }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response("MoeTruyen IMGX Decoder\n\nPOST /decode {downloadUrl, grant, storageKey}\nGET /decode?url=...&grant=...&sk=...\nGET /health", {
        headers: { ...corsHeaders, "Content-Type": "text/plain" },
      });

    } catch (e) {
      return new Response(JSON.stringify({ error: e.message || "Internal error" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  },
};
