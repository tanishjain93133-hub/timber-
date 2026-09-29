const fs = require('fs');
const path = require('path');

const pdfPath = 'C:\\Users\\Tanish Jain\\Downloads\\THE HANGING TIMBER LIGHTS WITH RATES.pdf';
const outputDir = path.join(__dirname, '..', 'images', 'catalog');

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

const buffer = fs.readFileSync(pdfPath);
console.log('Read PDF of length:', buffer.length);

// Extract JPEG streams: markers 0xFFD8 to 0xFFD9
let count = 0;
let pos = 0;

while (pos < buffer.length - 1) {
  if (buffer[pos] === 0xFF && buffer[pos + 1] === 0xD8) {
    // Found start of JPEG
    let end = pos + 2;
    while (end < buffer.length - 1) {
      if (buffer[end] === 0xFF && buffer[end + 1] === 0xD9) {
        // Found end of JPEG
        const imgBuf = buffer.slice(pos, end + 2);
        if (imgBuf.length > 5000) { // filter out tiny icons
          count++;
          const outName = path.join(outputDir, `timber_light_${String(count).padStart(3, '0')}.jpg`);
          fs.writeFileSync(outName, imgBuf);
          console.log(`Saved image ${count}: ${imgBuf.length} bytes -> ${outName}`);
        }
        pos = end + 2;
        break;
      }
      end++;
    }
    if (end >= buffer.length - 1) {
      break;
    }
  } else {
    pos++;
  }
}

console.log(`Total JPEG images extracted: ${count}`);
