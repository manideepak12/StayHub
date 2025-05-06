import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';

const MenuForm = () => {
  const [menus, setMenus] = useState([]);
  const [form, setForm] = useState({
    day: 'Monday',
    breakfast: '',
    lunch: '',
    dinner: '',
  });
  const [isLoading, setIsLoading] = useState(true);

  const fetchMenus = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/menu');
      setMenus(res.data);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching menus:', error);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMenus();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      await axios.post('http://localhost:5000/api/menu', form);
      setForm({ day: 'Monday', breakfast: '', lunch: '', dinner: '' });
      await fetchMenus();
    } catch (error) {
      console.error('Error adding menu:', error);
      setIsLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      setIsLoading(true);
      await axios.delete(`http://localhost:5000/api/menu/${id}`);
      await fetchMenus();
    } catch (error) {
      console.error('Error deleting menu:', error);
      setIsLoading(false);
    }
  };

  const handleUpdate = async (id) => {
    try {
      setIsLoading(true);
      await axios.put(`http://localhost:5000/api/menu/${id}`, form);
      setForm({ day: 'Monday', breakfast: '', lunch: '', dinner: '' });
      await fetchMenus();
    } catch (error) {
      console.error('Error updating menu:', error);
      setIsLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 style={styles.title}>🍽️ Mess Menu Planner</h1>
      </motion.div>

      <div style={styles.gridContainer}>
        <motion.div 
          style={styles.formWrapper}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>Add New Menu</h3>
            <form onSubmit={handleSubmit} style={styles.form}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Day:</label>
                <select 
                  name="day" 
                  value={form.day} 
                  onChange={handleChange} 
                  style={styles.select}
                >
                  {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((day) => (
                    <option key={day} value={day}>{day}</option>
                  ))}
                </select>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Breakfast:</label>
                <input 
                  type="text" 
                  name="breakfast" 
                  value={form.breakfast} 
                  onChange={handleChange} 
                  style={styles.input} 
                  placeholder="e.g., Poha, Tea" 
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Lunch:</label>
                <input 
                  type="text" 
                  name="lunch" 
                  value={form.lunch} 
                  onChange={handleChange} 
                  style={styles.input} 
                  placeholder="e.g., Dal, Rice, Roti" 
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Dinner:</label>
                <input 
                  type="text" 
                  name="dinner" 
                  value={form.dinner} 
                  onChange={handleChange} 
                  style={styles.input} 
                  placeholder="e.g., Paneer, Paratha" 
                />
              </div>

              <motion.button 
                type="submit" 
                style={styles.primaryButton}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={isLoading}
              >
                {isLoading ? 'Adding...' : 'Add Menu'}
              </motion.button>
            </form>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>Weekly Menu</h3>
            {isLoading ? (
              <div style={styles.loader}>
                <div style={styles.spinner}></div>
                <p>Loading menus...</p>
              </div>
            ) : menus.length === 0 ? (
              <p style={styles.emptyMessage}>No menus added yet. Add your first menu!</p>
            ) : (
              <div style={styles.tableContainer}>
                <table style={styles.table}>
                  <thead>
                    <tr style={styles.tableHeaderRow}>
                      <th style={styles.tableHeader}>Day</th>
                      <th style={styles.tableHeader}>Breakfast</th>
                      <th style={styles.tableHeader}>Lunch</th>
                      <th style={styles.tableHeader}>Dinner</th>
                      <th style={styles.tableHeader}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {menus.map((menu, index) => (
                      <motion.tr 
                        key={menu.id} 
                        style={styles.tableRow}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <td style={styles.tableCell}>{menu.day}</td>
                        <td style={styles.tableCell}>{menu.breakfast}</td>
                        <td style={styles.tableCell}>{menu.lunch}</td>
                        <td style={styles.tableCell}>{menu.dinner}</td>
                        <td style={styles.tableCell}>
                          <div style={styles.buttonGroup}>
                            <motion.button 
                              onClick={() => {
                                setForm({
                                  day: menu.day,
                                  breakfast: menu.breakfast,
                                  lunch: menu.lunch,
                                  dinner: menu.dinner
                                });
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                              }}
                              style={styles.editButton}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              Edit
                            </motion.button>
                            <motion.button 
                              onClick={() => handleDelete(menu.id)}
                              style={styles.deleteButton}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              Delete
                            </motion.button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    padding: '1.5rem',
    background: 'linear-gradient(135deg, #f5f7fa 0%, #e4e8f0 100%)',
    minHeight: '100vh',
    fontFamily: "'Poppins', sans-serif",
  },
  title: {
    fontSize: '2.5rem',
    color: '#2d3748',
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: '1.5rem',
    background: 'linear-gradient(90deg, #4f46e5, #10b981)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  gridContainer: {
    display: 'grid',
    gridTemplateColumns: '1fr 2fr',
    gap: '1.5rem',
    maxWidth: '1200px',
    margin: '0 auto',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '1.25rem',
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    height: '100%',
    overflow: 'hidden', // Added to prevent content overflow
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem', // Added for consistent spacing between form groups
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    marginBottom: '0.75rem', // Reduced from 1rem
    width: '100%',
  },
  label: {
    display: 'block',
    marginBottom: '0.25rem', // Reduced from 0.5rem
    fontSize: '0.875rem',
    fontWeight: '500',
    color: '#4a5568',
  },
  input: {
    width: '100%',
    padding: '0.65rem', // Reduced from 0.75rem
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
    fontSize: '0.9rem', // Slightly reduced font size
    transition: 'all 0.2s',
    backgroundColor: '#f8fafc',
    boxSizing: 'border-box', // Ensures padding is included in width
  },
  select: {
    width: '100%',
    padding: '0.65rem', // Reduced from 0.75rem
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
    fontSize: '0.9rem', // Slightly reduced font size
    transition: 'all 0.2s',
    backgroundColor: '#f8fafc',
    cursor: 'pointer',
    boxSizing: 'border-box', // Ensures padding is included in width
  },
  primaryButton: {
    backgroundColor: '#4f46e5',
    color: 'white',
    padding: '0.75rem 1.5rem',
    border: 'none',
    borderRadius: '8px',
    fontSize: '1rem',
    fontWeight: '500',
    cursor: 'pointer',
    width: '100%',
    transition: 'all 0.2s',
    marginTop: '0.5rem',
  },
  tableContainer: {
    overflowX: 'auto',
  },
  table: {
    width: '100%',
    borderCollapse: 'separate',
    borderSpacing: '0',
    borderRadius: '8px',
    overflow: 'hidden',
  },
  tableHeaderRow: {
    backgroundColor: '#4f46e5',
  },
  tableHeader: {
    padding: '0.875rem',
    textAlign: 'left',
    color: 'white',
    fontWeight: '500',
    fontSize: '0.875rem',
  },
  tableRow: {
    backgroundColor: 'white',
    transition: 'all 0.2s',
    '&:hover': {
      backgroundColor: '#f8fafc',
    },
  },
  tableCell: {
    padding: '0.875rem',
    borderBottom: '1px solid #e2e8f0',
    fontSize: '0.875rem',
    color: '#4a5568',
  },
  buttonGroup: {
    display: 'flex',
    gap: '0.5rem',
  },
  editButton: {
    backgroundColor: '#10b981',
    color: 'white',
    padding: '0.5rem 1rem',
    border: 'none',
    borderRadius: '6px',
    fontSize: '0.875rem',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  deleteButton: {
    backgroundColor: '#ef4444',
    color: 'white',
    padding: '0.5rem 1rem',
    border: 'none',
    borderRadius: '6px',
    fontSize: '0.875rem',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  loader: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '1.5rem',
  },
  spinner: {
    border: '4px solid rgba(0, 0, 0, 0.1)',
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    borderLeftColor: '#4f46e5',
    animation: 'spin 1s linear infinite',
    marginBottom: '1rem',
  },
  emptyMessage: {
    textAlign: 'center',
    color: '#718096',
    padding: '1.5rem',
  },
};

// Add global styles for animation
const styleSheet = document.styleSheets[0];
styleSheet.insertRule(`
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`, styleSheet.cssRules.length);

styleSheet.insertRule(`
  input:focus, select:focus {
    outline: none;
    border-color: #4f46e5;
    box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.2);
  }
`, styleSheet.cssRules.length);


export default MenuForm;