
const sqlite3 = require("sqlite3");
const { open } = require("sqlite");
const path = require("path");

const dbPath = path.join(__dirname, "library.db");

const dbPromise = open({
  filename: dbPath,
  driver: sqlite3.Database,
});

module.exports = dbPromise;
