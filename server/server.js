require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const fs = require('fs');
const db = require('./config/db');

const authRoutes = require('./routes/auth');
const transactionRoutes = require('./routes/transactions');
const budgetRoutes = require('./routes/budgets');
const accountRoutes = require('./routes/accounts');
const statsRoutes = require('./routes/stats');

const app = express();
const isProd = process.env.NODE_ENV === 'production';

app.use(helmet({
  contentSecurityPolicy: isProd ? undefined : false,
}));

app.use(cors({
  origin: isProd
    ? (process.env.CLIENT_URL || true)
    : (process.env.CLIENT_URL || 'http://localhost:5173'),
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: { error: 'Too many requests, please try again later.' },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: 'Too many auth attempts, please try again later.' },
});

app.use('/api', apiLimiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

app.use('/api/auth', authRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/budgets', budgetRoutes);
app.use('/api/accounts', accountRoutes);
app.use('/api/stats', statsRoutes);

app.get('/api/health', (req, res) => res.json({ status: 'ok', timestamp: new Date() }));

if (isProd) {
  const clientDist = path.join(__dirname, '../client/dist');
  app.use(express.static(clientDist));
  app.get('*', (req, res) => {
    res.sendFile(path.join(clientDist, 'index.html'));
  });
}

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

async function migrate() {
  const schema = fs.readFileSync(path.join(__dirname, 'db/schema.sql'), 'utf8');
  await db.query(schema);
  console.log('Database schema ready');
}

const PORT = process.env.PORT || 5001;

migrate()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`FinTrack running on port ${PORT} [${process.env.NODE_ENV || 'development'}]`);
    });
  })
  .catch((err) => {
    console.error('Migration failed:', err);
    process.exit(1);
  });
