# 🏨 StayHub - Hostel Management System

<div align="center">

![StayHub Logo](https://img.shields.io/badge/StayHub-Hostel%20Management-blue?style=for-the-badge&logo=home&logoColor=white)

**A comprehensive full-stack hostel management solution for the modern era**

[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![MySQL](https://img.shields.io/badge/MySQL-005C84?style=for-the-badge&logo=mysql&logoColor=white)](https://www.mysql.com/)
[![Express.js](https://img.shields.io/badge/Express.js-404D59?style=for-the-badge)](https://expressjs.com/)

[🚀 Demo](#demo) • [✨ Features](#features) • [🛠️ Installation](#installation) • [📖 Usage](#usage) • [🤝 Contributing](#contributing)

</div>

---

## 🌟 Overview

StayHub revolutionizes hostel management by providing a seamless, digital-first approach to handle all aspects of student accommodation. From room allocation to fee management, complaints to mess menus - everything is just a click away!

> **"Transforming traditional hostel operations into a smart, efficient, and user-friendly experience"**

## ✨ Features

### 🔐 **Authentication & Security**
- **Dual Login System**: Separate portals for students and administrators
- **Role-Based Access Control**: Secure permissions for different user types
- **JWT Authentication**: Industry-standard token-based security
- **Password Encryption**: Secure password hashing for user safety

### 👨‍🎓 **Student Management**
- **Complete CRUD Operations**: Create, read, update, and delete student records
- **Profile Management**: Students can view and update their personal information
- **Room Assignment Tracking**: Real-time view of allocated rooms and beds
- **Academic Year Management**: Organize students by academic sessions

### 🏠 **Room & Bed Allocation**
- **Smart Room Assignment**: Efficient allocation system for rooms and beds
- **Occupancy Tracking**: Real-time monitoring of room availability
- **Bed Management**: Individual bed tracking within rooms
- **Capacity Optimization**: Maximize hostel occupancy efficiently

### 💰 **Payment Integration**
- **Razorpay Integration**: Seamless UPI and online payment processing
- **Fee Management**: Track hostel fees, mess fees, and other charges
- **Payment History**: Complete transaction records for students and admins
- **Automated Receipts**: Digital receipt generation for all payments

### 🍽️ **Mess Management**
- **Dynamic Menu System**: Easy-to-update daily/weekly mess menus
- **Meal Planning**: Advanced meal scheduling and planning tools
- **Nutritional Information**: Track meal nutritional content
- **Special Dietary Options**: Support for various dietary requirements

### 📝 **Complaint Management**
- **Digital Complaint System**: Students can raise issues digitally
- **Complaint Tracking**: Real-time status updates for raised complaints
- **Priority Management**: Categorize complaints by urgency
- **Resolution Timeline**: Track complaint resolution progress

### 📊 **Admin Dashboard**
- **Comprehensive Analytics**: Detailed insights into hostel operations
- **Student Statistics**: Occupancy rates, payment status, and more
- **Financial Reports**: Revenue tracking and expense management
- **System Monitoring**: Track system usage and performance

## 🛠️ Tech Stack

<div align="center">

| Frontend | Backend | Database | Payment |
|----------|---------|----------|---------|
| ![React](https://img.shields.io/badge/-React-61DAFB?style=flat-square&logo=react&logoColor=white) | ![Node.js](https://img.shields.io/badge/-Node.js-339933?style=flat-square&logo=node.js&logoColor=white) | ![MySQL](https://img.shields.io/badge/-MySQL-4479A1?style=flat-square&logo=mysql&logoColor=white) | ![Razorpay](https://img.shields.io/badge/-Razorpay-02042B?style=flat-square&logo=razorpay&logoColor=white) |
| React Router | Express.js | Sequelize ORM | UPI Integration |
| Axios | JWT | Database Design | Payment Gateway |
| Material-UI/CSS | Bcrypt | Data Modeling | Transaction Security |

</div>

## 🚀 Quick Start

### Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v14.0.0 or higher)
- **MySQL** (v8.0 or higher)
- **npm** or **yarn** package manager
- **Git** for version control

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/manideepak12/StayHub.git
   cd StayHub
   ```

2. **Install Backend Dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Install Frontend Dependencies**
   ```bash
   cd ../frontend
   npm install
   ```

4. **Database Setup**
   ```bash
   # Create MySQL database
   mysql -u root -p
   CREATE DATABASE stayhub_db;
   ```

5. **Environment Configuration**
   
   Create `.env` file in backend directory:
   ```env
   # Database Configuration
   DB_HOST=localhost
   DB_USER=your_mysql_username
   DB_PASSWORD=your_mysql_password
   DB_NAME=stayhub_db
   
   # JWT Secret
   JWT_SECRET=your_super_secret_jwt_key
   
   # Razorpay Configuration
   RAZORPAY_KEY_ID=your_razorpay_key_id
   RAZORPAY_KEY_SECRET=your_razorpay_key_secret
   
   # Server Configuration
   PORT=5000
   NODE_ENV=development
   ```

6. **Start the Application**
   
   Backend Server:
   ```bash
   cd backend
   npm start
   # Server runs on http://localhost:5000
   ```
   
   Frontend Application:
   ```bash
   cd frontend
   npm start
   # Application runs on http://localhost:3000
   ```

## 📖 Usage Guide

### 🎯 **For Students**

1. **Login/Register**: Access your student portal with credentials
2. **Dashboard**: View room details, payment status, and announcements
3. **Profile Management**: Update personal information and preferences
4. **Payment**: Pay hostel fees securely through integrated payment gateway
5. **Complaints**: Raise and track maintenance or facility issues
6. **Mess Menu**: Check daily meal schedules and special menus

### 🎯 **For Administrators**

1. **Admin Dashboard**: Comprehensive overview of hostel operations
2. **Student Management**: Add, edit, or remove student records
3. **Room Allocation**: Assign rooms and beds to students
4. **Payment Tracking**: Monitor fee payments and generate reports
5. **Complaint Resolution**: Review and resolve student complaints
6. **Menu Management**: Update mess menus and meal plans

## 📁 Project Structure

```
StayHub/
├── 📁 frontend/                 # React.js frontend application
│   ├── 📁 src/
│   │   ├── 📁 components/       # Reusable UI components
│   │   ├── 📁 pages/           # Application pages
│   │   ├── 📁 services/        # API service calls
│   │   ├── 📁 utils/           # Utility functions
│   │   └── 📁 styles/          # CSS and styling files
│   └── 📄 package.json
├── 📁 backend/                  # Node.js backend server
│   ├── 📁 controllers/         # Request handlers
│   ├── 📁 models/              # Database models
│   ├── 📁 routes/              # API routes
│   ├── 📁 middleware/          # Custom middleware
│   ├── 📁 config/              # Configuration files
│   └── 📄 package.json
├── 📁 database/                 # Database scripts and migrations
└── 📄 README.md
```

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/logout` - User logout

### Student Management
- `GET /api/students` - Get all students
- `POST /api/students` - Create new student
- `PUT /api/students/:id` - Update student
- `DELETE /api/students/:id` - Delete student

### Room Management
- `GET /api/rooms` - Get all rooms
- `POST /api/rooms/allocate` - Allocate room to student
- `PUT /api/rooms/:id` - Update room details

### Payment
- `POST /api/payments/create` - Create payment order
- `POST /api/payments/verify` - Verify payment
- `GET /api/payments/history` - Payment history

### Complaints
- `GET /api/complaints` - Get complaints
- `POST /api/complaints` - Create complaint
- `PUT /api/complaints/:id` - Update complaint status

## 🎨 Application Screenshots

<div align="center">

### 🏠 **Home Page**
![StayHub Home Page](https://res.cloudinary.com/duhabjmtf/image/upload/v1749065608/Screenshot_2025-06-05_010049_pg90j9.png)
*Modern and welcoming landing page showcasing StayHub's comprehensive hostel management solution*

---

### 👨‍🎓 **Student Dashboard**
![Student Dashboard](https://res.cloudinary.com/duhabjmtf/image/upload/v1749065936/Screenshot_2025-06-05_010731_deoxdw.png)
*Intuitive student interface providing easy access to room details, payments, complaints, and mess information*

---

### 👨‍💼 **Admin Dashboard**
![Admin Dashboard](https://res.cloudinary.com/duhabjmtf/image/upload/v1749065782/Screenshot_2025-06-05_010524_fel0fp.png)
*Comprehensive administrative panel with powerful tools for managing students, rooms, payments, and hostel operations*

---

### 💳 **Razorpay Payment Integration**
![Razorpay Integration](https://res.cloudinary.com/duhabjmtf/image/upload/v1749066027/Screenshot_2025-06-05_011010_uen0ii.png)
*Seamless and secure payment processing with Razorpay UPI integration for hassle-free fee management*

</div>

> **🚀 Experience the live application and see these features in action!**

## 🚧 Roadmap

- [ ] **Mobile App Development** - Native iOS and Android applications
- [ ] **Advanced Analytics** - Detailed reporting and insights dashboard
- [ ] **Notification System** - Push notifications for important updates
- [ ] **QR Code Integration** - QR codes for room access and payments
- [ ] **Visitor Management** - Track and manage hostel visitors
- [ ] **Inventory Management** - Track hostel assets and supplies
- [ ] **Multi-language Support** - Support for multiple languages
- [ ] **Integration APIs** - Connect with other institutional systems

## 🤝 Contributing

We welcome contributions from the community! Here's how you can help:

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/AmazingFeature`)
3. **Commit your changes** (`git commit -m 'Add some AmazingFeature'`)
4. **Push to the branch** (`git push origin feature/AmazingFeature`)
5. **Open a Pull Request**

### 📋 Contribution Guidelines

- Follow the existing code style and conventions
- Write clear commit messages
- Add tests for new features
- Update documentation as needed
- Ensure all tests pass before submitting

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 About the Developer

<div align="center">

**Manideepak Reddy Bodigam**

*Full-Stack Developer & Software Engineer*

[![Portfolio](https://img.shields.io/badge/Portfolio-Visit%20My%20Work-FF6B6B?style=for-the-badge&logo=vercel&logoColor=white)](https://my-portfolio-manideepak12s-projects.vercel.app/)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Connect%20With%20Me-0077B5?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/manideepak-reddy-bodigam-/)
[![GitHub](https://img.shields.io/badge/GitHub-Follow%20Me-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/manideepak12)

---

*"Passionate about creating innovative solutions that solve real-world problems through technology"*

🌟 **Expertise**: Full-Stack Development | React.js | Node.js | Database Design  
🎯 **Focus**: Building scalable web applications with exceptional user experiences  
🚀 **Mission**: Transforming ideas into powerful digital solutions

</div>

## 🙏 Acknowledgments

- Thanks to all contributors who have helped shape StayHub
- Special thanks to the open-source community for the amazing tools and libraries
- Razorpay for providing seamless payment integration
- React.js, Node.js, and MySQL communities for excellent documentation

## 📞 Support & Contact

If you encounter any issues or have questions about StayHub:

<div align="center">

### 🔗 **Quick Links**
[![Portfolio](https://img.shields.io/badge/🌐_Portfolio-Visit_My_Work-FF6B6B?style=flat-square)](https://my-portfolio-manideepak12s-projects.vercel.app/)
[![LinkedIn](https://img.shields.io/badge/💼_LinkedIn-Let's_Connect-0077B5?style=flat-square)](https://www.linkedin.com/in/manideepak-reddy-bodigam-/)

### 📋 **Support Options**
- 🐛 **Bug Reports**: [Create an issue](https://github.com/manideepak12/StayHub/issues)
- 💡 **Feature Requests**: [Request a feature](https://github.com/manideepak12/StayHub/issues)
- 💬 **Discussions**: [GitHub Discussions](https://github.com/manideepak12/StayHub/discussions)
- 📧 **Direct Contact**: Connect via LinkedIn for professional inquiries

</div>

---

<div align="center">

**⭐ If you found this project helpful, please give it a star! ⭐**

[![GitHub stars](https://img.shields.io/github/stars/manideepak12/StayHub?style=social)](https://github.com/manideepak12/StayHub/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/manideepak12/StayHub?style=social)](https://github.com/manideepak12/StayHub/network)

**Made with ❤️ for better hostel management**

</div>
