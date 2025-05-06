const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

module.exports = (db) => {
  const router = express.Router();

  // ======== Multer Setup for Profile Uploads ========
  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      const uploadDir = 'uploads/profiles';
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
      const ext = path.extname(file.originalname);
      cb(null, `student-${Date.now()}${ext}`);
    }
  });
  const upload = multer({ storage });
  
  router.post('/login', async (req, res) => {
    const { email, password } = req.body;
  
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }
  
    const sql = 'SELECT * FROM add_students WHERE email = ? AND password = ?';
    try {
      const [results] = await db.query(sql, [email, password]);
  
      if (results.length > 0) {
        const student = results[0];
        res.json({
          success: true,
          student: {
            id: student.id,
            name: student.name,
            room_number: student.room_number,
            fee_status: student.fee_status,
          },
        });
      } else {
        res.status(401).json({ success: false, message: 'Invalid email or password' });
      }
    } catch (err) {
      console.error('Login error:', err);
      res.status(500).json({ success: false, message: 'Database error', error: err.message });
    }
  });
  
  // ======== ROOMS ========
  router.get('/rooms', async (req, res) => {
    const sql = `
      SELECT r.room_number, r.capacity, COUNT(s.id) AS filled_beds
      FROM rooms r
      LEFT JOIN add_students s ON r.room_number = s.room_number
      GROUP BY r.room_number, r.capacity
    `;
    try {
      const [rooms] = await db.query(sql);
      res.json(rooms);
    } catch (err) {
      console.error('Error fetching rooms:', err);
      res.status(500).json({ success: false, message: 'Failed to fetch rooms', error: err.message });
    }
  });

  router.get('/rooms/:roomNumber/students', async (req, res) => {
    const { roomNumber } = req.params;
    const sql = 'SELECT id, name, bed_number, fee_status, contact FROM add_students WHERE room_number = ?';
    try {
      const [students] = await db.query(sql, [roomNumber]);
      res.json(students);
    } catch (err) {
      console.error('Error fetching room details:', err);
      res.status(500).json({ success: false, message: 'Failed to fetch room details', error: err.message });
    }
  });

  router.put('/:id/update-room', async (req, res) => {
    const { room_number, bed_number } = req.body;
    const id = req.params.id;
    if (!room_number || !bed_number) {
      return res.status(400).json({ error: 'Room number and bed number are required' });
    }
    const sql = `UPDATE add_students SET room_number = ?, bed_number = ? WHERE id = ?`;
    try {
      const [result] = await db.query(sql, [room_number, bed_number, id]);
      if (result.affectedRows === 0) {
        return res.status(404).json({ success: false, message: 'Student not found' });
      }
      res.json({ success: true, message: 'Room assignment updated successfully' });
    } catch (err) {
      console.error('Error updating room assignment:', err);
      res.status(500).json({ success: false, message: 'Database error', error: err.message });
    }
  });
  
  router.post('/rooms', async (req, res) => {
    const { room_number } = req.body;
  
    if (!room_number) {
      return res.status(400).json({ error: 'Room number is required' });
    }
  
    try {
      // Correct query based on your table schema
      const sql = 'INSERT INTO rooms (room_number, capacity) VALUES (?, ?)';
      await db.query(sql, [room_number, 4]); // Default capacity = 4
      res.status(201).json({ success: true, message: 'Room created successfully' });
    } catch (err) {
      console.error('Error creating room:', err);
      res.status(500).json({ success: false, message: 'Database error while creating room', error: err.message });
    }
  });
  
  // Added new route to delete a room
  router.delete('/rooms/:roomNumber', async (req, res) => {
    const { roomNumber } = req.params;
    
    try {
      // Check if there are students in this room
      const [studentsInRoom] = await db.query(
        'SELECT COUNT(*) as count FROM add_students WHERE room_number = ?', 
        [roomNumber]
      );
      
      if (studentsInRoom[0].count > 0) {
        return res.status(400).json({ 
          success: false, 
          message: `Cannot delete room ${roomNumber}. It has ${studentsInRoom[0].count} students assigned to it.` 
        });
      }
      
      // Delete the room
      const [result] = await db.query('DELETE FROM rooms WHERE room_number = ?', [roomNumber]);
      
      if (result.affectedRows === 0) {
        return res.status(404).json({ success: false, message: 'Room not found' });
      }
      
      res.json({ success: true, message: `Room ${roomNumber} deleted successfully` });
    } catch (err) {
      console.error('Error deleting room:', err);
      res.status(500).json({ success: false, message: 'Database error', error: err.message });
    }
  });
  
  // ======== STUDENTS ========
  // Get all students - root route for students
  router.get('/', async (req, res) => {
    const sql = `
      SELECT id, name, email, room_number, contact, fee_status, joining_date, profile_url
      FROM add_students
    `;
    try {
      const [results] = await db.query(sql);
      const students = results.map(student => ({
        ...student,
        fees: student.fee_status === 'paid' ? 5000 : 0
      }));
      res.json(students);
    } catch (err) {
      console.error('Error fetching all students:', err);
      res.status(500).json({ success: false, message: 'Database error', error: err.message });
    }
  });

  // Get single student by ID
  router.get('/:id', async (req, res) => {
    const studentId = req.params.id;
    const sql = `
      SELECT id, name, email, room_number, contact, fee_status, joining_date, profile_url
      FROM add_students WHERE id = ?
    `;
    try {
      const [results] = await db.query(sql, [studentId]);
      if (results.length > 0) {
        res.json(results[0]);
      } else {
        res.status(404).json({ success: false, message: 'Student not found' });
      }
    } catch (err) {
      console.error('Error fetching student by ID:', err);
      res.status(500).json({ success: false, message: 'Database error', error: err.message });
    }
  });

  // Updated route to add a new student with bed availability checks
  router.post('/add', async (req, res) => {
    const { name, email, password, room_number, bed_number, contact, fee_status, joining_date } = req.body;
    
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email, and password are required' });
    }
    
    try {
      // Begin transaction
      await db.query('START TRANSACTION');
      
      // First check if the room and bed are available
      if (room_number && bed_number) {
        const [existingBed] = await db.query(
          'SELECT id FROM add_students WHERE room_number = ? AND bed_number = ?', 
          [room_number, bed_number]
        );
        
        if (existingBed.length > 0) {
          await db.query('ROLLBACK');
          return res.status(400).json({ 
            success: false, 
            message: `Bed ${bed_number} in Room ${room_number} is already occupied` 
          });
        }
        
        // Check if room exists
        const [roomExists] = await db.query('SELECT room_number FROM rooms WHERE room_number = ?', [room_number]);
        if (roomExists.length === 0) {
          await db.query('ROLLBACK');
          return res.status(400).json({ 
            success: false, 
            message: `Room ${room_number} does not exist` 
          });
        }
      }
      
      // Insert the student
      const sql = `
        INSERT INTO add_students (name, email, password, room_number, bed_number, contact, fee_status, joining_date)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `;
      const values = [name, email, password, room_number || null, bed_number || null, contact, fee_status || 'pending', joining_date];
      
      const [result] = await db.query(sql, values);
      await db.query('COMMIT');
      
      res.status(201).json({ 
        success: true, 
        studentId: result.insertId,
        message: room_number ? `Student assigned to Room ${room_number}, Bed ${bed_number}` : 'Student added successfully' 
      });
    } catch (err) {
      await db.query('ROLLBACK');
      console.error('Error adding student:', err);
      res.status(500).json({ success: false, message: 'Database error', error: err.message });
    }
  });

  // Delete student - FIXED route with better error handling
  router.delete('/:id', async (req, res) => {
    const studentId = req.params.id;
    console.log(`Attempting to delete student with ID: ${studentId}`);
    
    try {
      // First check if student exists
      const [checkResult] = await db.query('SELECT id FROM add_students WHERE id = ?', [studentId]);
      
      if (checkResult.length === 0) {
        console.log(`Student with ID ${studentId} not found`);
        return res.status(404).json({ 
          success: false, 
          message: 'Student not found' 
        });
      }
      
      // Proceed with deletion if student exists
      const [deleteResult] = await db.query('DELETE FROM add_students WHERE id = ?', [studentId]);
      
      console.log('Delete operation result:', deleteResult);
      
      if (deleteResult.affectedRows > 0) {
        return res.json({ 
          success: true, 
          message: 'Student deleted successfully',
          deletedId: studentId
        });
      } else {
        return res.status(500).json({ 
          success: false, 
          message: 'Failed to delete student' 
        });
      }
    } catch (err) {
      console.error('Error deleting student:', err);
      console.error('Details of error:', err.message, err.code, err.sqlMessage);
      res.status(500).json({ 
        success: false, 
        message: 'Database error while deleting student', 
        error: err.message 
      });
    }
  });

  // Update student
  router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { name, email, room_number, contact, fee_status, joining_date } = req.body;
    if (!name || !email) {
      return res.status(400).json({ success: false, message: 'Name and email are required' });
    }
    const sql = `
      UPDATE add_students
      SET name = ?, email = ?, room_number = ?, contact = ?, fee_status = ?, joining_date = ?
      WHERE id = ?
    `;
    try {
      const [result] = await db.query(sql, [name, email, room_number, contact, fee_status, joining_date, id]);
      if (result.affectedRows === 0) {
        return res.status(404).json({ success: false, message: 'Student not found' });
      }
      res.json({ success: true, message: 'Student updated successfully' });
    } catch (err) {
      console.error('Error updating student:', err);
      res.status(500).json({ success: false, message: 'Database error', error: err.message });
    }
  });

  router.post('/upload-profile/:id', upload.single('profile'), async (req, res) => {
    const studentId = req.params.id;
    const profileImagePath = req.file ? `/uploads/profiles/${req.file.filename}` : null;
    if (!profileImagePath) {
      return res.status(400).json({ success: false, message: 'No image uploaded' });
    }
    const sql = 'UPDATE add_students SET profile_url = ? WHERE id = ?';
    try {
      await db.query(sql, [profileImagePath, studentId]);
      res.json({ success: true, message: 'Profile image uploaded successfully', path: profileImagePath });
    } catch (err) {
      console.error('Error uploading profile image:', err);
      res.status(500).json({ success: false, message: 'Failed to update profile image', error: err.message });
    }
  });

  // ======== STATS & FEES ========
  router.get('/count', async (req, res) => {
    try {
      const [result] = await db.query('SELECT COUNT(*) AS count FROM add_students');
      res.json({ totalStudents: result[0].count });
    } catch (err) {
      console.error('Error counting students:', err);
      res.status(500).json({ success: false, message: 'Database error', error: err.message });
    }
  });

  router.get('/fees/collection', async (req, res) => {
    try {
      const [result] = await db.query('SELECT COUNT(*) AS count FROM add_students WHERE fee_status = "paid"');
      const total = result[0].count * 5000;
      res.json({ totalFees: total });
    } catch (err) {
      console.error('Error calculating fees:', err);
      res.status(500).json({ success: false, message: 'Database error', error: err.message });
    }
  });

  // ======== COMPLAINTS ========
  router.post('/complaint', async (req, res) => {
    const { student_name, room_number, complaint_text } = req.body;
    if (!student_name || !room_number || !complaint_text) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }
    const sql = `
      INSERT INTO complaints (student_name, room_number, complaint_text, status, created_at)
      VALUES (?, ?, ?, 'pending', NOW())
    `;
    try {
      const [result] = await db.query(sql, [student_name, room_number, complaint_text]);
      res.status(201).json({ success: true, message: 'Complaint submitted successfully', complaintId: result.insertId });
    } catch (err) {
      console.error('Error submitting complaint:', err);
      res.status(500).json({ success: false, message: 'Database error', error: err.message });
    }
  });

  return router;
};