import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { 
  FaBed, FaUser, FaDoorOpen, FaHome, FaExchangeAlt, 
  FaSearch, FaExclamationTriangle, FaPlus, FaTrash,
  FaMoneyBillWave, FaTimes, FaCheck
} from 'react-icons/fa';

const RoomManager = () => {
  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [studentsInRoom, setStudentsInRoom] = useState([]);
  const [assignData, setAssignData] = useState({ studentId: '', room_number: '', bed_number: '' });
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateRoom, setShowCreateRoom] = useState(false);
  const [newRoomNumber, setNewRoomNumber] = useState('');
  const [isAdmin, setIsAdmin] = useState(true);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Function to fetch all rooms data
  const fetchAllRooms = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await axios.get('http://localhost:5000/students/rooms');
      setRooms(res.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching rooms:', error);
      setError('Failed to load rooms data. Please check server connection.');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllRooms();
  }, []);

  const fetchRoomDetails = async (roomNumber) => {
    try {
      setStudentsInRoom([]);
      const res = await axios.get(`http://localhost:5000/students/rooms/${roomNumber}/students`);
      
      // Make sure fee_status is properly handled
      const studentsWithFeeStatus = res.data.map(student => ({
        ...student,
        fee_status: student.fee_status || 'pending'
      }));

      setSelectedRoom(roomNumber);
      setStudentsInRoom(studentsWithFeeStatus);
      console.log("Fetched room students:", studentsWithFeeStatus);
    } catch (error) {
      console.error('Error fetching room students:', error);
      alert(`Failed to fetch students for room ${roomNumber}`);
    }
  };

  const handleAssign = async () => {
    if (!assignData.studentId || !assignData.room_number || !assignData.bed_number) {
      alert('All fields are required.');
      return;
    }

    try {
      // First check if the bed is already occupied
      if (selectedRoom === assignData.room_number) {
        const bedOccupied = studentsInRoom.some(
          student => student.bed_number === parseInt(assignData.bed_number)
        );
        
        if (bedOccupied) {
          alert(`Bed ${assignData.bed_number} is already occupied.`);
          return;
        }
      }
      
      await axios.put(`http://localhost:5000/students/${assignData.studentId}/update-room`, {
        room_number: assignData.room_number,
        bed_number: parseInt(assignData.bed_number),
      });
      
      setSuccessMessage('Student assignment updated successfully!');
      setShowSuccessModal(true);
      
      // Refresh all rooms data first
      await fetchAllRooms();
      
      // Then refresh the current room details if it's the same as the assigned room
      if (selectedRoom === assignData.room_number) {
        fetchRoomDetails(assignData.room_number);
      } else {
        // If assigning to a different room than currently selected, select that room
        setSelectedRoom(assignData.room_number);
        fetchRoomDetails(assignData.room_number);
      }
      
      setAssignData({ studentId: '', room_number: '', bed_number: '' });
    } catch (error) {
      console.error('Error assigning room:', error);
      alert(error.response?.data?.message || 'Failed to assign student to room');
    }
  };

  const handleCreateRoom = async () => {
    if (!newRoomNumber) {
      alert('Please enter a room number');
      return;
    }

    if (rooms.some(room => room.room_number === newRoomNumber)) {
      alert('Room number already exists');
      return;
    }

    try {
      await axios.post('http://localhost:5000/students/rooms', {
        room_number: newRoomNumber,
      });
      
      const newRoom = {
        room_number: newRoomNumber,
        capacity: 4,
        filled_beds: 0
      };
      
      setRooms([...rooms, newRoom]);
      setNewRoomNumber('');
      setShowCreateRoom(false);
      setSuccessMessage(`Room ${newRoomNumber} created successfully!`);
      setShowSuccessModal(true);
    } catch (error) {
      console.error('Error creating room:', error);
      alert(error.response?.data?.message || 'Failed to create room');
    }
  };

  const handleDeleteRoom = async (roomNumber) => {
    if (!window.confirm(`Are you sure you want to delete Room ${roomNumber}?`)) return;
    
    try {
      await axios.delete(`http://localhost:5000/students/rooms/${roomNumber}`);
      
      // Refresh all rooms data instead of manually updating state
      await fetchAllRooms();
      
      if (selectedRoom === roomNumber) {
        setSelectedRoom(null);
        setStudentsInRoom([]);
      }
      
      setSuccessMessage(`Room ${roomNumber} deleted successfully`);
      setShowSuccessModal(true);
    } catch (error) {
      console.error('Error deleting room:', error);
      alert(error.response?.data?.message || 'Failed to delete room');
    }
  };

  // Close success modal and perform any refresh needed
  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false);
    // If we need to refresh data after closing the modal, we can do it here
  };

  const filteredRooms = rooms.filter(room => 
    room.room_number.toString().includes(searchTerm) || 
    (selectedRoom === room.room_number && studentsInRoom.some(student => 
      student.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      student.id?.toString().includes(searchTerm)
    ))
  );

  const getFeeStatusDisplay = (student) => {
    const feeStatus = student.fee_status || 'pending';
    
    return {
      text: feeStatus === 'paid' ? 'Paid' : 'Pending',
      bgColor: feeStatus === 'paid' ? '#dcfce7' : '#fee2e2',
      textColor: feeStatus === 'paid' ? '#166534' : '#991b1b'
    };
  };

  const styles = {
    container: {
      padding: '20px',
      fontFamily: "'Inter', sans-serif",
      backgroundColor: '#f9fafb',
      minHeight: '100vh',
      maxWidth: '100%',
      overflowX: 'hidden',
    },
    header: {
      display: 'flex',
      flexDirection: 'column',
      gap: '20px',
      marginBottom: '30px',
    },
    headerActions: {
      display: 'flex',
      flexDirection: 'column',
      gap: '15px',
    },
    title: {
      fontSize: '24px',
      fontWeight: '600',
      color: '#111827',
      display: 'flex',
      alignItems: 'center',
      margin: 0,
    },
    loadingContainer: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      fontFamily: "'Inter', sans-serif",
    },
    loadingSpinner: {
      width: '40px',
      height: '40px',
      borderRadius: '50%',
      border: '3px solid #e5e7eb',
      borderTopColor: '#4f46e5',
      animation: 'spin 1s infinite linear',
      marginBottom: '20px',
    },
    errorContainer: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      fontFamily: "'Inter', sans-serif",
      padding: '20px',
      textAlign: 'center',
    },
    errorBanner: {
      backgroundColor: '#fee2e2',
      color: '#991b1b',
      padding: '12px 16px',
      borderRadius: '8px',
      marginBottom: '20px',
      display: 'flex',
      alignItems: 'center',
      fontWeight: '500',
    },
    retryButton: {
      backgroundColor: '#4f46e5',
      color: 'white',
      border: 'none',
      borderRadius: '6px',
      padding: '10px 20px',
      fontSize: '14px',
      fontWeight: '500',
      cursor: 'pointer',
      marginTop: '20px',
      transition: 'background-color 0.2s',
    },
    searchContainer: {
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
      width: '100%',
    },
    searchIcon: {
      position: 'absolute',
      left: '12px',
      color: '#9ca3af',
    },
    searchInput: {
      padding: '10px 15px 10px 40px',
      borderRadius: '8px',
      border: '1px solid #e5e7eb',
      width: '100%',
      fontSize: '14px',
      outline: 'none',
      transition: 'all 0.3s',
      boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
    },
    addRoomButton: {
      backgroundColor: '#10b981',
      color: 'white',
      border: 'none',
      borderRadius: '6px',
      padding: '10px 15px',
      fontSize: '14px',
      fontWeight: '500',
      cursor: 'pointer',
      transition: 'all 0.2s',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      whiteSpace: 'nowrap',
    },
    content: {
      display: 'flex',
      flexDirection: 'column',
      gap: '30px',
    },
    roomsSection: {
      flex: 1,
      minWidth: '100%',
    },
    roomDetailsSection: {
      flex: 2,
      minWidth: '100%',
    },
    sectionHeader: {
      display: 'flex',
      flexDirection: 'column',
      gap: '10px',
      marginBottom: '20px',
    },
    sectionTitle: {
      fontSize: '18px',
      fontWeight: '600',
      color: '#111827',
      margin: 0,
      display: 'flex',
      alignItems: 'center',
    },
    roomStats: {
      display: 'flex',
      gap: '15px',
      fontSize: '14px',
      color: '#4b5563',
    },
    statItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '5px',
    },
    roomsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
      gap: '15px',
    },
    roomCard: {
      border: '1px solid',
      borderRadius: '12px',
      padding: '15px',
      cursor: 'pointer',
      transition: 'all 0.2s',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    },
    roomHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '10px',
    },
    roomNumber: {
      fontSize: '16px',
      fontWeight: '600',
      margin: 0,
      color: '#111827',
    },
    roomActions: {
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
    },
    capacityBadge: {
      backgroundColor: '#e5e7eb',
      color: '#4b5563',
      padding: '4px 8px',
      borderRadius: '20px',
      fontSize: '12px',
      fontWeight: '500',
    },
    deleteRoomButton: {
      backgroundColor: 'transparent',
      border: 'none',
      color: '#ef4444',
      cursor: 'pointer',
      padding: '4px',
      borderRadius: '4px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    progressContainer: {
      height: '6px',
      backgroundColor: '#f3f4f6',
      borderRadius: '3px',
      overflow: 'hidden',
      marginTop: '10px',
    },
    progressBar: {
      height: '100%',
      borderRadius: '3px',
      transition: 'width 0.3s',
    },
    bedsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
      gap: '15px',
      marginBottom: '30px',
    },
    bedCard: {
      backgroundColor: 'white',
      border: '1px solid #e5e7eb',
      borderRadius: '10px',
      padding: '15px',
      boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
    },
    bedHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '10px',
    },
    bedIcon: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
    },
    bedNumber: {
      fontSize: '14px',
      fontWeight: '500',
      color: '#4b5563',
    },
    paymentStatus: {
      display: 'flex',
      alignItems: 'center',
      padding: '4px 8px',
      borderRadius: '12px',
      fontSize: '12px',
      fontWeight: '500',
    },
    studentInfo: {
      marginTop: '10px',
    },
    studentBadge: {
      display: 'flex',
      alignItems: 'center',
      backgroundColor: '#eff6ff',
      color: '#1e40af',
      padding: '6px 10px',
      borderRadius: '6px',
      fontSize: '14px',
      fontWeight: '500',
      marginBottom: '5px',
    },
    studentId: {
      fontSize: '12px',
      color: '#6b7280',
      marginBottom: '3px',
    },
    studentContact: {
      fontSize: '12px',
      color: '#6b7280',
    },
    emptyBed: {
      color: '#9ca3af',
      fontSize: '14px',
      fontStyle: 'italic',
      marginTop: '10px',
    },
    assignToThisButton: {
      backgroundColor: '#e0e7ff',
      color: '#4f46e5',
      border: 'none',
      borderRadius: '6px',
      padding: '6px 12px',
      fontSize: '12px',
      fontWeight: '500',
      cursor: 'pointer',
      transition: 'all 0.2s',
      whiteSpace: 'nowrap',
    },
    assignSection: {
      backgroundColor: 'white',
      border: '1px solid #e5e7eb',
      borderRadius: '10px',
      padding: '20px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    },
    assignForm: {
      display: 'flex',
      flexDirection: 'column',
      gap: '15px',
    },
    formRow: {
      display: 'flex',
      gap: '15px',
    },
    formGroup: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      gap: '5px',
    },
    label: {
      fontSize: '14px',
      fontWeight: '500',
      color: '#4b5563',
    },
    input: {
      padding: '10px 12px',
      border: '1px solid #e5e7eb',
      borderRadius: '6px',
      fontSize: '14px',
      outline: 'none',
      transition: 'all 0.2s',
      width: '100%',
    },
    assignButton: {
      backgroundColor: '#4f46e5',
      color: 'white',
      border: 'none',
      borderRadius: '6px',
      padding: '12px',
      fontSize: '14px',
      fontWeight: '500',
      cursor: 'pointer',
      transition: 'all 0.2s',
      marginTop: '10px',
    },
    modalOverlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px',
    },
    modalContent: {
      backgroundColor: 'white',
      borderRadius: '12px',
      width: '100%',
      maxWidth: '450px',
      boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
      overflow: 'hidden',
    },
    modalHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '16px 20px',
      borderBottom: '1px solid #e5e7eb',
    },
    modalBody: {
      padding: '20px',
    },
    modalFooter: {
      display: 'flex',
      justifyContent: 'flex-end',
      gap: '10px',
      padding: '16px 20px',
      borderTop: '1px solid #e5e7eb',
    },
    closeModalButton: {
      backgroundColor: 'transparent',
      border: 'none',
      color: '#6b7280',
      cursor: 'pointer',
      fontSize: '18px',
    },
    confirmButton: {
      backgroundColor: '#10b981',
      color: 'white',
      border: 'none',
      borderRadius: '6px',
      padding: '10px 16px',
      fontSize: '14px',
      fontWeight: '500',
      cursor: 'pointer',
      transition: 'background-color 0.2s',
    },
    cancelButton: {
      backgroundColor: '#e5e7eb',
      color: '#4b5563',
      border: 'none',
      borderRadius: '6px',
      padding: '10px 16px',
      fontSize: '14px',
      fontWeight: '500',
      cursor: 'pointer',
      transition: 'background-color 0.2s',
    },
    successContent: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      textAlign: 'center',
      padding: '20px 0',
    },
    successIcon: {
      marginBottom: '20px',
    },
    successMessage: {
      fontSize: '16px',
      color: '#111827',
      margin: 0,
    },
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.loadingSpinner}></div>
        <p>Loading rooms data...</p>
      </div>
    );
  }

  if (error && rooms.length === 0) {
    return (
      <div style={styles.errorContainer}>
        <FaExclamationTriangle size={48} color="#ef4444" />
        <h3>Error Loading Data</h3>
        <p>{error}</p>
        <button 
          onClick={() => fetchAllRooms()} 
          style={styles.retryButton}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {error && (
        <div style={styles.errorBanner}>
          <FaExclamationTriangle style={{ marginRight: '10px' }} />
          {error}
        </div>
      )}
      
      <div style={styles.header}>
        <h2 style={styles.title}>
          <FaHome style={{ marginRight: '10px' }} /> Room Management
        </h2>
        <div style={styles.headerActions}>
          <div style={styles.searchContainer}>
            <FaSearch style={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search by room or student..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={styles.searchInput}
            />
          </div>
          {isAdmin && (
            <button 
              onClick={() => setShowCreateRoom(true)} 
              style={styles.addRoomButton}
            >
              <FaPlus style={{ marginRight: '8px' }} /> Add Room
            </button>
          )}
        </div>
      </div>

      {/* Success Modal */}
      {showSuccessModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <div style={styles.modalHeader}>
              <h3 style={{ margin: 0 }}>Success</h3>
              <button 
                onClick={handleCloseSuccessModal} 
                style={styles.closeModalButton}
              >
                <FaTimes />
              </button>
            </div>
            <div style={styles.modalBody}>
              <div style={styles.successContent}>
                <FaCheck size={48} color="#10b981" style={styles.successIcon} />
                <p style={styles.successMessage}>{successMessage}</p>
              </div>
            </div>
            <div style={styles.modalFooter}>
              <button 
                onClick={handleCloseSuccessModal} 
                style={styles.confirmButton}
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Room Modal */}
      {showCreateRoom && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <div style={styles.modalHeader}>
              <h3 style={{ margin: 0 }}>Create New Room</h3>
              <button 
                onClick={() => setShowCreateRoom(false)} 
                style={styles.closeModalButton}
              >
                <FaTimes />
              </button>
            </div>
            <div style={styles.modalBody}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Room Number</label>
                <input
                  type="text"
                  placeholder="Enter room number"
                  value={newRoomNumber}
                  onChange={(e) => setNewRoomNumber(e.target.value)}
                  style={styles.input}
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Capacity</label>
                <select
                  style={styles.input}
                  value={4}
                  disabled
                >
                  <option value={4}>4 beds (default)</option>
                </select>
              </div>
            </div>
            <div style={styles.modalFooter}>
              <button 
                onClick={handleCreateRoom} 
                style={styles.confirmButton}
              >
                Create Room
              </button>
              <button 
                onClick={() => setShowCreateRoom(false)} 
                style={styles.cancelButton}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div style={styles.content}>
        <div style={styles.roomsSection}>
          <div style={styles.sectionHeader}>
            <h3 style={styles.sectionTitle}><FaDoorOpen style={{ marginRight: '8px' }} /> Available Rooms</h3>
            <div style={styles.roomStats}>
              <span style={styles.statItem}>
                Total Rooms: {rooms.length}
              </span>
              <span style={styles.statItem}>
                Occupied Students: {rooms.reduce((sum, room) => sum + (room.filled_beds || 0), 0)}
              </span>
            </div>
          </div>
          <div style={styles.roomsGrid}>
            {filteredRooms.map((room) => (
              <div 
                key={room.room_number} 
                style={{
                  ...styles.roomCard,
                  borderColor: selectedRoom === room.room_number ? '#4f46e5' : '#e5e7eb',
                  backgroundColor: selectedRoom === room.room_number ? '#eef2ff' : 'white'
                }}
                onClick={() => fetchRoomDetails(room.room_number)}
              >
                <div style={styles.roomHeader}>
                  <h4 style={styles.roomNumber}>Room {room.room_number}</h4>
                  <div style={styles.roomActions}>
                    <span style={styles.capacityBadge}>
                      {room.filled_beds || 0}/{room.capacity}
                    </span>
                    {isAdmin && (
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteRoom(room.room_number);
                        }} 
                        style={styles.deleteRoomButton}
                      >
                        <FaTrash size={12} />
                      </button>
                    )}
                  </div>
                </div>
                <div style={styles.progressContainer}>
                  <div 
                    style={{
                      ...styles.progressBar,
                      width: `${((room.filled_beds || 0) / room.capacity) * 100}%`,
                      backgroundColor: room.filled_beds === room.capacity ? '#ef4444' : '#10b981'
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {selectedRoom && (
          <div style={styles.roomDetailsSection}>
            <div style={styles.sectionHeader}>
              <h3 style={styles.sectionTitle}>
                <FaBed style={{ marginRight: '8px' }} /> Beds in Room {selectedRoom}
              </h3>
              <button 
                onClick={() => {
                  setAssignData({
                    ...assignData,
                    room_number: selectedRoom
                  });
                }} 
                style={styles.assignToThisButton}
              >
                Assign to this room
              </button>
            </div>
            
            <div style={styles.bedsGrid}>
              {[1, 2, 3, 4].map((bedNumber) => {
                const studentInBed = studentsInRoom.find(student => student.bed_number === bedNumber);
                const feeStatus = studentInBed ? getFeeStatusDisplay(studentInBed) : null;
                
                return (
                  <div key={bedNumber} style={styles.bedCard}>
                    <div style={styles.bedHeader}>
                      <div style={styles.bedIcon}>
                        <FaBed size={24} color={studentInBed ? '#3b82f6' : '#9ca3af'} />
                        <span style={styles.bedNumber}>Bed {bedNumber}</span>
                      </div>
                      {studentInBed && feeStatus && (
                        <div style={{
                          ...styles.paymentStatus,
                          backgroundColor: feeStatus.bgColor,
                          color: feeStatus.textColor
                        }}>
                          <FaMoneyBillWave size={12} style={{ marginRight: '4px' }} />
                          {feeStatus.text}
                        </div>
                      )}
                    </div>
                    {studentInBed ? (
                      <div style={styles.studentInfo}>
                        <div style={styles.studentBadge}>
                          <FaUser size={14} style={{ marginRight: '5px' }} />
                          {studentInBed.name}
                        </div>
                        <div style={styles.studentId}>ID: {studentInBed.id}</div>
                        <div style={styles.studentContact}>Phone: {studentInBed.contact || 'N/A'}</div>
                      </div>
                    ) : (
                      <div style={styles.emptyBed}>Vacant</div>
                    )}
                  </div>
                );
              })}
            </div>

            <div style={styles.assignSection}>
              <h3 style={styles.sectionTitle}>
                <FaExchangeAlt style={{ marginRight: '8px' }} /> Assign/Move Student
              </h3>
              <div style={styles.assignForm}>
                <div style={styles.formRow}>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Student ID</label>
                    <input
                      type="text"
                      placeholder="Enter student ID"
                      value={assignData.studentId}
                      onChange={(e) => setAssignData({ ...assignData, studentId: e.target.value })}
                      style={styles.input}
                    />
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Room Number</label>
                    <input
                      type="text"
                      placeholder="Enter room number"
                      value={assignData.room_number}
                      onChange={(e) => setAssignData({ ...assignData, room_number: e.target.value })}
                      style={styles.input}
                    />
                  </div>
                </div>
                <div style={styles.formRow}>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Bed Number</label>
                    <select
                      value={assignData.bed_number}
                      onChange={(e) => setAssignData({ ...assignData, bed_number: e.target.value })}
                      style={styles.input}
                    >
                      <option value="">Select bed</option>
                      {[1, 2, 3, 4].map(num => (
                        <option key={num} value={num}>Bed {num}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <button onClick={handleAssign} style={styles.assignButton}>
                  Assign Student
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Add keyframes for spinner animation
const styleSheet = document.styleSheets[0];
styleSheet.insertRule(`
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`, styleSheet.cssRules.length);

export default RoomManager;