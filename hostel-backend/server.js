const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');
const mysql = require('mysql2/promise');
const Razorpay = require('razorpay');
 
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
// Static files
app.use('/uploads/profiles', express.static(path.join(__dirname, 'uploads/profiles')));
const uploadsDir = path.join(__dirname, 'uploads/profiles');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

(async () => {
  try {
    // Create database pool
    const db = mysql.createPool({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || 'asdf@123',
      database: process.env.DB_NAME || 'hostel_management',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });

    // Test connection
    const connection = await db.getConnection();
    connection.release();
    console.log('✅ Connected to MySQL Database');

    // Razorpay setup
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID || 'YOUR_KEY_ID',
      key_secret: process.env.RAZORPAY_KEY_SECRET || 'YOUR_KEY_SECRET'
    });

    // Payment routes
    app.post('/api/create-order', async (req, res) => {
      try {
        const { amount } = req.body;
        const order = await razorpay.orders.create({
          amount: amount * 100,
          currency: 'INR',
          receipt: `receipt_order_${Date.now()}`
        });
        res.json(order);
      } catch (err) {
        console.error('Razorpay create order error:', err);
        res.status(500).json({ success: false, error: 'Server error' });
      }
    });

    app.post('/api/capture-payment', async (req, res) => {
      const { student_id, order_id, payment_id, amount } = req.body;
      try {
        await db.query(
          `INSERT INTO payments (student_id, razorpay_order_id, razorpay_payment_id, amount_paid, status)
           VALUES (?, ?, ?, ?, 'success')`,
          [student_id, order_id, payment_id, amount]
        );
        res.json({ success: true });
      } catch (err) {
        console.error('Payment capture failed:', err);
        res.status(500).json({ success: false });
      }
    });

    // Routes
    const studentRoutes = require('./routes/studentRoutes')(db);
    const adminRoutes = require('./routes/adminRoutes')(db);
    const menuRoutes = require('./routes/menuRoutes')(db);
    const complaintRoutes = require('./routes/complaintRoutes')(db);
    const washingMachineRoutes = require('./routes/washingMachineRoutes')(db);
    const noticeRoutes = require('./routes/noticeRoutes')(db);

    // FIX: Added forward slashes before 'api' for proper URL routing
    app.use('/students', studentRoutes);
    app.use('/api/admin', adminRoutes);
    app.use('/api/menu', menuRoutes);
    app.use('/api/complaints', complaintRoutes);
    app.use('/api/washing-machine', washingMachineRoutes);
    app.use('/api/notices', noticeRoutes);

    // ADD: Map the /api/add_students endpoint to use the existing studentRoutes
    app.use('/api/add_students', studentRoutes);

    // Admin login
    app.post('/api/admin-login', async (req, res) => {
      const { username, password } = req.body;
      try {
        const [results] = await db.query(
          'SELECT * FROM admins WHERE username = ? AND password = ?',
          [username, password]
        );
        if (results.length > 0) {
          res.json({ success: true, admin: results[0] });
        } else {
          res.status(401).json({ success: false, message: 'Invalid admin credentials' });
        }
      } catch (err) {
        console.error('Admin Login Error:', err);
        res.status(500).json({ success: false, message: 'Database error' });
      }
    });

    // Health check
    app.get('/api/health', (req, res) => {
      res.json({ status: 'OK', timestamp: new Date() });
    });

    // Root endpoint
    app.get('/', (req, res) => {
      res.send('Hostel Management System API is running.');
    });

    // Error handling
    app.use((err, req, res, next) => {
      console.error('Global error handler:', err.stack);
      res.status(500).json({ success: false, message: 'Internal server error' });
    });

    // 404 handler
    app.use((req, res) => {
      res.status(404).json({ success: false, message: 'Endpoint not found' });
    });

    // Start server
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });

  } catch (err) {
    console.error('❌ MySQL Connection Error:', err);
    process.exit(1);
  }
})();