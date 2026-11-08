
const express = require("express");
const dbPromise = require("./database");
const bookRoutes = require("./routes");

const app = express();
const PORT = 3000;

app.use(express.json());

// Connect book routes
app.use("/api", bookRoutes);

async function initializeDatabase() {
  const db = await dbPromise;

  await db.exec(`
    CREATE TABLE IF NOT EXISTS book (
      id INTEGER PRIMARY KEY,
      title TEXT NOT NULL,
      author TEXT NOT NULL,
      price INTEGER,
      pages INTEGER
    )
  `);

  console.log("Database and book table are ready!");
}

app.get("/", (req, res) => {
  res.send("Library Management API is running!");
});

initializeDatabase()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Database initialization failed:", error);
  });
