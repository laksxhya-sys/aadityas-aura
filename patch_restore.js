const fs = require('fs');
const path = require('path');

const dir = 'c:\\Users\\acer\\Downloads\\download\\src';
const htmlPath = path.join(dir, 'index.html');

try {
    let html = fs.readFileSync(htmlPath, 'utf8');
    const originalNewlines = html.includes('\r\n');
    if (originalNewlines) { html = html.split('\r\n').join('\n'); }

    // 1. Remove Any Large Base64 URLs in html for any img src
    // Usually <img class="wm" src="data:..." ...> and <img class="logo-img" src="data:..." ...>
    let replacedCount = 0;
    html = html.replace(/src="data:image\/[^;]+;base64,[^"]+"/g, (match) => {
        replacedCount++;
        return 'src="logo.png"';
    });
    console.log(`Replaced ${replacedCount} large data URIs with "logo.png"`);

    // 2. Add topKey function to JavaScript
    const topKeyJs = `        function topKey(e, nextId) {
            if (e.key === 'Enter') {
                e.preventDefault();
                if (nextId === 'items') {
                    const inputs = document.querySelectorAll('#iroot .irow input');
                    if (inputs.length) inputs[0].focus();
                } else {
                    const el = document.getElementById(nextId);
                    if (el) el.focus();
                }
            }
        }`;

    if (!html.includes('function topKey')) {
        // Find safe spot to insert e.g. before "/* STATE */" or "/* TOAST */"
        if (html.includes('/* STATE */')) {
            html = html.replace('/* STATE */', `${topKeyJs}\n\n        /* STATE */`);
            console.log("Injected topKey focus helper");
        } else {
            // Fallback at bottom script
            html = html.replace('</script>', `${topKeyJs}\n</script>`);
        }
    }

    // 3. Remove Preloader logic added previously
    const preloadBlock = `        /* ── PRELOAD IMAGES SAFARI FIX ── */
        async function loadImages() {
            const url = "https://iili.io/qF2iwKu.png";
            try {
                const res = await fetch(url);
                const blob = await res.blob();
                const objUrl = URL.createObjectURL(blob);
                document.querySelectorAll('img[src="https://iili.io/qF2iwKu.png"]').forEach(img => img.src = objUrl);
            } catch (e) { console.error("Logo load error:", e); }
        }`;

    if (html.includes(preloadBlock)) {
        html = html.replace(preloadBlock, '');
        console.log("Removed Preload images Safai fix");
    }

    // Replace loadImages() inside INIT call
    html = html.replace('        loadImages();\n', '');

    // 4. Update control grid inputs to use onkeydown triggers
    const ctrlGridOld = `            <div>
                <label>Customer Name (M/s)</label>
                <input id="cust" type="text" placeholder="Client Name" oninput="upd()">
            </div>
            <div>
                <label>Bill No.</label>
                <input id="bno" type="text" value="1" oninput="upd()">
            </div>
            <div>
                <label>Customer Number</label>
                <input id="cust-num" type="text" placeholder="Contact number" oninput="upd()">
            </div>
            <div>
                <label>Customer Address</label>
                <input id="cust-addr" type="text" placeholder="Address" oninput="upd()">
            </div>`;

    const ctrlGridNew = `            <div>
                <label>Customer Name (M/s)</label>
                <input id="cust" type="text" placeholder="Client Name" oninput="upd()" onkeydown="topKey(event, 'bno')">
            </div>
            <div>
                <label>Bill No.</label>
                <input id="bno" type="text" value="1" oninput="upd()" onkeydown="topKey(event, 'cust-num')">
            </div>
            <div>
                <label>Customer Number</label>
                <input id="cust-num" type="text" placeholder="Contact number" oninput="upd()" onkeydown="topKey(event, 'cust-addr')">
            </div>
            <div>
                <label>Customer Address</label>
                <input id="cust-addr" type="text" placeholder="Address" oninput="upd()" onkeydown="topKey(event, 'items')">
            </div>`;

    if (html.includes(ctrlGridOld)) {
        html = html.replace(ctrlGridOld, ctrlGridNew);
        console.log("Added enter-to-focus to top controls inputs grid");
    } else {
        console.log("WARNING: ctrlGridOld pattern not found in html file");
    }

    if (originalNewlines) { html = html.split('\n').join('\r\n'); }
    fs.writeFileSync(htmlPath, html, 'utf8');
    console.log("Restore & enter triggers Completed successfully!");

} catch (err) {
    console.error("Error patching file:", err);
}
