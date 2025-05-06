// ✅ All imports should be at the top
import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import HomePage from './components/HomePage';
import AdminLogin from './components/AdminLogin';
import AdminDashboard from './components/AdminDashboard';
import StudentLogin from './components/StudentLogin';
import StudentDashboard from './components/StudentDashboard';
import Navbar from './components/Navbar'; // Optional if always showing
import StudentList from './components/StudentList';
import StudentForm from './components/StudentForm';
import StudentEditForm from './components/StudentEditForm';
import MenuForm from './components/MenuForm'; // ✅ make sure this import exists
import RoomManager from './components/RoomManager'; // ✅ Adjust the path if needed
import AdminNoticeBoard from './components/AdminNoticeBoard';
import WashingMachineAdmin from './components/WashingMachineAdmin';
// ✅ Optional wrapper to show Navbar only on specific routes
const AppWrapper = () => {
  const location = useLocation();
  const showNavbar = !['/', '/admin-login', '/student-login'].includes(location.pathname);

  return (
    <>
      {showNavbar && <Navbar />}
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/student-login" element={<StudentLogin />} />

        {/* Admin Routes */}
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/students" element={<StudentList />} />
        <Route path="/add-student" element={<StudentForm />} />
        <Route path="/edit-student/:id" element={<StudentEditForm />} />
        <Route path="/menu" element={<MenuForm />} />
        <Route path="/room-manager" element={<RoomManager />} />
        <Route path="/admin/notices" element={<AdminNoticeBoard />} />
        <Route path="/admin/washing-machine" element={<WashingMachineAdmin />} />
        {/* Student Routes */}
        <Route path="/student-login" element={<StudentLogin />} />
        <Route path="/student-dashboard" element={<StudentDashboard />} />
        <Route path="/edit-student" element={<StudentEditForm studentId={localStorage.getItem('studentId')} />}
/>

      </Routes>
    </>
  );
};

function App() {
  return (
    <Router>
      <AppWrapper />
    </Router>
  );
}

export default App;
