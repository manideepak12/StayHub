import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Lottie from 'lottie-react';

function StudentLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showAnimation, setShowAnimation] = useState(false);
  const [animationData, setAnimationData] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotPasswordDialog, setShowForgotPasswordDialog] = useState(false);
  const navigate = useNavigate();

  // Load the animation JSON file
  useEffect(() => {
    fetch('/student.json')
      .then(response => response.json())
      .then(data => {
        setAnimationData(data);
      })
      .catch(err => {
        console.error('Error loading animation:', err);
      });
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/students/login', {
        email,
        password,
      });
      if (response.data.success) {
        // Store necessary data in localStorage
        localStorage.setItem('userRole', 'student');
        localStorage.setItem('studentId', response.data.student.id);
        localStorage.setItem('studentName', response.data.student.name);
        localStorage.setItem('studentRoomNumber', response.data.student.room_number);
        localStorage.setItem('studentFeeStatus', response.data.student.fee_status);
        
        // Show animation on successful login
        setShowAnimation(true);
        
        // Navigate to dashboard after animation completes (3 seconds)
        setTimeout(() => {
          navigate('/student-dashboard');
        }, 3000);
      } else {
        setError('Invalid email or password');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Login failed. Please try again.');
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleForgotPasswordClick = () => {
    setShowForgotPasswordDialog(true);
  };

  const closeForgotPasswordDialog = () => {
    setShowForgotPasswordDialog(false);
  };

  return (
    <div style={styles.container}>
      {/* Back Button */}
      <div onClick={() => navigate('/')} style={styles.backIcon} title="Go Back">
        ←
      </div>

      {showAnimation ? (
        // Show animation after successful login
        <div style={styles.animationContainer}>
          {animationData && (
            <Lottie
              animationData={animationData}
              loop={false}
              style={{ width: 250, height: 250 }}
            />
          )}
          <p style={styles.successText}>Login Successful!</p>
        </div>
      ) : (
        // Show login form
        <>
          <h2 style={styles.title}>Student Login</h2>
          <form onSubmit={handleLogin} style={styles.form} className="student-form">
            <div style={styles.inputGroup}>
              <label style={styles.label}>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={styles.input}
                required
                placeholder="youremail@example.com"
              />
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Password</label>
              <div style={styles.passwordContainer}>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={styles.passwordInput}
                  required
                  placeholder="••••••••"
                />
                <div 
                  onClick={togglePasswordVisibility} 
                  style={styles.eyeIcon}
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                      <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                  ) : (
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
            <div 
              style={styles.forgotPassword}
              onClick={handleForgotPasswordClick}
            >
              Forgot password?
            </div>
          </form>
        </>
      )}

      {/* Forgot Password Dialog */}
      {showForgotPasswordDialog && (
        <div style={styles.dialogOverlay}>
          <div style={styles.dialogContent}>
            <h3 style={styles.dialogTitle}>Forgot Password?</h3>
            <p style={styles.dialogMessage}>
              Please contact your administrator to reset your password.
              <br /><br />
              Email: admin@hostel.com
              <br />
              Phone: +1 (123) 456-7890
            </p>
            <button 
              style={styles.dialogButton}
              onClick={closeForgotPasswordDialog}
            >
              OK
            </button>
          </div>
        </div>
      )}

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
          
          .student-form {
            transition: all 0.3s ease;
          }
          
          .student-form:hover {
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
    backgroundColor: '#f8f8f8',
    position: 'relative',
    fontFamily: "'Poppins', sans-serif",
    padding: '20px',
    boxSizing: 'border-box',
  },
  animationContainer: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '30px',
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
    maxWidth: '90%',
    boxSizing: 'border-box',
  },
  successText: {
    marginTop: '16px',
    fontSize: '20px',
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
  forgotPassword: {
    textAlign: 'center',
    marginTop: '16px',
    fontSize: '14px',
    color: '#CB202D',
    cursor: 'pointer',
    fontWeight: '500',
  },
  // Dialog styles
  dialogOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  dialogContent: {
    backgroundColor: '#ffffff',
    padding: '25px',
    borderRadius: '12px',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
    width: '350px',
    maxWidth: '90%',
    textAlign: 'center',
  },
  dialogTitle: {
    fontSize: '20px',
    fontWeight: '600',
    marginBottom: '15px',
    color: '#333333',
  },
  dialogMessage: {
    fontSize: '15px',
    color: '#555555',
    marginBottom: '20px',
    lineHeight: '1.5',
  },
  dialogButton: {
    padding: '10px 20px',
    backgroundColor: '#CB202D',
    color: '#ffffff',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: '500',
    fontSize: '15px',
    transition: 'all 0.3s ease',
    width: '100%',
    boxSizing: 'border-box',
  },
};

export default StudentLogin;