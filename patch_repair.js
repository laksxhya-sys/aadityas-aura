const fs = require('fs');
const htmlPath = 'c:\\Users\\acer\\Downloads\\download\\src\\index.html';

try {
    let html = fs.readFileSync(htmlPath, 'utf8');

    const searchStr = `           We satisfy all three by initiating download immediately,`;

    // We want to insert above this string
    const codeToInsert = `        /* ── CAPTURE ── */
        async function captureBill(bw) {
            const bill = document.getElementById('bill');
            const saved = bill.style.transform;
            const savedShadow = bill.style.boxShadow;

            bill.style.transform = 'none';
            bill.style.boxShadow = 'none'; // CRITICAL SPEEDUP for Safari / Mac

            if (bw) { bill.classList.add('bw-mode'); await new Promise(r => setTimeout(r, 320)); }
            else { await new Promise(r => setTimeout(r, 30)); }

            const isMac = /Macintosh|iPhone|iPad|iPod/.test(navigator.userAgent);

            const canvas = await html2canvas(bill, {
                scale: isMac ? 1.5 : 2,
                useCORS: true,
                allowTaint: false,
                backgroundColor: bw ? '#ffffff' : '#f2e8d0',
                logging: false,
                imageTimeout: 0,
                foreignObjectRendering: false
            });
            if (bw) bill.classList.remove('bw-mode');
            bill.style.transform = saved;
            bill.style.boxShadow = savedShadow;
            return canvas;
        }

        /* ── SAFARI-SAFE DOWNLOAD
           Safari needs: (1) URL.createObjectURL blob (not dataURL),
                         (2) anchor appended to DOM,
                         (3) click happens in same microtask as user gesture.
`;

    if (html.includes(searchStr)) {
        // Replace the target and also restore the opening comment block that was lost
        html = html.replace(searchStr, codeToInsert + searchStr);
        fs.writeFileSync(htmlPath, html, 'utf8');
        console.log("Successfully repaired and inserted captureBill!");
    } else {
        console.log("Error: Anchor string not found triggers!");
    }

} catch (e) {
    console.error("Task failed:", e);
}
