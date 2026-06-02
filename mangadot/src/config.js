var BASE_URL = 'https://mangadot.net';

/**
 * Parse React Router turbo-stream format.
 * The response is a JSON array where objects use _N keys:
 *   arr[N] = field name (string), value at _N = index of the value.
 * So {_16:17, _18:19} where arr[16]='id', arr[17]=41, arr[18]='title', arr[19]='ONE PIECE'
 * becomes {id: 41, title: 'ONE PIECE'}.
 * Index -5 means null.
 */
function parseTurbo(text) {
    var arr = JSON.parse(text);
    var cache = {};
    var resolving = {};

    function resolve(idx) {
        if (idx === -5) return null;
        if (typeof idx !== 'number') return idx;
        if (cache[idx] !== undefined) return cache[idx];
        if (resolving[idx]) return null; // break circular refs
        resolving[idx] = true;

        var val = arr[idx];
        if (val === undefined || val === null) {
            delete resolving[idx];
            return val;
        }
        if (typeof val === 'string' || typeof val === 'number' || typeof val === 'boolean') {
            cache[idx] = val;
            delete resolving[idx];
            return val;
        }
        if (Array.isArray(val)) {
            var result = [];
            cache[idx] = result;
            for (var i = 0; i < val.length; i++) {
                result.push(resolve(val[i]));
            }
            delete resolving[idx];
            return result;
        }
        if (typeof val === 'object') {
            var obj = {};
            cache[idx] = obj;
            var keys = Object.keys(val);
            for (var i = 0; i < keys.length; i++) {
                var rawKey = keys[i];
                var keyIdx = parseInt(rawKey.replace(/^_/, ''), 10);
                var keyName = resolve(keyIdx);
                var valueRef = val[rawKey];
                if (typeof keyName === 'string') {
                    obj[keyName] = resolve(valueRef);
                } else {
                    // fallback: use numeric key if name is not a string
                    obj[String(keyIdx)] = resolve(valueRef);
                }
            }
            delete resolving[idx];
            return obj;
        }
        delete resolving[idx];
        return val;
    }

    return resolve(0);
}

/**
 * Walk through a parsed turbo object to find a value by key path.
 * Example: findInTurbo(data, 'mangaData.manga') navigates data.mangaData.manga
 * Also searches recursively if direct path fails.
 */
function findInTurbo(obj, key) {
    if (!obj || typeof obj !== 'object') return null;

    // Direct key access
    if (obj[key] !== undefined) return obj[key];

    // Dotted path
    if (key.indexOf('.') > -1) {
        var parts = key.split('.');
        var cur = obj;
        for (var i = 0; i < parts.length; i++) {
            if (!cur || typeof cur !== 'object') return null;
            cur = cur[parts[i]];
        }
        return cur !== undefined ? cur : null;
    }

    // BFS search
    var queue = [];
    var visited = [];
    queue.push(obj);
    visited.push(obj);

    while (queue.length > 0) {
        var current = queue.shift();
        if (!current || typeof current !== 'object') continue;

        var ks = Object.keys(current);
        for (var i = 0; i < ks.length; i++) {
            if (ks[i] === key) return current[ks[i]];
            var child = current[ks[i]];
            if (child && typeof child === 'object') {
                var found = false;
                for (var v = 0; v < visited.length; v++) {
                    if (visited[v] === child) { found = true; break; }
                }
                if (!found) {
                    visited.push(child);
                    queue.push(child);
                }
            }
        }
    }
    return null;
}

/**
 * Fetch a .data endpoint and return parsed turbo object.
 */
function fetchTurbo(url) {
    var resp = fetch(url, {
        headers: {
            'Accept': 'text/x-turbo'
        }
    });
    if (!resp.ok) return null;
    var text = resp.text();
    if (!text) return null;
    return parseTurbo(text);
}

/**
 * Extract manga list items from a turbo data object.
 * Searches for 'manga_list' or 'results' array.
 * Returns array of {name, link, cover, description, host}.
 */
function extractMangaList(turbo) {
    var list = findInTurbo(turbo, 'manga_list');
    if (!list) list = findInTurbo(turbo, 'results');
    if (!list || !Array.isArray(list)) return [];

    var data = [];
    for (var i = 0; i < list.length; i++) {
        var m = list[i];
        if (!m || typeof m !== 'object') continue;

        var title = m.title || '';
        var id = m.id;
        var photo = m.photo || '';
        var desc = m.description || '';
        var chapCount = m.chapter_count;

        if (!title || !id) continue;

        var cover = photo;
        if (cover && cover.indexOf('http') !== 0) {
            cover = BASE_URL + cover;
        }

        var link = BASE_URL + '/manga/' + id;

        if (chapCount) {
            desc = 'Ch. ' + chapCount + (desc ? ' — ' + desc : '');
        }

        data.push({
            name: title,
            link: link,
            cover: cover,
            description: desc,
            host: BASE_URL
        });
    }
    return data;
}

/**
 * Parse authors field: could be a JSON string like '["Author1"]' or a plain string or an array.
 */
function parseAuthors(val) {
    if (!val) return '';
    if (Array.isArray(val)) return val.join(', ');
    if (typeof val === 'string') {
        var s = val.trim();
        if (s.charAt(0) === '[') {
            try {
                var arr = JSON.parse(s);
                if (Array.isArray(arr)) return arr.join(', ');
            } catch (e) { }
        }
        return s;
    }
    return String(val);
}
