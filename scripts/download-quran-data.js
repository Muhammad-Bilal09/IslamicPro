const fs = require('fs');
const path = require('path');
const https = require('https');

const API_BASE = 'https://api.alquran.cloud/v1/quran';

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode !== 200) {
        reject(new Error(`Failed to fetch ${url}: Status ${res.statusCode}`));
        return;
      }
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

async function run() {
  try {
    console.log('Downloading Arabic text...');
    const arabicData = await fetchUrl(`${API_BASE}/quran-simple`);
    console.log('Downloading English translation...');
    const enData = await fetchUrl(`${API_BASE}/en.asad`);
    console.log('Downloading Urdu translation...');
    const urData = await fetchUrl(`${API_BASE}/ur.jalandhry`);
    console.log('Downloading audio links...');
    const audioData = await fetchUrl(`${API_BASE}/ar.alafasy`);

    console.log('Processing data...');
    const arabicSurahs = arabicData.data.surahs;
    const enSurahs = enData.data.surahs;
    const urSurahs = urData.data.surahs;
    const audioSurahs = audioData.data.surahs;

    if (
      arabicSurahs.length !== 114 ||
      enSurahs.length !== 114 ||
      urSurahs.length !== 114 ||
      audioSurahs.length !== 114
    ) {
      throw new Error('Incomplete data downloaded. Quran must contain 114 Surahs.');
    }

    const surahs = [];
    const ayahs = [];

    for (let sIdx = 0; sIdx < 114; sIdx++) {
      const sArabic = arabicSurahs[sIdx];
      const sEn = enSurahs[sIdx];
      const sUr = urSurahs[sIdx];
      const sAudio = audioSurahs[sIdx];

      surahs.push({
        number: sArabic.number,
        name: sArabic.name,
        englishName: sArabic.englishName,
        englishNameTranslation: sArabic.englishNameTranslation,
        revelationType: sArabic.revelationType,
        numberOfAyahs: sArabic.numberOfAyahs
      });

      for (let aIdx = 0; aIdx < sArabic.ayahs.length; aIdx++) {
        const aArabic = sArabic.ayahs[aIdx];
        const aEn = sEn.ayahs[aIdx];
        const aUr = sUr.ayahs[aIdx];
        const aAudio = sAudio.ayahs[aIdx];

        ayahs.push({
          number: aArabic.number,
          surahNumber: sArabic.number,
          numberInSurah: aArabic.numberInSurah,
          juzNumber: aArabic.juz,
          pageNumber: aArabic.page,
          text: aArabic.text,
          translationEn: aEn.text,
          translationUr: aUr.text,
          audio: aAudio.audio
        });
      }
    }

    const result = { surahs, ayahs };
    const outputPath = path.join(__dirname, '..', 'assets', 'quran.json');
    console.log(`Writing data to ${outputPath}...`);
    fs.writeFileSync(outputPath, JSON.stringify(result));
    console.log('Quran data bundled successfully!');
  } catch (error) {
    console.error('Error bundling Quran data:', error);
    process.exit(1);
  }
}

run();
