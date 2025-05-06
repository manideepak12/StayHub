import React, { useEffect, useState, useCallback, useMemo } from 'react';
import axios from 'axios';

const AdminDashboard = () => {
  const [studentCount, setStudentCount] = useState(0);
  const [feesCollected, setFeesCollected] = useState(0);
  const [feesToBeCollected, setFeesToBeCollected] = useState(0);
  const [complaintCount, setComplaintCount] = useState(0);
  const [complaints, setComplaints] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const complaintsPerPage = 5;
  const [sortKey, setSortKey] = useState('');
  const [sortOrder, setSortOrder] = useState('asc');
  const [searchQuery, setSearchQuery] = useState('');
  const [showResolved, setShowResolved] = useState(true);
  const [apiStatus, setApiStatus] = useState({ students: false, complaints: false });
  const [apiRetryCount, setApiRetryCount] = useState(0);
  const [isLoadingComplaints, setIsLoadingComplaints] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedComplaintId, setSelectedComplaintId] = useState(null);

  // Mock data for when API is unavailable
  const mockStudents = [
    { id: 1, name: "John Doe", fees: "5000", room_number: "A101", fee_status: "paid" },
    { id: 2, name: "Jane Smith", fees: "5000", room_number: "B202", fee_status: "unpaid" },
    { id: 3, name: "Raj Patel", fees: "5000", room_number: "C303", fee_status: "paid" }
  ];

  const mockComplaints = [
    { 
      id: 1, 
      student_name: "John Doe", 
      room_number: "A101", 
      complaint_text: "AC not working", 
      status: "pending",
      created_at: "2023-01-01T12:00:00Z" 
    },
    { 
      id: 2, 
      student_name: "Jane Smith", 
      room_number: "B202", 
      complaint_text: "Water leakage", 
      status: "in_progress",
      created_at: "2023-01-02T10:30:00Z" 
    },
    { 
      id: 3, 
      student_name: "Raj Patel", 
      room_number: "C303", 
      complaint_text: "Internet issue", 
      status: "resolved",
      created_at: "2023-01-03T14:15:00Z" 
    }
  ];

  // Function to determine correct API endpoints
  const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
  
  const getEndpoint = useCallback((type) => {
    switch(type) {
      case 'students':
        return `${baseUrl}/students`;
      case 'add_students':
        return `${baseUrl}/api/add_students`;
      case 'complaints':
        return `${baseUrl}/api/complaints`;
      case 'complaints_count':
        return `${baseUrl}/api/complaints/count`;
      default:
        return `${baseUrl}/api/${type}`;
    }
  }, [baseUrl]);

  // Fetch students data with fallback to mock data
  const fetchStudentsData = useCallback(() => {
    const endpoints = [
      getEndpoint('add_students'), // Primary endpoint for fee data
      getEndpoint('students')      // Fallback endpoint
    ];
    
    return new Promise((resolve) => {
      let attemptCount = 0;
      
      const tryNextEndpoint = () => {
        if (attemptCount >= endpoints.length) {
          console.log("All API endpoints failed, using mock data");
          setApiStatus(prev => ({ ...prev, students: false }));
          resolve(mockStudents);
          return;
        }
        
        const currentEndpoint = endpoints[attemptCount];
        console.log(`Trying endpoint: ${currentEndpoint}`);
        
        const timeoutId = setTimeout(() => {
          console.log(`Timeout for endpoint: ${currentEndpoint}`);
          attemptCount++;
          tryNextEndpoint();
        }, 5000);
        
        axios.get(currentEndpoint)
          .then((response) => {
            clearTimeout(timeoutId);
            console.log(`Success from ${currentEndpoint}:`, response.data);
            
            let processedData = [];
            
            if (Array.isArray(response.data)) {
              processedData = response.data;
            } else if (response.data && Array.isArray(response.data.students)) {
              processedData = response.data.students;
            } else if (response.data && typeof response.data === 'object') {
              const possibleArrays = Object.values(response.data).filter(val => Array.isArray(val));
              if (possibleArrays.length > 0) {
                processedData = possibleArrays[0];
              }
            }
            
            if (processedData.length > 0 && processedData[0] && 
                (processedData[0].name !== undefined || processedData[0].student_name !== undefined)) {
              setApiStatus(prev => ({ ...prev, students: true }));
              resolve(processedData);
            } else {
              console.warn('Unexpected data format, using mock data');
              setApiStatus(prev => ({ ...prev, students: false }));
              resolve(mockStudents);
            }
          })
          .catch((err) => {
            clearTimeout(timeoutId);
            console.error(`Error from ${currentEndpoint}:`, err);
            attemptCount++;
            tryNextEndpoint();
          });
      };
      
      tryNextEndpoint();
    });
  }, [getEndpoint]);

  // Calculate fees based on student data
  const calculateFees = useCallback((students) => {
    if (!Array.isArray(students)) return { collected: 0, toBeCollected: 0 };
    
    const paidStudents = students.filter(student => 
      student.fee_status === 'paid' || 
      student.fee_status === true || 
      student.paid === true
    );
    
    const unpaidStudents = students.filter(student => 
      student.fee_status === 'unpaid' || 
      student.fee_status === false || 
      student.paid === false ||
      !student.fee_status
    );
    
    // Calculate total fees (assuming 5000 per student if not specified)
    const collected = paidStudents.reduce((sum, student) => {
      const feeAmount = student.fees ? parseInt(student.fees) : 5000;
      return sum + feeAmount;
    }, 0);
    
    const toBeCollected = unpaidStudents.reduce((sum, student) => {
      const feeAmount = student.fees ? parseInt(student.fees) : 5000;
      return sum + feeAmount;
    }, 0);
    
    return { collected, toBeCollected };
  }, []);

  // Fetch complaints with fallback to mock data
  const fetchComplaints = useCallback(() => {
    setIsLoadingComplaints(true);
    setError(null);
    
    axios.get(getEndpoint('complaints'))
      .then((res) => {
        if (!res.data) {
          throw new Error('No data received');
        }
        
        setApiStatus(prev => ({ ...prev, complaints: true }));
        
        if (Array.isArray(res.data)) {
          setComplaints(res.data);
          // Calculate counts from the full list
          const pendingCount = res.data.filter(c => c.status === 'pending').length;
          const inProgressCount = res.data.filter(c => c.status === 'in_progress').length;
          setComplaintCount(pendingCount + inProgressCount);
        } else {
          console.error('Unexpected complaints data format:', res.data);
          setComplaints(mockComplaints);
          setComplaintCount(mockComplaints.filter(c => c.status !== 'resolved').length);
        }
      })
      .catch((err) => {
        console.error('Error fetching complaints:', err);
        setError('Failed to load complaints');
        setApiStatus(prev => ({ ...prev, complaints: false }));
        setComplaints(mockComplaints);
        setComplaintCount(mockComplaints.filter(c => c.status !== 'resolved').length);
      })
      .finally(() => {
        setIsLoadingComplaints(false);
      });
  }, [getEndpoint]);

  const fetchRealTimeData = useCallback(() => {
    setIsLoading(true);
    setError(null);
    
    // Fetch student data
    fetchStudentsData()
      .then((data) => {
        if (Array.isArray(data)) {
          console.log(`Found ${data.length} students`);
          setStudentCount(data.length);
          
          // Calculate fees based on fee_status
          const { collected, toBeCollected } = calculateFees(data);
          
          setFeesCollected(collected);
          setFeesToBeCollected(toBeCollected);
        } else {
          setError('Invalid student data format');
          setStudentCount(mockStudents.length);
          const { collected, toBeCollected } = calculateFees(mockStudents);
          setFeesCollected(collected);
          setFeesToBeCollected(toBeCollected);
        }
        
        setIsLoading(false);
      })
      .catch((err) => {
        console.error('Error in fetchRealTimeData:', err);
        setError('Failed to load student data');
        setStudentCount(mockStudents.length);
        const { collected, toBeCollected } = calculateFees(mockStudents);
        setFeesCollected(collected);
        setFeesToBeCollected(toBeCollected);
        setIsLoading(false);
      });

    // Fetch complaints data
    fetchComplaints();
  }, [fetchStudentsData, fetchComplaints, calculateFees]);

  const handleStatusChange = async (id, status) => {
    if (!apiStatus.complaints) {
      // If API is not available, update local state instead
      setComplaints(prev => 
        prev.map(complaint => 
          complaint.id === id ? { ...complaint, status } : complaint
        )
      );
      
      // Also update the complaint count if status changes to/from resolved
      const updatedComplaints = complaints.map(complaint => 
        complaint.id === id ? { ...complaint, status } : complaint
      );
      setComplaintCount(updatedComplaints.filter(c => c.status !== 'resolved').length);
      return;
    }
    
    try {
      await axios.put(`${getEndpoint('complaints')}/${id}`, { status });
      // Refresh the complaints list after update
      fetchComplaints();
    } catch (error) {
      console.error('Error updating complaint status:', error);
      // Update local state as fallback
      setComplaints(prev => 
        prev.map(complaint => 
          complaint.id === id ? { ...complaint, status } : complaint
        )
      );
      
      // Also update the complaint count if status changes to/from resolved
      const updatedComplaints = complaints.map(complaint => 
        complaint.id === id ? { ...complaint, status } : complaint
      );
      setComplaintCount(updatedComplaints.filter(c => c.status !== 'resolved').length);
    }
  };

  const handleDeleteComplaint = async (id) => {
    if (!apiStatus.complaints) {
      // If API is not available, update local state directly
      setComplaints(prev => prev.filter(complaint => complaint.id !== id));
      setComplaintCount(prev => prev - 1);
      return;
    }
  
    try {
      // Delete complaint from the backend
      const response = await axios.delete(`${getEndpoint('complaints')}/${id}`);
      
      if (response.status === 200) {
        // On successful deletion, update the local state
        setComplaints(prev => prev.filter(complaint => complaint.id !== id));
        setComplaintCount(prev => prev - 1);
      } else {
        console.error('Error deleting complaint:', response.statusText);
      }
    } catch (error) {
      console.error('Error deleting complaint:', error);
      // In case of error, still update the local state (fallback)
      setComplaints(prev => prev.filter(complaint => complaint.id !== id));
      setComplaintCount(prev => prev - 1);
    }
  };
  
  // Try to reconnect to API after a certain time
  useEffect(() => {
    if (!apiStatus.students || !apiStatus.complaints) {
      const reconnectInterval = setTimeout(() => {
        console.log(`Attempting to reconnect to API (attempt ${apiRetryCount + 1})`);
        fetchRealTimeData();
        setApiRetryCount(prev => prev + 1);
      }, 30000); // Try every 30 seconds
      
      return () => clearTimeout(reconnectInterval);
    }
  }, [apiStatus, apiRetryCount, fetchRealTimeData]);

  useEffect(() => {
    // Initial data fetch
    fetchRealTimeData();
    
    // Set up auto-refresh interval
    const intervalId = setInterval(() => {
      fetchRealTimeData();
    }, 60000); // Refresh every 60 seconds
    
    return () => clearInterval(intervalId);
  }, [fetchRealTimeData]);

  useEffect(() => {
    const fontLink = document.createElement('link');
    fontLink.href = 'https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&family=Montserrat:wght@500;700&display=swap';
    fontLink.rel = 'stylesheet';
    document.head.appendChild(fontLink);
    
    return () => {
      document.head.removeChild(fontLink);
    };
  }, []);

  const toggleDarkMode = () => setDarkMode((prev) => !prev);

  // Memoize filtered and sorted complaints to improve performance
  const filteredComplaints = useMemo(() => {
    return complaints
      .filter((c) =>
        `${c.student_name} ${c.room_number} ${c.complaint_text}`
          .toLowerCase()
          .includes(searchQuery.toLowerCase())
      )
      .filter((c) => (showResolved ? true : c.status !== 'resolved'));
  }, [complaints, searchQuery, showResolved]);

  const sortedComplaints = useMemo(() => {
    if (!sortKey) return filteredComplaints;
    
    return [...filteredComplaints].sort((a, b) => {
      if (!a[sortKey] || !b[sortKey]) return 0;
      if (sortOrder === 'asc') {
        return a[sortKey].localeCompare(b[sortKey]);
      } else {
        return b[sortKey].localeCompare(a[sortKey]);
      }
    });
  }, [filteredComplaints, sortKey, sortOrder]);

  const indexOfLastComplaint = currentPage * complaintsPerPage;
  const indexOfFirstComplaint = indexOfLastComplaint - complaintsPerPage;
  const currentComplaints = sortedComplaints.slice(indexOfFirstComplaint, indexOfLastComplaint);
  const totalPages = Math.ceil(filteredComplaints.length / complaintsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, showResolved, sortKey, sortOrder]);

  const styles = {
    container: {
      padding: '30px',
      fontFamily: '"Poppins", sans-serif',
      background: darkMode ? '#1a1a2e' : '#f8f9fa',
      minHeight: '100vh',
      color: darkMode ? '#e6e6e6' : '#333',
      transition: 'all 0.3s ease'
    },
    title: {
      fontSize: '2.5rem',
      fontWeight: '700',
      marginBottom: '30px',
      textAlign: 'center',
      color: darkMode ? '#f8f9fa' : '#2c3e50',
      fontFamily: '"Montserrat", sans-serif',
      textShadow: darkMode ? '0 2px 4px rgba(0,0,0,0.5)' : '0 2px 4px rgba(0,0,0,0.1)',
      letterSpacing: '1px'
    },
    statsContainer: {
      display: 'flex',
      justifyContent: 'space-between',
      gap: '20px',
      marginBottom: '40px',
      flexWrap: 'wrap'
    },
    statCard: {
      background: darkMode ? '#16213e' : '#ffffff',
      padding: '20px',
      borderRadius: '12px',
      boxShadow: darkMode ? '0 4px 12px rgba(0,0,0,0.3)' : '0 4px 12px rgba(0,0,0,0.1)',
      textAlign: 'center',
      transition: 'all 0.3s ease',
      flex: '1 1 200px',
      minWidth: '180px',
      maxWidth: '240px',
      borderTop: '4px solid'
    },
    statCardHover: {
      transform: 'translateY(-5px)',
      boxShadow: darkMode ? '0 8px 16px rgba(0,0,0,0.4)' : '0 8px 16px rgba(0,0,0,0.15)'
    },
    statCardTitle: {
      fontSize: '1rem',
      fontWeight: '600',
      marginBottom: '12px',
      color: darkMode ? '#bbbbbb' : '#555555'
    },
    statCardValue: {
      fontSize: '1.8rem',
      fontWeight: 'bold',
      color: darkMode ? '#ffffff' : '#2c3e50',
      margin: '8px 0'
    },
    statCardIcon: {
      fontSize: '1.5rem',
      marginBottom: '12px'
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse',
      backgroundColor: darkMode ? '#16213e' : '#ffffff',
      boxShadow: darkMode ? '0 3px 15px rgba(0,0,0,0.3)' : '0 3px 12px rgba(0,0,0,0.1)',
      borderRadius: '12px',
      overflow: 'hidden',
      marginTop: '20px'
    },
    thTd: {
      padding: '15px 20px',
      textAlign: 'left',
      borderBottom: `1px solid ${darkMode ? '#2a3a5a' : '#e1e1e1'}`,
      color: darkMode ? '#e6e6e6' : '#333'
    },
    tableHeader: {
      backgroundColor: darkMode ? '#0f3460' : '#e3f2fd',
      fontWeight: '600'
    },
    select: {
      padding: '8px 12px',
      borderRadius: '8px',
      border: `1px solid ${darkMode ? '#2a3a5a' : '#ccc'}`,
      fontFamily: 'inherit',
      backgroundColor: darkMode ? '#16213e' : '#fff',
      color: darkMode ? '#f5f6fa' : '#333',
      marginRight: '10px',
      cursor: 'pointer',
      transition: 'all 0.2s ease'
    },
    refreshButton: {
      backgroundColor: '#4e73df',
      color: '#fff',
      border: 'none',
      padding: '12px 24px',
      borderRadius: '8px',
      cursor: 'pointer',
      fontWeight: '600',
      fontSize: '16px',
      marginBottom: '20px',
      marginRight: '15px',
      transition: 'all 0.3s ease',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '8px',
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
    },
    refreshButtonHover: {
      backgroundColor: '#2e59d9',
      transform: 'translateY(-2px)',
      boxShadow: '0 6px 8px rgba(0,0,0,0.15)'
    },
    toggleButton: {
      backgroundColor: darkMode ? '#f8f9fa' : '#343a40',
      color: darkMode ? '#343a40' : '#f8f9fa',
      border: 'none',
      padding: '12px 24px',
      borderRadius: '8px',
      cursor: 'pointer',
      fontWeight: '600',
      fontSize: '16px',
      transition: 'all 0.3s ease',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '8px',
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
    },
    toggleButtonHover: {
      transform: 'translateY(-2px)',
      boxShadow: '0 6px 8px rgba(0,0,0,0.15)'
    },
    pagination: {
      display: 'flex',
      justifyContent: 'center',
      marginTop: '25px',
      gap: '10px'
    },
    pageButton: {
      padding: '10px 16px',
      backgroundColor: '#4e73df',
      color: '#fff',
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      fontWeight: '600',
      minWidth: '40px'
    },
    pageButtonActive: {
      backgroundColor: '#1cc88a'
    },
    pageButtonHover: {
      transform: 'translateY(-2px)',
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
    },
    sortSelect: {
      marginLeft: '10px',
      padding: '8px 12px',
      backgroundColor: darkMode ? '#16213e' : '#fff',
      color: darkMode ? '#f5f6fa' : '#333',
      borderRadius: '8px',
      border: `1px solid ${darkMode ? '#2a3a5a' : '#ccc'}`,
      cursor: 'pointer'
    },
    searchInput: {
      padding: '12px 15px',
      borderRadius: '8px',
      marginRight: '15px',
      width: '300px',
      border: `1px solid ${darkMode ? '#2a3a5a' : '#ccc'}`,
      backgroundColor: darkMode ? '#16213e' : '#fff',
      color: darkMode ? '#f5f6fa' : '#333',
      fontSize: '15px',
      transition: 'all 0.3s ease',
      '&:focus': {
        outline: 'none',
        borderColor: '#4e73df',
        boxShadow: '0 0 0 3px rgba(78, 115, 223, 0.25)'
      }
    },
    errorMessage: {
      color: '#e74c3c',
      backgroundColor: darkMode ? '#2d3436' : '#fadbd8',
      padding: '15px',
      borderRadius: '8px',
      marginBottom: '20px',
      textAlign: 'center',
      fontWeight: '500'
    },
    warning: {
      backgroundColor: darkMode ? '#2d3436' : '#fef9e7',
      color: darkMode ? '#f39c12' : '#d35400',
      padding: '15px',
      borderRadius: '8px',
      marginBottom: '25px',
      textAlign: 'center',
      fontSize: '15px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '10px',
      fontWeight: '500',
      boxShadow: darkMode ? '0 2px 8px rgba(0,0,0,0.2)' : '0 2px 8px rgba(0,0,0,0.1)'
    },
    statusPending: {
      backgroundColor: darkMode ? '#FF9800' : '#fff3e0',
      color: darkMode ? '#000' : '#e65100',
      padding: '6px 12px',
      borderRadius: '20px',
      fontWeight: '600',
      display: 'inline-block',
      fontSize: '14px'
    },
    statusInProgress: {
      backgroundColor: darkMode ? '#2196F3' : '#e3f2fd',
      color: darkMode ? '#fff' : '#0d47a1',
      padding: '6px 12px',
      borderRadius: '20px',
      fontWeight: '600',
      display: 'inline-block',
      fontSize: '14px'
    },
    statusResolved: {
      backgroundColor: darkMode ? '#4CAF50' : '#e8f5e9',
      color: darkMode ? '#fff' : '#1b5e20',
      padding: '6px 12px',
      borderRadius: '20px',
      fontWeight: '600',
      display: 'inline-block',
      fontSize: '14px'
    },
    loadingText: {
      textAlign: 'center',
      padding: '30px',
      color: darkMode ? '#ccc' : '#666',
      fontSize: '18px'
    },
    deleteButton: {
      backgroundColor: '#e74c3c',
      color: '#fff',
      border: 'none',
      padding: '8px 16px',
      borderRadius: '8px',
      cursor: 'pointer',
      fontWeight: '600',
      fontSize: '14px',
      transition: 'all 0.2s ease',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '5px'
    },
    deleteButtonHover: {
      backgroundColor: '#c0392b',
      transform: 'translateY(-2px)'
    },
    actionCell: {
      display: 'flex',
      alignItems: 'center',
      gap: '10px'
    },
    filterControls: {
      display: 'flex',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      gap: '15px',
      marginBottom: '20px',
      alignItems: 'center'
    },
    filterGroup: {
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      flexWrap: 'wrap'
    },
    label: {
      color: darkMode ? '#bbbbbb' : '#555555',
      fontWeight: '500',
      fontSize: '15px'
    },
    confirmModal: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.7)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    },
    confirmContent: {
      backgroundColor: darkMode ? '#16213e' : '#fff',
      padding: '30px',
      borderRadius: '12px',
      width: '400px',
      maxWidth: '90%',
      boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
      textAlign: 'center'
    },
    confirmTitle: {
      fontSize: '1.5rem',
      marginBottom: '15px',
      color: darkMode ? '#fff' : '#2c3e50',
      fontWeight: '600'
    },
    confirmMessage: {
      marginBottom: '25px',
      color: darkMode ? '#bbbbbb' : '#555555',
      lineHeight: '1.5'
    },
    confirmButtons: {
      display: 'flex',
      justifyContent: 'center',
      gap: '15px'
    },
    confirmButton: {
      padding: '10px 20px',
      borderRadius: '8px',
      border: 'none',
      cursor: 'pointer',
      fontWeight: '600',
      transition: 'all 0.2s ease',
      minWidth: '100px'
    },
    confirmButtonDelete: {
      backgroundColor: '#e74c3c',
      color: '#fff'
    },
    confirmButtonCancel: {
      backgroundColor: darkMode ? '#2a3a5a' : '#e0e0e0',
      color: darkMode ? '#fff' : '#333'
    },
    animatedValue: {
      display: 'inline-block',
      transition: 'all 0.5s ease-out'
    }
  };

  const renderStatus = (status) => {
    if (status === 'pending') {
      return <span style={styles.statusPending}>Pending</span>;
    } else if (status === 'in_progress') {
      return <span style={styles.statusInProgress}>In Progress</span>;
    } else if (status === 'resolved') {
      return <span style={styles.statusResolved}>Resolved</span>;
    }
    return status;
  };

  const StatCard = ({ title, value, color, icon }) => {
    const [hover, setHover] = useState(false);
    return (
      <div
        style={{ 
          ...styles.statCard, 
          ...(hover ? styles.statCardHover : {}), 
          borderTopColor: color,
          transform: hover ? 'translateY(-5px)' : 'translateY(0)',
          boxShadow: hover 
            ? (darkMode ? '0 8px 16px rgba(0,0,0,0.4)' : '0 8px 16px rgba(0,0,0,0.15)')
            : (darkMode ? '0 4px 12px rgba(0,0,0,0.3)' : '0 4px 12px rgba(0,0,0,0.1)')
        }}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
      >
        <div style={styles.statCardIcon}>{icon}</div>
        <div style={styles.statCardTitle}>{title}</div>
        <div style={styles.statCardValue}>
          <span style={styles.animatedValue}>{value}</span>
        </div>
      </div>
    );
  };

  const Button = ({ onClick, style, hoverStyle, children, disabled }) => {
    const [hover, setHover] = useState(false);
    return (
      <button
        style={{ 
          ...style, 
          ...(hover && !disabled ? hoverStyle : {}),
          opacity: disabled ? 0.6 : 1,
          cursor: disabled ? 'not-allowed' : 'pointer'
        }}
        onClick={disabled ? undefined : onClick}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        disabled={disabled}
      >
        {children}
      </button>
    );
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Admin Dashboard</h1>

      {(!apiStatus.students || !apiStatus.complaints) && (
        <div style={styles.warning}>
          <span>⚠️</span>
          <span>API connection issue - Using mock data for demonstration. Check server connection.</span>
        </div>
      )}

      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        <Button 
          style={styles.refreshButton} 
          hoverStyle={styles.refreshButtonHover}
          onClick={fetchRealTimeData}
        >
          <span>🔄</span>
          <span>Refresh Data</span>
        </Button>
        <Button 
          style={styles.toggleButton} 
          hoverStyle={styles.toggleButtonHover}
          onClick={toggleDarkMode}
        >
          <span>{darkMode ? '☀️' : '🌙'}</span>
          <span>{darkMode ? 'Light Mode' : 'Dark Mode'}</span>
        </Button>
        <p style={{ 
          fontSize: '14px', 
          color: darkMode ? '#aaaaaa' : '#7f8c8d', 
          marginTop: '10px',
          fontStyle: 'italic'
        }}>
          Auto-refreshes every minute
        </p>
      </div>

      {error && <div style={styles.errorMessage}>{error}</div>}

      {isLoading ? (
        <p style={styles.loadingText}>Loading dashboard data...</p>
      ) : (
        <>
          <div style={styles.statsContainer}>
            <StatCard 
              title="Total Students" 
              value={studentCount} 
              color="#4e73df" 
              icon="👥"
            />
            <StatCard 
              title="Fees Collected" 
              value={`₹${feesCollected.toLocaleString()}`} 
              color="#1cc88a" 
              icon="💰"
            />
            <StatCard 
              title="Fees to Collect" 
              value={`₹${feesToBeCollected.toLocaleString()}`} 
              color="#f6c23e" 
              icon="📝"
            />
            <StatCard 
              title="Pending Complaints" 
              value={complaintCount} 
              color="#e74c3c" 
              icon="🛠️"
            />
          </div>

          <h2 style={{ 
            ...styles.title, 
            fontSize: '1.8rem', 
            marginTop: '40px',
            marginBottom: '20px',
            textAlign: 'center',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px'
          }}>
            <span>📝</span>
            <span>Student Complaints</span>
          </h2>

          <div style={styles.filterControls}>
            <input
              style={styles.searchInput}
              type="text"
              placeholder="Search complaints..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <div style={styles.filterGroup}>
              <span style={styles.label}>Sort by:</span>
              <select
                style={styles.sortSelect}
                value={sortKey}
                onChange={(e) => {
                  setSortKey(e.target.value);
                  setSortOrder('asc');
                }}
              >
                <option value="">None</option>
                <option value="student_name">Name</option>
                <option value="status">Status</option>
                <option value="created_at">Date</option>
              </select>
              <Button
                style={{ 
                  ...styles.pageButton,
                  backgroundColor: '#6c757d'
                }}
                hoverStyle={{
                  backgroundColor: '#5a6268',
                  transform: 'translateY(-2px)'
                }}
                onClick={() => setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'))}
              >
                {sortOrder === 'asc' ? '⬆️ Asc' : '⬇️ Desc'}
              </Button>
              <Button
                style={{ 
                  ...styles.pageButton, 
                  backgroundColor: showResolved ? '#e67e22' : '#6c757d'
                }}
                hoverStyle={{
                  backgroundColor: showResolved ? '#d46a10' : '#5a6268',
                  transform: 'translateY(-2px)'
                }}
                onClick={() => setShowResolved(!showResolved)}
              >
                {showResolved ? '🧹 Hide Resolved' : '👁 Show All'}
              </Button>
            </div>
          </div>

          {isLoadingComplaints ? (
            <p style={styles.loadingText}>Loading complaints...</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={styles.table}>
                <thead>
                  <tr style={styles.tableHeader}>
                    <th style={styles.thTd}>ID</th>
                    <th style={styles.thTd}>Name</th>
                    <th style={styles.thTd}>Room No</th>
                    <th style={styles.thTd}>Complaint</th>
                    <th style={styles.thTd}>Status</th>
                    <th style={styles.thTd}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentComplaints.length > 0 ? (
                    currentComplaints.map((c) => (
                      <tr key={c.id}>
                        <td style={styles.thTd}>{c.id}</td>
                        <td style={styles.thTd}>{c.student_name}</td>
                        <td style={styles.thTd}>{c.room_number}</td>
                        <td style={styles.thTd}>{c.complaint_text}</td>
                        <td style={styles.thTd}>{renderStatus(c.status)}</td>
                        <td style={styles.thTd}>
                          <div style={styles.actionCell}>
                            <select
                              value={c.status}
                              onChange={(e) => handleStatusChange(c.id, e.target.value)}
                              style={styles.select}
                            >
                              <option value="pending">Pending</option>
                              <option value="in_progress">In Progress</option>
                              <option value="resolved">Resolved</option>
                            </select>
                            <Button
                              style={{
                                ...styles.deleteButton,
                                opacity: c.status === 'resolved' ? 1 : 0.6,
                                cursor: c.status === 'resolved' ? 'pointer' : 'not-allowed'
                              }}
                              hoverStyle={styles.deleteButtonHover}
                              disabled={c.status !== 'resolved'}
                              onClick={() => {
                                setSelectedComplaintId(c.id);
                                setShowConfirm(true);
                              }}
                            >
                              🗑️ Delete
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" style={{ ...styles.thTd, textAlign: 'center' }}>
                        No complaints found matching your criteria
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {totalPages > 0 && (
            <div style={styles.pagination}>
              {[...Array(totalPages)].map((_, i) => (
                <Button 
                  key={i + 1} 
                  style={{
                    ...styles.pageButton,
                    backgroundColor: currentPage === i + 1 ? '#1cc88a' : '#4e73df'
                  }} 
                  hoverStyle={styles.pageButtonHover}
                  onClick={() => paginate(i + 1)}
                >
                  {i + 1}
                </Button>
              ))}
            </div>
          )}
        </>
      )}

      {showConfirm && (
        <div style={styles.confirmModal}>
          <div style={styles.confirmContent}>
            <h3 style={styles.confirmTitle}>Confirm Deletion</h3>
            <p style={styles.confirmMessage}>
              Are you sure you want to delete this resolved complaint? This action cannot be undone.
            </p>
            <div style={styles.confirmButtons}>
              <Button
                style={{ ...styles.confirmButton, ...styles.confirmButtonDelete }}
                hoverStyle={{ backgroundColor: '#c0392b' }}
                onClick={() => {
                  handleDeleteComplaint(selectedComplaintId);
                  setShowConfirm(false);
                }}
              >
                Delete
              </Button>
              <Button
                style={{ ...styles.confirmButton, ...styles.confirmButtonCancel }}
                hoverStyle={{ 
                  backgroundColor: darkMode ? '#1a2a4a' : '#d0d0d0'
                }}
                onClick={() => setShowConfirm(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;