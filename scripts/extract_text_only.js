const fs = require('fs');
const path = require('path');

async function main() {
  const pdfjsLib = await import('pdfjs-dist/legacy/build/pdf.mjs');
  const pdfPath = 'C:\\Users\\Tanish Jain\\Downloads\\THE HANGING TIMBER LIGHTS WITH RATES.pdf';
  const data = new Uint8Array(fs.readFileSync(pdfPath));
  const doc = await pdfjsLib.getDocument({ data }).promise;

  console.log(`Total Pages: ${doc.numPages}`);
  const pages = [];

  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const textContent = await page.getTextContent();
    const items = textContent.items.map(it => ({
      str: it.str,
      x: Math.round(it.transform[4]),
      y: Math.round(it.transform[5])
    }));
    const fullText = items.map(t => t.str).join(' ');
    console.log(`\n--- PAGE ${i} ---`);
    console.log(fullText);
    pages.push({ page: i, fullText, items });
  }

  fs.writeFileSync(path.join(__dirname, 'pdf_pages_text.json'), JSON.stringify(pages, null, 2));
}

main().catch(console.error);
