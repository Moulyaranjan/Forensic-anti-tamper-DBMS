const express = require('express');
const router = express.Router();
const db = require('../db');

router.post('/view', async (req, res) => {
  const { case_id, warrant_id, user } = req.body;

  try {
    const result = await db.query(
      `SELECT * FROM access_evidence($1, $2, $3)`,
      [case_id, warrant_id, user]
    );

    res.json(result.rows);
  } catch (err) {
    res.status(500).json(err.message);
  }
});

module.exports = router;