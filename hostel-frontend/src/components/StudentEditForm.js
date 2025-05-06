import React, { useEffect, useState } from 'react';
import { fetchStudentById, updateStudent } from '../api';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const StudentEditForm = () => {
  const studentId = localStorage.getItem('editStudentId');
  const [formData, setFormData] = useState({});
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [contactError, setContactError] = useState('');
  const navigate = useNavigate();
  
  // Dialog states
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (studentId) {
      fetchStudentById(studentId)
        .then((res) => setFormData(res.data))
        .catch((err) => {
          console.error(err);
          setErrorMessage('Failed to fetch student data');
          setShowErrorDialog(true);
        });
    }
  }, [studentId]);

  // Create preview when file is selected
  useEffect(() => {
    if (!selectedFile) return;
    
    const fileReader = new FileReader();
    fileReader.onload = () => {
      setPreviewUrl(fileReader.result);
    };
    fileReader.readAsDataURL(selectedFile);
    
    return () => {
      URL.revokeObjectURL(previewUrl);
    };
  }, [selectedFile]);

  const validateIndianPhoneNumber = (phone) => {
    // Indian phone numbers: 10 digits, optionally with +91 or 0 prefix
    const indianPhoneRegex = /^(?:(?:\+|0{0,2})91(\s*[\-]\s*)?|[0]?)?[6789]\d{9}$/;
    return indianPhoneRegex.test(phone);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'contact') {
      if (value && !validateIndianPhoneNumber(value)) {
        setContactError('Please enter a valid phone number');
      } else {
        setContactError('');
      }
    }
    
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const closeSuccessDialog = () => {
    setShowSuccessDialog(false);
    localStorage.removeItem('editStudentId');
    // Changed from '/admin-dashboard' to '/students'
    navigate('/students');
  };

  const closeErrorDialog = () => {
    setShowErrorDialog(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate phone number before submission
    if (formData.contact && !validateIndianPhoneNumber(formData.contact)) {
      setContactError('Please enter a valid phone number');
      return;
    }

    const formattedDate = new Date(formData.joining_date).toISOString().split('T')[0];

    const updatedData = {
      ...formData,
      joining_date: formattedDate,
    };

    try {
      await updateStudent(studentId, updatedData);

      if (selectedFile) {
        const profileData = new FormData();
        profileData.append('profile', selectedFile);

        await axios.post(
          `http://localhost:5000/students/upload-profile/${studentId}`,
          profileData,
          {
            headers: { 'Content-Type': 'multipart/form-data' },
          }
        );
      }

      // Show success dialog instead of alert
      setShowSuccessDialog(true);
    } catch (error) {
      console.error(error);
      // Show error dialog instead of alert
      setErrorMessage('Failed to update student');
      setShowErrorDialog(true);
    }
  };

  return (
    <div style={styles.pageBackground}>
      {/* Success Dialog */}
      {showSuccessDialog && (
        <div style={styles.dialogOverlay}>
          <div style={styles.dialogBox}>
            <div style={styles.dialogContent}>
              <div style={styles.successIcon}>✓</div>
              <h3 style={styles.dialogTitle}>Success!</h3>
              <p style={styles.dialogMessage}>Student updated successfully!</p>
              <button 
                style={styles.dialogButton}
                onClick={closeSuccessDialog}
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Error Dialog */}
      {showErrorDialog && (
        <div style={styles.dialogOverlay}>
          <div style={styles.dialogBox}>
            <div style={styles.dialogContent}>
              <div style={styles.errorIcon}>!</div>
              <h3 style={styles.dialogTitle}>Error</h3>
              <p style={styles.dialogMessage}>{errorMessage}</p>
              <button 
                style={styles.dialogButton}
                onClick={closeErrorDialog}
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      <div style={styles.container}>
        <div style={styles.header}>
          <button 
            style={styles.backButton} 
            onClick={() => navigate('/students')}
            aria-label="Back to students"
          >
            <BackIcon />
          </button>
          <h2 style={styles.title}>Edit Student Details</h2>
        </div>
        
        <div style={styles.profileSection}>
          <div style={styles.profileContainer}>
            {(previewUrl || formData.profile_url) && (
              <img
                src={previewUrl || `http://localhost:5000${formData.profile_url}`}
                alt="Student Profile"
                style={styles.profileImage}
              />
            )}
            {!previewUrl && !formData.profile_url && (
              <div style={styles.noProfile}>
                <i style={styles.userIcon}>👤</i>
              </div>
            )}
          </div>
          
          <label style={styles.fileInputLabel}>
            <input 
              type="file" 
              accept="image/*" 
              onChange={handleFileChange}
              style={styles.fileInput} 
            />
            Change Photo
          </label>
        </div>
        
        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.formGrid}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Name</label>
              <input 
                style={styles.input} 
                name="name" 
                value={formData.name || ''} 
                onChange={handleChange} 
                required 
              />
            </div>
            
            <div style={styles.formGroup}>
              <label style={styles.label}>Email</label>
              <input 
                style={styles.input} 
                name="email" 
                type="email"
                value={formData.email || ''} 
                onChange={handleChange} 
                required 
              />
            </div>
          
            <div style={styles.formGroup}>
              <label style={styles.label}>Room Number</label>
              <input 
                style={styles.input} 
                name="room_number" 
                value={formData.room_number || ''} 
                onChange={handleChange} 
                required 
              />
            </div>
            
            <div style={styles.formGroup}>
              <label style={styles.label}>
                <span style={styles.phoneLabel}>
                  <span style={styles.flagIcon}>🇮🇳</span> 
                  <span style={styles.countryCode}>+91</span> 
                  Phone Number
                </span>
              </label>
              <input 
                style={contactError ? {...styles.input, ...styles.inputError} : styles.input} 
                name="contact" 
                value={formData.contact || ''} 
                onChange={handleChange}
                placeholder="10-digit number starting with 6-9" 
                required 
              />
              {contactError && <span style={styles.errorText}>{contactError}</span>}
            </div>
          
            <div style={styles.formGroup}>
              <label style={styles.label}>Fee Status</label>
              <select 
                style={styles.select} 
                name="fee_status" 
                value={formData.fee_status || ''} 
                onChange={handleChange} 
                required
              >
                <option value="">Select Status</option>
                <option value="paid">Paid</option>
                <option value="unpaid">Unpaid</option>
              </select>
            </div>
            
            <div style={styles.formGroup}>
              <label style={styles.label}>Joining Date</label>
              <input
                style={styles.input}
                type="date"
                name="joining_date"
                value={formData.joining_date?.split('T')[0] || ''}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          
          <div style={styles.actions}>
            <button 
              type="button" 
              style={styles.cancelButton} 
              // Changed from '/admin-dashboard' to '/students'
              onClick={() => navigate('/students')}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              style={styles.submitButton}
              disabled={contactError ? true : false}
            >
              Update Student
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Back icon component
const BackIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 12H5"></path>
    <path d="M12 19l-7-7 7-7"></path>
  </svg>
);

const styles = {
  pageBackground: {
    backgroundColor: '#f3f4f6', 
    minHeight: '100vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '20px',
    fontFamily: '"Segoe UI", Roboto, "Helvetica Neue", sans-serif',
    position: 'relative', // Added for dialog positioning
  },
  container: {
    width: '100%',
    maxWidth: '800px',
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.08)',
    padding: '32px',
    margin: '20px auto',
    position: 'relative',
  },
  header: {
    position: 'relative',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: '30px',
  },
  title: {
    color: '#1e3a8a',
    fontSize: '28px',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  backButton: {
    position: 'absolute',
    left: '0',
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#3b82f6',
    padding: '8px',
    borderRadius: '8px',
    transition: 'all 0.2s',
  },
  profileSection: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: '30px',
  },
  profileContainer: {
    width: '120px',
    height: '120px',
    borderRadius: '60px',
    overflow: 'hidden',
    marginBottom: '15px',
    border: '4px solid #e5e7eb',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
  },
  profileImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  noProfile: {
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#e5e7eb',
  },
  userIcon: {
    fontSize: '48px',
  },
  fileInputLabel: {
    cursor: 'pointer',
    backgroundColor: '#3b82f6',
    color: 'white',
    padding: '8px 16px',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: 'bold',
    transition: 'background-color 0.2s',
  },
  fileInput: {
    display: 'none'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '20px',
    width: '100%',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
  },
  label: {
    marginBottom: '8px',
    fontWeight: '500',
    color: '#4b5563',
    fontSize: '15px',
  },
  phoneLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  flagIcon: {
    fontSize: '16px',
  },
  countryCode: {
    fontWeight: 'bold',
    color: '#3b82f6',
  },
  input: {
    width: '100%',
    padding: '12px 16px',
    borderRadius: '8px',
    border: '1px solid #d1d5db',
    fontSize: '16px',
    color: '#111827',
    backgroundColor: '#f9fafb',
    outline: 'none',
    transition: 'border-color 0.2s, box-shadow 0.2s',
    boxSizing: 'border-box',
  },
  inputError: {
    borderColor: '#ef4444',
    backgroundColor: '#fef2f2',
  },
  errorText: {
    color: '#ef4444',
    fontSize: '12px',
    marginTop: '4px',
  },
  select: {
    width: '100%',
    padding: '12px 16px',
    borderRadius: '8px',
    border: '1px solid #d1d5db',
    fontSize: '16px',
    color: '#111827',
    backgroundColor: '#f9fafb',
    outline: 'none',
    transition: 'border-color 0.2s, box-shadow 0.2s',
    appearance: 'none',
    backgroundImage: `url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 12px center',
    backgroundSize: '16px',
    boxSizing: 'border-box',
  },
  actions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '16px',
    marginTop: '12px',
  },
  cancelButton: {
    padding: '12px 24px',
    borderRadius: '8px',
    border: '1px solid #d1d5db',
    backgroundColor: 'white',
    color: '#4b5563',
    fontSize: '16px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
  submitButton: {
    padding: '12px 28px',
    borderRadius: '8px',
    border: 'none',
    backgroundColor: '#2563eb',
    color: 'white',
    fontSize: '16px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
    boxShadow: '0 2px 5px rgba(37, 99, 235, 0.3)',
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
  dialogBox: {
    backgroundColor: '#fff',
    borderRadius: '12px',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    width: '100%',
    maxWidth: '400px',
    overflow: 'hidden',
  },
  dialogContent: {
    padding: '30px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
  },
  successIcon: {
    width: '60px',
    height: '60px',
    borderRadius: '50%',
    backgroundColor: '#10b981',
    color: '#fff',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    fontSize: '32px',
    marginBottom: '16px',
  },
  errorIcon: {
    width: '60px',
    height: '60px',
    borderRadius: '50%',
    backgroundColor: '#ef4444',
    color: '#fff',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    fontSize: '32px',
    fontWeight: 'bold',
    marginBottom: '16px',
  },
  dialogTitle: {
    color: '#1e293b',
    fontSize: '22px',
    fontWeight: '700',
    marginBottom: '8px',
    fontFamily: '"Segoe UI", Roboto, "Helvetica Neue", sans-serif',
  },
  dialogMessage: {
    color: '#64748b',
    fontSize: '16px',
    marginBottom: '24px',
    fontFamily: '"Segoe UI", Roboto, "Helvetica Neue", sans-serif',
  },
  dialogButton: {
    padding: '12px 32px',
    backgroundColor: '#3b82f6',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: '600',
    fontFamily: '"Segoe UI", Roboto, "Helvetica Neue", sans-serif',
    transition: 'all 0.2s ease',
  },
};

export default StudentEditForm;