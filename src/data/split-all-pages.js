// split-all-pages.js
const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname); // Bu dizinde çalışıyor: src/data içinde çalıştırmalısın

function splitFile(pageNumber) {
  const fileName = `page_${pageNumber}.json`;
  const filePath = path.join(DATA_DIR, fileName);

  if (!fs.existsSync(filePath)) {
    console.log(`❌ ${fileName} bulunamadı, atlanıyor...`);
    return;
  }

  const raw = fs.readFileSync(filePath, 'utf8');
  const json = JSON.parse(raw);

  if (!json.features || !Array.isArray(json.features)) {
    console.log(`⚠️  ${fileName} dosyasında features array'i yok!`);
    return;
  }

  const half = Math.ceil(json.features.length / 2);
  const aPart = {
    type: 'FeatureCollection',
    features: json.features.slice(0, half),
  };
  const bPart = {
    type: 'FeatureCollection',
    features: json.features.slice(half),
  };

  fs.writeFileSync(
    path.join(DATA_DIR, `page_${pageNumber}a.json`),
    JSON.stringify(aPart)
  );
  fs.writeFileSync(
    path.join(DATA_DIR, `page_${pageNumber}b.json`),
    JSON.stringify(bPart)
  );

  console.log(`✅ ${fileName} => page_${pageNumber}a.json + page_${pageNumber}b.json`);
}

function splitAll() {
  for (let i = 1; i <= 48; i++) {
    splitFile(i);
  }
}

splitAll();
