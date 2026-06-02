const express = require('express');
const { body, query, validationResult } = require('express-validator');
const db = require('../config/db');
const auth = require('../middleware/auth');

const router = express.Router();

router.get('/', auth, async (req, res) => {
  const { type, category, startDate, endDate, search, page = 1, limit = 50 } = req.query;
  const offset = (parseInt(page) - 1) * parseInt(limit);

  let conditions = ['user_id = $1'];
  let params = [req.user.id];
  let idx = 2;

  if (type) { conditions.push(`type = $${idx++}`); params.push(type); }
  if (category) { conditions.push(`category = $${idx++}`); params.push(category); }
  if (startDate) { conditions.push(`date >= $${idx++}`); params.push(startDate); }
  if (endDate) { conditions.push(`date <= $${idx++}`); params.push(endDate); }
  if (search) { conditions.push(`(description ILIKE $${idx++} OR category ILIKE $${idx - 1})`); params.push(`%${search}%`); }

  const where = conditions.join(' AND ');

  try {
    const countResult = await db.query(`SELECT COUNT(*) FROM transactions WHERE ${where}`, params);
    const total = parseInt(countResult.rows[0].count);

    const result = await db.query(
      `SELECT * FROM transactions WHERE ${where} ORDER BY date DESC, created_at DESC LIMIT $${idx++} OFFSET $${idx++}`,
      [...params, parseInt(limit), offset]
    );

    res.json({ transactions: result.rows, total, page: parseInt(page), limit: parseInt(limit) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});

router.post(
  '/',
  auth,
  [
    body('type').isIn(['income', 'expense']),
    body('category').trim().notEmpty(),
    body('amount').isFloat({ gt: 0 }),
    body('date').isDate(),
    body('description').optional().trim(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ error: errors.array()[0].msg });

    const { type, category, description, amount, date } = req.body;
    try {
      const result = await db.query(
        'INSERT INTO transactions (user_id, type, category, description, amount, date) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
        [req.user.id, type, category, description || null, amount, date]
      );
      res.status(201).json(result.rows[0]);
    } catch (err) {
      res.status(500).json({ error: 'Failed to create transaction' });
    }
  }
);

router.put(
  '/:id',
  auth,
  [
    body('type').isIn(['income', 'expense']),
    body('category').trim().notEmpty(),
    body('amount').isFloat({ gt: 0 }),
    body('date').isDate(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ error: errors.array()[0].msg });

    const { type, category, description, amount, date } = req.body;
    try {
      const result = await db.query(
        'UPDATE transactions SET type=$1, category=$2, description=$3, amount=$4, date=$5, updated_at=NOW() WHERE id=$6 AND user_id=$7 RETURNING *',
        [type, category, description || null, amount, date, req.params.id, req.user.id]
      );
      if (!result.rows[0]) return res.status(404).json({ error: 'Transaction not found' });
      res.json(result.rows[0]);
    } catch (err) {
      res.status(500).json({ error: 'Failed to update transaction' });
    }
  }
);

router.delete('/:id', auth, async (req, res) => {
  try {
    const result = await db.query(
      'DELETE FROM transactions WHERE id = $1 AND user_id = $2 RETURNING id',
      [req.params.id, req.user.id]
    );
    if (!result.rows[0]) return res.status(404).json({ error: 'Transaction not found' });
    res.json({ message: 'Transaction deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete transaction' });
  }
});

module.exports = router;
