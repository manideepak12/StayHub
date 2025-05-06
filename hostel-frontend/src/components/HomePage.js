import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { color } from 'framer-motion';

function HomePage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div style={styles.loader}>
        <DotLottieReact
          src="https://lottie.host/24368446-4185-471e-aecc-11e3713c38ba/x0GhGbw8lZ.lottie"
          loop
          autoplay
          style={{ width: '300px', height: '300px' }}
        />
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.heroSection}>
        <div style={styles.overlay}></div>
        <div style={styles.contentContainer}>
          <div style={styles.headerSection}>
            <div style={styles.logo}>
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                <polyline points="9 22 9 12 15 12 15 22"></polyline>
              </svg>
              <h1 style={styles.logoText}>StayHub</h1>
            </div>
          </div>
          
          <div style={styles.heroContent}>
            <h1 style={styles.title}>Your Ultimate Hostel Management System</h1>
            <p style={styles.subtitle}>Simplified management for administrators and seamless experience for students</p>
            
            <div style={styles.cardContainer}>
              <div style={styles.card} onClick={() => navigate('/admin-login')} className="hover-card">
                <div style={styles.cardIcon}>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                </div>
                <div style={styles.cardContent}>
                  <h2 style={styles.cardTitle}>Administrator</h2>
                  <p style={styles.cardDescription}>Manage students, rooms, and facilities</p>
                </div>
                <div style={styles.cardArrow}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14"></path>
                    <path d="M12 5l7 7-7 7"></path>
                  </svg>
                </div>
              </div>
              
              <div style={styles.card} onClick={() => navigate('/student-login')} className="hover-card">
                <div style={{...styles.cardIcon, backgroundColor: '#10b981'}}>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"></path>
                  </svg>
                </div>
                <div style={styles.cardContent}>
                  <h2 style={styles.cardTitle}>Student</h2>
                  <p style={styles.cardDescription}>Check room details, payments, and announcements</p>
                </div>
                <div style={{...styles.cardArrow, backgroundColor: '#10b981'}}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14"></path>
                    <path d="M12 5l7 7-7 7"></path>
                  </svg>
                </div>
              </div>
            </div>
          </div>
          
          <div style={styles.featuresSection}>
            <div style={styles.feature}>
              <div style={styles.featureIcon}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0ea5e9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="3" y1="9" x2="21" y2="9"></line>
                  <line x1="9" y1="21" x2="9" y2="9"></line>
                </svg>
              </div>
              <p style={styles.featureText}>Room Management</p>
            </div>
            
            <div style={styles.feature}>
              <div style={styles.featureIcon}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0ea5e9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="1" x2="12" y2="23"></line>
                  <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                </svg>
              </div>
              <p style={styles.featureText}>Fee Tracking</p>
            </div>
            
            <div style={styles.feature}>
              <div style={styles.featureIcon}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0ea5e9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                  <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                </svg>
              </div>
              <p style={styles.featureText}>Notifications</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Hover CSS */}
      <style>
        {`
          .hover-card {
            transition: all 0.3s ease;
            cursor: pointer;
          }
          .hover-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
          }
        `}
      </style>
    </div>
  );
}

const styles = {
  loader: {
    height: '100vh',
    backgroundColor: '#111827',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  container: {
    minHeight: '100vh',
    width: '100%',
    fontFamily: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, sans-serif',
  },
  heroSection: {
    position: 'relative',
    height: '100vh',
    backgroundImage: 'url("https://images.unsplash.com/photo-1554118811-1e0d58224f24?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80")',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    color: 'white',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(17, 24, 39, 0.85)',
    zIndex: 1,
  },
  contentContainer: {
    position: 'relative',
    zIndex: 2,
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 24px',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
  },
  headerSection: {
    padding: '24px 0',
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  logoText: {
    fontSize: '24px',
    fontWeight: 'bold',
    margin: 0,
  },
  heroContent: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
    paddingBottom: '80px',
  },
  title: {
    fontSize: '42px',
    fontWeight: 'bold',
    marginBottom: '16px',
    maxWidth: '700px',
  },
  subtitle: {
    fontSize: '18px',
    color: '#e2e8f0',
    marginBottom: '40px',
    maxWidth: '600px',
  },
  cardContainer: {
    display: 'flex',
    gap: '24px',
    width: '100%',
    maxWidth: '900px',
    margin: '0 auto',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  card: {
    backgroundColor: '#1f2937',
    borderRadius: '16px',
    padding: '24px',
    display: 'flex',
    alignItems: 'center',
    width: '400px',
    maxWidth: '100%',
    position: 'relative',
    overflow: 'hidden',
    border: '1px solid rgba(255, 255, 255, 0.1)',
  },
  cardIcon: {
    backgroundColor: '#0ea5e9',
    width: '64px',
    height: '64px',
    borderRadius: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    marginRight: '20px',
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: '24px',
    fontWeight: 'bold',
    marginBottom: '6px',
    marginTop: 0,
  },
  cardDescription: {
    fontSize: '14px',
    color: '#d1d5db',
    margin: 0,
  },
  cardArrow: {
    backgroundColor: '#0ea5e9',
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: '16px',
  },
  featuresSection: {
    display: 'flex',
    justifyContent: 'center',
    gap: '32px',
    marginTop: '64px',
    flexWrap: 'wrap',
    color: 'violet'
  },
  feature: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  featureIcon: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    width: '44px',
    height: '44px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureText: {
    margin: 0,
    fontSize: '16px',
    fontWeight: '500',
  },
};

export default HomePage;