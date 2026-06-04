fetch('https://truyenqqko.com').then(r => r.text()).then(html => {
    const matches = html.match(/href="([^"]*truyen-tranh[^"]*)"/g);
    if (matches) {
        matches.slice(0, 10).forEach(m => console.log(m));
    }
});
