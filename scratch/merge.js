const fs = require('fs');

const k1 = JSON.parse(fs.readFileSync('src/lib/kanji_1-120.json', 'utf8'));
const k2 = JSON.parse(fs.readFileSync('src/lib/kanji_n5.json', 'utf8'));

// k1 is the one with kanji_database array, source_format etc
// k2 is the array of 120 kanjis currently used by the app

const merged = k2.map(item => {
  const sourceItem = k1.kanji_database.find(k => k.kanji === item.kanji);
  if (sourceItem) {
    // Merge new fields
    item.mnemonic = sourceItem.mnemonic;
    item.kun_yomi_new = sourceItem.kun_yomi;
    item.on_yomi_new = sourceItem.on_yomi;
    // ensure sentences are kept
    if (sourceItem.sentences && sourceItem.sentences.length > 0) {
      item.sentences = sourceItem.sentences;
    }
  }
  return item;
});

// Write to kanji_n5.json
fs.writeFileSync('src/lib/kanji_n5.json', JSON.stringify(merged, null, 2));
console.log('Merged successfully!');
