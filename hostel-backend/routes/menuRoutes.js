// routes/menuRoutes.js
const express = require('express');

// Changed to use dependency injection like the other route files
module.exports = function(db) {
  const router = express.Router();

  // Get all menu entries
  router.get('/', async (req, res) => {
    try {
      const [results] = await db.query('SELECT * FROM mess_menu ORDER BY FIELD(day, "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday")');
      res.json(results);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // Add a new menu
  router.post('/', async (req, res) => {
    const { day, breakfast, lunch, dinner } = req.body;
    const sql = 'INSERT INTO mess_menu (day, breakfast, lunch, dinner) VALUES (?, ?, ?, ?)';
    
    try {
      const [result] = await db.query(sql, [day, breakfast, lunch, dinner]);
      res.status(201).json({ message: 'Menu added successfully', id: result.insertId });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // Update an existing menu
  router.put('/:id', async (req, res) => {
    const { day, breakfast, lunch, dinner } = req.body;
    const { id } = req.params;
    const sql = 'UPDATE mess_menu SET day = ?, breakfast = ?, lunch = ?, dinner = ? WHERE id = ?';
    
    try {
      await db.query(sql, [day, breakfast, lunch, dinner, id]);
      res.json({ message: 'Menu updated successfully' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // Delete a menu
  router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    const sql = 'DELETE FROM mess_menu WHERE id = ?';
    
    try {
      await db.query(sql, [id]);
      res.json({ message: 'Menu deleted successfully' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  return router;
};