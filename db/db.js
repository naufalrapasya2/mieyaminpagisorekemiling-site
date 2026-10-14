const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const DB_FILE = process.env.DATABASE_FILE || path.join(__dirname, '..', 'data', 'database.sqlite');
const db = new sqlite3.Database(DB_FILE);
module.exports = db;
