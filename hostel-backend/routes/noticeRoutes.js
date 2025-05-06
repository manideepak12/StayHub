const express = require('express');
const { sendWhatsApp } = require('../services/messageService'); // Make sure this is at the top

module.exports = (db) => {
  const router = express.Router();

  // GET all notices
  router.get('/', async (req, res) => {
    try {
      const [notices] = await db.query(`
        SELECT id, title, content, created_at
        FROM notices
        ORDER BY created_at DESC
      `);
      res.json(notices);
    } catch (err) {
      console.error('Error fetching notices:', err);
      res.status(500).json({ error: 'Failed to fetch notices' });
    }
  });

  // GET a specific notice by ID
  router.get('/:id', async (req, res) => {
    try {
      const [notice] = await db.query(
        'SELECT id, title, content, created_at FROM notices WHERE id = ?',
        [req.params.id]
      );
      if (notice.length === 0) {
        return res.status(404).json({ message: 'Notice not found' });
      }
      res.json(notice[0]);
    } catch (err) {
      console.error('Error fetching specific notice:', err);
      res.status(500).json({ error: 'Failed to fetch notice' });
    }
  });

  // POST a new notice
  router.post('/', async (req, res) => {
    const { title, content } = req.body;
  
    if (!title || !content) {
      return res.status(400).json({ error: 'Title and content are required' });
    }
  
    try {
      // ✅ 1. Insert notice into the database
      const sql = 'INSERT INTO notices (title, content, created_at) VALUES (?, ?, NOW())';
      await db.query(sql, [title, content]);
  
      console.log('✅ Notice saved:', title);
  
      // ✅ 2. Fetch all student contact numbers
      const [students] = await db.query('SELECT name, contact FROM add_students');
  
      // ✅ 3. Send WhatsApp message to each student
      const message = `📢 New Hostel Notice:\n📝 *${title}*\n\n${content}\n\n- Hostel Admin`;
  
      for (const student of students) {
        if (student.contact && student.contact.startsWith('+91')) {
          console.log(`📤 Sending notice to ${student.name} - ${student.contact}`);
          await sendWhatsApp(student.contact, message);
        }
      }
  
      res.status(201).json({ message: 'Notice created and sent to all students' });
    } catch (err) {
      console.error('❌ Error creating notice or sending messages:', err);
      res.status(500).json({ error: 'Failed to create notice or notify students' });
    }
  });
  
  // PUT to update a notice
  router.put('/:id', async (req, res) => {
    const { title, content } = req.body;
    const id = req.params.id;

    if (!title || !content) {
      return res.status(400).json({ message: 'Title and content are required' });
    }

    try {
      await db.query(
        `UPDATE notices
         SET title = ?, content = ?
         WHERE id = ?`,
        [title, content, id]
      );
      res.json({ message: 'Notice updated successfully' });
    } catch (err) {
      console.error('Error updating notice:', err);
      res.status(500).json({ error: 'Failed to update notice' });
    }
  });

  // DELETE a notice
  router.delete('/:id', async (req, res) => {
    try {
      await db.query('DELETE FROM notices WHERE id = ?', [req.params.id]);
      res.json({ message: 'Notice deleted successfully' });
    } catch (err) {
      console.error('Error deleting notice:', err);
      res.status(500).json({ error: 'Failed to delete notice' });
    }
  });

  return router;
};
