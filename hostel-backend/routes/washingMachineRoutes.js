// washingMachineRoutes.js
const express = require('express');
const { body, validationResult } = require('express-validator');
const { sendWhatsApp } = require('../services/messageService');

// Constants
const MAX_BOOKINGS_PER_WEEK = process.env.MAX_WASHING_BOOKINGS || 1;

// Helper functions
const isValidDate = (dateString) => {
  return !isNaN(Date.parse(dateString));
};

const isValidTime = (timeString) => {
  return /^([01]\d|2[0-3]):([0-5]\d)$/.test(timeString);
};

module.exports = (db) => {
  const router = express.Router();

  // Get all slots with student names
  router.get('/slots', async (req, res) => {
    try {
      const [rows] = await db.query(`
        SELECT 
          w.id, w.booking_date, w.booking_day, w.time_slot, w.is_slot_open,
          s.id AS student_id, s.name AS student_name
        FROM washing_machine_allocation w
        LEFT JOIN add_students s ON w.student_id = s.id
        ORDER BY w.booking_date, w.time_slot
      `);
      res.json(rows);
    } catch (err) {
      console.error('Error fetching slots:', err);
      res.status(500).json({ error: 'Failed to fetch slots' });
    }
  });

  // Create a new slot
  router.post('/slots', 
    [
      body('booking_date').isDate(),
      body('time_slot').custom(isValidTime),
      body('is_slot_open').isBoolean()
    ],
    async (req, res) => {
      try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).json({ errors: errors.array() });
        }

        const { booking_date, booking_day, time_slot, is_slot_open } = req.body;
        
        // Check for duplicate slot
        const [existing] = await db.query(
          `SELECT id FROM washing_machine_allocation 
           WHERE booking_date = ? AND time_slot = ?`,
          [booking_date, time_slot]
        );
        
        if (existing.length > 0) {
          return res.status(409).json({ error: 'Slot already exists for this date and time' });
        }

        const conn = await db.getConnection();
        try {
          await conn.beginTransaction();
          
          await conn.query(`
            INSERT INTO washing_machine_allocation 
            (booking_date, booking_day, time_slot, is_slot_open)
            VALUES (?, ?, ?, ?)
          `, [booking_date, booking_day, time_slot, is_slot_open]);
          
          await conn.commit();
          res.status(201).json({ message: 'Slot created successfully' });
        } catch (err) {
          await conn.rollback();
          throw err;
        } finally {
          conn.release();
        }
      } catch (err) {
        console.error('Error creating slot:', err);
        res.status(500).json({ error: 'Failed to create slot' });
      }
    }
  );

  // Delete expired slots
  router.delete('/slots/expired', async (req, res) => {
    try {
      const conn = await db.getConnection();
      try {
        await conn.beginTransaction();
        
        const [result] = await conn.query(`
          DELETE FROM washing_machine_allocation
          WHERE booking_date < CURDATE()
        `);
        
        await conn.commit();
        res.json({ 
          message: 'Expired slots deleted successfully',
          deletedCount: result.affectedRows
        });
      } catch (err) {
        await conn.rollback();
        throw err;
      } finally {
        conn.release();
      }
    } catch (err) {
      console.error('Error deleting expired slots:', err);
      res.status(500).json({ error: 'Failed to delete expired slots' });
    }
  });

  // Delete a specific slot by ID
  router.delete('/slot/:id', async (req, res) => {
    try {
      const { id } = req.params;
      
      // Check if slot exists and is not booked
      const [[slot]] = await db.query(
        `SELECT student_id FROM washing_machine_allocation WHERE id = ?`,
        [id]
      );
      
      if (!slot) {
        return res.status(404).json({ error: 'Slot not found' });
      }
      
      if (slot.student_id) {
        return res.status(400).json({ error: 'Cannot delete a booked slot' });
      }
      
      const conn = await db.getConnection();
      try {
        await conn.beginTransaction();
        
        const [result] = await conn.query(
          `DELETE FROM washing_machine_allocation WHERE id = ?`,
          [id]
        );
        
        await conn.commit();
        
        if (result.affectedRows === 0) {
          return res.status(404).json({ error: 'Slot not found' });
        }
        
        res.json({ 
          message: 'Slot deleted successfully',
          deletedId: id
        });
      } catch (err) {
        await conn.rollback();
        throw err;
      } finally {
        conn.release();
      }
    } catch (err) {
      console.error('Error deleting slot:', err);
      res.status(500).json({ error: 'Failed to delete slot' });
    }
  });

  // Book a slot
  router.post('/book', 
    [
      body('student_id').isInt(),
      body('slot_id').isInt()
    ],
    async (req, res) => {
      try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).json({ errors: errors.array() });
        }
        const { student_id, slot_id } = req.body;
        console.log('Received booking request:', { student_id, slot_id });
        
        const conn = await db.getConnection();
        
        try {
          await conn.beginTransaction();
          
          // Get student details including contact number
          const [studentResults] = await conn.query(
            'SELECT id, name, contact FROM add_students WHERE id = ?', 
            [student_id]
          );
          
          console.log('Student query result:', studentResults);
          
          if (studentResults.length === 0) {
            console.log('Student not found with ID:', student_id);
            await conn.rollback();
            return res.status(404).json({ error: 'Student not found' });
          }
          
          const student = studentResults[0];
          
          // Check if slot exists and is available
          const [slotResults] = await conn.query(
            `SELECT id, is_slot_open, booking_date, booking_day, time_slot 
             FROM washing_machine_allocation 
             WHERE id = ?`,
            [slot_id]
          );
          
          console.log('Slot query result:', slotResults);
          
          if (slotResults.length === 0) {
            await conn.rollback();
            return res.status(404).json({ error: 'Slot not found' });
          }
          
          const slot = slotResults[0];
          
          if (!slot.is_slot_open) {
            await conn.rollback();
            return res.status(400).json({ error: 'Slot is not available for booking' });
          }
          
          // Check weekly booking limit
          const [bookingResults] = await conn.query(
            `SELECT COUNT(*) AS bookings FROM washing_machine_allocation
             WHERE student_id = ? AND WEEK(booking_date) = WEEK(CURDATE())`,
            [student_id]
          );
          
          const bookingCount = bookingResults[0].bookings;
          console.log('Current bookings this week:', bookingCount);
          
          if (bookingCount >= MAX_BOOKINGS_PER_WEEK) {
            await conn.rollback();
            return res.status(400).json({ 
              error: `You can only book ${MAX_BOOKINGS_PER_WEEK} slot(s) per week` 
            });
          }
          
          // Book the slot - Make sure to handle foreign key constraint properly
          try {
            await conn.query(
              `UPDATE washing_machine_allocation 
               SET student_id = ?, is_slot_open = false 
               WHERE id = ?`,
              [student_id, slot_id]
            );
          } catch (error) {
            console.error('Database error during update:', error);
            await conn.rollback();
            
            if (error.code === 'ER_NO_REFERENCED_ROW_2') {
              return res.status(400).json({ 
                error: 'The student ID does not exist or there is a database constraint issue' 
              });
            }
            throw error;
          }
          
          // Send WhatsApp notification if contact number is available
          if (student.contact) {
            try {
              // Enhanced WhatsApp message format with emojis
              const message = `🧼 *Washing Machine Booking Confirmed!* ✅\n\n` +
              `📌 *Booking Details*\n` +
              `--------------------------------\n` +
              `👤 *Student Name:* ${student.name}\n` +
              `📅 *Day:* ${slot.booking_day}\n` +
              `⏰ *Time Slot:* ${slot.time_slot}\n` +
              `📍 *Location:* Hostel Laundry Room\n\n` +
              `📋 *Important Notes:*\n` +
              `--------------------------------\n` +
              `• Please arrive on time for your allocated slot\n` +
              `• Bring your own detergent and fabric softener\n` +
              `• Remove your clothes promptly after washing\n\n` +
              `For any issues, please contact the hostel office.\n\n` +
              `Happy Washing! 🧺✨\n` +
              `*- Hostel Management*`;
              
              console.log('Sending WhatsApp notification to:', student.contact);
              await sendWhatsApp(student.contact, message);
              console.log('WhatsApp notification sent successfully');
            } catch (whatsappError) {
              console.error('Error sending WhatsApp notification:', whatsappError);
              // Continue with booking process even if WhatsApp notification fails
            }
          } else {
            console.log('No contact number available for student:', student.name);
          }
          
          await conn.commit();
          console.log('Booking successful for student:', student.name);
          
          res.json({ 
            message: 'Slot booked successfully',
            studentName: student.name
          });
        } catch (err) {
          await conn.rollback();
          console.error('Transaction error:', err);
          throw err;
        } finally {
          conn.release();
        }
      } catch (err) {
        console.error('Error booking slot:', err);
        res.status(500).json({ error: 'Failed to book slot: ' + err.message });
      }
    }
  );

  // Separate route for manually sending booking notifications
  router.post('/send-booking-notification', async (req, res) => {
    try {
      const { name, contact, day, time } = req.body;
      
      if (!name || !contact || !day || !time) {
        return res.status(400).json({ error: 'Missing required fields' });
      }
      
      // Enhanced WhatsApp message format with emojis
      const message = `🧼 *Washing Machine Booking Confirmed!* ✅\n\n` +
      `📌 *Booking Details*\n` +
      `--------------------------------\n` +
      `👤 *Student Name:* ${name}\n` +
      `📅 *Day:* ${day}\n` +
      `⏰ *Time Slot:* ${time}\n` +
      `📍 *Location:* Hostel Laundry Room\n\n` +
      `📋 *Important Notes:*\n` +
      `--------------------------------\n` +
      `• Please arrive on time for your allocated slot\n` +
      `• Bring your own detergent and fabric softener\n` +
      `• Remove your clothes promptly after washing\n\n` +
      `For any issues, please contact the hostel office.\n\n` +
      `Happy Washing! 🧺✨\n` +
      `*- Hostel Management*`;
      
      await sendWhatsApp(contact, message);
      
      res.json({ success: true, message: 'WhatsApp notification sent successfully' });
    } catch (err) {
      console.error('Error sending notification:', err);
      res.status(500).json({ error: 'Failed to send notification: ' + err.message });
    }
  });

  // Toggle slot status
  router.put('/slot/:id/toggle', async (req, res) => {
    try {
      const { id } = req.params;
      const conn = await db.getConnection();
      
      try {
        await conn.beginTransaction();

        const [[slot]] = await conn.query(
          `SELECT is_slot_open, student_id 
           FROM washing_machine_allocation 
           WHERE id = ?`,
          [id]
        );
        
        if (!slot) {
          return res.status(404).json({ error: 'Slot not found' });
        }
        if (slot.student_id) {
          return res.status(400).json({ error: 'Cannot toggle a booked slot' });
        }

        const newState = !slot.is_slot_open;

        await conn.query(
          'UPDATE washing_machine_allocation SET is_slot_open = ? WHERE id = ?',
          [newState, id]
        );

        await conn.commit();
        res.json({ 
          message: `Slot ${newState ? 'opened' : 'closed'}`,
          is_slot_open: newState
        });
      } catch (err) {
        await conn.rollback();
        throw err;
      } finally {
        conn.release();
      }
    } catch (err) {
      console.error('Error toggling slot:', err);
      res.status(500).json({ error: 'Failed to toggle slot status' });
    }
  });

  return router;
};