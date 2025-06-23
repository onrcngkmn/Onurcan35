const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

const musicDirs = [
  path.join(__dirname, 'public', 'music'),
  path.join(__dirname, 'public', 'music2'),
  path.join(__dirname, 'public', 'music3'),
  path.join(__dirname, 'public', 'music4'),
  path.join(__dirname, 'public', 'music5'),
];

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

function getSongsFromDir(dirPath) {
  return new Promise((resolve, reject) => {
    fs.readdir(dirPath, (err, files) => {
      if (err) return reject(err);
      const songs = files
        .filter(f => f.toLowerCase().endsWith('.mp3'))
        .map(f => ({
          name: path.parse(f).name,
          file: `/${path.relative(path.join(__dirname, 'public'), path.join(dirPath, f)).replace(/\\/g, '/')}`
        }));
      resolve(songs);
    });
  });
}

app.get('/songs/:listNum', async (req, res) => {
  const listNum = parseInt(req.params.listNum);
  if (isNaN(listNum) || listNum < 1 || listNum > musicDirs.length) {
    return res.status(400).json({ error: 'Geçersiz liste numarası' });
  }
  try {
    const songs = await getSongsFromDir(musicDirs[listNum - 1]);
    res.json(songs);
  } catch (e) {
    res.status(500).json({ error: 'Müzik listesi alınamadı' });
  }
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Sunucu http://localhost:${PORT} adresinde çalışıyor.`);
});
