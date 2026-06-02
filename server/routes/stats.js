const express = require('express');
const db = require('../config/db');
const auth = require('../middleware/auth');

const router = express.Router();

router.get('/overview', auth, async (req, res) => {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString().split('T')[0];
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0).toISOString().split('T')[0];

  try {
    const [current, previous, accounts] = await Promise.all([
      db.query(
        `SELECT
          SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as income,
          SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as expenses
         FROM transactions WHERE user_id = $1 AND date >= $2`,
        [req.user.id, startOfMonth]
      ),
      db.query(
        `SELECT
          SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as income,
          SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as expenses
         FROM transactions WHERE user_id = $1 AND date >= $2 AND date <= $3`,
        [req.user.id, startOfLastMonth, endOfLastMonth]
      ),
      db.query(
        `SELECT
          SUM(CASE WHEN type = 'asset' THEN balance ELSE 0 END) as assets,
          SUM(CASE WHEN type = 'liability' THEN balance ELSE 0 END) as liabilities
         FROM accounts WHERE user_id = $1`,
        [req.user.id]
      ),
    ]);

    const cur = current.rows[0];
    const prev = previous.rows[0];
    const acc = accounts.rows[0];

    const income = parseFloat(cur.income) || 0;
    const expenses = parseFloat(cur.expenses) || 0;
    const prevIncome = parseFloat(prev.income) || 0;
    const prevExpenses = parseFloat(prev.expenses) || 0;
    const totalAssets = parseFloat(acc.assets) || 0;
    const totalLiabilities = parseFloat(acc.liabilities) || 0;

    const pctChange = (curr, prev) =>
      prev === 0 ? null : (((curr - prev) / prev) * 100).toFixed(1);

    res.json({
      income,
      expenses,
      savings: income - expenses,
      netWorth: totalAssets - totalLiabilities,
      savingsRate: income > 0 ? (((income - expenses) / income) * 100).toFixed(1) : 0,
      changes: {
        income: pctChange(income, prevIncome),
        expenses: pctChange(expenses, prevExpenses),
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch overview' });
  }
});

router.get('/cashflow', auth, async (req, res) => {
  const months = parseInt(req.query.months) || 12;
  try {
    const result = await db.query(
      `SELECT
        TO_CHAR(date_trunc('month', date), 'Mon') as month,
        EXTRACT(YEAR FROM date) as year,
        EXTRACT(MONTH FROM date) as month_num,
        SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as income,
        SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as expenses
       FROM transactions
       WHERE user_id = $1 AND date >= NOW() - INTERVAL '${months} months'
       GROUP BY date_trunc('month', date), EXTRACT(YEAR FROM date), EXTRACT(MONTH FROM date)
       ORDER BY date_trunc('month', date) ASC`,
      [req.user.id]
    );

    res.json(result.rows.map((r) => ({
      month: r.month,
      year: parseInt(r.year),
      income: parseFloat(r.income),
      expenses: parseFloat(r.expenses),
    })));
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch cash flow data' });
  }
});

router.get('/spending-by-category', auth, async (req, res) => {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];

  try {
    const result = await db.query(
      `SELECT category, SUM(amount) as total
       FROM transactions
       WHERE user_id = $1 AND type = 'expense' AND date >= $2
       GROUP BY category
       ORDER BY total DESC`,
      [req.user.id, startOfMonth]
    );

    res.json(result.rows.map((r) => ({ category: r.category, amount: parseFloat(r.total) })));
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch spending data' });
  }
});

router.get('/net-worth-history', auth, async (req, res) => {
  const months = parseInt(req.query.months) || 12;

  try {
    const [accountsResult, txResult] = await Promise.all([
      db.query(
        `SELECT
          SUM(CASE WHEN type = 'asset' THEN balance ELSE 0 END) as assets,
          SUM(CASE WHEN type = 'liability' THEN balance ELSE 0 END) as liabilities
         FROM accounts WHERE user_id = $1`,
        [req.user.id]
      ),
      db.query(
        `SELECT
          date_trunc('month', date) as month,
          SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as income,
          SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as expenses
         FROM transactions
         WHERE user_id = $1 AND date >= NOW() - INTERVAL '${months} months'
         GROUP BY date_trunc('month', date)
         ORDER BY month ASC`,
        [req.user.id]
      ),
    ]);

    const currentNetWorth =
      parseFloat(accountsResult.rows[0].assets || 0) -
      parseFloat(accountsResult.rows[0].liabilities || 0);

    const monthlyData = txResult.rows;
    const history = [];
    let runningNetWorth = currentNetWorth;

    const reversedMonths = [...monthlyData].reverse();
    for (const row of reversedMonths) {
      const date = new Date(row.month);
      history.unshift({
        month: date.toLocaleString('default', { month: 'short' }),
        year: date.getFullYear(),
        netWorth: Math.round(runningNetWorth),
      });
      runningNetWorth -= parseFloat(row.income) - parseFloat(row.expenses);
    }

    res.json(history);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch net worth history' });
  }
});

module.exports = router;
