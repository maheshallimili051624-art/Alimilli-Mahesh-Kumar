
const express = require("express");
const dbPromise = require("./database");

const router = express.Router();

// GET all books with query parameters
router.get("/books", async (req, res) => {
  try {
    const db = await dbPromise;

    const {
      search_q = "",
      order_by = "id",
      order = "ASC",
      limit = 10,
      offset = 0,
      min_price,
      max_price
    } = req.query;

    const allowedColumns = ["id", "title", "author", "price", "pages"];

    const sortColumn = allowedColumns.includes(order_by)
      ? order_by
      : "id";

    const sortOrder = order.toUpperCase() === "DESC"
      ? "DESC"
      : "ASC";

    const bookLimit = Math.max(1, parseInt(limit) || 10);
    const bookOffset = Math.max(0, parseInt(offset) || 0);
    
    if (
  (min_price !== undefined && (min_price.trim() === "" || !Number.isFinite(Number(min_price))) ) ||
  (max_price !== undefined && (max_price.trim() === "" || !Number.isFinite(Number(max_price))))
) {
  return res.status(400).json({
    message: "Price must be a valid number"
  });
}

if (
  min_price !== undefined &&
  max_price !== undefined &&
  Number(min_price) > Number(max_price)
) {
  return res.status(400).json({
    message: "Minimum price cannot be greater than maximum price"
  });
}

    let sql = "SELECT * FROM book WHERE 1=1";
    const params = [];

    if (search_q) {
      sql += " AND title LIKE ?";
      params.push(`%${search_q}%`);
    }

    if (min_price !== undefined) {
      sql += " AND price >= ?";
      params.push(min_price);
    }

    if (max_price !== undefined) {
      sql += " AND price <= ?";
      params.push(max_price);
    }

    sql += ` ORDER BY ${sortColumn} ${sortOrder} LIMIT ? OFFSET ?`;

    params.push(bookLimit, bookOffset);

    const books = await db.all(sql, params);

    res.status(200).json(books);

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Internal server error"
    });
  }
});

// GET book by ID
router.get("/books/:id", async (req, res) => {
  try {
    const db = await dbPromise;
    const book = await db.get(
      "SELECT * FROM book WHERE id = ?",
      [req.params.id]
    );

    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }

    res.json(book);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST add new book
router.post("/books", async (req, res) => {
  try {
    const { title, author, price, pages } = req.body;

    if (!title || !author) {
      return res.status(400).json({
        message: "Title and author are required"
      });
    }

    if (price !== undefined && price !== null &&
    (typeof price !== "number" || !Number.isFinite(price))) {
  return res.status(400).json({
    message: "Price must be a number"
  });
}

    const db = await dbPromise;

    const result = await db.run(
      "INSERT INTO book (title, author, price, pages) VALUES (?, ?, ?, ?)",
      [title, author, price ?? null, pages ?? null]
    );

    res.status(201).json({
      message: "Book added successfully",
      id: result.lastID
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT update book
router.put("/books/:id", async (req, res) => {
  try {
    const { title, author, price, pages } = req.body;
    const db = await dbPromise;

    const result = await db.run(
      "UPDATE book SET title = ?, author = ?, price = ?, pages = ? WHERE id = ?",
      [title, author, price ?? null, pages ?? null, req.params.id]
    );

    if (result.changes === 0) {
      return res.status(404).json({ message: "Book not found" });
    }

    res.json({ message: "Book updated successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE book
router.delete("/books/:id", async (req, res) => {
  try {
    const db = await dbPromise;

    const result = await db.run(
      "DELETE FROM book WHERE id = ?",
      [req.params.id]
    );

    if (result.changes === 0) {
      return res.status(404).json({ message: "Book not found" });
    }

    res.json({ message: "Book deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
