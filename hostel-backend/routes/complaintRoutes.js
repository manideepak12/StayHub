// complaintRoutes.js
const express = require('express');
const { sendWhatsApp } = require('../services/messageService');

module.exports = (db) => {
  const router = express.Router();

  // Get all complaints
  router.get('/', async (req, res) => {
    const sql = `
      SELECT 
        c.id,
        c.student_name,
        c.room_number,
        c.complaint_text,
        c.status,
        c.created_at,
        s.contact
      FROM complaints c
      LEFT JOIN add_students s ON c.student_name = s.name
      ORDER BY c.created_at DESC
    `;

    try {
      const [result] = await db.query(sql);
      res.status(200).json(result);
    } catch (err) {
      console.error('Error fetching complaints:', err);
      res.status(500).json({ error: 'Failed to fetch complaints' });
    }
  });

  // Submit a new complaint
  router.post('/', async (req, res) => {
    const { student_name, room_number, complaint_text } = req.body;

    if (!student_name || !room_number || !complaint_text) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const sql = `
      INSERT INTO complaints (student_name, room_number, complaint_text, status)
      VALUES (?, ?, ?, 'pending')
    `;

    try {
      await db.query(sql, [student_name, room_number, complaint_text]);
      console.log("✅ Complaint inserted into DB");

      // Get contact number using student_name (since student_id is not passed)
      const [[student]] = await db.query(
        'SELECT contact FROM add_students WHERE name = ?',
        [student_name]
      );

      if (student && student.contact) {
        const message = `🔔 *New Complaint Registered!* 🔔\n\n👤 Hi ${student_name},\n\n📝 Your complaint has been successfully received:\n\n"${complaint_text}"\n\n🚀 Status: Being processed\n⏱️ We're on it! Our team will resolve it as soon as possible.\n\n🏢 Thank you for your patience!\n- Hostel Management Team`;
        console.log('📤 Sending WhatsApp message to:', student.contact);
        await sendWhatsApp(student.contact, message);
        console.log('✅ WhatsApp message sent');
      } else {
        console.log('⚠️ No contact found for student:', student_name);
      }

      res.status(201).json({ message: 'Complaint submitted successfully' });
    } catch (err) {
      console.error('❌ Error inserting complaint or sending message:', err);
      res.status(500).json({ error: 'Failed to submit complaint' });
    }
  });

  // Update complaint status
  router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    try {
      // First get complaint details and student contact
      const [complaintDetails] = await db.query(`
        SELECT 
          c.id, 
          c.student_name, 
          c.complaint_text, 
          s.contact
        FROM complaints c
        LEFT JOIN add_students s ON c.student_name = s.name
        WHERE c.id = ?
      `, [id]);

      if (complaintDetails.length === 0) {
        return res.status(404).json({ error: 'Complaint not found' });
      }

      const complaint = complaintDetails[0];

      // Update complaint status
      const updateSql = `
        UPDATE complaints
        SET status = ?
        WHERE id = ?
      `;

      await db.query(updateSql, [status, id]);

      // Send WhatsApp notification if contact is available
      if (complaint.contact) {
        try {
          let statusEmoji;
          switch(status.toLowerCase()) {
            case 'resolved':
              statusEmoji = '✅';
              break;
            case 'in progress':
              statusEmoji = '🔧';
              break;
            case 'pending':
              statusEmoji = '⏳';
              break;
            default:
              statusEmoji = '📋';
          }
          
          const message = `🔔 *Complaint Update!* 🔔\n\n👤 Hello ${complaint.student_name},\n\n📝 Your complaint:\n"${complaint.complaint_text.substring(0, 50)}${complaint.complaint_text.length > 50 ? '...' : ''}"\n\n${statusEmoji} Has been updated to: *${status}*\n\n💬 If you have any questions, please reach out to the hostel office.\n\n- Hostel Management Team`;
          
          console.log('Sending WhatsApp notification to:', complaint.contact);
          await sendWhatsApp(complaint.contact, message);
          console.log('WhatsApp notification sent successfully');
        } catch (whatsappError) {
          console.error('Error sending WhatsApp notification:', whatsappError);
          // Continue with status update even if WhatsApp notification fails
        }
      } else {
        console.log('No contact number available for student:', complaint.student_name);
      }

      res.status(200).json({ 
        message: 'Complaint status updated successfully',
        notificationSent: !!complaint.contact
      });
    } catch (err) {
      console.error('Error updating complaint:', err);
      res.status(500).json({ error: 'Failed to update complaint' });
    }
  });

  // DELETE complaint by ID
  router.delete('/:id', async (req, res) => {
    const { id } = req.params;

    const sql = `
      DELETE FROM complaints
      WHERE id = ?
    `;

    try {
      const [result] = await db.query(sql, [id]);
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Complaint not found' });
      }
      res.status(200).json({ message: 'Complaint deleted successfully' });
    } catch (err) {
      console.error('Error deleting complaint:', err);
      res.status(500).json({ error: 'Failed to delete complaint' });
    }
  });

  // Separate route for manually sending complaint status notifications
  router.post('/send-status-notification', async (req, res) => {
    try {
      const { studentName, contact, complaint, status } = req.body;
      
      if (!studentName || !contact || !complaint || !status) {
        return res.status(400).json({ error: 'Missing required fields' });
      }
      
      const message = `🔔 *Complaint Status Update!* 🔔\n\n👤 Hello ${studentName},\n\n📝 Regarding your complaint:\n"${complaint}"\n\n📊 Status: *${status}*\n\n💫 We appreciate your patience and cooperation!\n\n- Hostel Management Team`;
      
      await sendWhatsApp(contact, message);
      
      res.json({ success: true, message: 'WhatsApp notification sent successfully' });
    } catch (err) {
      console.error('Error sending notification:', err);
      res.status(500).json({ error: 'Failed to send notification: ' + err.message });
    }
  });
  
  return router;
};