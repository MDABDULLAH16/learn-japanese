const fs = require('fs');

try {
  let content = fs.readFileSync('src/lib/kanji_1-120.md', 'utf8');
  content = content.replace(/\\\[/g, '[').replace(/\\\]/g, ']');
  let data = JSON.parse(content);
  
  let kanjiN5 = [];
  try {
    kanjiN5 = JSON.parse(fs.readFileSync('src/lib/kanji_n5.json', 'utf8'));
  } catch (e) {
    console.log("Could not read kanji_n5.json", e);
  }

  // Update source
  data.source_format = "ARS ABDULLAH";
  data.source_academy = "ARS ABDULLAH";
  
  data.kanji_database = data.kanji_database.map(item => {
    // Find matching kanji in kanji_n5.json
    let match = kanjiN5.find(k => k.kanji === item.kanji);
    if (match && match.sentences) {
      item.sentences = match.sentences;
    } else {
      item.sentences = [];
    }
    return item;
  });

  fs.writeFileSync('src/lib/kanji_1-120.json', JSON.stringify(data, null, 2));
  console.log('Successfully written to kanji_1-120.json');
} catch (e) {
  console.error(e);
}
