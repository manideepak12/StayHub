// WashingMachineAdmin.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
axios.defaults.baseURL = 'http://localhost:5000';

const WashingMachineAdmin = () => {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState('');
  const [message, setMessage] = useState({ text: '', type: '' });
  const hourOptions = Array.from({ length: 12 }, (_, i) => i + 9); // 9 to 20

  // Initialize current date on component mount
  useEffect(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    setCurrentDate(`${year}-${month}-${day}`);
  }, []);

  // Custom time selector component
  const TimeSelector = ({ id, defaultValue = "09:00" }) => {
    const defaultHour = parseInt(defaultValue.split(':')[0], 10);
    const [selectedHour, setSelectedHour] = useState(
      hourOptions.includes(defaultHour) ? defaultHour : 9
    );

    // Format the time value for form submission
    const timeValue = `${String(selectedHour).padStart(2, '0')}:00`;

    return (
      <div className="custom-time-selector">
        <select 
          id={id}
          className="hour-select"
          value={selectedHour}
          onChange={(e) => setSelectedHour(parseInt(e.target.value, 10))}
          data-value={timeValue}
        >
          {hourOptions.map(hour => (
            <option key={hour} value={hour}>
              {String(hour).padStart(2, '0')}:00 {hour < 12 ? 'AM' : 'PM'}
            </option>
          ))}
        </select>
        <input type="hidden" name={id} value={timeValue} />
      </div>
    );
  };

  // Helper to get time value from custom selector
  const getTimeValue = (timeSelectId) => {
    const selector = document.getElementById(timeSelectId);
    if (selector) {
      return selector.dataset.value;
    }
    return '09:00'; // Default fallback
  };

  // Fetch all washing machine slots from backend
  const fetchSlots = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/washing-machine/slots');
      
      // Process the data to group by date and time
      const processedSlots = processSlotData(res.data);
      setSlots(processedSlots);
      
      // Clear any old messages
      if (message.text) {
        setTimeout(() => setMessage({ text: '', type: '' }), 3000);
      }
    } catch (error) {
      console.error('Error fetching washing machine slots:', error);
      setMessage({ 
        text: 'Failed to load washing machine slots. Please try again.', 
        type: 'error' 
      });
    } finally {
      setLoading(false);
    }
  };

  // Process slot data to organize by date
  const processSlotData = (data) => {
    const groupedByDate = {};
    
    data.forEach(slot => {
      if (!groupedByDate[slot.booking_date]) {
        groupedByDate[slot.booking_date] = [];
      }
      groupedByDate[slot.booking_date].push(slot);
    });
    
    // Sort time slots within each date
    Object.keys(groupedByDate).forEach(date => {
      groupedByDate[date].sort((a, b) => {
        return new Date('1970/01/01 ' + a.time_slot) - new Date('1970/01/01 ' + b.time_slot);
      });
    });
    
    return groupedByDate;
  };

  // Toggle slot status (open/closed)
  const toggleSlot = async (slotId, isCurrentlyOpen) => {
    try {
      await axios.put(`/api/washing-machine/slot/${slotId}/toggle`);
      
      setMessage({ 
        text: `Slot ${isCurrentlyOpen ? 'closed' : 'opened'} successfully!`, 
        type: 'success' 
      });
      
      fetchSlots(); // Refresh slots after update
    } catch (error) {
      console.error('Error updating slot status:', error);
      setMessage({ 
        text: 'Failed to update slot status. Please try again.', 
        type: 'error' 
      });
    }
  };

  // Create a new empty slot
  const createSlot = async (date, time) => {
    try {
      await axios.post('/api/washing-machine/slots', {
        booking_date: date,
        booking_day: new Date(date).toLocaleDateString('en-US', { weekday: 'long' }),
        time_slot: time,
        is_slot_open: true
      });
      
      setMessage({ 
        text: 'New slot created successfully!', 
        type: 'success' 
      });
      
      fetchSlots(); // Refresh slots after creating
    } catch (error) {
      console.error('Error creating new slot:', error);
      setMessage({ 
        text: 'Failed to create new slot. Please try again.', 
        type: 'error' 
      });
    }
  };

  // Delete a slot
  const deleteSlot = async (slotId) => {
    try {
      await axios.delete(`/api/washing-machine/slot/${slotId}`);
      
      setMessage({ 
        text: 'Slot deleted successfully!', 
        type: 'success' 
      });
      
      fetchSlots(); // Refresh slots after deletion
    } catch (error) {
      console.error('Error deleting slot:', error);
      setMessage({ 
        text: 'Failed to delete slot. Please try again.', 
        type: 'error' 
      });
    }
  };

  // Create multiple slots for a single day
  const createFullDaySlots = async (date) => {
    try {
      setLoading(true);
      
      // Create an array of promises for all slot creations (9AM to 8PM)
      const slotPromises = hourOptions.map(hour => {
        const timeSlot = `${String(hour).padStart(2, '0')}:00`;
        return axios.post('/api/washing-machine/slots', {
          booking_date: date,
          booking_day: new Date(date).toLocaleDateString('en-US', { weekday: 'long' }),
          time_slot: timeSlot,
          is_slot_open: true
        });
      });
      
      // Wait for all slot creations to complete
      await Promise.all(slotPromises);
      
      setMessage({ 
        text: 'All day slots created successfully!', 
        type: 'success' 
      });
      
      fetchSlots(); // Refresh slots after creating
    } catch (error) {
      console.error('Error creating full day slots:', error);
      setMessage({ 
        text: 'Failed to create all day slots. Please try again.', 
        type: 'error' 
      });
    } finally {
      setLoading(false);
    }
  };

  // Delete expired slots
  const deleteExpiredSlots = async () => {
    try {
      await axios.delete('/api/washing-machine/slots/expired');
      
      setMessage({ 
        text: 'Expired slots deleted successfully!', 
        type: 'success' 
      });
      
      fetchSlots(); // Refresh slots after deletion
    } catch (error) {
      console.error('Error deleting expired slots:', error);
      setMessage({ 
        text: 'Failed to delete expired slots. Please try again.', 
        type: 'error' 
      });
    }
  };

  // Check if a date is in the past
  const isPastDate = (dateStr) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const date = new Date(dateStr);
    return date < today;
  };

  // Check if a time slot is past
  const isPastTimeSlot = (dateStr, timeStr) => {
    const now = new Date();
    const slotDateTime = new Date(`${dateStr}T${timeStr}`);
    return slotDateTime < now;
  };

  // Load slots on component mount
  useEffect(() => {
    fetchSlots();
    
    // Set up interval to refresh slots every minute
    const interval = setInterval(fetchSlots, 60000);
    
    return () => clearInterval(interval);
  }, []);

  // Handle time selection and create slot
  const handleCreateSlot = (date, timeSelectId) => {
    const time = getTimeValue(timeSelectId);
    if (time) {
      createSlot(date, time);
    } else {
      setMessage({
        text: 'Please select a valid time.',
        type: 'error'
      });
    }
  };

  // Handle new date and time creation
  const handleCreateNewDateSlot = () => {
    const date = document.getElementById('new-date').value;
    const time = getTimeValue('new-time');
    if (date && time) {
      createSlot(date, time);
    } else {
      setMessage({
        text: 'Please enter both date and time.',
        type: 'error'
      });
    }
  };

  return (
    <div className="washing-admin-container">
      <div className="washing-admin-header">
        <div className="header-title">
          <h1>Washing Machine Administration</h1>
        </div>
        <div className="header-actions">
          <button 
            className="action-button refresh-btn"
            onClick={fetchSlots}
          >
            Refresh Slots
          </button>
          <button 
            className="action-button cleanup-btn"
            onClick={deleteExpiredSlots}
          >
            Clean Up Expired Slots
          </button>
        </div>
      </div>
      
      {message.text && (
        <div className={`message-banner ${message.type}`}>
          {message.text}
        </div>
      )}

      <div className="admin-info-banner">
        <span className="info-icon"></span>
        <p>As an administrator, you can open or close slots for washing machine booking. 
        Students can only book slots that are open. Expired slots will be automatically removed from the system.</p>
      </div>

      {loading ? (
        <div className="loading-container">
          <div className="washing-loader"></div>
          <p>Loading washing machine slots...</p>
        </div>
      ) : Object.keys(slots).length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-content">
            <h3>No Washing Machine Slots Available</h3>
            <p>There are no slots in the system. You can create new slots using the form below.</p>
            
            <div className="new-slot-form">
              <h4>Create New Slot</h4>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="new-slot-date">Date:</label>
                  <input 
                    type="date" 
                    id="new-slot-date"
                    min={currentDate}
                    defaultValue={currentDate}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="new-slot-time">Time:</label>
                  <TimeSelector id="new-slot-time" defaultValue="09:00" />
                </div>
                <button 
                  className="create-slot-btn"
                  onClick={() => {
                    const date = document.getElementById('new-slot-date').value;
                    if (date) {
                      handleCreateSlot(date, 'new-slot-time');
                    } else {
                      setMessage({
                        text: 'Please enter a date.',
                        type: 'error'
                      });
                    }
                  }}
                >
                  Create Slot
                </button>
                <button 
                  className="create-full-day-btn"
                  onClick={() => {
                    const date = document.getElementById('new-slot-date').value;
                    if (date) {
                      createFullDaySlots(date);
                    } else {
                      setMessage({
                        text: 'Please enter a date.',
                        type: 'error'
                      });
                    }
                  }}
                >
                  Create All Day Slots
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="slots-container">
          {Object.keys(slots).sort().map(date => {
            const dateObj = new Date(date);
            const formattedDate = dateObj.toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            });
            
            const isPast = isPastDate(date);
            const timeSelectId = `new-time-${date}`;
            
            return (
              <div key={date} className={`date-section ${isPast ? 'past-date' : ''}`}>
                <div className="date-header">
                  <h2>{formattedDate}</h2>
                  {!isPast && (
                    <button 
                      className="create-full-day-btn"
                      onClick={() => createFullDaySlots(date)}
                    >
                      Create All Day Slots
                    </button>
                  )}
                  {isPast && <span className="past-badge">Past Date</span>}
                </div>
                
                <div className="slot-cards">
                  {slots[date].map(slot => {
                    const isBooked = !!slot.student_id;
                    const isPastTime = isPastTimeSlot(date, slot.time_slot);
                    
                    return (
                      <div 
                        key={slot.id} 
                        className={`slot-card ${isBooked ? 'booked' : slot.is_slot_open ? 'open' : 'closed'} ${isPastTime ? 'past-time' : ''}`}
                      >
                        <div className="slot-time">
                          {new Date(`1970-01-01T${slot.time_slot}`).toLocaleTimeString('en-US', {
                            hour: 'numeric',
                            minute: '2-digit',
                            hour12: true
                          })}
                          {isPastTime && <span className="past-time-badge">Past</span>}
                        </div>
                        
                        <div className="slot-content">
                          {isBooked ? (
                            <div className="booking-details">
                              <div className="booking-label">Booked By:</div>
                              <div className="student-name">{slot.student_name || 'N/A'}</div>
                              <div className="student-id">ID: {slot.student_id}</div>
                            </div>
                          ) : (
                            <div className="slot-status">
                              {slot.is_slot_open ? 'Available' : 'Closed'}
                            </div>
                          )}
                        </div>
                        
                        <div className="slot-actions">
                          <button 
                            onClick={() => toggleSlot(slot.id, slot.is_slot_open)}
                            className={`toggle-btn ${slot.is_slot_open ? 'close' : 'open'}`}
                            disabled={isBooked || isPastTime}
                          >
                            {slot.is_slot_open ? 'Close' : 'Open'}
                          </button>
                          
                          {!isBooked && !isPastTime && (
                            <button 
                              onClick={() => deleteSlot(slot.id)}
                              className="delete-btn"
                              title="Delete Slot"
                            >
                              Delete
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  
                  {/* Add slot button at the end of each date section */}
                  <div className="add-slot-card">
                    <div className="add-slot-content">
                      <span className="plus-icon"></span>
                      <p>Add New Time Slot</p>
                      
                      <div className="add-slot-form">
                        <div className="form-group">
                          <label htmlFor={timeSelectId}>Time:</label>
                          <TimeSelector id={timeSelectId} defaultValue="09:00" />
                        </div>
                        <button 
                          className="create-slot-btn"
                          onClick={() => handleCreateSlot(date, timeSelectId)}
                        >
                          Add
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          
          {/* Form to add a new date section */}
          <div className="add-date-section">
            <h3>Add New Date Section</h3>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="new-date">Date:</label>
                <input 
                  type="date" 
                  id="new-date"
                  min={currentDate}
                  defaultValue={currentDate}
                />
              </div>
              <div className="form-group">
                <label htmlFor="new-time">Time:</label>
                <TimeSelector id="new-time" defaultValue="09:00" />
              </div>
              <button 
                className="create-date-btn"
                onClick={handleCreateNewDateSlot}
              >
                Create Single Slot
              </button>
              <button 
                className="create-full-day-btn"
                onClick={() => {
                  const date = document.getElementById('new-date').value;
                  if (date) {
                    createFullDaySlots(date);
                  } else {
                    setMessage({
                      text: 'Please enter a date.',
                      type: 'error'
                    });
                  }
                }}
              >
                Create All Day Slots
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        /* Import Font Awesome for icons */
        @import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css');

        /* Main Container Styles */
        .washing-admin-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background-color: #f5f7fb;
          border-radius: 12px;
          box-shadow: 0 0 20px rgba(0, 0, 0, 0.05);
        }

        /* Header Styles */
        .washing-admin-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-bottom: 15px;
          margin-bottom: 20px;
          border-bottom: 2px solid #e0e5f0;
        }

        .header-title h1 {
          font-size: 24px;
          color: #1a365d;
          position: relative;
          padding-left: 40px;
          margin: 0;
        }

        .header-title h1::before {
          content: "\\f898"; /* Washing machine icon */
          font-family: 'Font Awesome 6 Free';
          font-weight: 900;
          position: absolute;
          left: 0;
          font-size: 28px;
          color: #4299e1;
        }

        .header-actions {
          display: flex;
          gap: 10px;
        }

        .action-button {
          padding: 8px 16px;
          border: none;
          border-radius: 5px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: all 0.2s ease;
        }

        .refresh-btn {
          background-color: #4299e1;
          color: white;
        }

        .refresh-btn:hover {
          background-color: #3182ce;
        }

        .refresh-btn::before {
          content: "\\f2f1"; /* Refresh icon */
          font-family: 'Font Awesome 6 Free';
          font-weight: 900;
        }

        .cleanup-btn {
          background-color: #48bb78;
          color: white;
        }

        .cleanup-btn:hover {
          background-color: #38a169;
        }

        .cleanup-btn::before {
          content: "\\f1f8"; /* Trash icon */
          font-family: 'Font Awesome 6 Free';
          font-weight: 900;
        }

        /* Message Banner */
        .message-banner {
          padding: 12px 20px;
          border-radius: 8px;
          margin-bottom: 20px;
          font-weight: 500;
          position: relative;
          animation: fadeIn 0.3s ease;
        }

        .message-banner.success {
          background-color: #d4edda;
          color: #155724;
          border-left: 5px solid #28a745;
        }

        .message-banner.error {
          background-color: #f8d7da;
          color: #721c24;
          border-left: 5px solid #dc3545;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* Admin Info Banner */
        .admin-info-banner {
          background-color: #e6f3ff;
          border-left: 5px solid #4299e1;
          padding: 15px 20px;
          margin-bottom: 25px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          gap: 15px;
        }

        .info-icon::before {
          content: "\\f05a"; /* Info icon */
          font-family: 'Font Awesome 6 Free';
          font-weight: 900;
          font-size: 24px;
          color: #4299e1;
        }

        .admin-info-banner p {
          margin: 0;
          color: #2c5282;
          font-size: 14px;
          line-height: 1.5;
        }

        /* Loading Container */
        .loading-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 40px 0;
          background-color: white;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
        }

        .washing-loader {
          width: 60px;
          height: 60px;
          border: 4px solid #e2e8f0;
          border-radius: 50%;
          border-top-color: #4299e1;
          animation: spin 1s linear infinite;
          margin-bottom: 15px;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        /* Empty State */
        .empty-state {
          background-color: white;
          border-radius: 12px;
          padding: 30px;
          text-align: center;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
        }

        .empty-state-content h3 {
          color: #1a365d;
          margin-bottom: 15px;
          position: relative;
          display: inline-block;
          padding-left: 30px;
        }

        .empty-state-content h3::before {
          content: "\\f898"; /* Washing machine icon */
          font-family: 'Font Awesome 6 Free';
          font-weight: 900;
          position: absolute;
          left: 0;
          color: #a0aec0;
        }

        .empty-state-content p {
          color: #4a5568;
          margin-bottom: 30px;
        }

        /* New Slot Form */
        .new-slot-form {
          background-color: #f9fafb;
          padding: 20px;
          border-radius: 8px;
          margin-top: 20px;
          border: 1px dashed #cbd5e0;
        }

        .new-slot-form h4 {
          margin-top: 0;
          color: #2d3748;
          margin-bottom: 15px;
          font-size: 16px;
        }

        .form-row {
          display: flex;
          flex-wrap: wrap;
          gap: 15px;
          align-items: flex-end;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 5px;
        }

        .form-group label {
          font-size: 14px;
          font-weight: 600;
          color: #4a5568;
        }

        .form-group input {
          padding: 8px 12px;
          border: 1px solid #cbd5e0;
          border-radius: 5px;
          font-size: 14px;
        }

        .create-slot-btn, .create-date-btn, .create-full-day-btn {
          background-color: #4299e1;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 5px;
          font-weight: 600;
          cursor: pointer;
          transition: background-color 0.2s;
          height: 36px;
          font-size: 13px;
        }

        .create-slot-btn:hover, .create-date-btn:hover {
          background-color: #3182ce;
        }

        .create-full-day-btn {
          background-color: #805ad5;
        }

        .create-full-day-btn:hover {
          background-color: #6b46c1;
        }

        .create-full-day-btn::before {
          content: "\\f0ae"; /* Tasks icon */
          font-family: 'Font Awesome 6 Free';
          font-weight: 900;
          margin-right: 5px;
        }

        /* Slots Container */
        .slots-container {
          display: flex;
          flex-direction: column;
          gap: 25px;
        }

        /* Date Section */
        .date-section {
          background-color: white;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
        }

        .date-section.past-date {
          opacity: 0.7;
        }

        .date-header {
          background: linear-gradient(90deg, #fb8b24, #e36414);
          color: white;
          padding: 12px 15px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .date-header h2 {
          margin: 0;
          font-size: 16px;
          font-weight: 600;
        }

        .past-badge {
          background-color: rgba(0, 0, 0, 0.2);
          padding: 4px 10px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 600;
        }

        /* Slot Cards */
        .slot-cards {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
          gap: 12px;
          padding: 15px;
        }

        .slot-card {
          border-radius: 6px;
          overflow: hidden;
          box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
          display: flex;
          flex-direction: column;
          transition: transform 0.2s, box-shadow 0.2s;
          border: 2px solid transparent;
          min-height: 120px;
        }

        .slot-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .slot-card.open {
          border-color: #48bb78;
        }

        .slot-card.closed {
          border-color: #a0aec0;
        }

        .slot-card.booked {
          border-color: #f56565;
        }

        .slot-card.past-time {
          opacity: 0.7;
        }

        .slot-time {
          background-color: #2c5282;
          color: white;
          padding: 7px;
          text-align: center;
          font-weight: 600;
          font-size: 14px;
          position: relative;
        }

        .past-time-badge {
          position: absolute;
          top: 3px;
          right: 3px;
          background-color: rgba(0, 0, 0, 0.3);
          padding: 2px 6px;
          border-radius: 10px;
          font-size: 9px;
          font-weight: 600;
        }

        .slot-content {
          padding: 12px 10px;
          flex-grow: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          text-align: center;
        }

        .booking-details {
          margin-bottom: 10px;
          width: 100%;
        }

        .booking-label {
          font-weight: 600;
          color: #4a5568;
          margin-bottom: 5px;
          font-size: 12px;
        }

        .student-name {
          font-weight: 600;
          font-size: 13px;
          margin-bottom: 3px;
          word-break: break-word;
        }

        .student-id {
          background-color: #ffe5e5;
          color: #c53030;
          padding: 3px 8px;
          border-radius: 4px;
          font-size: 12px;
        }

      .slot-status {
          font-weight: 600;
          font-size: 16px;
        }

        .open .slot-status {
          color: #38a169;
        }

        .closed .slot-status {
          color: #718096;
        }

        .slot-actions {
          padding: 15px;
          border-top: 1px solid #e2e8f0;
          display: flex;
          gap: 8px;
        }

        .toggle-btn {
          width: 100%;
          padding: 6px 0;
          border: none;
          border-radius: 5px;
          font-weight: 600;
          cursor: pointer;
          transition: background-color 0.2s;
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 5px;
          font-size: 12px;
        }

        .toggle-btn.open {
          background-color: #48bb78;
          color: white;
        }

        .toggle-btn.open::before {
          content: "\\f058"; /* Check circle icon */
          font-family: 'Font Awesome 6 Free';
          font-weight: 900;
        }

        .toggle-btn.open:hover {
          background-color: #38a169;
        }

        .toggle-btn.close {
          background-color: #f56565;
          color: white;
        }

        .toggle-btn.close::before {
          content: "\\f057"; /* Times circle icon */
          font-family: 'Font Awesome 6 Free';
          font-weight: 900;
        }

        .toggle-btn.close:hover {
          background-color: #e53e3e;
        }

        .toggle-btn:disabled {
          background-color: #cbd5e0;
          cursor: not-allowed;
          opacity: 0.7;
        }

        .delete-btn {
          background-color: #f56565;
          color: white;
          border: none;
          padding: 6px 12px;
          border-radius: 5px;
          cursor: pointer;
          transition: background-color 0.2s;
          font-size: 12px;
          font-weight: 600;
        }

        .delete-btn:hover {
          background-color: #e53e3e;
        }

        .delete-btn::before {
          content: "\\f1f8"; /* Trash icon */
          font-family: 'Font Awesome 6 Free';
          font-weight: 900;
          margin-right: 5px;
        }

        /* Add Slot Card */
        .add-slot-card {
          border: 2px dashed #cbd5e0;
          border-radius: 8px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 20px;
          min-height: 120px;
          transition: border-color 0.2s;
        }

        .add-slot-card:hover {
          border-color: #4299e1;
        }

        .add-slot-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
        }

        .plus-icon::before {
          content: "\\f067"; /* Plus icon */
          font-family: 'Font Awesome 6 Free';
          font-weight: 900;
          font-size: 24px;
          color: #a0aec0;
          margin-bottom: 10px;
          display: block;
        }

        .add-slot-content p {
          color: #4a5568;
          margin-bottom: 15px;
          font-size: 13px;
        }

        .add-slot-form {
          width: 100%;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        /* Add Date Section */
        .add-date-section {
          background-color: white;
          border-radius: 12px;
          padding: 20px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
          margin-top: 10px;
        }

        .add-date-section h3 {
          color: #1a365d;
          margin-top: 0;
          margin-bottom: 15px;
          font-size: 18px;
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .washing-admin-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 15px;
          }

          .header-actions {
            width: 100%;
            justify-content: space-between;
          }

          .slot-cards {
            grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
          }

          .form-row {
            flex-direction: column;
            align-items: stretch;
          }

          .form-group, .create-slot-btn, .create-date-btn, .create-full-day-btn {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};

export default WashingMachineAdmin;