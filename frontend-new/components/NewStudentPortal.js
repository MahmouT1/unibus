import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import LanguageSwitcher from './LanguageSwitcher';
import './NewStudentPortal.css';

function NewStudentPortal() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const { user, student, logout } = useAuth();
  const { t, isRTL } = useLanguage();

  // Get the display name and other user info
  const displayName = student?.fullName || user?.email?.split('@')[0] || 'Student';
  const userYear = student?.grade || 'N/A';
  const firstName = displayName.split(' ')[0];

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleNavigation = (path) => {
    navigate(path);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="new-student-portal">
      {/* Hamburger Menu Icon */}
      <div className="hamburger-menu" onClick={toggleSidebar}>
        <div className="hamburger-line"></div>
        <div className="hamburger-line"></div>
        <div className="hamburger-line"></div>
      </div>

      {/* Sidebar */}
      <aside 
        className={`sidebar ${isSidebarOpen ? 'open' : ''}`}
        style={{
          position: 'fixed',
          top: 0,
          left: isSidebarOpen ? '0' : '-300px',
          width: '300px',
          height: '100vh',
          background: 'linear-gradient(180deg, #8B5CF6 0%, #6D28D9 100%)',
          zIndex: 1001,
          transition: 'left 0.3s ease',
          boxShadow: '4px 0 20px rgba(0, 0, 0, 0.2)',
          overflowY: 'auto',
          border: '3px solid red'
        }}
      >
        <div className="sidebar-header">
          <h3>{t('studentPortal')}</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <LanguageSwitcher variant="compact" />
            <button className="close-sidebar" onClick={toggleSidebar}>
              ×
            </button>
          </div>
        </div>
        <nav className="sidebar-nav">
          <button className="sidebar-nav-item" onClick={() => handleNavigation('/transportation')}>
            <img 
              src={process.env.PUBLIC_URL + "/icons8-location-100.png"} 
              alt={t('transportation')}
              className="sidebar-nav-icon"
            />
            <span>{t('transportation')}</span>
          </button>
          <button className="sidebar-nav-item">
            <img 
              src={process.env.PUBLIC_URL + "/icons8-notebook-100.png"} 
              alt={t('attendance')}
              className="sidebar-nav-icon"
            />
            <span>{t('attendance')}</span>
          </button>
          <button className="sidebar-nav-item">
            <img 
              src={process.env.PUBLIC_URL + "/icons8-rocket-96.png"} 
              alt={t('subscription')}
              className="sidebar-nav-icon"
            />
            <span>{t('subscription')}</span>
          </button>
          <button className="sidebar-nav-item">
            <img 
              src={process.env.PUBLIC_URL + "/icons8-headphones-100.png"} 
              alt={t('support')}
              className="sidebar-nav-icon"
            />
            <span>{t('support')}</span>
          </button>
          <button className="sidebar-nav-item logout" onClick={handleLogout}>
            <img 
              src={process.env.PUBLIC_URL + "/icons8-credit-card-100.png"} 
              alt={t('logout')}
              className="sidebar-nav-icon"
            />
            <span>{t('logout')}</span>
          </button>
        </nav>
      </aside>

      {/* Overlay */}
      {isSidebarOpen && <div className="sidebar-overlay" onClick={toggleSidebar}></div>}

      {/* Main Content */}
      <main className="main-content">
        {/* Top Bar */}
        <div className="top-bar">
          <input type="search" placeholder={t('search')} className="search-input" />
          <div className="user-info">
            <div className="user-details">
              <span className="user-name">{displayName}</span>
              <span className="user-year">{userYear}</span>
            </div>
            <img
              src={student?.profilePhoto ? 
                `http://localhost:5000${student.profilePhoto}` : 
                process.env.PUBLIC_URL + "/profile.png.png"
              }
              alt={t('profile')}
              className="profile-pic"
            />
            <button className="notification-button">
              <img
                src={process.env.PUBLIC_URL + "/icons8-notification-48.png"}
                alt="Notifications"
                className="notification-icon"
              />
            </button>
          </div>
        </div>

        {/* Welcome Banner */}
        <section className="welcome-banner">
          <div className="welcome-text">
            <p className="date-text">{new Date().toLocaleDateString(isRTL ? 'ar-SA' : 'en-US', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}</p>
            <h2 className="welcome-title">{t('welcomeStudent')}, {firstName}!</h2>
            <p>Always stay updated in your student portal</p>
          </div>
          
          <div className="sponsor-section">
            <img
              src={process.env.PUBLIC_URL + "/uni-bus-logo.png.jpg"}
              alt="Uni Bus"
              className="uni-bus-logo"
            />
            <p className="sponsor-text">sponsored by : Uni Bus</p>
          </div>
        </section>

        {/* Finance Section */}
        <section className="finance-section">
          <h3>Category</h3>
          <div className="finance-cards">
            <div className="finance-card" onClick={() => handleNavigation('/registration')}>
              <img
                src={process.env.PUBLIC_URL + "/icons8-notebook-100.png"}
                alt={t('attendance')}
                className="finance-icon"
              />
              <span>{t('attendance')}</span>
            </div>
            <div className="finance-card" onClick={() => handleNavigation('/subscription')}>
              <img
                src={process.env.PUBLIC_URL + "/icons8-rocket-96.png"}
                alt={t('subscription')}
                className="finance-icon"
              />
              <span>{t('subscription')}</span>
            </div>
            <div className="finance-card" onClick={() => handleNavigation('/transportation')}>
              <img
                src={process.env.PUBLIC_URL + "/icons8-location-100.png"}
                alt={t('transportation')}
                className="finance-icon"
              />
              <span>{t('transportation')}</span>
            </div>
            <div className="finance-card" onClick={() => handleNavigation('/support')}>
              <img
                src={process.env.PUBLIC_URL + "/icons8-headphones-100.png"}
                alt={t('support')}
                className="finance-icon"
              />
              <span>{t('support')}</span>
            </div>
          </div>
        </section>

        {/* Daily Notice */}
        <section className="daily-notice">
          <div className="notice-header">
            <h4>Daily notice</h4>
            <button className="see-all-link">See all</button>
          </div>
          <div className="notice-content">
            <div className="notice-item">
              <p className="notice-title">Prelim payment due</p>
              <p>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit.
              </p>
              <button className="notice-link">See more</button>
            </div>
            <div className="notice-item">
              <p className="notice-title">Exam schedule</p>
              <p>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc
                vulputate libero et velit interdum, ac aliquet odio mattis.
              </p>
              <button className="notice-link">See more</button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default NewStudentPortal;
