const express = require('express');
const { body, validationResult } = require('express-validator');
const db = require('../config/db');
const auth = require('../middleware/auth');

const router = express.Router();

router.get('/', auth, async (req, res) => {
  try {
    const result = await db.query(
      'SELECT * FROM accounts WHERE user_id = $1 ORDER BY type, name',
      [req.user.id]
    );

    const accounts = result.rows;
    const totalAssets = accounts
      .filter((a) => a.type === 'asset')
      .reduce((sum, a) => sum + parseFloat(a.balance), 0);
    const totalLiabilities = accounts
      .filter((a) => a.type === 'liability')
      .reduce((sum, a) => sum + parseFloat(a.balance), 0);

    res.json({ accounts, totalAssets, totalLiabilities, netWorth: totalAssets - totalLiabilities });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch accounts' });
  }
});

router.post(
  '/',
  auth,
  [
    body('name').trim().notEmpty().withMessage('Account name is required'),
    body('type').isIn(['asset', 'liability']).withMessage('Type must be asset or liability'),
    body('balance').isFloat().withMessage('Balance must be a number'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ error: errors.array()[0].msg });

    const { name, type, balance } = req.body;
    try {
      const result = await db.query(
        'INSERT INTO accounts (user_id, name, type, balance) VALUES ($1, $2, $3, $4) RETURNING *',
        [req.user.id, name, type, balance]
      );
      res.status(201).json(result.rows[0]);
    } catch (err) {
      res.status(500).json({ error: 'Failed to create account' });
    }
  }
);

router.put(
  '/:id',
  auth,
  [
    body('name').trim().notEmpty(),
    body('type').isIn(['asset', 'liability']),
    body('balance').isFloat(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ error: errors.array()[0].msg });

    const { name, type, balance } = req.body;
    try {
      const result = await db.query(
        'UPDATE accounts SET name=$1, type=$2, balance=$3, updated_at=NOW() WHERE id=$4 AND user_id=$5 RETURNING *',
        [name, type, balance, req.params.id, req.user.id]
      );
      if (!result.rows[0]) return res.status(404).json({ error: 'Account not found' });
      res.json(result.rows[0]);
    } catch (err) {
      res.status(500).json({ error: 'Failed to update account' });
    }
  }
);

router.delete('/:id', auth, async (req, res) => {
  try {
    const result = await db.query(
      'DELETE FROM accounts WHERE id = $1 AND user_id = $2 RETURNING id',
      [req.params.id, req.user.id]
    );
    if (!result.rows[0]) return res.status(404).json({ error: 'Account not found' });
    res.json({ message: 'Account deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete account' });
  }
});

module.exports = router;
