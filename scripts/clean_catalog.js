const fs = require('fs');
const path = require('path');

const filePath = path.resolve('js/data/products.js');
const rawCode = fs.readFileSync(filePath, 'utf8');

const window = {};
eval(rawCode);

console.log('Total before cleanup:', window.TIMBER_PRODUCTS.length);

const cleaned = window.TIMBER_PRODUCTS.filter(p => p.id && p.id.startsWith('tl_'));

console.log('Total after cleanup:', cleaned.length);

const content = `/**
 * THE TIMBER LIGHTS — OFFICIAL COMPLETE PRODUCT CATALOG
 * Collection 2026 • Signature Architectural Wooden Lighting Series
 * All 25 Handcrafted Solid Ghana Teak Wood Lighting Fixtures
 */

window.TIMBER_WOOD_POLISH_OPTIONS = [
  "Walnut", "Oak", "Teak", "Mahogany", "Cherry", "Maple", "Ash", "Cedar"
];

window.TIMBER_WOOD_COATING_OPTIONS = [
  "Laquer", "Melamine", "PU", "Wax"
];

window.TIMBER_COATING_FINISH_OPTIONS = [
  "Matt", "Semi", "Glossy"
];

window.TIMBER_SIZE_NOTE = "Size mentioned is net wood size. Bulb will be as per actual.";

window.TIMBER_PRODUCTS = ${JSON.stringify(cleaned, null, 2)};
`;

fs.writeFileSync(filePath, content, 'utf8');
console.log('Catalog successfully cleaned and saved!');
