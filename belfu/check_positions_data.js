const fs = require('fs');
const path = 'c:/Users/ASUS/Desktop/website/mertcihanbayir.github.io/belfu/positions_data.js';

try {
    const buffer = fs.readFileSync(path);
    // Find "Erkek " is 45 72 6B 65 6B 20
    const start = buffer.indexOf('Erkek ');
    if (start !== -1) {
        console.log('Found "Erkek " at index:', start);
        const snippet = buffer.slice(start, start + 20);
        console.log('Hex:', snippet.toString('hex'));
        console.log('String (utf8):', snippet.toString('utf8'));
    } else {
        console.log('Could not find "Erkek "');
    }
} catch (err) {
    console.error(err);
}
