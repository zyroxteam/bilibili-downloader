import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import parseHandler from './api/parse.js';
import downloadHandler from './api/download.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static frontend from public folder
app.use(express.static(path.join(__dirname, 'public')));

// API Routes (matching Vercel serverless functions)
app.all('/api/parse', (req, res) => parseHandler(req, res));
app.all('/api/download', (req, res) => downloadHandler(req, res));

// Fallback to index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n======================================================`);
  console.log(`⚡ ARJUN RAJPUT • BILIBILI DOWNLOADER (MADE BY ZYROX)`);
  console.log(`🚀 Live Server running on http://0.0.0.0:${PORT}`);
  console.log(`======================================================\n`);
});
