import React, { useState, useEffect } from 'react';
import axios from 'axios';

// Add a CSS file import for hover effects
import './StudentForm.css'; // You'll need to create this file

const StudentForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    room_number: '',
    bed_number: '',
    contact: '+91', // Initialize with +91 prefix
    fee_status: 'Unpaid',
    joining_date: '',
  });
  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [contactError, setContactError] = useState('');
  const [rooms, setRooms] = useState([]);
  const [selectedRoomCapacity, setSelectedRoomCapacity] = useState(0);
  // State for showing success dialog
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);

  // Load Google Fonts
  useEffect(() => {
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600&family=Montserrat:wght@500;700&family=Playfair+Display:wght@700&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);

    return () => {
      document.head.removeChild(link);
    };
  }, []);

  // Fetch rooms data
  useEffect(() => {
    const fetchRooms = async () => {
      try {
        // Use the same endpoint as RoomManager for consistency
        const response = await axios.get('http://localhost:5000/students/rooms');
        setRooms(response.data || []);
      } catch (err) {
        console.error('Error fetching rooms:', err);
        setRooms([]); // Set empty array as fallback
      }
    };
    
    fetchRooms();
  }, []);

  const validateIndianPhoneNumber = (phone) => {
    // Indian phone numbers: 10 digits after +91
    const indianPhoneRegex = /^\+91[6-9]\d{9}$/;
    return indianPhoneRegex.test(phone);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'contact') {
      // Handle phone number input specially
      const numericValue = value.replace(/[^0-9]/g, ''); // Extract only numbers
      const formattedValue = '+91' + numericValue; // Always keep +91 prefix
      
      // Validate the full number (with +91)
      if (numericValue && !validateIndianPhoneNumber(formattedValue)) {
        setContactError('Please enter a valid 10-digit number starting with 6-9');
      } else {
        setContactError('');
      }
      
      // Update state with the formatted value (always keeping +91)
      setFormData({ ...formData, [name]: formattedValue });
      return; // Skip the normal state update below
    }
    
    if (name === 'room_number') {
      // Find the corresponding room to get capacity
      const selectedRoom = rooms.find(room => room.room_number === value);
      const capacity = selectedRoom ? selectedRoom.capacity : 4; // Default to 4 if not found
      setSelectedRoomCapacity(capacity);
      
      // Reset bed number when room changes
      setFormData({ ...formData, [name]: value, bed_number: '' });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const closeSuccessDialog = () => {
    setShowSuccessDialog(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate phone number before submission
    if (!validateIndianPhoneNumber(formData.contact)) {
      setContactError('Please enter a valid 10-digit number starting with 6-9');
      return;
    }
    
    setIsSubmitting(true);

    try {
      const studentResponse = await axios.post('http://localhost:5000/students/add', formData);
      
      if (studentResponse.data.success && profileImage) {
        const studentId = studentResponse.data.studentId;
        const imageData = new FormData();
        imageData.append('profile', profileImage);
        
        try {
          await axios.post(`http://localhost:5000/students/upload-profile/${studentId}`, imageData, {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          });
        } catch (imageError) {
          console.error('Error uploading image:', imageError);
          // Continue with success flow even if image upload fails
        }
      }
      
      // Show success dialog 
      setShowSuccessDialog(true);
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        password: '',
        room_number: '',
        bed_number: '',
        contact: '+91', // Reset to just the prefix
        fee_status: 'Unpaid',
        joining_date: '',
      });
      setProfileImage(null);
      setImagePreview(null);
      setContactError('');
    } catch (err) {
      console.error('Error adding student:', err);
      alert('Failed to add student: ' + (err.response?.data?.message || 'Unknown error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={styles.container}>
      {/* Success Dialog */}
      {showSuccessDialog && (
        <div style={styles.dialogOverlay}>
          <div style={styles.dialogBox}>
            <div style={styles.dialogContent}>
              <div style={styles.successIcon}>✓</div>
              <h3 style={styles.dialogTitle}>Success!</h3>
              <p style={styles.dialogMessage}>Student added successfully!</p>
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

      <div style={styles.card}>
        <h2 style={styles.heading}>Add New Student</h2>
        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.imageUploadSection}>
            <div 
              style={styles.imagePreviewContainer}
              onMouseEnter={() => setIsHovering(true)}
              onMouseLeave={() => setIsHovering(false)}
              className="image-container" // Add class for CSS effects
            >
              {imagePreview ? (
                <>
                  <img src={imagePreview} alt="Profile Preview" style={styles.imagePreview} />
                  {isHovering && (
                    <div style={styles.imageOverlay}>
                      <span style={styles.overlayText}>Change Image</span>
                    </div>
                  )}
                </>
              ) : (
                <div style={styles.noImagePlaceholder}>
                  <div style={styles.uploadIcon}>📷</div>
                  <p style={styles.uploadText}>Upload Photo</p>
                </div>
              )}
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              style={styles.fileInput}
              id="profile-upload"
            />
            <label htmlFor="profile-upload" style={styles.fileInputLabel} className="file-input-label">
              Select Profile Image
            </label>
          </div>

          <div style={styles.formGrid}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Full Name</label>
              <input
                name="name"
                value={formData.name}
                onChange={handleChange}
                style={styles.input}
                type="text"
                required
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Email</label>
              <input
                name="email"
                value={formData.email}
                onChange={handleChange}
                style={styles.input}
                type="email"
                required
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Password</label>
              <input
                name="password"
                value={formData.password}
                onChange={handleChange}
                style={styles.input}
                type="password"
                required
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Room Number</label>
              <input
                name="room_number"
                value={formData.room_number}
                onChange={handleChange}
                style={styles.input}
                type="text"
                required
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Bed Number</label>
              <select
                name="bed_number"
                value={formData.bed_number}
                onChange={handleChange}
                style={styles.select}
                required
                disabled={!formData.room_number || selectedRoomCapacity === 0}
              >
                <option value="">Select Bed</option>
                {Array.from({ length: selectedRoomCapacity || 4 }, (_, i) => (
                  <option key={i + 1} value={i + 1}>
                    Bed {i + 1}
                  </option>
                ))}
              </select>
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Phone Number</label>
              <div style={styles.phoneInputContainer}>
                <div style={styles.phonePrefix}>
                  <span style={styles.flagIcon}>🇮🇳</span>
                  <span style={styles.countryCode}>+91</span>
                </div>
                <input
                  name="contact"
                  value={formData.contact.replace('+91', '')} // Display without the prefix
                  onChange={handleChange}
                  style={contactError ? {...styles.phoneInput, ...styles.inputError} : styles.phoneInput}
                  type="text"
                  placeholder="10-digit number starting with 6-9"
                  maxLength="10" // Limit to 10 digits
                  required
                />
              </div>
              {contactError && <span style={styles.errorText}>{contactError}</span>}
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Fee Status</label>
              <select
                name="fee_status"
                value={formData.fee_status}
                onChange={handleChange}
                style={styles.select}
                required
              >
                <option value="Paid">Paid</option>
                <option value="Unpaid">Unpaid</option>
              </select>
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Joining Date</label>
              <input
                name="joining_date"
                value={formData.joining_date}
                onChange={handleChange}
                style={styles.input}
                type="date"
                required
              />
            </div>
          </div>
          
          <button 
            type="submit" 
            style={isSubmitting ? styles.buttonSubmitting : styles.button}
            className="submit-button" // Add class for CSS effects
            disabled={isSubmitting || contactError}
          >
            {isSubmitting ? (
              <>
                <span className="spinner"></span>
                Adding Student...
              </>
            ) : (
              'Add Student'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    backgroundColor: '#f8fafc',
    padding: '20px',
    fontFamily: '"Poppins", sans-serif',
    position: 'relative', // Added for dialog positioning
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: '16px',
    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.08)',
    padding: '40px',
    width: '100%',
    maxWidth: '800px',
  },
  heading: {
    textAlign: 'center',
    marginBottom: '30px',
    color: '#1e293b',
    fontSize: '28px',
    fontWeight: '700',
    fontFamily: '"Montserrat", sans-serif',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '20px',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  label: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#475569',
  },
  // New phone input styles
  phoneInputContainer: {
    display: 'flex',
    alignItems: 'center',
    width: '100%',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    overflow: 'hidden',
  },
  phonePrefix: {
    display: 'flex',
    alignItems: 'center',
    padding: '12px 16px',
    backgroundColor: '#f1f5f9',
    borderRight: '1px solid #e2e8f0',
    gap: '6px',
  },
  flagIcon: {
    fontSize: '16px',
  },
  countryCode: {
    fontWeight: 'bold',
    color: '#0284c7',
  },
  phoneInput: {
    flex: 1,
    padding: '12px 16px',
    border: 'none',
    fontSize: '14px',
    transition: 'all 0.2s ease',
    fontFamily: '"Poppins", sans-serif',
    width: '100%',
    outline: 'none',
  },
  input: {
    padding: '12px 16px',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
    fontSize: '14px',
    transition: 'all 0.2s ease',
    fontFamily: '"Poppins", sans-serif',
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
    padding: '12px 16px',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
    fontSize: '14px',
    backgroundColor: '#fff',
    fontFamily: '"Poppins", sans-serif',
  },
  button: {
    padding: '14px',
    backgroundColor: '#0284c7',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: '600',
    fontFamily: '"Montserrat", sans-serif',
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    marginTop: '10px',
  },
  buttonSubmitting: {
    padding: '14px',
    backgroundColor: '#0284c7',
    opacity: '0.7',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'not-allowed',
    fontSize: '16px',
    fontWeight: '600',
    fontFamily: '"Montserrat", sans-serif',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    marginTop: '10px',
  },
  // Image upload styling
  imageUploadSection: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '20px',
  },
  imagePreviewContainer: {
    width: '150px',
    height: '150px',
    borderRadius: '50%',
    border: '2px dashed #cbd5e1',
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '16px',
    cursor: 'pointer',
    position: 'relative',
  },
  imagePreview: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  imageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#fff',
    fontSize: '14px',
    fontWeight: '600',
  },
  noImagePlaceholder: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#94a3b8',
  },
  uploadIcon: {
    fontSize: '32px',
    marginBottom: '8px',
  },
  uploadText: {
    fontSize: '14px',
    textAlign: 'center',
  },
  fileInput: {
    display: 'none',
  },
  fileInputLabel: {
    padding: '10px 16px',
    backgroundColor: '#f1f5f9',
    color: '#475569',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'all 0.2s ease',
    border: '1px solid #e2e8f0',
  },
  // Success dialog styles
  dialogOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  dialogBox: {
    backgroundColor: '#fff',
    borderRadius: '16px',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    width: '90%',
    maxWidth: '400px',
    padding: '30px',
    textAlign: 'center',
  },
  dialogContent: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  successIcon: {
    width: '60px',
    height: '60px',
    borderRadius: '50%',
    backgroundColor: '#10b981',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '32px',
    fontWeight: 'bold',
    marginBottom: '20px',
  },
  dialogTitle: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#111827',
    marginBottom: '12px',
    fontFamily: '"Montserrat", sans-serif',
  },
  dialogMessage: {
    fontSize: '16px',
    color: '#4b5563',
    marginBottom: '24px',
  },
  dialogButton: {
    padding: '12px 28px',
    backgroundColor: '#0284c7',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: '600',
    fontFamily: '"Montserrat", sans-serif',
    transition: 'all 0.2s ease',
  },
};

export default StudentForm;