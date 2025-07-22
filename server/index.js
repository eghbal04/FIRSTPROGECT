const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const basicAuth = require('express-basic-auth');

const app = express();
const PORT = process.env.PORT || 3001;
const PRICES_FILE = path.join(__dirname, 'prices.json');
const FORUM_FILE = path.join(__dirname, 'forum-messages.json');
const TOPICS_FILE = path.join(__dirname, 'forum-topics.json');

app.use(basicAuth({
  users: { 'dulhomqmp': '428199846533476' },
  challenge: true,
  unauthorizedResponse: 'دسترسی غیرمجاز'
}));

app.use(cors());
app.use(bodyParser.json());

// سرو استاتیک سایت از پوشه public
app.use(express.static(path.join(__dirname, '../public')));

// API: دریافت تاریخچه قیمت
app.get('/api/prices', (req, res) => {
  if (!fs.existsSync(PRICES_FILE)) return res.json([]);
  const data = fs.readFileSync(PRICES_FILE, 'utf-8');
  try {
    res.json(JSON.parse(data));
  } catch {
    res.json([]);
  }
});

// API: ذخیره قیمت جدید
app.post('/api/prices', (req, res) => {
  const { tokenPrice, pointPrice } = req.body;
  if (typeof tokenPrice !== 'number' || typeof pointPrice !== 'number') {
    return res.status(400).json({ error: 'مقادیر نامعتبر' });
  }
  let prices = [];
  if (fs.existsSync(PRICES_FILE)) {
    try { prices = JSON.parse(fs.readFileSync(PRICES_FILE, 'utf-8')); } catch {}
  }
  prices.push({ tokenPrice, pointPrice, timestamp: new Date().toISOString() });
  fs.writeFileSync(PRICES_FILE, JSON.stringify(prices, null, 2));
  res.json({ success: true });
});

// دریافت پیام‌های یک تاپیک
app.get('/api/forum-messages', (req, res) => {
  const topicId = req.query.topicId;
  if (!topicId) return res.status(400).json({ error: 'topicId الزامی است' });
  let all = [];
  if (fs.existsSync(FORUM_FILE)) {
    try { all = JSON.parse(fs.readFileSync(FORUM_FILE, 'utf-8')); } catch {}
  }
  const messages = all.filter(m => m.topicId === topicId);
  res.json(messages);
});

// ذخیره پیام جدید
app.post('/api/forum-messages', (req, res) => {
  const { topicId, nick, index, time, text, voiceUrl } = req.body;
  if (!topicId || !nick || !index || !time || (!text && !voiceUrl)) {
    return res.status(400).json({ error: 'مقادیر پیام ناقص است' });
  }
  let all = [];
  if (fs.existsSync(FORUM_FILE)) {
    try { all = JSON.parse(fs.readFileSync(FORUM_FILE, 'utf-8')); } catch {}
  }
  all.push({ topicId, nick, index, time, text, voiceUrl });
  fs.writeFileSync(FORUM_FILE, JSON.stringify(all, null, 2));
  res.json({ success: true });
});

// دریافت لیست تاپیک‌ها
app.get('/api/forum-topics', (req, res) => {
  let topics = [];
  if (fs.existsSync(TOPICS_FILE)) {
    try { topics = JSON.parse(fs.readFileSync(TOPICS_FILE, 'utf-8')); } catch {}
  }
  res.json(topics);
});

// ذخیره تاپیک جدید
app.post('/api/forum-topics', (req, res) => {
  const { id, title, desc, creator, index, created } = req.body;
  if (!id || !title || !creator || !index || !created) {
    return res.status(400).json({ error: 'مقادیر تاپیک ناقص است' });
  }
  let topics = [];
  if (fs.existsSync(TOPICS_FILE)) {
    try { topics = JSON.parse(fs.readFileSync(TOPICS_FILE, 'utf-8')); } catch {}
  }
  topics.unshift({ id, title, desc, creator, index, created });
  fs.writeFileSync(TOPICS_FILE, JSON.stringify(topics, null, 2));
  res.json({ success: true });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
}); 