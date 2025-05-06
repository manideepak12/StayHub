import React, { useEffect, useState } from 'react';
import { fetchStudents, deleteStudent, checkStudentBookings } from '../api';
import { useNavigate } from 'react-router-dom';

const StudentList = () => {
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hoveredRow, setHoveredRow] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDialog, setShowDialog] = useState(false);
  const [dialogMessage, setDialogMessage] = useState('');
  const [studentToDelete, setStudentToDelete] = useState(null);
  const navigate = useNavigate();

  // Load Google Fonts
  useEffect(() => {
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600&family=Montserrat:wght@500;700&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);

    return () => {
      document.head.removeChild(link);
    };
  }, []);

  useEffect(() => {
    setLoading(true);
    fetchStudents()
      .then((res) => {
        const fetchedStudents = res.data || [];
        setStudents(fetchedStudents);
        setFilteredStudents(fetchedStudents);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching students:', err);
        setError('Failed to load students. Please try again later.');
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    // Filter students when searchTerm changes
    if (searchTerm.trim() === '') {
      setFilteredStudents(students);
    } else {
      const lowercaseSearch = searchTerm.toLowerCase();
      const filtered = students.filter(student => 
        // Convert each field to string and check if it contains the search term
        (student.id?.toString().toLowerCase().includes(lowercaseSearch)) ||
        (student.name?.toLowerCase().includes(lowercaseSearch)) ||
        (student.contact?.toLowerCase().includes(lowercaseSearch)) ||
        (student.room_number?.toString().toLowerCase().includes(lowercaseSearch))
      );
      setFilteredStudents(filtered);
    }
  }, [searchTerm, students]);

  const handleDeleteClick = (id) => {
    // First find the student name for the confirmation dialog
    const studentToDelete = students.find(s => s.id === id);
    
    // Check if student has washing machine bookings
    checkStudentBookings(id)
      .then((response) => {
        const hasBookings = response.data.hasBookings;
        
        if (hasBookings) {
          // Show warning dialog about existing bookings
          setDialogMessage(`WARNING: Student ${studentToDelete.name} has active washing machine bookings. Deleting this student will also remove all their bookings. Are you sure you want to proceed?`);
        } else {
          // Regular confirmation dialog
          setDialogMessage(`Are you sure you want to delete student ${studentToDelete.name}?`);
        }
        
        setStudentToDelete(id);
        setShowDialog(true);
      })
      .catch((err) => {
        console.error('Error checking student bookings:', err);
        // Fallback to standard confirmation if booking check fails
        setDialogMessage(`Are you sure you want to delete student ${studentToDelete.name}?`);
        setStudentToDelete(id);
        setShowDialog(true);
      });
  };

  const confirmDelete = () => {
    if (!studentToDelete) return;
    
    deleteStudent(studentToDelete)
      .then(() => {
        setStudents((prev) => {
          const updatedStudents = prev.filter((s) => s.id !== studentToDelete);
          setFilteredStudents(updatedStudents);
          return updatedStudents;
        });
        // Show success message
        setDialogMessage('Student deleted successfully');
        setTimeout(() => {
          setShowDialog(false);
          setDialogMessage('');
        }, 2000);
      })
      .catch((err) => {
        console.error('Error deleting student:', err);
        setDialogMessage('Failed to delete student. Please try again.');
      })
      .finally(() => {
        setStudentToDelete(null);
      });
  };

  const cancelDelete = () => {
    setShowDialog(false);
    setStudentToDelete(null);
    setDialogMessage('');
  };

  const handleEdit = (id) => {
    localStorage.setItem('editStudentId', id);
    navigate('/edit-student');
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  if (loading) return (
    <div style={styles.loadingContainer}>
      <div style={styles.spinner}></div>
      <p>Loading students...</p>
    </div>
  );

  if (error) return (
    <div style={styles.errorContainer}>
      <div style={styles.errorIcon}>⚠️</div>
      <p style={styles.errorText}>{error}</p>
    </div>
  );

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Student List</h2>
      
      {/* Custom Dialog */}
      {showDialog && (
        <div style={styles.dialogOverlay}>
          <div style={styles.dialogContent}>
            <p style={styles.dialogMessage}>{dialogMessage}</p>
            {studentToDelete && (
              <div style={styles.dialogButtons}>
                <button style={styles.cancelButton} onClick={cancelDelete}>
                  Cancel
                </button>
                <button style={styles.confirmButton} onClick={confirmDelete}>
                  Confirm
                </button>
              </div>
            )}
            {!studentToDelete && (
              <button style={styles.okButton} onClick={cancelDelete}>
                OK
              </button>
            )}
          </div>
        </div>
      )}
      
      {/* Search Bar */}
      <div style={styles.searchContainer}>
        <input
          type="text"
          placeholder="Search by ID, name, phone number or room number..."
          value={searchTerm}
          onChange={handleSearchChange}
          style={styles.searchInput}
        />
        {searchTerm && (
          <button 
            style={styles.clearSearchButton} 
            onClick={() => setSearchTerm('')}
          >
            ✕
          </button>
        )}
      </div>

      {filteredStudents.length === 0 ? (
        <div style={styles.emptyState}>
          {searchTerm ? (
            <>
              <div style={styles.emptyIcon}>🔍</div>
              <p>No students match your search criteria.</p>
              <button 
                onClick={() => setSearchTerm('')} 
                style={styles.resetSearchButton}
              >
                Clear Search
              </button>
            </>
          ) : (
            <>
              <div style={styles.emptyIcon}>📭</div>
              <p>No students found in the database.</p>
            </>
          )}
        </div>
      ) : (
        <div style={styles.tableContainer}>
          <table style={styles.table}>
            <thead>
              <tr style={styles.tableHeader}>
                <th style={styles.th}>S.No</th>
                <th style={styles.th}>ID</th>
                <th style={styles.th}>Name</th>
                <th style={styles.th}>Email</th>
                <th style={styles.th}>Room</th>
                <th style={styles.th}>Contact</th>
                <th style={styles.th}>Fee Status</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((student, index) => (
                <tr 
                  key={student.id} 
                  style={{
                    ...styles.tr,
                    backgroundColor: hoveredRow === student.id ? '#f8f9fa' : '#fff',
                  }}
                  onMouseEnter={() => setHoveredRow(student.id)}
                  onMouseLeave={() => setHoveredRow(null)}
                >
                  <td style={styles.td}>{index + 1}</td>
                  <td style={styles.td}>{student.id}</td>
                  <td style={styles.td}>{student.name}</td>
                  <td style={styles.td}>{student.email}</td>
                  <td style={styles.td}>{student.room_number || 'N/A'}</td>
                  <td style={styles.td}>{student.contact || 'N/A'}</td>
                  <td style={styles.td}>
                    <span style={getFeeStatusStyle(student.fee_status)}>
                      {student.fee_status || 'N/A'}
                    </span>
                  </td>
                  <td style={styles.td}>
                    <div style={styles.actionButtons}>
                      <button
                        onClick={() => handleEdit(student.id)}
                        style={styles.editButton}
                      >
                        ✏️ Edit
                      </button>
                      <button
                        onClick={() => handleDeleteClick(student.id)}
                        style={styles.deleteButton}
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

const getFeeStatusStyle = (status) => {
  const baseStyle = {
    padding: '4px 8px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '600',
    textTransform: 'capitalize',
  };

  switch (status?.toLowerCase()) {
    case 'paid':
      return { ...baseStyle, backgroundColor: '#e6f7ee', color: '#10b981' };
    case 'pending':
      return { ...baseStyle, backgroundColor: '#fff3e0', color: '#f59e0b' };
    case 'overdue':
      return { ...baseStyle, backgroundColor: '#fee2e2', color: '#ef4444' };
    default:
      return { ...baseStyle, backgroundColor: '#f3f4f6', color: '#6b7280' };
  }
};

const styles = {
  container: {
    padding: '30px',
    fontFamily: '"Poppins", sans-serif',
    maxWidth: '1200px',
    margin: '0 auto',
  },
  title: {
    color: '#2c3e50',
    marginBottom: '30px',
    textAlign: 'center',
    fontSize: '28px',
    fontWeight: '700',
    fontFamily: '"Montserrat", sans-serif',
    letterSpacing: '0.5px',
  },
  searchContainer: {
    position: 'relative',
    marginBottom: '25px',
    maxWidth: '600px',
    margin: '0 auto 25px',
  },
  searchInput: {
    width: '100%',
    padding: '12px 40px 12px 15px',
    fontSize: '14px',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    boxShadow: '0 2px 6px rgba(0,0,0,0.05)',
    fontFamily: '"Poppins", sans-serif',
    transition: 'all 0.3s ease',
    outline: 'none',
  },
  clearSearchButton: {
    position: 'absolute',
    right: '12px',
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'none',
    border: 'none',
    color: '#9ca3af',
    cursor: 'pointer',
    fontSize: '14px',
    padding: '4px',
  },
  resetSearchButton: {
    backgroundColor: '#f3f4f6',
    color: '#4b5563',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '6px',
    marginTop: '15px',
    cursor: 'pointer',
    fontWeight: '500',
    fontSize: '14px',
    transition: 'all 0.2s ease',
  },
  tableContainer: {
    overflowX: 'auto',
    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
    borderRadius: '10px',
    border: '1px solid #e5e7eb',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    backgroundColor: '#fff',
  },
  tableHeader: {
    backgroundColor: '#0284c7',
    color: '#fff',
  },
  th: {
    padding: '15px',
    textAlign: 'left',
    fontWeight: '600',
    fontFamily: '"Montserrat", sans-serif',
    fontSize: '14px',
    letterSpacing: '0.5px',
  },
  tr: {
    transition: 'background-color 0.2s ease',
    borderBottom: '1px solid #e5e7eb',
  },
  td: {
    padding: '15px',
    color: '#4b5563',
    fontSize: '14px',
  },
  actionButtons: {
    display: 'flex',
    gap: '8px',
  },
  editButton: {
    backgroundColor: '#3b82f6',
    color: '#fff',
    border: 'none',
    padding: '8px 12px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: '500',
    fontSize: '13px',
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
  },
  deleteButton: {
    backgroundColor: '#ef4444',
    color: '#fff',
    border: 'none',
    padding: '8px 12px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: '500',
    fontSize: '13px',
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '200px',
    fontFamily: '"Poppins", sans-serif',
    color: '#4b5563',
  },
  spinner: {
    border: '4px solid rgba(0, 0, 0, 0.1)',
    borderLeftColor: '#0284c7',
    borderRadius: '50%',
    width: '40px',
    height: '40px',
    animation: 'spin 1s linear infinite',
    marginBottom: '15px',
  },
  errorContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '200px',
    fontFamily: '"Poppins", sans-serif',
  },
  errorIcon: {
    fontSize: '40px',
    marginBottom: '15px',
  },
  errorText: {
    color: '#ef4444',
    fontWeight: '500',
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '200px',
    fontFamily: '"Poppins", sans-serif',
    color: '#6b7280',
  },
  emptyIcon: {
    fontSize: '50px',
    marginBottom: '15px',
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
    backgroundColor: '#fff',
    borderRadius: '8px',
    padding: '24px',
    maxWidth: '500px',
    width: '90%',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  dialogMessage: {
    fontSize: '16px',
    marginBottom: '20px',
    textAlign: 'center',
    lineHeight: '1.5',
    color: '#4b5563',
  },
  dialogButtons: {
    display: 'flex',
    gap: '12px',
    justifyContent: 'center',
    width: '100%',
  },
  cancelButton: {
    backgroundColor: '#f3f4f6',
    color: '#4b5563',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: '500',
    fontSize: '14px',
    transition: 'all 0.2s ease',
    flex: '1',
    maxWidth: '120px',
  },
  confirmButton: {
    backgroundColor: '#ef4444',
    color: '#fff',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: '500',
    fontSize: '14px',
    transition: 'all 0.2s ease',
    flex: '1',
    maxWidth: '120px',
  },
  okButton: {
    backgroundColor: '#3b82f6',
    color: '#fff',
    border: 'none',
    padding: '10px 30px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: '500',
    fontSize: '14px',
    transition: 'all 0.2s ease',
    minWidth: '100px',
  },
};

// Add this to your global CSS or a style tag
const globalStyles = `
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

export default StudentList;