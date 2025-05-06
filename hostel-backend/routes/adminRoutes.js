const express = require('express');
const router = express.Router();

module.exports = (db) => {
  // Admin Authentication
  router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    const query = 'SELECT * FROM admins WHERE username = ? AND password = ?';
    try {
      const [results] = await db.query(query, [username, password]);
      
      if (results.length > 0) {
        res.json({ success: true, admin: results[0] });
      } else {
        res.json({ success: false, message: 'Invalid admin credentials' });
      }
    } catch (err) {
      console.error('Admin Login Error:', err);
      res.status(500).json({ success: false, message: 'Database error', error: err.message });
    }
  });

  // Student Management Endpoints
  // Get all students
  router.get('/students', async (req, res) => {
    try {
      const [students] = await db.query('SELECT * FROM students');
      res.json(students);
    } catch (err) {
      console.error('Error fetching students:', err);
      res.status(500).json({ success: false, message: 'Database error', error: err.message });
    }
  });
  
  // Add student (admin route)
  router.post('/students', async (req, res) => {
    const { name, room_number, email, phone } = req.body;
    
    try {
      const [result] = await db.query(
        'INSERT INTO students (name, room_number, email, phone) VALUES (?, ?, ?, ?)',
        [name, room_number, email, phone]
      );
      
      res.status(201).json({ 
        success: true, 
        message: 'Student added successfully',
        student_id: result.insertId
      });
    } catch (err) {
      console.error('Error adding student:', err);
      res.status(500).json({ success: false, message: 'Database error', error: err.message });
    }
  });

  // Update student details (admin route)
  router.put('/students/:id', async (req, res) => {
    const studentId = req.params.id;
    const { name, room_number, email, phone } = req.body;
    
    try {
      const [result] = await db.query(
        'UPDATE students SET name = ?, room_number = ?, email = ?, phone = ? WHERE id = ?',
        [name, room_number, email, phone, studentId]
      );
      
      if (result.affectedRows === 0) {
        return res.status(404).json({ success: false, message: 'Student not found' });
      }
      
      res.json({ success: true, message: 'Student updated successfully' });
    } catch (err) {
      console.error('Error updating student:', err);
      res.status(500).json({ success: false, message: 'Database error', error: err.message });
    }
  });

  // Delete student (admin route)
  router.delete('/students/:id', async (req, res) => {
    const studentId = req.params.id;
    
    try {
      const [result] = await db.query('DELETE FROM students WHERE id = ?', [studentId]);
      
      if (result.affectedRows === 0) {
        return res.status(404).json({ success: false, message: 'Student not found' });
      }
      
      res.json({ success: true, message: 'Student deleted successfully' });
    } catch (err) {
      console.error('Error deleting student:', err);
      res.status(500).json({ success: false, message: 'Database error', error: err.message });
    }
  });

  // Complaint Management Endpoints
  router.get('/complaints', async (req, res) => {
    try {
      const [complaints] = await db.query(`
        SELECT c.*, s.name as student_name 
        FROM complaints c
        LEFT JOIN students s ON c.student_id = s.id
        ORDER BY c.created_at DESC
      `);
      res.json(complaints);
    } catch (err) {
      console.error('Error fetching complaints:', err);
      res.status(500).json({ success: false, message: 'Database error', error: err.message });
    }
  });

  // Get count of pending and in-progress complaints
  router.get('/complaints/count', async (req, res) => {
    try {
      const [result] = await db.query(`
        SELECT 
          COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_count,
          COUNT(CASE WHEN status = 'in_progress' THEN 1 END) as in_progress_count
        FROM complaints
      `);
      
      const totalCount = (result[0].pending_count || 0) + (result[0].in_progress_count || 0);
      res.json({ count: totalCount });
    } catch (err) {
      console.error('Error fetching complaint count:', err);
      res.status(500).json({ success: false, message: 'Database error', error: err.message });
    }
  });

  // Update complaint status
  router.put('/complaints/:id', async (req, res) => {
    const complaintId = req.params.id;
    const { status } = req.body;
    
    try {
      const [result] = await db.query(
        'UPDATE complaints SET status = ? WHERE id = ?',
        [status, complaintId]
      );
      
      if (result.affectedRows === 0) {
        return res.status(404).json({ success: false, message: 'Complaint not found' });
      }
      
      res.json({ success: true, message: 'Complaint status updated successfully' });
    } catch (err) {
      console.error('Error updating complaint status:', err);
      res.status(500).json({ success: false, message: 'Database error', error: err.message });
    }
  });

  // Delete complaint (only for resolved complaints)
  router.delete('/complaints/:id', async (req, res) => {
    const complaintId = req.params.id;
    
    try {
      // First check if complaint is resolved
      const [complaint] = await db.query(
        'SELECT status FROM complaints WHERE id = ?', 
        [complaintId]
      );
      
      if (complaint.length === 0) {
        return res.status(404).json({ success: false, message: 'Complaint not found' });
      }
      
      if (complaint[0].status !== 'resolved') {
        return res.status(400).json({ 
          success: false, 
          message: 'Only resolved complaints can be deleted' 
        });
      }
      
      // If resolved, proceed with deletion
      const [result] = await db.query('DELETE FROM complaints WHERE id = ?', [complaintId]);
      
      if (result.affectedRows === 0) {
        return res.status(500).json({ success: false, message: 'Failed to delete complaint' });
      }
      
      res.json({ success: true, message: 'Complaint deleted successfully' });
    } catch (err) {
      console.error('Error deleting complaint:', err);
      res.status(500).json({ success: false, message: 'Database error', error: err.message });
    }
  });

  // Fee Management Endpoints
  router.get('/fees', async (req, res) => {
    try {
      const [fees] = await db.query(`
        SELECT f.*, s.name as student_name, s.room_number
        FROM fees f
        JOIN students s ON f.student_id = s.id
      `);
      res.json(fees);
    } catch (err) {
      console.error('Error fetching fees:', err);
      res.status(500).json({ success: false, message: 'Database error', error: err.message });
    }
  });

  // Update fee status
  router.put('/fees/:id', async (req, res) => {
    const feeId = req.params.id;
    const { status, payment_date } = req.body;
    
    try {
      const [result] = await db.query(
        'UPDATE fees SET status = ?, payment_date = ? WHERE id = ?',
        [status, payment_date, feeId]
      );
      
      if (result.affectedRows === 0) {
        return res.status(404).json({ success: false, message: 'Fee record not found' });
      }
      
      res.json({ success: true, message: 'Fee status updated successfully' });
    } catch (err) {
      console.error('Error updating fee status:', err);
      res.status(500).json({ success: false, message: 'Database error', error: err.message });
    }
  });

  // Dashboard Summary Endpoint
  router.get('/dashboard-summary', async (req, res) => {
    try {
      // Get student count
      const [studentCountResult] = await db.query('SELECT COUNT(*) as count FROM students');
      const studentCount = studentCountResult[0].count;
      
      // Get fees collected and to be collected
      const [feesResult] = await db.query(`
        SELECT 
          SUM(CASE WHEN status = 'paid' THEN fee_amount ELSE 0 END) as collected,
          SUM(CASE WHEN status != 'paid' OR status IS NULL THEN fee_amount ELSE 0 END) as to_be_collected
        FROM fees
      `);
      
      // Get complaint counts
      const [complaintsResult] = await db.query(`
        SELECT 
          COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_count,
          COUNT(CASE WHEN status = 'in_progress' THEN 1 END) as in_progress_count,
          COUNT(CASE WHEN status = 'resolved' THEN 1 END) as resolved_count
        FROM complaints
      `);
      
      res.json({
        student_count: studentCount,
        fees_collected: feesResult[0].collected || 0,
        fees_to_be_collected: feesResult[0].to_be_collected || 0,
        pending_complaints: complaintsResult[0].pending_count || 0,
        in_progress_complaints: complaintsResult[0].in_progress_count || 0,
        resolved_complaints: complaintsResult[0].resolved_count || 0
      });
    } catch (err) {
      console.error('Error generating dashboard summary:', err);
      res.status(500).json({ success: false, message: 'Database error', error: err.message });
    }
  });

  return router;
};