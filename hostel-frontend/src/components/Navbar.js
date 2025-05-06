import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaBars } from 'react-icons/fa';

const Navbar = () => {
  const [role, setRole] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Load Google Fonts
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&family=Montserrat:wght@500;700&family=Playfair+Display:wght@700&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);

    const storedRole = localStorage.getItem('userRole');
    setRole(storedRole);

    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);

    return () => {
      document.head.removeChild(link);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('userRole');
    localStorage.removeItem('studentId');
    localStorage.removeItem('studentName');
    localStorage.removeItem('editStudentId');
    setRole('');
    navigate('/');
    setShowLogoutConfirm(false);
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const confirmLogout = () => {
    setShowLogoutConfirm(true);
  };

  const cancelLogout = () => {
    setShowLogoutConfirm(false);
  };

  return (
    <nav style={styles.navbar(isMobile)}>
      <div style={styles.leftContainer}>
        <div style={styles.logoContainer}>
          <h2 style={styles.logo}>Hostel Management</h2>
        </div>
      </div>

      <div style={styles.mobileMenuButton(isMobile)} onClick={toggleMenu}>
        {isMenuOpen ? (
          <div style={styles.burgerOpen}></div>
        ) : (
          <FaBars size={20} color="#fff" />
        )}
      </div>

      <ul style={{
        ...styles.navLinks(isMobile),
        ...(isMenuOpen ? styles.navLinksActive(isMobile) : styles.navLinksClosed(isMobile))
      }}>
        {isMobile && isMenuOpen && (
          <li style={styles.navItem(isMobile)}>
            <button onClick={closeMenu} style={styles.closeButton}>
              <FaArrowLeft size={18} color="#fff" style={{ marginRight: '8px' }} />
              <span>Close Menu</span>
            </button>
          </li>
        )}
        
        {!role && (
          <>
            <li style={styles.navItem(isMobile)}>
              <Link to="/student-login" style={styles.link(isMobile)} onClick={closeMenu}>
                <span>Student Login</span>
              </Link>
            </li>
            <li style={styles.navItem(isMobile)}>
              <Link to="/admin-login" style={styles.link(isMobile)} onClick={closeMenu}>
                <span>Admin Login</span>
              </Link>
            </li>
          </>
        )}
        {role === 'student' && (
          <>
            <li style={styles.navItem(isMobile)}>
              <Link to="/student-dashboard" style={styles.link(isMobile)} onClick={closeMenu}>
                <span>Dashboard</span>
              </Link>
            </li>
            <li style={styles.navItem(isMobile)}>
              <button onClick={confirmLogout} style={styles.logout(isMobile)}>Logout</button>
            </li>
          </>
        )}
        {role === 'admin' && (
          <>
            <li style={styles.navItem(isMobile)}>
              <Link to="/admin-dashboard" style={styles.link(isMobile)} onClick={closeMenu}>
                <span>Dashboard</span>
              </Link>
            </li>
            <li style={styles.navItem(isMobile)}>
              <Link to="/students" style={styles.link(isMobile)} onClick={closeMenu}>
                <span>Students</span>
              </Link>
            </li>
            <li style={styles.navItem(isMobile)}>
              <Link to="/add-student" style={styles.link(isMobile)} onClick={closeMenu}>
                <span>Add Student</span>
              </Link>
            </li>
            <li style={styles.navItem(isMobile)}>
              <Link to="/menu" style={styles.link(isMobile)} onClick={closeMenu}>
                <span>Menu</span>
              </Link>
            </li>
            <li style={styles.navItem(isMobile)}>
              <Link to="/room-manager" style={styles.link(isMobile)} onClick={closeMenu}>
                <span>Rooms</span>
              </Link>
            </li>
            <li style={styles.navItem(isMobile)}>
              <Link to="/admin/notices" style={styles.link(isMobile)} onClick={closeMenu}>
                <span>Notices</span>
              </Link>
            </li>
            <li style={styles.navItem(isMobile)}>
              <Link to="/admin/washing-machine" style={styles.link(isMobile)} onClick={closeMenu}>
                <span>Washing Machine Slots</span>
              </Link>
            </li>
            <li style={styles.navItem(isMobile)}>
              <button onClick={confirmLogout} style={styles.logout(isMobile)}>Logout</button>
            </li>
          </>
        )}
      </ul>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <h3 style={styles.modalTitle}>Confirm Logout</h3>
            <p style={styles.modalText}>Are you sure you want to logout?</p>
            <div style={styles.modalButtons}>
              <button onClick={cancelLogout} style={styles.cancelButton}>
                Cancel
              </button>
              <button onClick={handleLogout} style={styles.confirmButton}>
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

const styles = {
  navbar: (isMobile) => ({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: isMobile ? '10px 15px' : '12px 30px',
    background: 'linear-gradient(135deg, #0369a1 0%, #0284c7 100%)',
    color: '#fff',
    width: '100%',
    boxSizing: 'border-box',
    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.15)',
    position: 'sticky',
    top: 0,
    zIndex: 1000,
    fontFamily: '"Poppins", sans-serif',
  }),
  leftContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
  },
  logoContainer: {
    position: 'relative',
    zIndex: 1100,
  },
  logo: {
    fontSize: '24px',
    margin: 0,
    fontFamily: '"Playfair Display", serif',
    fontWeight: 700,
    letterSpacing: '0.5px',
    background: 'linear-gradient(to right, #fff, #d1fae5)',
    WebkitBackgroundClip: 'text',
    color: 'transparent',
    textShadow: '0 2px 4px rgba(0,0,0,0.1)',
    display: 'inline-block',
  },
  closeButton: {
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    padding: '10px 0',
    color: '#fff',
    fontWeight: 500,
    fontSize: '15px',
    fontFamily: '"Montserrat", sans-serif',
    display: 'flex',
    alignItems: 'center',
    width: '100%',
    marginBottom: '10px',
    borderBottom: '1px solid rgba(255,255,255,0.2)',
    paddingBottom: '15px',
  },
  navLinks: (isMobile) => ({
    display: 'flex',
    gap: '15px',
    listStyle: 'none',
    margin: 0,
    padding: 0,
    alignItems: 'center',
    flexDirection: isMobile ? 'column' : 'row',
    position: isMobile ? 'fixed' : 'static',
    top: 0,
    right: 0,
    height: isMobile ? '100vh' : 'auto',
    backgroundColor: isMobile ? '#0369a1' : 'transparent',
    padding: isMobile ? '70px 20px 20px' : 0,
    width: isMobile ? '220px' : 'auto',
    boxShadow: isMobile ? '-5px 0 15px rgba(0, 0, 0, 0.1)' : 'none',
    transition: 'transform 0.3s ease-in-out',
  }),
  navLinksActive: (isMobile) => ({
    transform: isMobile ? 'translateX(0)' : 'none',
  }),
  navLinksClosed: (isMobile) => ({
    transform: isMobile ? 'translateX(100%)' : 'none',
  }),
  navItem: (isMobile) => ({
    width: isMobile ? '100%' : 'auto',
  }),
  link: (isMobile) => ({
    color: '#fff',
    textDecoration: 'none',
    fontWeight: 500,
    fontSize: '15px',
    padding: isMobile ? '10px 0' : '6px 10px',
    borderRadius: '6px',
    fontFamily: '"Montserrat", sans-serif',
    display: 'inline-block',
    width: isMobile ? '100%' : 'auto',
    transition: 'all 0.2s ease',
    ':hover': {
      backgroundColor: isMobile ? 'rgba(255,255,255,0.1)' : 'transparent',
    },
  }),
  mobileMenuButton: (isMobile) => ({
    display: isMobile ? 'block' : 'none',
    cursor: 'pointer',
    zIndex: 1100,
    width: '28px',
    height: '28px',
    position: 'relative',
  }),
  burger: {
    position: 'absolute',
    top: '50%',
    right: 0,
    width: '28px',
    height: '3px',
    backgroundColor: '#fff',
    borderRadius: '3px',
    transform: 'translateY(-50%)',
  },
  burgerOpen: {
    position: 'absolute',
    top: '50%',
    right: 0,
    width: '28px',
    height: '3px',
    backgroundColor: 'transparent',
    transform: 'translateY(-50%)',
  },
  logout: (isMobile) => ({
    background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
    border: 'none',
    padding: isMobile ? '10px 0' : '8px 16px',
    borderRadius: '6px',
    color: 'white',
    cursor: 'pointer',
    fontWeight: 500,
    fontSize: '14px',
    fontFamily: '"Montserrat", sans-serif',
    transition: 'all 0.3s ease',
    width: isMobile ? '100%' : 'auto',
    textAlign: isMobile ? 'center' : 'left',
    ':hover': {
      opacity: 0.9,
    },
  }),
  // Modal styles
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2000,
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: '25px',
    borderRadius: '8px',
    width: '90%',
    maxWidth: '400px',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
  },
  modalTitle: {
    margin: '0 0 15px 0',
    color: '#0369a1',
    fontFamily: '"Montserrat", sans-serif',
  },
  modalText: {
    margin: '0 0 20px 0',
    color: '#333',
    fontSize: '15px',
  },
  modalButtons: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '10px',
  },
  cancelButton: {
    padding: '8px 16px',
    borderRadius: '6px',
    border: '1px solid #ccc',
    background: 'transparent',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    ':hover': {
      backgroundColor: '#f5f5f5',
    },
  },
  confirmButton: {
    padding: '8px 16px',
    borderRadius: '6px',
    border: 'none',
    background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
    color: 'white',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    ':hover': {
      opacity: 0.9,
    },
  },
};

export default Navbar;