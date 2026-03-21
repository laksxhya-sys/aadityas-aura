const fs = require('fs');

const htmlPath = 'c:\\Users\\acer\\Downloads\\download\\src\\index.html';

try {
    let html = fs.readFileSync(htmlPath, 'utf8');

    // Remove the previously added Preload block that has inflated base64
    if (html.includes('/* ── PRELOAD IMAGES SAFARI FIX ── */')) {
        const parts = html.split('/* ── PRELOAD IMAGES SAFARI FIX ── */');
        const firstPart = parts[0];
        const secondPart = parts[1].split('/* INIT */')[1];

        html = firstPart + '\n        /* INIT */' + secondPart;
        console.log("Cleaned inflated preloader function successfully!");
    } else {
        console.log("No inflated preloader found in file");
    }

    fs.writeFileSync(htmlPath, html, 'utf8');
    console.log("File cleanup written.");

} catch (err) {
    console.error("Error cleaning file:", err);
}
