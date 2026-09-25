const fs = require('fs');
const path = require('path');
const axios = require('axios');

const QURAN_COM_BASE = 'https://api.quran.com/api/v4';

function cleanText(text) {
  if (!text) return '';
  return text
    .replace(/<sup[^>]*>.*?<\/sup>/gi, '')
    .replace(/<[^>]*>?/gm, '')
    .trim();
}

async function run() {
  try {
    console.log('Fetching Surah list from Quran.com API (v4)...');
    const chapRes = await axios.get(`${QURAN_COM_BASE}/chapters`, { timeout: 30000 });
    const chapters = chapRes.data?.chapters;

    if (!chapters || chapters.length !== 114) {
      throw new Error('Failed to fetch chapters from Quran.com API.');
    }

    const surahs = [];
    const ayahs = [];
    let globalVerseCounter = 1;

    for (let i = 0; i < chapters.length; i++) {
      const ch = chapters[i];
      console.log(`[${i + 1}/114] Downloading Surah ${ch.id}: ${ch.name_simple} (${ch.name_arabic})...`);

      surahs.push({
        number: ch.id,
        name: ch.name_arabic,
        englishName: ch.name_simple,
        englishNameTranslation: ch.translated_name?.name || ch.name_simple,
        revelationType: ch.revelation_place === 'makkah' ? 'Meccan' : 'Medinan',
        numberOfAyahs: ch.verses_count,
      });

      const versesRes = await axios.get(
        `${QURAN_COM_BASE}/verses/by_chapter/${ch.id}?words=false&translations=20,234&fields=text_indopak,text_qpc_hafs,text_uthmani,chapter_id,verse_number,page_number,juz_number&per_page=300`,
        { timeout: 30000 }
      );

      const verses = versesRes.data?.verses || [];
      for (const v of verses) {
        const enTransObj = v.translations?.find((t) => t.resource_id === 20 || t.resource_id === 131);
        const urTransObj = v.translations?.find((t) => t.resource_id === 234);

        const translationEn = cleanText(enTransObj?.text);
        const translationUr = cleanText(urTransObj?.text);
        const surahPadded = String(ch.id).padStart(3, '0');
        const ayahPadded = String(v.verse_number).padStart(3, '0');
        const audioUrl = `https://audio.qurancdn.com/Alafasy/mp3/${surahPadded}${ayahPadded}.mp3`;
        
        let arabicText = (v.text_indopak || v.text_qpc_hafs || v.text_uthmani || '').replace(/[\s\u00A0]*[\u0660-\u0669\u06F0-\u06F9]+$/g, '').trim();

        ayahs.push({
          number: globalVerseCounter,
          surahNumber: ch.id,
          numberInSurah: v.verse_number,
          juzNumber: v.juz_number,
          pageNumber: v.page_number,
          text: arabicText,
          translationEn,
          translationUr,
          audio: audioUrl,
        });

        globalVerseCounter++;
      }
    }

    if (surahs.length !== 114 || ayahs.length !== 6236) {
      throw new Error(`Incomplete Quran data downloaded: ${surahs.length} surahs, ${ayahs.length} ayahs.`);
    }

    const result = { surahs, ayahs };
    const outputPath = path.join(__dirname, '..', 'assets', 'quran.json');
    console.log(`Writing bundled Quran data to ${outputPath}...`);
    fs.writeFileSync(outputPath, JSON.stringify(result));
    console.log('Quran data bundled successfully from Quran.com API!');
  } catch (error) {
    console.error('Error bundling Quran data from Quran.com API:', error.message);
    process.exit(1);
  }
}

run();
