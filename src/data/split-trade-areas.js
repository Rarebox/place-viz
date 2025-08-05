// split-trade-areas.js
const fs = require('fs');
const data = JSON.parse(fs.readFileSync('trade_areas.json', 'utf8'));

const CHUNK_SIZE = 100;
const features = data.features || data;

features.forEach((_, i) => {
  if (i % CHUNK_SIZE === 0) {
    const chunk = features.slice(i, i + CHUNK_SIZE);
    const fileName = `page_${i / CHUNK_SIZE + 1}.json`;
    fs.writeFileSync(fileName, JSON.stringify({ type: 'FeatureCollection', features: chunk }));
  }
});
