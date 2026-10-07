// 손맛어보 서버: 정적 파일(public, uploads) + REST API
const path = require('path');
const express = require('express');
const { UPLOAD_DIR } = require('./db');
const api = require('./routes/api');

const app = express();
app.use(express.json());
app.use('/api', api);
app.get('/progress.js', (req, res) => res.sendFile(path.join(__dirname, 'progress.js'))); // 서버와 같은 계산 코드
app.use('/uploads', express.static(UPLOAD_DIR));
app.use(express.static(path.join(__dirname, 'public')));

module.exports = app;

if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => console.log(`손맛어보 실행 중 → http://localhost:${PORT}`));
}
