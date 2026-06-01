const fs = require('fs');
const dir = 'mangadot/src';
fs.readdirSync(dir).forEach(file => {
    const content = fs.readFileSync(dir + '/' + file, 'utf8');
    if (content.match(/\b(const|let)\b/)) console.log(`ES6 var in ${file}`);
    if (content.match(/=>/)) console.log(`Arrow in ${file}`);
});
