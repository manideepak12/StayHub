import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AdminNoticeBoard = () => {
  const [notices, setNotices] = useState([]);
  const [formData, setFormData] = useState({ title: '', content: '' });
  const [editId, setEditId] = useState(null);
  const [showDialog, setShowDialog] = useState(false);
  const [dialogMessage, setDialogMessage] = useState('');

  // Fetch notices from the API
  const fetchNotices = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/notices');
      setNotices(res.data);
    } catch (error) {
      console.error("Error fetching notices:", error);
    }
  };

  useEffect(() => {
    fetchNotices();
  }, []);

  const handleSubmit = async () => {
    if (!formData.title || !formData.content) return;

    try {
      if (editId) {
        await axios.put(`http://localhost:5000/api/notices/${editId}`, formData);
        setDialogMessage(`Notice "${formData.title}" has been updated successfully!`);
        setShowDialog(true);
      } else {
        await axios.post('http://localhost:5000/api/notices', formData);
        setDialogMessage(`Notice "${formData.title}" has been created successfully!`);
        setShowDialog(true);
      }
      setFormData({ title: '', content: '' });
      setEditId(null);
      fetchNotices();
    } catch (error) {
      console.error("Error submitting notice:", error);
      setDialogMessage("Error updating notice. Please try again.");
      setShowDialog(true);
    }
  };

  const handleEdit = (notice) => {
    setFormData({ title: notice.title, content: notice.content });
    setEditId(notice.id);
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/notices/${id}`);
      setDialogMessage("Notice has been deleted successfully!");
      setShowDialog(true);
      fetchNotices();
    } catch (error) {
      console.error("Error deleting notice:", error);
      setDialogMessage("Error deleting notice. Please try again.");
      setShowDialog(true);
    }
  };

  // Close dialog handler
  const closeDialog = () => {
    setShowDialog(false);
  };

  // Zomato-inspired styles
  const styles = {
    noticeBoard: {
      fontFamily: '"Poppins", sans-serif',
      maxWidth: '800px',
      margin: '40px auto',
      padding: '30px',
      backgroundColor: '#f8f8f8',
      borderRadius: '12px',
      boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
    },
    boardHeader: {
      textAlign: 'center',
      marginBottom: '30px',
      paddingBottom: '15px',
      borderBottom: '2px solid #e23744',
      color: '#2d2d2d',
      fontSize: '32px',
      fontWeight: '700',
      position: 'relative',
    },
    boardHeaderAccent: {
      color: '#e23744',
    },
    formContainer: {
      backgroundColor: 'white',
      padding: '25px',
      marginBottom: '30px',
      border: 'none',
      borderRadius: '10px',
      boxShadow: '0 2px 15px rgba(0,0,0,0.05)',
    },
    formTitle: {
      marginTop: '0',
      color: '#2d2d2d',
      fontSize: '20px',
      fontWeight: '600',
      marginBottom: '20px',
    },
    input: {
      width: '100%',
      padding: '12px 15px',
      marginBottom: '15px',
      border: '1px solid #e1e1e1',
      borderRadius: '8px',
      fontFamily: '"Poppins", sans-serif',
      fontSize: '15px',
      transition: 'all 0.3s',
    },
    inputFocus: {
      borderColor: '#e23744',
      boxShadow: '0 0 0 2px rgba(226, 55, 68, 0.2)',
    },
    textarea: {
      width: '100%',
      padding: '12px 15px',
      marginBottom: '15px',
      border: '1px solid #e1e1e1',
      borderRadius: '8px',
      fontFamily: '"Poppins", sans-serif',
      fontSize: '15px',
      minHeight: '120px',
      resize: 'vertical',
      transition: 'all 0.3s',
    },
    submitButton: {
      backgroundColor: '#e23744',
      color: 'white',
      border: 'none',
      padding: '12px 25px',
      borderRadius: '8px',
      cursor: 'pointer',
      fontSize: '16px',
      fontWeight: '600',
      transition: 'all 0.3s',
      boxShadow: '0 4px 12px rgba(226, 55, 68, 0.3)',
    },
    submitButtonHover: {
      backgroundColor: '#c92a37',
      transform: 'translateY(-2px)',
    },
    noticeList: {
      listStyle: 'none',
      padding: '0',
      display: 'grid',
      gridTemplateColumns: '1fr',
      gap: '20px',
    },
    noticeItem: {
      backgroundColor: 'white',
      padding: '25px',
      borderLeft: '4px solid #e23744',
      borderRadius: '8px',
      boxShadow: '0 2px 15px rgba(0,0,0,0.05)',
      transition: 'all 0.3s',
      position: 'relative',
      overflow: 'hidden',
    },
    noticeItemHover: {
      transform: 'translateY(-5px)',
      boxShadow: '0 8px 25px rgba(0,0,0,0.1)',
    },
    noticeTitle: {
      marginTop: '0',
      color: '#2d2d2d',
      fontSize: '18px',
      fontWeight: '600',
      marginBottom: '10px',
    },
    noticeContent: {
      marginBottom: '15px',
      lineHeight: '1.6',
      color: '#4a4a4a',
      fontSize: '15px',
    },
    noticeDate: {
      fontSize: '13px',
      color: '#9a9a9a',
      marginBottom: '15px',
      display: 'block',
    },
    noticeActions: {
      display: 'flex',
      gap: '10px',
    },
    actionButton: {
      backgroundColor: 'white',
      border: '1px solid #e1e1e1',
      padding: '8px 15px',
      borderRadius: '6px',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '500',
      transition: 'all 0.3s',
      display: 'flex',
      alignItems: 'center',
      gap: '5px',
    },
    editButton: {
      color: '#e23744',
      borderColor: '#e23744',
    },
    editButtonHover: {
      backgroundColor: '#e23744',
      color: 'white',
    },
    deleteButton: {
      color: '#ff4d4d',
      borderColor: '#ff4d4d',
    },
    deleteButtonHover: {
      backgroundColor: '#ff4d4d',
      color: 'white',
    },
    statusIndicator: {
      position: 'absolute',
      top: '0',
      right: '0',
      width: '8px',
      height: '100%',
      backgroundColor: '#e23744',
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
      backgroundColor: 'white',
      padding: '30px',
      borderRadius: '12px',
      boxShadow: '0 4px 30px rgba(0, 0, 0, 0.15)',
      width: '400px',
      maxWidth: '90%',
      textAlign: 'center',
      position: 'relative',
      animation: 'fadeIn 0.3s ease-out',
    },
    dialogTitle: {
      color: '#e23744',
      fontSize: '22px',
      fontWeight: '600',
      marginBottom: '20px',
    },
    dialogMessage: {
      fontSize: '16px',
      lineHeight: '1.6',
      marginBottom: '25px',
      color: '#4a4a4a',
    },
    dialogButton: {
      backgroundColor: '#e23744',
      color: 'white',
      border: 'none',
      padding: '12px 25px',
      borderRadius: '8px',
      cursor: 'pointer',
      fontSize: '16px',
      fontWeight: '600',
      transition: 'all 0.3s',
      boxShadow: '0 4px 12px rgba(226, 55, 68, 0.3)',
    },
    dialogButtonHover: {
      backgroundColor: '#c92a37',
      transform: 'translateY(-2px)',
    }
  };

  return (
    <div style={styles.noticeBoard}>
      <h2 style={styles.boardHeader}>
        Admin <span style={styles.boardHeaderAccent}>Notice Board</span>
      </h2>

      {/* Add/Edit Form */}
      <div style={styles.formContainer}>
        <h4 style={styles.formTitle}>{editId ? 'Edit Notice' : 'Create New Notice'}</h4>
        <input
          type="text"
          placeholder="Notice Title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          style={styles.input}
          onFocus={(e) => {
            e.target.style.borderColor = styles.inputFocus.borderColor;
            e.target.style.boxShadow = styles.inputFocus.boxShadow;
          }}
          onBlur={(e) => {
            e.target.style.borderColor = styles.input.borderColor;
            e.target.style.boxShadow = 'none';
          }}
        />
        <textarea
          placeholder="Notice Content"
          value={formData.content}
          onChange={(e) => setFormData({ ...formData, content: e.target.value })}
          style={styles.textarea}
          onFocus={(e) => {
            e.target.style.borderColor = styles.inputFocus.borderColor;
            e.target.style.boxShadow = styles.inputFocus.boxShadow;
          }}
          onBlur={(e) => {
            e.target.style.borderColor = styles.input.borderColor;
            e.target.style.boxShadow = 'none';
          }}
        ></textarea>
        <button 
          onClick={handleSubmit}
          style={styles.submitButton}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = styles.submitButtonHover.backgroundColor;
            e.target.style.transform = styles.submitButtonHover.transform;
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = styles.submitButton.backgroundColor;
            e.target.style.transform = 'none';
          }}
        >
          {editId ? 'Update Notice' : 'Post Notice'}
        </button>
      </div>

      {/* Notices List */}
      <ul style={styles.noticeList}>
        {notices.map((notice) => (
          <li 
            key={notice.id} 
            style={styles.noticeItem}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = styles.noticeItemHover.transform;
              e.currentTarget.style.boxShadow = styles.noticeItemHover.boxShadow;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'none';
              e.currentTarget.style.boxShadow = styles.noticeItem.boxShadow;
            }}
          >
            <div style={styles.statusIndicator}></div>
            <h4 style={styles.noticeTitle}>{notice.title}</h4>
            <p style={styles.noticeContent}>{notice.content}</p>
            <small style={styles.noticeDate}>
              Posted: {new Date(notice.created_at).toLocaleString()}
              {notice.updated_at && ` | Updated: ${new Date(notice.updated_at).toLocaleString()}`}
            </small>
            <div style={styles.noticeActions}>
              <button 
                onClick={() => handleEdit(notice)}
                style={{...styles.actionButton, ...styles.editButton}}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = styles.editButtonHover.backgroundColor;
                  e.target.style.color = styles.editButtonHover.color;
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'white';
                  e.target.style.color = styles.editButton.color;
                }}
              >
                <span>✏️</span> Edit
              </button>
              <button 
                onClick={() => handleDelete(notice.id)}
                style={{...styles.actionButton, ...styles.deleteButton}}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = styles.deleteButtonHover.backgroundColor;
                  e.target.style.color = styles.deleteButtonHover.color;
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'white';
                  e.target.style.color = styles.deleteButton.color;
                }}
              >
                <span>🗑️</span> Delete
              </button>
            </div>
          </li>
        ))}
      </ul>

      {/* Dialog Box for notifications */}
      {showDialog && (
        <div style={styles.dialogOverlay}>
          <div style={styles.dialogBox}>
            <h3 style={styles.dialogTitle}>Notification</h3>
            <p style={styles.dialogMessage}>{dialogMessage}</p>
            <button 
              onClick={closeDialog}
              style={styles.dialogButton}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = styles.dialogButtonHover.backgroundColor;
                e.target.style.transform = styles.dialogButtonHover.transform;
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = styles.dialogButton.backgroundColor;
                e.target.style.transform = 'none';
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminNoticeBoard;