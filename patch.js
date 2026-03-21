const fs = require('fs');
const path = require('path');

const dir = 'c:\\Users\\acer\\Downloads\\download\\src';
const htmlPath = path.join(dir, 'index.html');
const b64Path = path.join(dir, 'logo_base64.txt');

try {
    let html = fs.readFileSync(htmlPath, 'utf8');

    // Normalize newlines inside HTML to \n to allow templates to match perfectly
    const originalNewlines = html.includes('\r\n');
    if (originalNewlines) {
        html = html.split('\r\n').join('\n');
    }

    // Read b64 written by PowerShell (typically utf16le)
    let b64 = '';
    try {
        // Try reading as utf16le first
        b64 = fs.readFileSync(b64Path, 'utf16le').trim();
        // If file has a BOM it can cause a issue, remove the BOM \uFEFF if it exists
        if (b64.charCodeAt(0) === 0xFEFF) { b64 = b64.slice(1); }
        if (b64.length < 10) { b64 = ''; } // invalid
    } catch (e) { }

    if (!b64 || b64.includes('\0')) {
        console.log("Fallback read file as utf8");
        b64 = fs.readFileSync(b64Path, 'utf8').trim();
    }

    if (!b64.startsWith('data:image')) {
        // Clean white-spaces that can break string
        b64 = 'data:image/png;base64,' + b64.replace(/[\s\r\n\0]+/g, '');
    }

    console.log(`B64 Length: ${b64.length}`);

    // 1. Replace logo link with base64
    const searchUrl = 'https://iili.io/qF2iwKu.png';
    const originalLength = html.length;
    html = html.split(searchUrl).join(b64);
    console.log(`Replaced image URL instances. Length delta: ${html.length - originalLength}`);

    // 2. Adjust doPrint()
    const doPrintOld = `        /* PRINT */
        async function doPrint(bw) {
            if (busy) return; busy = true; lockAll(true);
            toast('📥 Saving record copy…');
            try {
                const canvas = await captureBill(bw);
                await makePDF(canvas, bw);
                const bill = document.getElementById('bill');
                if (bw) bill.classList.add('bw-mode');
                toast('🖨️ Opening print dialog (A5)…');
                await new Promise(r => setTimeout(r, 600));
                window.print();
                setTimeout(() => { if (bw) bill.classList.remove('bw-mode'); }, 2000);
            } catch (e) { toast('❌ Error — please try again'); console.error(e); }
            finally { busy = false; lockAll(false); }
        }`;

    const doPrintNew = `        /* PRINT */
        async function doPrint(bw) {
            if (busy) return; busy = true; lockAll(true);
            toast('📥 Downloading record copy…');
            try {
                const canvas = await captureBill(bw);
                await makePDF(canvas, bw);
                
                const bill = document.getElementById('bill');
                if (bw) bill.classList.add('bw-mode');
                toast('🖨️ Opening print dialog (A5)…');
                
                // Safari window.print() escape chain fix
                setTimeout(() => {
                    window.print();
                    if (bw) bill.classList.remove('bw-mode');
                    busy = false; lockAll(false);
                }, 400);

            } catch (e) { 
                toast('❌ Error — please try again'); 
                console.error(e); 
                busy = false; lockAll(false);
            }
        }`;

    if (html.includes(doPrintOld)) {
        html = html.replace(doPrintOld, doPrintNew);
        console.log("Successfully patched doPrint() for Safari");
    } else {
        console.log("WARNING: doPrintOld match not found in html file");
    }

    // Convert back to original newlines layout if was present
    if (originalNewlines) {
        html = html.split('\n').join('\r\n');
    }

    fs.writeFileSync(htmlPath, html, 'utf8');
    console.log("Completed Successfully");

} catch (err) {
    console.error("Error patching file:", err);
}
