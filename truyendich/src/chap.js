load('config.js');

function execute(url) {
    var response = fetch(url);
    if (response.ok) {
        var json = response.json();
        if (json.content) {
            var content = json.content;
            
            // Format content if needed
            content = content.replace(/<content>/g, '');
            content = content.replace(/<\/content>/g, '');
            
            return Response.success(content);
        }
    }
    return null;
}
