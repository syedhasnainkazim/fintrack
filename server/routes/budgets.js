const express = require('express');
const { body, validationResult } = require('express-validator');
const db = require('../config/db');
const auth = require('../middleware/auth');

const router = express.Router();

router.get('/', auth, async (req, res) => {
  try {
    const budgets = await db.query(
      'SELECT * FROM budgets WHERE user_id = $1 ORDER BY category',
      [req.user.id]
    );

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const spending = await db.query(
      `SELECT category, SUM(amount) as spent
       FROM transactions
       WHERE user_id = $1 AND type = 'expense' AND date >= $2
       GROUP BY category`,
      [req.user.id, startOfMonth.toISOString().split('T')[0]]
    );

    const spendingMap = {};
    spending.rows.forEach((r) => { spendingMap[r.category] = parseFloat(r.spent); });

    const result = budgets.rows.map((b) => ({
      ...b,
      spent: spendingMap[b.category] || 0,
    }));

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch budgets' });
  }
});

router.post(
  '/',
  auth,
  [
    body('category').trim().notEmpty(),
    body('amount').isFloat({ gt: 0 }),
    body('period').optional().isIn(['monthly', 'yearly']),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ error: errors.array()[0].msg });

    const { category, amount, period = 'monthly' } = req.body;
    try {
      const result = await db.query(
        'INSERT INTO budgets (user_id, category, amount, period) VALUES ($1, $2, $3, $4) RETURNING *',
        [req.user.id, category, amount, period]
      );
      res.status(201).json(result.rows[0]);
    } catch (err) {
      if (err.code === '23505') return res.status(409).json({ error: 'Budget for this category already exists' });
      res.status(500).json({ error: 'Failed to create budget' });
    }
  }
);

router.put(
  '/:id',
  auth,
  [body('amount').isFloat({ gt: 0 })],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ error: errors.array()[0].msg });

    const { amount, period } = req.body;
    try {
      const result = await db.query(
        'UPDATE budgets SET amount=$1, period=COALESCE($2, period), updated_at=NOW() WHERE id=$3 AND user_id=$4 RETURNING *',
        [amount, period || null, req.params.id, req.user.id]
      );
      if (!result.rows[0]) return res.status(404).json({ error: 'Budget not found' });
      res.json(result.rows[0]);
    } catch (err) {
      res.status(500).json({ error: 'Failed to update budget' });
    }
  }
);

router.delete('/:id', auth, async (req, res) => {
  try {
    const result = await db.query(
      'DELETE FROM budgets WHERE id = $1 AND user_id = $2 RETURNING id',
      [req.params.id, req.user.id]
    );
    if (!result.rows[0]) return res.status(404).json({ error: 'Budget not found' });
    res.json({ message: 'Budget deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete budget' });
  }
});

module.exports = router;
