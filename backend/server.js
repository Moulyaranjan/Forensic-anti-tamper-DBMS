const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

/* 🔗 MYSQL CONNECTION */
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "1234",   // 👉 your MySQL password
  database: "forensic_db"
});

db.connect((err) => {
  if (err) {
    console.log("❌ DB Connection Failed:", err);
  } else {
    console.log("✅ Connected to MySQL");
  }
});

/* 🔐 LOGIN */
app.post("/login", (req, res) => {
  const { username, password } = req.body;

  const query = "SELECT * FROM users WHERE username=? AND password=?";

  db.query(query, [username, password], (err, result) => {
    if (err) return res.status(500).send(err);

    if (result.length > 0) {
      res.json({ success: true });
    } else {
      res.json({ success: false });
    }
  });
});

/* ➕ ADD EVIDENCE (AUTO CREATE EVERYTHING) */
app.post("/add", (req, res) => {
  const { case_id, data, warrant_id } = req.body;

  // 1️⃣ Create case if not exists
  const caseQuery = `
    INSERT INTO cases(case_id, case_name, officer_name)
    VALUES (?, 'Auto Case', 'Auto Officer')
    ON DUPLICATE KEY UPDATE case_id=case_id
  `;

  db.query(caseQuery, [case_id], (err) => {
    if (err) {
      console.log(err);
      return res.status(500).send(err);
    }

    // 2️⃣ Create warrant if not exists
    const warrantQuery = `
      INSERT INTO warrants(warrant_id, case_id, issued_to, valid_until, status)
      VALUES (?, ?, 'Auto Officer', NOW() + INTERVAL 1 DAY, 'VALID')
      ON DUPLICATE KEY UPDATE warrant_id=warrant_id
    `;

    db.query(warrantQuery, [warrant_id, case_id], (err) => {
      if (err) {
        console.log(err);
        return res.status(500).send(err);
      }

      // 3️⃣ Insert evidence (trigger will handle hash)
      const evidenceQuery = `
        INSERT INTO evidence_chain(case_id, data, action_type, warrant_id)
        VALUES (?, ?, 'INSERT', ?)
      `;

      db.query(evidenceQuery, [case_id, data, warrant_id], (err) => {
        if (err) {
          console.log(err);
          return res.status(500).send(err);
        }

        res.json({ message: "✅ Evidence added successfully" });
      });
    });
  });
});

/* 🔍 VIEW EVIDENCE */
app.post("/view", (req, res) => {
  const { case_id, warrant_id, user } = req.body;

  const query = "CALL access_evidence(?, ?, ?)";

  db.query(query, [case_id, warrant_id, user], (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).send(err);
    }

    res.json(result[0]); // stored procedure result
  });
});

/* 🚀 START SERVER */
app.listen(5000, () => {
  console.log("🚀 Server running on http://localhost:5000");
});