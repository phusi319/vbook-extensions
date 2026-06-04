var BASE_URL = "https://moetruyen.net";
var API_URL = "https://moe.suicaodex.com/v2";

function fetchApi(path, options) {
    if (!options) options = {};
    if (!options.headers) options.headers = {};
    options.headers['Origin'] = 'https://moetruyen.net';
    options.headers['User-Agent'] = 'Mozilla/5.0';
    if (!options.method) options.method = 'GET';
    
    var url = API_URL + path;
    var req = fetch(url, options);
    if (req.ok) {
        return req.json();
    }
    return null;
}
