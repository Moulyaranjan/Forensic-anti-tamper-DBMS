const express = require('express');
const router = express.Router();
const db = require('../db');

router.post('/add', async (req, res) => {
  const { case_id, data, warrant_id } = req.body;

  try {
    const result = await db.query(
      `INSERT INTO evidence_chain (case_id, data, action_type, warrant_id)
       VALUES ($1, $2, 'INSERT', $3)
       RETURNING *`,
      [case_id, data, warrant_id]
    );

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json(err.message);
  }
});

module.exports = router;