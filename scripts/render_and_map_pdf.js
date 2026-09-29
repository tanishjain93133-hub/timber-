const fs = require('fs');
const path = require('path');

async function main() {
  const pdfjsLib = await import('pdfjs-dist/legacy/build/pdf.mjs');
  const { createCanvas } = require('canvas');

  const pdfPath = 'C:\\Users\\Tanish Jain\\Downloads\\THE HANGING TIMBER LIGHTS WITH RATES.pdf';
  const outDir = path.join(__dirname, '..', 'images', 'pdf_pages');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  const data = new Uint8Array(fs.readFileSync(pdfPath));
  const doc = await pdfjsLib.getDocument({ data }).promise;

  console.log(`Total Pages in PDF: ${doc.numPages}`);

  const pageTexts = [];

  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const viewport = page.getViewport({ scale: 2.0 }); // 2x high-res
    const canvas = createCanvas(viewport.width, viewport.height);
    const context = canvas.getContext('2d');

    await page.render({ canvasContext: context, viewport }).promise;

    const pageImgPath = path.join(outDir, `page_${String(i).padStart(2, '0')}.png`);
    fs.writeFileSync(pageImgPath, canvas.toBuffer('image/png'));
    console.log(`Rendered page ${i} -> ${pageImgPath} (${viewport.width}x${viewport.height})`);

    const textContent = await page.getTextContent();
    const textItems = textContent.items.map(item => ({
      str: item.str,
      x: item.transform[4],
      y: item.transform[5],
      width: item.width,
      height: item.height
    }));

    pageTexts.push({
      page: i,
      text: textItems.map(t => t.str).join(' '),
      items: textItems
    });
  }

  fs.writeFileSync(path.join(__dirname, 'pdf_extracted_text.json'), JSON.stringify(pageTexts, null, 2));
  console.log('Saved all page texts to pdf_extracted_text.json');
}

main().catch(console.error);
