// split-page.js

const fs = require('fs');
const path = require('path');

const inputFile = process.argv[2];
if (!inputFile) {
  console.error('Kullanım: node split-page.js <dosya_ismi>');
  process.exit(1);
}

const inputPath = path.join(__dirname, 'src', 'data', inputFile);
const fileContent = fs.readFileSync(inputPath, 'utf8');
const parsed = JSON.parse(fileContent);

const features = parsed.features;

const half = Math.ceil(features.length / 2);
const firstHalf = features.slice(0, half);
const secondHalf = features.slice(half);

const baseName = path.basename(inputFile, '.json');

const firstOutput = path.join(__dirname, 'src', 'data', `${baseName}a.json`);
const secondOutput = path.join(__dirname, 'src', 'data', `${baseName}b.json`);

fs.writeFileSync(
  firstOutput,
  JSON.stringify({ type: 'FeatureCollection', features: firstHalf }, null, 2)
);
fs.writeFileSync(
  secondOutput,
  JSON.stringify({ type: 'FeatureCollection', features: secondHalf }, null, 2)
);

console.log(`✅ Bölme tamamlandı:
- ${firstOutput}
- ${secondOutput}`);
