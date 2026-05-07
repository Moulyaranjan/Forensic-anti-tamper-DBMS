const mysql = require('mysql2');

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '1234',
  database: 'forensic_db'
});

db.connect((err) => {
  if (err) {
    console.log("Connection Failed:", err);
  } else {
    console.log("Connected to MySQL");
  }
});

module.exports = db;