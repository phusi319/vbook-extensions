/**
 * Cloudflare Worker: MoeTruyen Page-Access Proxy
 * 
 * Converts GET requests into POST requests for the page-access API.
 * GET /page-access/{chapterId}?pages=0,1,2,3,4
 *   → POST https://moe.suicaodex.com/v2/chapters/{chapterId}/page-access
 *     body: { pageIndexes: [0,1,2,3,4] }
 *   → Returns JSON response
 */

const API_BASE = 'https://moe.suicaodex.com';

export default {
  async fetch(request) {
    const url = new URL(request.url);
    const path = url.pathname;

    // CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Access-Control-Allow-Headers': '*',
        }
      });
    }

    // Route: /page-access/{chapterId}?pages=0,1,2,3,4
    const match = path.match(/^\/page-access\/(\d+)$/);
    if (match) {
      const chapterId = match[1];
      const pagesParam = url.searchParams.get('pages') || '0';
      const pageIndexes = pagesParam.split(',').map(Number);

      const apiUrl = `${API_BASE}/v2/chapters/${chapterId}/page-access`;
      const resp = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Origin': 'https://moetruyen.net',
          'User-Agent': 'Mozilla/5.0'
        },
        body: JSON.stringify({ pageIndexes })
      });

      const data = await resp.text();
      return new Response(data, {
        status: resp.status,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Cache-Control': 'no-store'
        }
      });
    }

    // Fallback: proxy any other API request
    const apiPath = path.startsWith('/v2') ? path : '/v2' + path;
    const apiUrl = API_BASE + apiPath + url.search;
    const resp = await fetch(apiUrl, {
      headers: {
        'Origin': 'https://moetruyen.net',
        'User-Agent': 'Mozilla/5.0'
      }
    });
    const data = await resp.text();
    return new Response(data, {
      status: resp.status,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
};
