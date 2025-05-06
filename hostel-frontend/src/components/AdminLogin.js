import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Lottie from 'lottie-react';
import animationData from '../assets/admin.json'; // Make sure this path is correct

function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const res = await axios.post('http://localhost:5000/api/admin-login', {
        username,
        password,
      });

      if (res.data.success) {
        localStorage.setItem('userRole', 'admin');
        localStorage.setItem('adminInfo', JSON.stringify(res.data.admin));
        setLoading(true);
        setTimeout(() => {
          navigate('/AdminDashboard');
        }, 2000);
      } else {
        setError(res.data.message || 'Invalid credentials');
      }
    } catch (err) {
      console.error(err);
      if (err.response && err.response.status === 404) {
        setError('Server endpoint not found. Please check if the server is running.');
      } else if (err.code === 'ERR_NETWORK') {
        setError('Cannot connect to server. Please check if the server is running.');
      } else {
        setError('Login failed. Please try again.');
      }
    }
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <Lottie animationData={animationData} loop={true} style={{ width: 250, height: 250 }} />
        <p style={styles.loadingText}>Logging in...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div onClick={() => navigate('/')} style={styles.backIcon} title="Go Back">
        ←
      </div>
      <h2 style={styles.title}>Admin Login</h2>
      <form onSubmit={handleLogin} style={styles.form} className="admin-form">
        <div style={styles.inputGroup}>
          <label style={styles.label}>Username</label>
          <input
            type="text"
            style={styles.input}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter your username"
            required
          />
        </div>

        <div style={styles.inputGroup}>
          <label style={styles.label}>Password</label>
          <div style={styles.passwordContainer}>
            <input
              type={showPassword ? 'text' : 'password'}
              style={styles.passwordInput}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
            <div 
              onClick={() => setShowPassword(!showPassword)} 
              style={styles.eyeIcon}
              title={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                // Eye Open Icon (when password is visible)
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
              ) : (
                // Eye Closed Icon (when password is hidden)
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                  <line x1="1" y1="1" x2="23" y2="23"></line>
                </svg>
              )}
            </div>
          </div>
        </div>

        {error && <p style={styles.error}>{error}</p>}
        <button type="submit" style={styles.button} className="zomato-button">
          Sign In
        </button>
      </form>

      {/* District by Zomato Styles */}
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');
          
          body {
            font-family: 'Poppins', sans-serif;
          }
          
          .zomato-button {
            background-color: #CB202D;
            color: white;
            border: none;
            border-radius: 6px;
            font-size: 16px;
            font-weight: 500;
            padding: 12px;
            cursor: pointer;
            transition: all 0.3s ease;
          }
          
          .zomato-button:hover {
            background-color: #b71c25;
            transform: translateY(-2px);
            box-shadow: 0 4px 8px rgba(203, 32, 45, 0.3);
          }
          
          .admin-form {
            transition: all 0.3s ease;
          }
          
          .admin-form:hover {
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
          }
          
          input:focus {
            border-color: #CB202D !important;
            box-shadow: 0 0 0 2px rgba(203, 32, 45, 0.2) !important;
            outline: none;
          }
        `}
      </style>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    backgroundColor: '#f8f8f8', // Light gray background that matches District theme
    position: 'relative',
    fontFamily: "'Poppins', sans-serif",
    padding: '20px',
    boxSizing: 'border-box',
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    backgroundColor: '#f8f8f8',
    fontFamily: "'Poppins', sans-serif",
  },
  loadingText: {
    marginTop: '16px',
    fontSize: '18px',
    fontWeight: '600',
    color: '#CB202D',
  },
  backIcon: {
    position: 'absolute',
    top: '20px',
    left: '20px',
    fontSize: '28px',
    color: '#333333',
    cursor: 'pointer',
    transition: 'transform 0.3s ease',
    fontWeight: '300',
    padding: '5px',
    boxSizing: 'border-box',
  },
  title: {
    fontSize: '26px',
    fontWeight: '600',
    marginBottom: '24px',
    color: '#333333',
    textAlign: 'center',
  },
  form: {
    backgroundColor: '#ffffff',
    padding: '30px',
    borderRadius: '12px',
    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)',
    width: '340px',
    maxWidth: '90%',
    boxSizing: 'border-box',
    transition: 'all 0.3s ease',
  },
  inputGroup: {
    marginBottom: '20px',
  },
  label: {
    display: 'block',
    marginBottom: '8px',
    fontSize: '14px',
    color: '#333333',
    fontWeight: '500',
  },
  input: {
    width: '100%',
    padding: '12px 14px',
    borderRadius: '6px',
    border: '1px solid #E8E8E8',
    outline: 'none',
    fontSize: '15px',
    transition: 'all 0.3s ease',
    backgroundColor: '#FAFAFA',
    boxSizing: 'border-box',
  },
  passwordContainer: {
    position: 'relative',
    width: '100%',
  },
  passwordInput: {
    width: '100%',
    padding: '12px 14px',
    paddingRight: '40px',
    borderRadius: '6px',
    border: '1px solid #E8E8E8',
    outline: 'none',
    fontSize: '15px',
    transition: 'all 0.3s ease',
    backgroundColor: '#FAFAFA',
    boxSizing: 'border-box',
  },
  eyeIcon: {
    position: 'absolute',
    right: '12px',
    top: '50%',
    transform: 'translateY(-50%)',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#666',
    zIndex: 10,
  },
  error: {
    color: '#CB202D',
    fontSize: '14px',
    marginBottom: '16px',
    fontWeight: '500',
  },
  button: {
    width: '100%',
    padding: '12px',
    backgroundColor: '#CB202D',
    color: '#ffffff',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: '500',
    fontSize: '16px',
    transition: 'all 0.3s ease',
    marginTop: '8px',
    boxSizing: 'border-box',
  },
};

export default AdminLogin;