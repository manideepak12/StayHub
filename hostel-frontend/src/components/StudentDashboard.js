import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  FaSun, FaMoon, FaUtensils, FaUserGraduate, 
  FaCommentAlt, FaHistory, FaTrash, FaHome,
  FaClipboardList, FaBell, FaMoneyBill
} from 'react-icons/fa';
import { GiMeal } from 'react-icons/gi';
import { RiMoneyDollarCircleLine } from 'react-icons/ri';

const StudentDashboard = () => {
  const [studentData, setStudentData] = useState({});
  const [menuData, setMenuData] = useState([]);
  const [complaint, setComplaint] = useState('');
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [greeting, setGreeting] = useState('');
  const [showDialog, setShowDialog] = useState(false);
  const [dialogMessage, setDialogMessage] = useState('');
  const [activeSection, setActiveSection] = useState('profile'); // Changed default to 'profile'
  const [notices, setNotices] = useState([]);
  const [profileImage, setProfileImage] = useState(null);
  const [washingSlots, setWashingSlots] = useState([]);
  const [mySlot, setMySlot] = useState(null);
  const [bookingHistory, setBookingHistory] = useState([]);

  const navigate = useNavigate();
  const studentId = localStorage.getItem('studentId');
  const [studentName, setStudentName] = useState(localStorage.getItem('studentName') || 'Student');

  // Helper function to format dates
  const formatDate = (dateString) => {
    if (!dateString) return 'Not available';
    
    return new Date(dateString).toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  useEffect(() => {
    const generateGreeting = () => {
      const hour = new Date().getHours();
      const emoji = hour < 12 ? '☀️' : hour < 17 ? '🌤️' : '🌙';
      
      if (hour < 12) {
        setGreeting(`${emoji} Good morning, ${studentName}!`);
      } else if (hour < 17) {
        setGreeting(`${emoji} Good afternoon, ${studentName}!`);
      } else {
        setGreeting(`${emoji} Good evening, ${studentName}!`);
      }
    };

    generateGreeting();
  }, [studentName]);

  const handleCancelBooking = async (slotId) => {
    try {
      await axios.put(`http://localhost:5000/api/washing-machine/cancel/${slotId}`);
      setDialogMessage("Booking cancelled successfully.");
      setShowDialog(true);
      fetchData();
    } catch (error) {
      console.error("Cancellation failed:", error);
      setDialogMessage("Failed to cancel booking. Please try again.");
      setShowDialog(true);
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch student data
      const studentResponse = await axios.get(`http://localhost:5000/students/${studentId}`);
      setStudentData(studentResponse.data);
      
      if (studentResponse.data.name) {
        setStudentName(studentResponse.data.name);
        localStorage.setItem('studentName', studentResponse.data.name);
      }

      // Set profile image if available
      if (studentResponse.data.profile_url) {
        setProfileImage(`http://localhost:5000${studentResponse.data.profile_url}`);
      }

      // Modified code to show all days' menu
const menuResponse = await axios.get('http://localhost:5000/api/menu');
setMenuData(menuResponse.data);

      // Fetch complaints
      const complaintsResponse = await axios.get('http://localhost:5000/api/complaints');
      const studentComplaints = complaintsResponse.data.filter(
        comp => comp.student_name === (studentResponse.data.name || studentName)
      );
      setComplaints(studentComplaints);

      // Fetch notices
      const noticeResponse = await axios.get('http://localhost:5000/api/notices');
      setNotices(noticeResponse.data);

      // Fetch all washing machine slots
      const slotsRes = await axios.get('http://localhost:5000/api/washing-machine/slots');
      const mappedSlots = slotsRes.data.map(slot => ({
        ...slot,
        day: slot.booking_day,
        time: slot.time_slot
      }));
      setWashingSlots(mappedSlots);

      const myBookings = slotsRes.data.filter(slot => slot.student_id === parseInt(studentId));
      setBookingHistory(myBookings);
      
      // Find the student's slot
      const my = slotsRes.data.find(slot => slot.student_id === studentId);
      setMySlot(my || null);

    } catch (error) {
      console.error("Error fetching data:", error);
      setDialogMessage("Failed to load data. Please try again later.");
      setShowDialog(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    localStorage.setItem('userRole', 'student');

    if (!studentId) {
      navigate('/student-login');
      return;
    }

    fetchData();
  }, [studentId, navigate, studentName]);

  const handleRazorpayPayment = () => {
    const paymentLink = 'https://razorpay.me/@stayhub';
    const studentNameParam = encodeURIComponent(studentName || 'Student');
    const finalLink = `${paymentLink}?name=${studentNameParam}`;
    window.open(finalLink, '_blank');
  };
  
  const handleComplaintSubmit = async () => {
    if (!complaint.trim()) {
      setDialogMessage('Please enter a complaint before submitting.');
      setShowDialog(true);
      return;
    }

    try {
      await axios.post('http://localhost:5000/api/complaints', {
        student_name: studentData.name,
        room_number: studentData.room_number,
        complaint_text: complaint,
      });
      
      setDialogMessage('Complaint submitted successfully! We will address it soon.');
      setShowDialog(true);
      setComplaint('');
      
      // Refresh complaints list
      const response = await axios.get('http://localhost:5000/api/complaints');
      const studentComplaints = response.data.filter(
        comp => comp.student_name === studentName
      );
      setComplaints(studentComplaints);
    } catch (error) {
      console.error('Complaint submission failed:', error);
      setDialogMessage('Failed to submit complaint. Please try again later.');
      setShowDialog(true);
    }
  };

  const handleDeleteComplaint = async (complaintId) => {
    try {
      await axios.delete(`http://localhost:5000/api/complaints/${complaintId}`);
      setComplaints(complaints.filter(comp => comp.id !== complaintId));
      setDialogMessage('Complaint deleted successfully!');
      setShowDialog(true);
    } catch (error) {
      console.error('Failed to delete complaint:', error);
      setDialogMessage('Failed to delete complaint. Please try again.');
      setShowDialog(true);
    }
  };

  const getFeeStatus = () => {
    if (studentData.fee_status === 'paid') {
      return { status: 'paid', amount: 0 };
    } else {
      return { status: 'unpaid', amount: 5000 };
    }
  };

  const handleSlotBooking = async (slotId) => {
    const student_id = parseInt(localStorage.getItem('studentId'), 10);
    const slot_id = parseInt(slotId, 10);
  
    if (isNaN(student_id) || isNaN(slot_id)) {
      console.error("Invalid data:", { student_id, slot_id });
      setDialogMessage("Invalid student or slot ID. Please try logging in again.");
      setShowDialog(true);
      return;
    }
  
    console.log("Booking slot with:", { student_id, slot_id });
  
    try {
      await axios.post('http://localhost:5000/api/washing-machine/book', {
        student_id,
        slot_id
      });
  
      setDialogMessage("Slot booked successfully!");
      setShowDialog(true);
  
      const updated = washingSlots.find(slot => slot.id === slot_id);
      setMySlot(updated);
    } catch (error) {
      console.error("Booking failed:", error.response?.data || error);
      setDialogMessage(error.response?.data?.error || "Failed to book slot. Please try again.");
      setShowDialog(true);
    }
  };

  const renderWashingHistory = () => {
    const today = new Date();
    const upcoming = bookingHistory.filter(b => new Date(b.booking_date) >= today);
    const past = bookingHistory.filter(b => new Date(b.booking_date) < today);
  
    const renderTable = (data, isUpcoming) => (
      <div style={styles.complaintsHistoryContainer(darkMode)}>
        <div style={styles.complaintsTable}>
          <div style={styles.tableHeader(darkMode)}>
            <div style={styles.tableHeaderCell({ width: '25%' })}>Date</div>
            <div style={styles.tableHeaderCell({ width: '25%' })}>Day</div>
            <div style={styles.tableHeaderCell({ width: '25%' })}>Time</div>
            <div style={styles.tableHeaderCell({ width: '15%' })}>Status</div>
            {isUpcoming && <div style={styles.tableHeaderCell({ width: '10%' })}>Action</div>}
          </div>
          <div style={styles.tableBody}>
            {data.map((slot, index) => (
              <div key={index} style={styles.tableRow(darkMode)}>
                <div style={styles.tableCell({ width: '25%' })}>{formatDate(slot.booking_date)}</div>
                <div style={styles.tableCell({ width: '25%' })}>{slot.booking_day}</div>
                <div style={styles.tableCell({ width: '25%' })}>{slot.time_slot}</div>
                <div style={{
                  ...styles.tableCell({ width: '15%' }),
                  color: slot.is_slot_open ? '#f44336' : '#4caf50',
                  fontWeight: 'bold'
                }}>
                  {slot.is_slot_open ? 'Open' : 'Booked'}
                </div>
                {isUpcoming && (
                  <div style={styles.tableCell({ width: '10%' })}>
                    <button 
                      onClick={() => handleCancelBooking(slot.id)}
                      style={{
                        padding: '6px 10px',
                        backgroundColor: '#f44336',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    );

    return (
      <motion.div 
        style={styles.sectionContainer} 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }}
      >
        <div style={styles.sectionHeader(darkMode)}>
          <FaHistory size={24} style={{ marginRight: '10px' }} />
          <h2 style={styles.sectionTitle}>Washing Machine Booking History</h2>
        </div>

        {bookingHistory.length === 0 ? (
          <div style={styles.noComplaintsMessage(darkMode)}>
            <div style={styles.noComplaintsIcon}>🧺</div>
            <p>No bookings found yet.</p>
          </div>
        ) : (
          <>
            <h4 style={{ marginBottom: '10px', marginTop: '20px' }}>Upcoming Bookings</h4>
            {renderTable(upcoming, true)}

            <h4 style={{ marginBottom: '10px', marginTop: '30px' }}>Past Bookings</h4>
            {renderTable(past, false)}
          </>
        )}
      </motion.div>
    );
  };

  const renderOverview = () => {
    const feeDetails = getFeeStatus();
    
    return (
      <div style={styles.overviewGrid}>
        {/* Student Snapshot Card */}
        <motion.div 
          style={styles.overviewCard(darkMode)} 
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <div style={styles.cardIcon(darkMode)}><FaUserGraduate size={28} /></div>
          <h3 style={styles.overviewCardTitle(darkMode)}>Your Profile</h3>
          <div style={styles.overviewCardContent}>
            {profileImage ? (
              <div style={styles.profileImageContainer}>
                <img src={profileImage} alt="Profile" style={styles.overviewProfileImage} />
              </div>
            ) : (
              <div style={styles.overviewAvatar(darkMode)}>
                {studentData.name?.charAt(0) || 'S'}
              </div>
            )}
            <p><strong>Name:</strong> {studentData.name}</p>
            <p><strong>Room:</strong> {studentData.room_number}</p>
            <p><strong>Fees Status:</strong> <span style={
              feeDetails.status === 'paid' ? styles.paidStatus : styles.unpaidStatus
            }>
              {feeDetails.status === 'paid' ? 'Paid' : `₹${feeDetails.amount} Due`}
            </span></p>
          </div>
          <button 
            onClick={() => setActiveSection('profile')} 
            style={styles.viewDetailsButton(darkMode)}
          >
            View Full Details
          </button>
        </motion.div>

        {/* Today's Menu Card */}
        <motion.div 
          style={styles.overviewCard(darkMode)} 
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <div style={styles.cardIcon(darkMode)}><GiMeal size={28} /></div>
          <h3 style={styles.overviewCardTitle(darkMode)}>Today's Menu</h3>
          <div style={styles.overviewCardContent}>
            {menuData.length > 0 ? (
              <div style={styles.todayMenuOverview}>
                <div style={styles.mealRow}>
                  <div style={styles.mealIcon(darkMode)}>🍳</div>
                  <div style={styles.mealInfo}>
                    <h4 style={styles.mealTitle(darkMode)}>Breakfast</h4>
                    <p>{menuData[0]?.breakfast || 'Not available'}</p>
                    <span style={styles.mealTime}>7:30 AM - 9:30 AM</span>
                  </div>
                </div>
                
                <div style={styles.mealRow}>
                  <div style={styles.mealIcon(darkMode)}>🍲</div>
                  <div style={styles.mealInfo}>
                    <h4 style={styles.mealTitle(darkMode)}>Lunch</h4>
                    <p>{menuData[0]?.lunch || 'Not available'}</p>
                    <span style={styles.mealTime}>12:30 PM - 4:30 PM</span>
                  </div>
                </div>
                
                <div style={styles.mealRow}>
                  <div style={styles.mealIcon(darkMode)}>🍽️</div>
                  <div style={styles.mealInfo}>
                    <h4 style={styles.mealTitle(darkMode)}>Dinner</h4>
                    <p>{menuData[0]?.dinner || 'Not available'}</p>
                    <span style={styles.mealTime}>7:50 PM - 9:00 PM</span>
                  </div>
                </div>
              </div>
            ) : (
              <p>Menu information not available</p>
            )}
          </div>
          <button 
            onClick={() => setActiveSection('mess')} 
            style={styles.viewDetailsButton(darkMode)}
          >
            View Full Menu
          </button>
        </motion.div>

        {/* Fee Payment Card */}
        <motion.div 
          style={styles.overviewCard(darkMode)} 
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <div style={styles.cardIcon(darkMode)}><FaMoneyBill size={28} /></div>
          <h3 style={styles.overviewCardTitle(darkMode)}>Fee Payment</h3>
          <div style={styles.overviewCardContent}>
            <div style={styles.feeStatusBox(feeDetails.status === 'paid')}>
              <div style={styles.feeStatusIcon(feeDetails.status === 'paid')}>
                {feeDetails.status === 'paid' ? '✓' : '!'}
              </div>
              <h4>{feeDetails.status === 'paid' ? 'Fees Paid' : 'Payment Due'}</h4>
              {feeDetails.status === 'paid' ? (
                <p style={styles.feePaidText}>Your hostel fees have been paid. Thank you!</p>
              ) : (
                <>
                  <p style={styles.feeAmountText}>Amount: ₹{feeDetails.amount}</p>
                  <p style={styles.feeWarningText}>Please clear your dues at the earliest.</p>
                  <button 
                    onClick={handleRazorpayPayment} 
                    style={styles.payNowButton(darkMode)}
                  >
                    <RiMoneyDollarCircleLine size={18} style={{ marginRight: '5px' }} />
                    Pay Now
                  </button>
                </>
              )}
            </div>
          </div>
          <button 
            onClick={() => setActiveSection('profile')} 
            style={styles.viewDetailsButton(darkMode)}
          >
            Payment History
          </button>
        </motion.div>

        {/* Quick Complaint Card */}
        <motion.div 
          style={styles.overviewCard(darkMode)} 
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <div style={styles.cardIcon(darkMode)}><FaCommentAlt size={28} /></div>
          <h3 style={styles.overviewCardTitle(darkMode)}>Quick Complaint</h3>
          <div style={styles.overviewCardContent}>
            <textarea
              value={complaint}
              onChange={(e) => setComplaint(e.target.value)}
              placeholder="Describe your issue..."
              rows={4}
              style={styles.quickComplaintTextarea(darkMode)}
            />
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button 
              onClick={handleComplaintSubmit} 
              style={styles.submitButton(darkMode)}
            >
              Submit
            </button>
            
            <button 
              onClick={() => setActiveSection('complaints')} 
              style={styles.viewHistoryButton(darkMode)}
            >
              View History
            </button>
          </div>
        </motion.div>
      </div>
    );
  };

  const renderProfile = () => {
    const feeDetails = getFeeStatus();
    
    return (
      <motion.div 
        style={styles.sectionContainer} 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }}
      >
        <div style={styles.sectionHeader(darkMode)}>
          <FaUserGraduate size={24} style={{ marginRight: '10px' }} />
          <h2 style={styles.sectionTitle}>Student Profile</h2>
        </div>

        <div style={styles.profileCard(darkMode)}>
          <div style={styles.profileHeader(darkMode)}>
            {profileImage ? (
              <img src={profileImage} alt="Profile" style={styles.profileImage} />
            ) : (
              <div style={styles.profileAvatar(darkMode)}>
                {studentData.name?.charAt(0) || 'S'}
              </div>
            )}
            <div style={styles.profileHeaderInfo}>
              <h3 style={styles.profileName}>{studentData.name}</h3>
              <p style={styles.profileId}>ID: {studentId}</p>
            </div>
          </div>
          
          <div style={styles.profileDetails}>
            {[
              { label: 'Email', value: studentData.email, icon: '📧' },
              { label: 'Phone', value: studentData.contact, icon: '📱' },
              { label: 'Room Number', value: studentData.room_number, icon: '🏠' },
              { label: 'Admission Date', value: formatDate(studentData.joining_date) || 'Not available', icon: '📅' },
            ].map((item, index) => (
              <div key={index} style={styles.profileDetailRow(darkMode)}>
                <div style={styles.detailIcon}>{item.icon}</div>
                <div style={styles.detailLabel}>{item.label}</div>
                <div style={styles.detailValue}>{item.value}</div>
              </div>
            ))}
          </div>
          
          <div style={styles.paymentSection(darkMode)}>
            <h4 style={styles.paymentTitle}>Fee Payment Status</h4>
            
            <div style={styles.feeStatusContainer}>
              <div style={styles.feeStatusIndicator(feeDetails.status === 'paid')}>
                {feeDetails.status === 'paid' ? 'PAID' : 'UNPAID'}
              </div>
              
              {feeDetails.status === 'paid' ? (
                <p style={styles.paymentCompleteInfo}>
                  Your hostel fees have been paid in full. Thank you!
                </p>
              ) : (
                <>
                  <p style={styles.paymentInfo}>
                    Your current due amount: <span style={styles.dueAmount}>₹{feeDetails.amount}</span>
                  </p>
                  <p style={styles.paymentDeadline}>
                    Please pay before the deadline to avoid late fees.
                  </p>
                </>
              )}
              
              {feeDetails.status !== 'paid' && (
                <button 
                  onClick={handleRazorpayPayment} 
                  style={styles.paymentButton(darkMode)}
                >
                  <RiMoneyDollarCircleLine size={18} style={{ marginRight: '8px' }} /> 
                  Pay Now
                </button>
              )}
            </div>
            
            <div style={styles.paymentHistorySection}>
              <h5 style={styles.paymentHistoryTitle}>Recent Transactions</h5>
              
              {feeDetails.status === 'paid' ? (
                <div style={styles.transactionItem(darkMode)}>
                  <div style={styles.transactionDetails}>
                    <span style={styles.transactionName}>Hostel Fee Payment</span>
                    <span style={styles.transactionDate}>
                      {formatDate(new Date().toISOString())}
                    </span>
                  </div>
                  <div style={styles.transactionAmount(true)}>₹5000</div>
                </div>
              ) : (
                <div style={styles.noTransactionsMessage}>
                  No recent transactions to display
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  const renderMessMenu = () => (
    <motion.div 
      style={styles.sectionContainer} 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }}
    >
      <div style={styles.sectionHeader(darkMode)}>
        <GiMeal size={24} style={{ marginRight: '10px' }} />
        <h2 style={styles.sectionTitle}>Mess Menu</h2>
      </div>
  
      <div style={styles.messMenuContainer(darkMode)}>
        {menuData.length > 0 ? (
          <div style={styles.weeklyMenu}>
            {/* Add a Weekly Menu Title */}
            <h3 style={{
              marginBottom: '20px',
              color: darkMode ? '#e4e6eb' : '#444',
              textAlign: 'center'
            }}>
              Full Weekly Menu
            </h3>
            
            {/* Map through all days of the week */}
            {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day, index) => {
              // Find menu for current day
              const dayMenu = menuData.find(menu => menu.day === day) || {
                day: day,
                breakfast: 'Not available',
                lunch: 'Not available',
                dinner: 'Not available'
              };
              
              // Check if this is today
              const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
              const currentDayName = daysOfWeek[new Date().getDay()];
              const isToday = day === currentDayName;
              
              return (
                <div 
                  key={index} 
                  style={isToday ? 
                    styles.todayMenuCard(darkMode) : 
                    styles.menuCard(darkMode)
                  }
                >
                  <div style={styles.menuDayHeader(darkMode, isToday)}>
                    <span style={styles.dayName}>{day}</span>
                    {isToday && <span style={styles.todayBadge}>TODAY</span>}
                  </div>
                  
                  <div style={styles.mealGrid}>
                    <div style={styles.mealCard(darkMode)}>
                      <div style={styles.mealIcon(darkMode)}>🍳</div>
                      <h4 style={styles.mealTitle(darkMode)}>Breakfast</h4>
                      <p style={styles.mealItems}>{dayMenu.breakfast}</p>
                      <span style={styles.mealTime}>7:30 AM - 9:30 AM</span>
                    </div>
                    
                    <div style={styles.mealCard(darkMode)}>
                      <div style={styles.mealIcon(darkMode)}>🍲</div>
                      <h4 style={styles.mealTitle(darkMode)}>Lunch</h4>
                      <p style={styles.mealItems}>{dayMenu.lunch}</p>
                      <span style={styles.mealTime}>12:30 PM - 2:30 PM</span>
                    </div>
                    
                    <div style={styles.mealCard(darkMode)}>
                      <div style={styles.mealIcon(darkMode)}>🍽️</div>
                      <h4 style={styles.mealTitle(darkMode)}>Dinner</h4>
                      <p style={styles.mealItems}>{dayMenu.dinner}</p>
                      <span style={styles.mealTime}>7:30 PM - 9:30 PM</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div style={styles.noMenuMessage(darkMode)}>
            <div style={styles.noMenuIcon}>🍽️</div>
            <p>No mess menu data is currently available.</p>
            <p>Please check back later or contact the hostel administration.</p>
          </div>
        )}
      </div>
    </motion.div>
  );

  const renderNotices = () => (
    <motion.div 
      style={styles.sectionContainer} 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }}
    >
      <div style={styles.sectionHeader(darkMode)}>
        <FaBell size={24} style={{ marginRight: '10px' }} />
        <h2 style={styles.sectionTitle}>Notice Board</h2>
      </div>

      <div style={styles.noticeBoardContainer(darkMode)}>
        {notices.length > 0 ? (
          notices.map((notice, index) => (
            <motion.div 
              key={index} 
              style={styles.noticeCard(darkMode, index % 4)}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02 }}
            >
              <div style={styles.noticePushpin}></div>
              <h3 style={styles.noticeTitle(darkMode)}>{notice.title}</h3>
              <div style={styles.noticeContent(darkMode)}>
                <p>{notice.content}</p>
              </div>
              <div style={styles.noticeFooter(darkMode)}>
                <div style={styles.noticeDate}>
                  {formatDate(notice.created_at)}
                </div>
                <div style={styles.noticeAuthor}>
                  {notice.author || 'Hostel Administration'}
                </div>
              </div>
            </motion.div>
          ))
        ) : (
          <div style={styles.noNoticesMessage(darkMode)}>
            <div style={styles.noNoticesIcon}>📌</div>
            <p>No notices have been posted yet.</p>
          </div>
        )}
      </div>
    </motion.div>
  );

  const renderSubmitComplaint = () => (
    <motion.div 
      style={styles.sectionContainer} 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }}
    >
      <div style={styles.sectionHeader(darkMode)}>
        <FaCommentAlt size={24} style={{ marginRight: '10px' }} />
        <h2 style={styles.sectionTitle}>Submit a Complaint</h2>
      </div>

      <div style={styles.complaintForm(darkMode)}>
        <p style={{ marginBottom: '15px', fontSize: '14px', color: darkMode ? '#ccc' : '#555' }}>
          Please provide details about your issue. The hostel administration will address it as soon as possible.
        </p>
        
        <div style={styles.formGroup}>
          <label style={styles.formLabel(darkMode)}>Your Name</label>
          <input 
            type="text" 
            value={studentData.name || studentName}
            disabled
            style={styles.formInput(darkMode)}
          />
        </div>
        
        <div style={styles.formGroup}>
          <label style={styles.formLabel(darkMode)}>Room Number</label>
          <input 
            type="text" 
            value={studentData.room_number || 'Not assigned'}
            disabled
            style={styles.formInput(darkMode)}
          />
        </div>
        
        <div style={styles.formGroup}>
          <label style={styles.formLabel(darkMode)}>Complaint Details</label>
          <textarea
            value={complaint}
            onChange={(e) => setComplaint(e.target.value)}
            placeholder="Please describe your issue in detail..."
            rows={6}
            style={styles.complaintTextarea(darkMode)}
          />
        </div>
        
        <div style={styles.formActions}>
          <button 
            onClick={handleComplaintSubmit} 
            style={styles.submitComplaintButton(darkMode)}
          >
            <FaCommentAlt style={{ marginRight: '8px' }} /> 
            Submit Complaint
          </button>
          <button 
            onClick={() => setActiveSection('complaints')} 
            style={styles.viewComplaintsButton(darkMode)}
          >
            <FaHistory style={{ marginRight: '8px' }} /> 
            View History
          </button>
        </div>
      </div>
    </motion.div>
  );

  const renderComplaintHistory = () => (
    <motion.div 
      style={styles.sectionContainer} 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }}
    >
      <div style={styles.sectionHeader(darkMode)}>
        <FaHistory size={24} style={{ marginRight: '10px' }} />
        <h2 style={styles.sectionTitle}>Complaint History</h2>
      </div>

      {complaints.length === 0 ? (
        <div style={styles.noComplaintsMessage(darkMode)}>
          <div style={styles.noComplaintsIcon}>📝</div>
          <p>You have not submitted any complaints yet.</p>
          <button 
            onClick={() => setActiveSection('submitComplaint')} 
            style={styles.submitNewButton(darkMode)}
          >
            Submit a New Complaint
          </button>
        </div>
      ) : (
        <div style={styles.complaintsHistoryContainer(darkMode)}>
          <div style={styles.complaintsTable}>
            <div style={styles.tableHeader(darkMode)}>
              <div style={styles.tableHeaderCell({ width: '40%' })}>Complaint</div>
              <div style={styles.tableHeaderCell({ width: '15%' })}>Room</div>
              <div style={styles.tableHeaderCell({ width: '15%' })}>Status</div>
              <div style={styles.tableHeaderCell({ width: '20%' })}>Date</div>
              <div style={styles.tableHeaderCell({ width: '10%' })}>Actions</div>
            </div>
            
            <div style={styles.tableBody}>
              {complaints.map((comp) => (
                <div key={comp.id} style={styles.tableRow(darkMode)}>
                  <div style={styles.tableCell({ width: '40%' })}>{comp.complaint_text}</div>
                  <div style={styles.tableCell({ width: '15%' })}>{comp.room_number}</div>
                  <div style={{
                    ...styles.tableCell({ width: '15%' }),
                    ...styles.statusCell(darkMode, comp.status)
                  }}>
                    {comp.status}
                  </div>
                  <div style={styles.tableCell({ width: '20%' })}>
                    {formatDate(comp.created_at)}
                  </div>
                  <div style={styles.tableCell({ width: '10%' })}>
                    {comp.status === 'resolved' && (
                      <button 
                        onClick={() => handleDeleteComplaint(comp.id)}
                        style={styles.deleteButton(darkMode)}
                        title="Delete complaint"
                      >
                        <FaTrash />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div style={styles.complaintsActions}>
            <button 
              onClick={() => setActiveSection('submitComplaint')} 
              style={styles.submitNewButton(darkMode)}
            >
              Submit a New Complaint
            </button>
          </div>
        </div>
      )}
    </motion.div>
  );

  const renderWashingMachine = () => (
    <motion.div style={styles.sectionContainer} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div style={styles.sectionHeader(darkMode)}>
        <FaClipboardList size={24} style={{ marginRight: '10px' }} />
        <h2 style={styles.sectionTitle}>Washing Machine Booking</h2>
      </div>
  
      {mySlot ? (
        <div style={{ 
          padding: '20px', 
          backgroundColor: darkMode ? '#1e1e1e' : '#fff',
          borderRadius: '10px',
          boxShadow: darkMode ? '0 4px 15px rgba(0, 0, 0, 0.3)' : '0 4px 15px rgba(0, 0, 0, 0.05)',
          marginBottom: '20px'
        }}>
          <h3 style={{ marginTop: 0, color: darkMode ? '#e4e6eb' : '#333' }}>Your Booked Slot</h3>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '15px',
            marginTop: '15px'
          }}>
            <div style={styles.washingDetailCard(darkMode)}>
              <div style={styles.washingDetailLabel}>Day</div>
              <div style={styles.washingDetailValue}>{mySlot.day}</div>
            </div>
            <div style={styles.washingDetailCard(darkMode)}>
              <div style={styles.washingDetailLabel}>Time</div>
              <div style={styles.washingDetailValue}>{mySlot.time}</div>
            </div>
            <div style={styles.washingDetailCard(darkMode)}>
              <div style={styles.washingDetailLabel}>Status</div>
              <div style={{ ...styles.washingDetailValue, color: '#4caf50' }}>Booked</div>
            </div>
          </div>
          <p style={{ 
            marginTop: '15px', 
            fontSize: '14px', 
            color: darkMode ? '#b0b3b8' : '#666' 
          }}>
            You can book only once per week. If you need to change your slot, please contact the hostel administration.

          </p>
        </div>
      ) : (
        <>
          <p style={{ 
            marginBottom: '15px', 
            color: darkMode ? '#b0b3b8' : '#666' 
          }}>
            Select an available slot to book (only one booking per week allowed):
          </p>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '15px'
          }}>
            {washingSlots.filter(slot => !slot.student_id).map((slot) => (
              <motion.div
                key={slot.id}
                whileHover={{ scale: 1.03 }}
                style={styles.washingSlotCard(darkMode)}
                onClick={() => handleSlotBooking(slot.id)}
              >
                <div style={styles.washingSlotDay}>{slot.day}</div>
                <div style={styles.washingSlotTime}>{slot.time}</div>
                <button 
                  style={styles.bookButton(darkMode)}
                  onClick={() => handleSlotBooking(slot.id)}
                >
                  Book Slot
                </button>
              </motion.div>
            ))}
          </div>
        </>
      )}
    </motion.div>
  );

 

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'profile':
        return renderProfile();
      case 'mess':
        return renderMessMenu();
      case 'notices':
        return renderNotices();
      case 'submitComplaint':
        return renderSubmitComplaint();
      case 'complaints':
        return renderComplaintHistory();
      case 'washing':
        return renderWashingMachine();
      case 'washingHistory':
        return renderWashingHistory();
      case 'overview':
      default:
        return renderOverview();
    }
  };
  
  return (
    <div style={styles.page(darkMode)}>
      {/* Dark Mode Toggle */}
      <div style={styles.topBar(darkMode)}>
        <h1 style={styles.dashboardTitle}>Student Portal</h1>
        <button 
          onClick={() => setDarkMode(!darkMode)} 
          style={styles.toggleButton(darkMode)}
        >
          {darkMode ? <><FaSun /> Light</> : <><FaMoon /> Dark</>}
        </button>
      </div>

      {loading ? (
        <div style={styles.loading(darkMode)}>
          <div style={styles.loadingSpinner}></div>
          <p>Loading your dashboard...</p>
        </div>
      ) : (
        <div style={styles.dashboardLayout}>
          {/* Sidebar Navigation */}
          <div style={styles.sidebar(darkMode)}>
            <div style={styles.greeting}>
              {profileImage ? (
                <img src={profileImage} alt="Avatar" style={styles.sidebarAvatar} />
              ) : (
                <div style={styles.userAvatar(darkMode)}>{studentName.charAt(0)}</div>
              )}
              <div style={styles.greetingText}>{greeting}</div>
            </div>
            
            <div style={styles.navigation}>
            <button 
  style={activeSection === 'overview' ? 
    styles.activeNavItem(darkMode) : styles.navItem(darkMode)}
  onClick={() => setActiveSection('overview')}
>
  <FaHome size={18} style={styles.navIcon} /> Dashboard
</button>
              
              <button 
                style={activeSection === 'profile' ? 
                  styles.activeNavItem(darkMode) : styles.navItem(darkMode)}
                onClick={() => setActiveSection('profile')}
              >
                <FaUserGraduate size={18} style={styles.navIcon} /> Profile
              </button>
              
              <button 
                style={activeSection === 'mess' ? 
                  styles.activeNavItem(darkMode) : styles.navItem(darkMode)}
                onClick={() => setActiveSection('mess')}
              >
                <FaUtensils size={18} style={styles.navIcon} /> Mess Menu
              </button>
              
              <button 
                style={activeSection === 'notices' ? 
                  styles.activeNavItem(darkMode) : styles.navItem(darkMode)}
                onClick={() => setActiveSection('notices')}
              >
                <FaBell size={18} style={styles.navIcon} /> Notices
              </button>
              
              <button 
                style={activeSection === 'washing' ? 
                  styles.activeNavItem(darkMode) : styles.navItem(darkMode)}
                onClick={() => setActiveSection('washing')}
              >
                <FaClipboardList size={18} style={styles.navIcon} /> Washing Machine
              </button>
                
                <button 
                  style={activeSection === 'submitComplaint' ? 
                    styles.activeNavItem(darkMode) : styles.navItem(darkMode)}
                  onClick={() => setActiveSection('submitComplaint')}
                >
                  <FaCommentAlt size={18} style={styles.navIcon} /> Submit Complaint
                </button>
                
                <button 
                  style={activeSection === 'complaints' ? 
                    styles.activeNavItem(darkMode) : styles.navItem(darkMode)}
                  onClick={() => setActiveSection('complaints')}
                >
                  <FaHistory size={18} style={styles.navIcon} /> Complaint History
                </button>
              </div>
              <button 
                    style={activeSection === 'washingHistory' ? styles.activeNavItem(darkMode) : styles.navItem(darkMode)}
                     onClick={() => setActiveSection('washingHistory')}
                      >
                      <FaHistory size={18} style={styles.navIcon} /> Washing History            
                      </button>
              <button 
                onClick={() => {
                  localStorage.removeItem('studentId');
                  localStorage.removeItem('studentName');
                  navigate('/student-login');
                }} 
                style={styles.logoutButton(darkMode)}
              >
                Log Out
              </button>
            </div>
            
            {/* Main Content */}
            <div style={styles.mainContent(darkMode)}>
              {renderActiveSection()}
            </div>
          </div>
        )}
        
        {/* Dialog for notifications */}
        {showDialog && (
          <div style={styles.dialogOverlay}>
            <div style={styles.dialogBox(darkMode)}>
              <p style={styles.dialogMessage}>{dialogMessage}</p>
              <button 
                onClick={() => setShowDialog(false)} 
                style={styles.dialogButton(darkMode)}
              >
                OK
              </button>
            </div>
          </div>
        )}
      </div>
    );
};

// Styles object
const styles = {
  // Page and layout styles
  page: (darkMode) => ({
    minHeight: '100vh',
    backgroundColor: darkMode ? '#121212' : '#f5f5f7',
    color: darkMode ? '#e4e6eb' : '#333',
    transition: 'all 0.3s ease',
    fontFamily: "'Poppins', sans-serif"
  }),
  
  topBar: (darkMode) => ({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '15px 25px',
    backgroundColor: darkMode ? '#1e1e1e' : '#fff',
    boxShadow: darkMode ? '0 2px 10px rgba(0,0,0,0.3)' : '0 2px 10px rgba(0,0,0,0.1)',
    borderBottom: darkMode ? '1px solid #333' : '1px solid #e0e0e0',
  }),
  
  dashboardTitle: {
    margin: 0,
    fontSize: '24px',
    fontWeight: '600',
  },
  
  toggleButton: (darkMode) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 15px',
    backgroundColor: darkMode ? '#333' : '#f0f0f0',
    color: darkMode ? '#fff' : '#333',
    border: 'none',
    borderRadius: '20px',
    cursor: 'pointer',
    fontWeight: '500',
    transition: 'all 0.2s ease'
  }),
  
  dashboardLayout: {
    display: 'flex',
    minHeight: 'calc(100vh - 70px)',
  },
  
  sidebar: (darkMode) => ({
    width: '250px',
    backgroundColor: darkMode ? '#1e1e1e' : '#fff',
    padding: '20px 0',
    borderRight: darkMode ? '1px solid #333' : '1px solid #e0e0e0',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    boxShadow: darkMode ? '2px 0 10px rgba(0,0,0,0.2)' : '2px 0 10px rgba(0,0,0,0.05)',
  }),
  
  greeting: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '10px 20px 20px',
    borderBottom: '1px solid rgba(125,125,125,0.2)',
    marginBottom: '20px',
  },
  
  userAvatar: (darkMode) => ({
    width: '60px',
    height: '60px',
    borderRadius: '50%',
    backgroundColor: darkMode ? '#333' : '#e0e0e0',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    fontSize: '28px',
    fontWeight: 'bold',
    marginBottom: '10px',
    color: darkMode ? '#fff' : '#555',
    border: darkMode ? '3px solid #444' : '3px solid #ddd',
  }),
  
  sidebarAvatar: {
    width: '60px',
    height: '60px',
    borderRadius: '50%',
    objectFit: 'cover',
    marginBottom: '10px',
    border: '3px solid #ddd',
  },
  
  greetingText: {
    textAlign: 'center',
    fontSize: '16px',
    fontWeight: '500',
  },
  
  navigation: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
  },
  
  navItem: (darkMode) => ({
    display: 'flex',
    alignItems: 'center',
    padding: '12px 25px',
    backgroundColor: 'transparent',
    border: 'none',
    textAlign: 'left',
    fontSize: '15px',
    color: darkMode ? '#b0b3b8' : '#555',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    fontWeight: '500',
    borderLeft: '4px solid transparent',
  }),
  
  activeNavItem: (darkMode) => ({
    display: 'flex',
    alignItems: 'center',
    padding: '12px 25px',
    backgroundColor: darkMode ? '#333' : '#f0f0f7',
    border: 'none',
    textAlign: 'left',
    fontSize: '15px',
    color: darkMode ? '#fff' : '#1a73e8',
    cursor: 'pointer',
    fontWeight: '600',
    borderLeft: '4px solid #1a73e8',
  }),
  
  navIcon: {
    marginRight: '10px',
  },
  
  logoutButton: (darkMode) => ({
    margin: '10px 20px',
    padding: '10px',
    backgroundColor: darkMode ? '#333' : '#f5f5f7',
    color: darkMode ? '#ff6b6b' : '#d32f2f',
    border: darkMode ? '1px solid #444' : '1px solid #e0e0e0',
    borderRadius: '5px',
    cursor: 'pointer',
    fontWeight: '500',
    transition: 'all 0.2s ease',
  }),
  
  mainContent: (darkMode) => ({
    flex: 1,
    padding: '25px',
    overflowY: 'auto',
    backgroundColor: darkMode ? '#121212' : '#f5f5f7',
  }),
  
  // Loading state
  loading: (darkMode) => ({
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    height: 'calc(100vh - 70px)',
    color: darkMode ? '#e4e6eb' : '#333',
  }),
  
  loadingSpinner: {
    width: '50px',
    height: '50px',
    border: '5px solid rgba(0, 0, 0, 0.1)',
    borderRadius: '50%',
    borderTopColor: '#1a73e8',
    animation: 'spin 1s linear infinite',
    marginBottom: '20px',
  },
  
  // Dialog styles
  dialogOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  
  dialogBox: (darkMode) => ({
    backgroundColor: darkMode ? '#1e1e1e' : '#fff',
    padding: '25px',
    borderRadius: '10px',
    minWidth: '300px',
    maxWidth: '500px',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
    textAlign: 'center',
  }),
  
  dialogMessage: {
    marginBottom: '20px',
    fontSize: '16px',
    lineHeight: 1.5,
  },
  
  dialogButton: (darkMode) => ({
    padding: '10px 25px',
    backgroundColor: '#1a73e8',
    color: '#fff',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontWeight: '500',
    transition: 'all 0.2s ease',
    fontSize: '14px',
  }),
  
  // Overview section
  overviewGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '25px',
  },
  
  overviewCard: (darkMode) => ({
    backgroundColor: darkMode ? '#1e1e1e' : '#fff',
    borderRadius: '10px',
    padding: '20px',
    boxShadow: darkMode ? '0 4px 15px rgba(0, 0, 0, 0.3)' : '0 4px 15px rgba(0, 0, 0, 0.05)',
    display: 'flex',
    flexDirection: 'column',
  }),
  
  cardIcon: (darkMode) => ({
    backgroundColor: darkMode ? '#333' : '#f0f2ff',
    color: darkMode ? '#1a73e8' : '#1a73e8',
    borderRadius: '12px',
    width: '50px',
    height: '50px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: '15px',
  }),
  
  overviewCardTitle: (darkMode) => ({
    fontSize: '18px',
    fontWeight: '600',
    marginBottom: '15px',
    color: darkMode ? '#e4e6eb' : '#333',
  }),
  
  overviewCardContent: {
    flex: 1,
    marginBottom: '20px',
  },
  
  profileImageContainer: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: '15px',
  },
  
  overviewProfileImage: {
    width: '70px',
    height: '70px',
    borderRadius: '50%',
    objectFit: 'cover',
    border: '3px solid #f0f0f0',
  },
  
  overviewAvatar: (darkMode) => ({
    width: '70px',
    height: '70px',
    borderRadius: '50%',
    backgroundColor: darkMode ? '#333' : '#f0f0f0',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    fontSize: '28px',
    fontWeight: 'bold',
    margin: '0 auto 15px',
    color: darkMode ? '#fff' : '#333',
  }),
  
  paidStatus: {
    color: '#4caf50',
    fontWeight: '600',
  },
  
  unpaidStatus: {
    color: '#f44336',
    fontWeight: '600',
  },
  
  viewDetailsButton: (darkMode) => ({
    padding: '10px',
    backgroundColor: darkMode ? '#2d2d2d' : '#f5f5f7',
    color: darkMode ? '#1a73e8' : '#1a73e8',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontWeight: '500',
    transition: 'all 0.2s ease',
  }),
  
  todayMenuOverview: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
  },
  
  mealRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
  },
  
  mealIcon: (darkMode) => ({
    backgroundColor: darkMode ? '#333' : '#f0f2ff',
    borderRadius: '50%',
    width: '40px',
    height: '40px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    fontSize: '20px',
  }),
  
  mealInfo: {
    flex: 1,
  },
  
  mealTitle: (darkMode) => ({
    margin: '0 0 5px',
    fontSize: '16px',
    fontWeight: '600',
    color: darkMode ? '#e4e6eb' : '#333',
  }),
  
  mealTime: {
    fontSize: '12px',
    color: '#888',
    display: 'block',
    marginTop: '5px',
  },
  
  feeStatusBox: (isPaid) => ({
    backgroundColor: isPaid ? 'rgba(76, 175, 80, 0.1)' : 'rgba(244, 67, 54, 0.1)',
    padding: '15px',
    borderRadius: '8px',
    border: `1px solid ${isPaid ? 'rgba(76, 175, 80, 0.3)' : 'rgba(244, 67, 54, 0.3)'}`,
    textAlign: 'center',
  }),
  
  feeStatusIcon: (isPaid) => ({
    backgroundColor: isPaid ? '#4caf50' : '#f44336',
    color: '#fff',
    width: '30px',
    height: '30px',
    borderRadius: '50%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    fontSize: '16px',
    fontWeight: 'bold',
    margin: '0 auto 10px',
  }),
  
  feePaidText: {
    color: '#4caf50',
    fontWeight: '500',
  },
  
  feeAmountText: {
    fontSize: '18px',
    fontWeight: '600',
    margin: '10px 0',
  },
  
  feeWarningText: {
    color: '#f44336',
    fontSize: '14px',
    margin: '10px 0',
  },
  
  payNowButton: (darkMode) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '8px 15px',
    backgroundColor: '#4caf50',
    color: '#fff',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontWeight: '500',
    margin: '10px auto 0',
    transition: 'all 0.2s ease',
  }),
  
  quickComplaintTextarea: (darkMode) => ({
    width: '100%',
    padding: '10px',
    borderRadius: '5px',
    border: darkMode ? '1px solid #444' : '1px solid #ddd',
    backgroundColor: darkMode ? '#333' : '#fff',
    color: darkMode ? '#e4e6eb' : '#333',
    fontSize: '14px',
    resize: 'vertical',
    marginBottom: '10px',
  }),
  
  submitButton: (darkMode) => ({
    flex: 1,
    padding: '10px',
    backgroundColor: '#1a73e8',
    color: '#fff',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontWeight: '500',
    transition: 'all 0.2s ease',
  }),
  
  viewHistoryButton: (darkMode) => ({
    flex: 1,
    padding: '10px',
    backgroundColor: darkMode ? '#2d2d2d' : '#f5f5f7',
    color: darkMode ? '#1a73e8' : '#1a73e8',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontWeight: '500',
    transition: 'all 0.2s ease',
  }),
  
  // Section styles
  sectionContainer: {
    marginBottom: '30px',
  },
  
  sectionHeader: (darkMode) => ({
    display: 'flex',
    alignItems: 'center',
    marginBottom: '20px',
    padding: '0 0 10px',
    borderBottom: darkMode ? '1px solid #333' : '1px solid #e0e0e0',
  }),
  
  sectionTitle: {
    fontSize: '22px',
    fontWeight: '600',
    margin: 0,
  },
  
  // Profile section styles
  profileCard: (darkMode) => ({
    backgroundColor: darkMode ? '#1e1e1e' : '#fff',
    borderRadius: '10px',
    overflow: 'hidden',
    boxShadow: darkMode ? '0 4px 15px rgba(0, 0, 0, 0.3)' : '0 4px 15px rgba(0, 0, 0, 0.05)',
  }),
  
  profileHeader: (darkMode) => ({
    backgroundColor: darkMode ? '#2d2d2d' : '#f5f5f7',
    padding: '25px',
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
  }),
  
  profileImage: {
    width: '100px',
    height: '100px',
    borderRadius: '50%',
    objectFit: 'cover',
    border: '4px solid #fff',
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
  },
  
  profileAvatar: (darkMode) => ({
    width: '100px',
    height: '100px',
    borderRadius: '50%',
    backgroundColor: darkMode ? '#333' : '#e0e0e0',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    fontSize: '40px',
    fontWeight: 'bold',
    color: darkMode ? '#e4e6eb' : '#555',
    border: '4px solid #fff',
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
  }),
  
  profileHeaderInfo: {
    flex: 1,
  },
  
  profileName: {
    fontSize: '24px',
    fontWeight: '600',
    margin: '0 0 5px',
  },
  
  profileId: {
    fontSize: '14px',
    color: '#888',
    margin: 0,
  },
  
  profileDetails: {
    padding: '25px',
  },
  
  profileDetailRow: (darkMode) => ({
    display: 'grid',
    gridTemplateColumns: '40px 150px 1fr',
    alignItems: 'center',
    padding: '12px 0',
    borderBottom: darkMode ? '1px solid #333' : '1px solid #f0f0f0',
  }),
  
  detailIcon: {
    fontSize: '24px',
    marginRight: '15px',
  },
  
  detailLabel: {
    fontWeight: '500',
    marginRight: '15px',
  },
  
  detailValue: {
    color: '#888',
  },
  
  paymentSection: (darkMode) => ({
    padding: '25px',
    backgroundColor: darkMode ? '#2d2d2d' : '#f9f9f9',
    borderTop: darkMode ? '1px solid #333' : '1px solid #e0e0e0',
  }),
  
  paymentTitle: {
    fontSize: '18px',
    fontWeight: '600',
    marginTop: 0,
    marginBottom: '20px',
  },
  
  feeStatusContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: '25px',
  },
  
  feeStatusIndicator: (isPaid) => ({
    backgroundColor: isPaid ? '#4caf50' : '#f44336',
    color: '#fff',
    padding: '5px 15px',
    borderRadius: '20px',
    fontWeight: '600',
    fontSize: '14px',
    marginBottom: '15px',
  }),
  
  paymentCompleteInfo: {
    color: '#4caf50',
    textAlign: 'center',
    fontWeight: '500',
  },
  
  paymentInfo: {
    textAlign: 'center',
    marginBottom: '10px',
  },
  
  dueAmount: {
    fontWeight: '600',
    color: '#f44336',
  },
  
  paymentDeadline: {
    color: '#888',
    fontSize: '14px',
    textAlign: 'center',
    marginBottom: '15px',
  },
  
  paymentButton: (darkMode) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '10px 20px',
    backgroundColor: '#4caf50',
    color: '#fff',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontWeight: '500',
    transition: 'all 0.2s ease',
  }),
  
  paymentHistorySection: {
    marginTop: '20px',
  },
  
  paymentHistoryTitle: {
    fontSize: '16px',
    fontWeight: '600',
    marginBottom: '15px',
  },
  
  transactionItem: (darkMode) => ({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 15px',
    borderRadius: '8px',
    backgroundColor: darkMode ? '#1e1e1e' : '#fff',
    boxShadow: '0 2px 5px rgba(0, 0, 0, 0.05)',
    marginBottom: '10px',
  }),
  
  transactionDetails: {
    display: 'flex',
    flexDirection: 'column',
  },
  
  transactionName: {
    fontWeight: '500',
    marginBottom: '5px',
  },
  
  transactionDate: {
    fontSize: '12px',
    color: '#888',
  },
  
  transactionAmount: (isPositive) => ({
    color: isPositive ? '#4caf50' : '#f44336',
    fontWeight: '600',
  }),
  
  noTransactionsMessage: {
    textAlign: 'center',
    padding: '15px',
    color: '#888',
    fontStyle: 'italic',
  },
  
  // Mess menu styles
  messMenuContainer: (darkMode) => ({
    backgroundColor: darkMode ? '#1e1e1e' : '#fff',
    borderRadius: '10px',
    overflow: 'hidden',
    boxShadow: darkMode ? '0 4px 15px rgba(0, 0, 0, 0.3)' : '0 4px 15px rgba(0, 0, 0, 0.05)',
    padding: '25px',
  }),
  
  weeklyMenu: {
    display: 'flex',
    flexDirection: 'column',
    gap: '25px',
  },
  
  todayMenuCard: (darkMode) => ({
    backgroundColor: darkMode ? '#2d2d2d' : '#f0f7ff',
    borderRadius: '10px',
    border: '2px solid #1a73e8',
    padding: '20px',
    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.05)',
  }),
  
  menuCard: (darkMode) => ({
    backgroundColor: darkMode ? '#2d2d2d' : '#fff',
    borderRadius: '10px',
    border: darkMode ? '1px solid #333' : '1px solid #e0e0e0',
    padding: '20px',
  }),
  
  menuDayHeader: (darkMode, isToday) => ({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '15px',
    padding: '0 0 10px',
    borderBottom: darkMode ? '1px solid #333' : '1px solid #e0e0e0',
  }),
  
  dayName: {
    fontSize: '18px',
    fontWeight: '600',
  },
  
  todayBadge: {
    backgroundColor: '#1a73e8',
    color: '#fff',
    padding: '3px 10px',
    borderRadius: '15px',
    fontSize: '12px',
    fontWeight: '600',
  },
  
  mealGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '20px',
  },
  
  mealCard: (darkMode) => ({
    backgroundColor: darkMode ? '#1e1e1e' : '#fff',
    padding: '15px',
    borderRadius: '8px',
    boxShadow: '0 2px 5px rgba(0, 0, 0, 0.05)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
  }),
  
  mealItems: {
    margin: '10px 0',
    lineHeight: 1.5,
  },
  
  noMenuMessage: (darkMode) => ({
    textAlign: 'center',
    padding: '40px 20px',
    color: darkMode ? '#b0b3b8' : '#666',
  }),
  
  noMenuIcon: {
    fontSize: '40px',
    marginBottom: '15px',
  },
  
  // Notices styles
  noticeBoardContainer: (darkMode) => ({
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '25px',
    padding: '10px',
  }),
  
  noticeCard: (darkMode, colorIndex) => {
    const colors = [
      { bg: darkMode ? '#2d2d2d' : '#f0f7ff', border: '#1a73e8' },
      { bg: darkMode ? '#2d2d2d' : '#fff9e6', border: '#ffc107' },
      { bg: darkMode ? '#2d2d2d' : '#e8f5e9', border: '#4caf50' },
      { bg: darkMode ? '#2d2d2d' : '#ffebee', border: '#f44336' }
    ];
    
    return {
      backgroundColor: colors[colorIndex].bg,
      borderRadius: '10px',
      boxShadow: '0 4px 15px rgba(0, 0, 0, 0.05)',
      padding: '25px',
      border: `1px solid ${colors[colorIndex].border}`,
      position: 'relative',
    };
  },
  
  noticePushpin: {
    width: '15px',
    height: '15px',
    backgroundColor: '#e74c3c',
    borderRadius: '50%',
    position: 'absolute',
    top: '15px',
    right: '15px',
    boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)',
  },
  
  noticeTitle: (darkMode) => ({
    fontSize: '18px',
    fontWeight: '600',
    marginTop: 0,
    marginBottom: '15px',
    color: darkMode ? '#e4e6eb' : '#333',
  }),
  
  noticeContent: (darkMode) => ({
    fontSize: '14px',
    lineHeight: 1.6,
    marginBottom: '20px',
    color: darkMode ? '#b0b3b8' : '#666',
  }),
  
  noticeFooter: (darkMode) => ({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '15px',
    paddingTop: '15px',
    borderTop: darkMode ? '1px solid #333' : '1px solid #e0e0e0',
    fontSize: '12px',
    color: '#888',
  }),
  complaintsHistoryContainer: (darkMode) => ({
  padding: '20px',
  backgroundColor: darkMode ? '#1e1e1e' : '#fff',
  borderRadius: '10px',
  boxShadow: darkMode
    ? '0 4px 15px rgba(0, 0, 0, 0.3)'
    : '0 4px 15px rgba(0, 0, 0, 0.1)',
}),

  noticeDate: {
    fontWeight: '500',
  },
  
  noticeAuthor: {
    fontStyle: 'italic',
  },
  tableHeader: (darkMode) => ({
    display: 'flex',
    backgroundColor: darkMode ? '#2d2d2d' : '#f0f0f0',
    color: darkMode ? '#fff' : '#000',
    fontWeight: '600',
    padding: '10px 0',
    borderBottom: darkMode ? '1px solid #444' : '1px solid #ccc',
  }),
  
  noNoticesMessage: (darkMode) => ({
    textAlign: 'center',
    padding: '40px 20px',
    color: darkMode ? '#b0b3b8' : '#666',
    backgroundColor: darkMode ? '#1e1e1e' : '#fff',
    borderRadius: '10px',
    boxShadow: darkMode ? '0 4px 15px rgba(0, 0, 0, 0.3)' : '0 4px 15px rgba(0, 0, 0, 0.05)',
  }),
  
  // Submit complaint styles
  complaintForm: (darkMode) => ({
    backgroundColor: darkMode ? '#1e1e1e' : '#fff',
    borderRadius: '10px',
    padding: '25px',
    boxShadow: darkMode ? '0 4px 15px rgba(0, 0, 0, 0.3)' : '0 4px 15px rgba(0, 0, 0, 0.05)',
  }),
  
  formGroup: {
    marginBottom: '20px',
  },
  
  formLabel: (darkMode) => ({
    display: 'block',
    marginBottom: '8px',
    fontWeight: '500',
    color: darkMode ? '#e4e6eb' : '#333',
  }),
  
  formInput: (darkMode) => ({
    width: '100%',
    padding: '12px',
    borderRadius: '5px',
    border: darkMode ? '1px solid #444' : '1px solid #ddd',
    backgroundColor: darkMode ? '#333' : '#fff',
    color: darkMode ? '#e4e6eb' : '#333',
    fontSize: '14px',
    transition: 'all 0.2s ease',
  }),
  
  formSelect: (darkMode) => ({
    width: '100%',
    padding: '12px',
    borderRadius: '5px',
    border: darkMode ? '1px solid #444' : '1px solid #ddd',
    backgroundColor: darkMode ? '#333' : '#fff',
    color: darkMode ? '#e4e6eb' : '#333',
    fontSize: '14px',
    cursor: 'pointer',
  }),
  
  formTextarea: (darkMode) => ({
    width: '100%',
    padding: '12px',
    borderRadius: '5px',
    border: darkMode ? '1px solid #444' : '1px solid #ddd',
    backgroundColor: darkMode ? '#333' : '#fff',
    color: darkMode ? '#e4e6eb' : '#333',
    fontSize: '14px',
    resize: 'vertical',
    minHeight: '150px',
  }),
  
  formSubmitButton: (darkMode) => ({
    display: 'inline-block',
    padding: '12px 25px',
    backgroundColor: '#1a73e8',
    color: '#fff',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontWeight: '500',
    transition: 'all 0.2s ease',
    fontSize: '16px',
  }),
  
  formResetButton: (darkMode) => ({
    display: 'inline-block',
    padding: '12px 25px',
    backgroundColor: darkMode ? '#333' : '#f5f5f7',
    color: darkMode ? '#e4e6eb' : '#666',
    border: darkMode ? '1px solid #444' : '1px solid #ddd',
    borderRadius: '5px',
    cursor: 'pointer',
    fontWeight: '500',
    transition: 'all 0.2s ease',
    marginRight: '15px',
    fontSize: '16px',
  }),
  
  formActionButtons: {
    display: 'flex',
    justifyContent: 'flex-end',
    marginTop: '25px',
  },
  
  // Complaint history styles
  filterBar: (darkMode) => ({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: darkMode ? '#1e1e1e' : '#fff',
    borderRadius: '10px',
    padding: '15px 20px',
    marginBottom: '25px',
    boxShadow: darkMode ? '0 4px 15px rgba(0, 0, 0, 0.3)' : '0 4px 15px rgba(0, 0, 0, 0.05)',
  }),
  
  filterSelect: (darkMode) => ({
    padding: '8px 15px',
    borderRadius: '5px',
    border: darkMode ? '1px solid #444' : '1px solid #ddd',
    backgroundColor: darkMode ? '#333' : '#fff',
    color: darkMode ? '#e4e6eb' : '#333',
    fontSize: '14px',
    cursor: 'pointer',
    marginRight: '15px',
  }),
  
  searchInput: (darkMode) => ({
    padding: '8px 15px',
    borderRadius: '5px',
    border: darkMode ? '1px solid #444' : '1px solid #ddd',
    backgroundColor: darkMode ? '#333' : '#fff',
    color: darkMode ? '#e4e6eb' : '#333',
    fontSize: '14px',
    width: '250px',
  }),
  
  complaintList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  
  complaintCard: (darkMode) => ({
    backgroundColor: darkMode ? '#1e1e1e' : '#fff',
    borderRadius: '10px',
    boxShadow: darkMode ? '0 4px 15px rgba(0, 0, 0, 0.3)' : '0 4px 15px rgba(0, 0, 0, 0.05)',
    overflow: 'hidden',
  }),
  
  complaintHeader: (darkMode, status) => {
    const statusColors = {
      'pending': { bg: darkMode ? '#392e15' : '#fff9e6', text: '#ffc107' },
      'in-progress': { bg: darkMode ? '#142d4c' : '#e3f2fd', text: '#1a73e8' },
      'resolved': { bg: darkMode ? '#1b3a29' : '#e8f5e9', text: '#4caf50' },
      'rejected': { bg: darkMode ? '#3d2129' : '#ffebee', text: '#f44336' },
    };
    
    return {
      backgroundColor: statusColors[status].bg,
      padding: '15px 20px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderBottom: darkMode ? '1px solid #333' : '1px solid #e0e0e0',
    };
  },
  
  complaintTitle: (darkMode) => ({
    fontSize: '16px',
    fontWeight: '600',
    margin: 0,
    color: darkMode ? '#e4e6eb' : '#333',
  }),
  
  complaintStatusBadge: (status) => {
    const statusColors = {
      'pending': { bg: '#ffc107', text: '#000' },
      'in-progress': { bg: '#1a73e8', text: '#fff' },
      'resolved': { bg: '#4caf50', text: '#fff' },
      'rejected': { bg: '#f44336', text: '#fff' },
    };
    
    return {
      backgroundColor: statusColors[status].bg,
      color: statusColors[status].text,
      padding: '5px 12px',
      borderRadius: '15px',
      fontSize: '12px',
      fontWeight: '600',
    };
  },
  
  complaintBody: {
    padding: '20px',
  },
  
  complaintType: (darkMode) => ({
    display: 'inline-block',
    padding: '3px 12px',
    borderRadius: '15px',
    backgroundColor: darkMode ? '#333' : '#f0f0f0',
    color: darkMode ? '#b0b3b8' : '#666',
    fontSize: '12px',
    fontWeight: '500',
    marginBottom: '15px',
  }),
  
  complaintText: (darkMode) => ({
    fontSize: '14px',
    lineHeight: 1.6,
    marginBottom: '20px',
    color: darkMode ? '#b0b3b8' : '#666',
  }),
  
  complaintFooter: (darkMode) => ({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '15px 20px',
    borderTop: darkMode ? '1px solid #333' : '1px solid #e0e0e0',
    backgroundColor: darkMode ? '#2d2d2d' : '#f9f9f9',
  }),
  
  complaintMetadata: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
    color: '#888',
    fontSize: '12px',
  },
  
  complaintId: {
    fontWeight: '500',
  },
  
  complaintDate: {
    fontStyle: 'italic',
  },
  
  responseSection: (darkMode) => ({
    marginTop: '15px',
    padding: '15px',
    backgroundColor: darkMode ? '#2d2d2d' : '#f9f9f9',
    borderRadius: '8px',
    borderLeft: '3px solid #1a73e8',
  }),
  
  responseText: (darkMode) => ({
    fontSize: '14px',
    lineHeight: 1.6,
    color: darkMode ? '#b0b3b8' : '#666',
    marginBottom: '10px',
  }),
  
  responseText: (darkMode) => ({
    fontSize: '14px',
    lineHeight: 1.6,
    color: darkMode ? '#b0b3b8' : '#666',
    marginBottom: '10px',
  }),
  
  responderInfo: {
    display: 'flex',
    justifyContent: 'flex-end',
    fontSize: '12px',
    fontStyle: 'italic',
    color: '#888',
  },
  
  noComplaintsMessage: (darkMode) => ({
    textAlign: 'center',
    padding: '40px 20px',
    color: darkMode ? '#b0b3b8' : '#666',
    backgroundColor: darkMode ? '#1e1e1e' : '#fff',
    borderRadius: '10px',
    boxShadow: darkMode ? '0 4px 15px rgba(0, 0, 0, 0.3)' : '0 4px 15px rgba(0, 0, 0, 0.05)',
  }),
  complaintForm: (darkMode) => ({
    backgroundColor: darkMode ? '#1e1e1e' : '#fff',
    borderRadius: '10px',
    padding: '25px',
    boxShadow: darkMode ? '0 4px 15px rgba(0, 0, 0, 0.3)' : '0 4px 15px rgba(0, 0, 0, 0.05)',
  }),
  submitNewButton: (darkMode) => ({
    padding: '10px 20px',
    backgroundColor: '#1a73e8',
    color: '#fff',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontWeight: '500',
    transition: 'all 0.2s ease',
    display: 'inline-block',
    marginTop: '15px',
  }),
  
  complaintInstructions: (darkMode) => ({
    marginBottom: '15px',
    fontSize: '14px',
    lineHeight: 1.5,
    color: darkMode ? '#ccc' : '#555',
  }),
  
  complaintTextarea: (darkMode) => ({
    width: '100%',
    padding: '12px',
    borderRadius: '5px',
    border: darkMode ? '1px solid #444' : '1px solid #ccc',
    backgroundColor: darkMode ? '#2c2c2c' : '#fff',
    color: darkMode ? '#e4e6eb' : '#333',
    fontSize: '14px',
    resize: 'vertical',
  }),
  
  submitComplaintButton: (darkMode) => ({
    padding: '10px 20px',
    backgroundColor: '#1a73e8',
    color: '#fff',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontWeight: '500',
    display: 'flex',
    alignItems: 'center',
    transition: 'all 0.2s ease',
  }),
  
  viewComplaintsButton: (darkMode) => ({
    padding: '10px 20px',
    backgroundColor: darkMode ? '#2d2d2d' : '#f0f0f0',
    color: darkMode ? '#1a73e8' : '#1a73e8',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontWeight: '500',
    display: 'flex',
    alignItems: 'center',
    transition: 'all 0.2s ease',
  }),
  
  tableHeaderCell: ({ width }) => ({
    width: width || 'auto',
    padding: '10px',
    fontSize: '14px',
  }),
  tableRow: (darkMode) => ({
    display: 'flex',
    padding: '12px 10px',
    borderBottom: darkMode ? '1px solid #333' : '1px solid #e0e0e0',
    '&:hover': {
      backgroundColor: darkMode ? '#2d2d2d' : '#f9f9f9',
    },
  }),
  
  tableCell: ({ width }) => ({
    width: width || 'auto',
    padding: '10px',
    fontSize: '14px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  }),
  
  statusCell: (darkMode, status) => {
    const statusColors = {
      'pending': { bg: darkMode ? '#392e15' : '#fff9e6', text: '#ffc107' },
      'in-progress': { bg: darkMode ? '#142d4c' : '#e3f2fd', text: '#1a73e8' },
      'resolved': { bg: darkMode ? '#1b3a29' : '#e8f5e9', text: '#4caf50' },
      'rejected': { bg: darkMode ? '#3d2129' : '#ffebee', text: '#f44336' },
    };
    
    return {
      backgroundColor: statusColors[status]?.bg || (darkMode ? '#333' : '#f0f0f0'),
      color: statusColors[status]?.text || (darkMode ? '#fff' : '#333'),
      padding: '5px 10px',
      borderRadius: '15px',
      fontSize: '12px',
      fontWeight: '500',
      textAlign: 'center',
    };
  },
  
  deleteButton: (darkMode) => ({
    backgroundColor: 'transparent',
    color: darkMode ? '#ff6b6b' : '#f44336',
    border: 'none',
    cursor: 'pointer',
    padding: '5px',
    borderRadius: '4px',
    '&:hover': {
      backgroundColor: darkMode ? '#3d2129' : '#ffebee',
    },
  }),
  
  pagination: (darkMode) => ({
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: '25px',
    gap: '10px',
  }),
  
  pageButton: (darkMode, isActive) => ({
    width: '40px',
    height: '40px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: isActive ? '#1a73e8' : (darkMode ? '#2d2d2d' : '#fff'),
    color: isActive ? '#fff' : (darkMode ? '#e4e6eb' : '#333'),
    border: darkMode ? '1px solid #444' : '1px solid #ddd',
    borderRadius: '5px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  }),
  
  pageNavigationButton: (darkMode) => ({
    width: '40px',
    height: '40px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: darkMode ? '#2d2d2d' : '#fff',
    color: darkMode ? '#e4e6eb' : '#333',
    border: darkMode ? '1px solid #444' : '1px solid #ddd',
    borderRadius: '5px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  }),
  
  disabledPageButton: (darkMode) => ({
    width: '40px',
    height: '40px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: darkMode ? '#1e1e1e' : '#f5f5f7',
    color: '#888',
    border: darkMode ? '1px solid #333' : '1px solid #ddd',
    borderRadius: '5px',
    cursor: 'not-allowed',
    opacity: 0.5,
  }),
  // Add these to your styles object
washingSlotCard: (darkMode) => ({
  backgroundColor: darkMode ? '#2d2d2d' : '#fff',
  borderRadius: '10px',
  padding: '20px',
  boxShadow: darkMode ? '0 4px 15px rgba(0, 0, 0, 0.3)' : '0 4px 15px rgba(0, 0, 0, 0.1)',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  border: darkMode ? '1px solid #444' : '1px solid #e0e0e0',
  textAlign: 'center',
}),

washingSlotDay: {
  fontSize: '18px',
  fontWeight: '600',
  marginBottom: '5px',
  color: '#1a73e8',
},

washingSlotTime: {
  fontSize: '16px',
  marginBottom: '15px',
},

bookButton: (darkMode) => ({
  padding: '8px 15px',
  backgroundColor: '#1a73e8',
  color: '#fff',
  border: 'none',
  borderRadius: '5px',
  cursor: 'pointer',
  fontWeight: '500',
  transition: 'all 0.2s ease',
}),

washingDetailCard: (darkMode) => ({
  backgroundColor: darkMode ? '#1e1e1e' : '#f5f5f7',
  borderRadius: '8px',
  padding: '15px',
  boxShadow: '0 2px 5px rgba(0, 0, 0, 0.05)',
}),

washingDetailLabel: {
  fontSize: '12px',
  color: '#888',
  marginBottom: '5px',
},

washingDetailValue: {
  fontSize: '16px',
  fontWeight: '500',
}
};


export default StudentDashboard;