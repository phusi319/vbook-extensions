const fs = require('fs');
const dir = 'mangadot/src';
fs.readdirSync(dir).forEach(f => {
    try {
        new require('vm').Script(fs.readFileSync(dir + '/' + f, 'utf8'));
    } catch (e) {
        console.error('Syntax error in ' + f + ':', e);
    }
});
