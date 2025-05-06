// studentController.js
const getAllStudents = (req, res) => {
  const db = req.app.locals.db; // Get access to the database connection
  
  db.query('SELECT * FROM add_students', (err, results) => {
    if (err) {
      console.error('Error fetching students:', err);
      return res.status(500).json({ message: 'Database error' });
    }
    res.json(results);
  });
};

const updateStudent = (req, res) => {
  const db = req.app.locals.db;
  const studentId = req.params.id;
  const { name, email, room_number, contact, fee_status } = req.body;
  
  const sql = 'UPDATE add_students SET name = ?, email = ?, room_number = ?, contact = ?, fee_status = ? WHERE id = ?';
  db.query(sql, [name, email, room_number, contact, fee_status, studentId], (err) => {
    if (err) {
      console.error('Update student error:', err);
      return res.status(500).json({ message: 'Database error' });
    }
    res.json({ success: true, message: 'Student updated successfully' });
  });
};

const deleteStudent = (req, res) => {
  const db = req.app.locals.db;
  const studentId = req.params.id;
  
  db.query('DELETE FROM add_students WHERE id = ?', [studentId], (err) => {
    if (err) {
      console.error('Delete student error:', err);
      return res.status(500).json({ message: 'Database error' });
    }
    res.json({ success: true, message: 'Student deleted successfully' });
  });
};

const getStudentStats = (req, res) => {
  const db = req.app.locals.db;
  
  // Get total students count
  db.query('SELECT COUNT(*) as total FROM add_students', (err, results) => {
    if (err) {
      console.error('Student stats error:', err);
      return res.status(500).json({ message: 'Database error' });
    }
    
    const totalStudents = results[0].total;
    
    // Get fee status breakdown
    db.query(
      'SELECT fee_status, COUNT(*) as count FROM add_students GROUP BY fee_status',
      (err, feeResults) => {
        if (err) {
          console.error('Fee stats error:', err);
          return res.status(500).json({ message: 'Database error' });
        }
        
        res.json({
          totalStudents,
          feeStats: feeResults
        });
      }
    );
  });
};

// Export all controller functions
module.exports = {
  getAllStudents,
  updateStudent,
  deleteStudent,
  getStudentStats
};