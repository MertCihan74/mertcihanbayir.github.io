const fs = require('fs');

const path = 'C:/Users/ASUS/.gemini/antigravity/brain/0287530b-0eca-43e0-b507-9f699963df88/300_positions_part1.js';

try {
    const buffer = fs.readFileSync(path);
    // Find "Erkek üstte"
    // "Erkek " is 45 72 6B 65 6B 20
    // "üstte" starts with "ü" which should be C3 BC in UTF-8
    
    const start = buffer.indexOf('Erkek ');
    if (start !== -1) {
        console.log('Found "Erkek " at index:', start);
        // Print next 20 bytes
        const snippet = buffer.slice(start, start + 20);
        console.log('Hex:', snippet.toString('hex'));
        console.log('String (utf8):', snippet.toString('utf8'));
        console.log('String (latin1):', snippet.toString('latin1'));
    } else {
        console.log('Could not find "Erkek "');
    }

} catch (err) {
    console.error(err);
}
