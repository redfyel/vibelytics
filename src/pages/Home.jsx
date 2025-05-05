// src/pages/Home.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import Header from '../components/Header';
import Sidebar from '../components/SideBar';
import BottomControls from '../components/BottomControls';
import CenterPanel from '../components/CentralPanel';
import NowPlaying from '../components/NowPlaying';
import { getUserProfile } from '../services/spotifyService';
import '../styles/homeLayout.css';

// --- Constants ---
const MIN_SIDEBAR_WIDTH = 150;
const MAX_SIDEBAR_WIDTH = 500;
const DEFAULT_SIDEBAR_WIDTH = 280;

// --- Helper ---
const checkLoginStatus = () => {
  const token = localStorage.getItem('spotify_access_token');
  return !!token;
};

const Home = () => {
  // --- State ---
  const [isLoggedIn, setIsLoggedIn] = useState(checkLoginStatus()); // Initial check
  const [userInfo, setUserInfo] = useState(null); // State for user profile
  const [sidebarWidth, setSidebarWidth] = useState(() => {
      const savedWidth = localStorage.getItem('spotify_sidebar_width');
      const initialWidth = savedWidth ? parseInt(savedWidth, 10) : DEFAULT_SIDEBAR_WIDTH;
      return Math.max(MIN_SIDEBAR_WIDTH, Math.min(initialWidth, MAX_SIDEBAR_WIDTH));
  });
  const [isResizing, setIsResizing] = useState(false);
  const sidebarRef = useRef(null);
  const mainContentRef = useRef(null);
  const navigate = useNavigate(); // Hook for navigation

  // --- Effects ---

  // Effect to fetch user profile when logged in status changes to true
  useEffect(() => {
    const fetchProfile = async () => {
      if (isLoggedIn) {
        console.log("Home.jsx: Logged in, fetching user profile...");
        const profile = await getUserProfile();
        setUserInfo(profile);
      } else {
        console.log("Home.jsx: Logged out, clearing user profile.");
        setUserInfo(null); // Clear profile on logout
      }
    };
    fetchProfile();
  }, [isLoggedIn]); // Re-run ONLY when isLoggedIn changes

  // Optional: Listener for storage changes (if login/logout happens in another tab)
  useEffect(() => {
     const handleStorageChange = () => {
        console.log("Home.jsx: Storage changed, checking login status...");
        setIsLoggedIn(checkLoginStatus());
     };
     window.addEventListener('storage', handleStorageChange);
     return () => window.removeEventListener('storage', handleStorageChange);
  }, []);


  // --- Resizable Sidebar Event Handlers ---
const handleMouseDown = (e) => {
  e.preventDefault(); // Prevent text selection during drag
  setIsResizing(true);
  document.body.style.cursor = 'col-resize'; // Change cursor globally
  document.body.style.userSelect = 'none'; // Prevent text selection globally
  };
  const handleMouseMove = useCallback((e) => {
  if (!isResizing || !mainContentRef.current) return;
  // Calculate new width based on mouse position relative to the main content area start
  const mainContentRect = mainContentRef.current.getBoundingClientRect();
  let newWidth = e.clientX - mainContentRect.left;
  
  // Apply constraints
  newWidth = Math.max(MIN_SIDEBAR_WIDTH, Math.min(newWidth, MAX_SIDEBAR_WIDTH));
  
  setSidebarWidth(newWidth);
  }, [isResizing]); // Dependency: isResizing
  const handleMouseUp = useCallback(() => {
  if (isResizing) {
  setIsResizing(false);
  document.body.style.cursor = 'default'; // Reset cursor
  document.body.style.userSelect = 'auto'; // Re-enable text selection
  // Save the final width
  localStorage.setItem('spotify_sidebar_width', sidebarWidth.toString());
  console.log("Saved sidebar width:", sidebarWidth);
  }
  }, [isResizing, sidebarWidth]); // Dependencies: isResizing, sidebarWidth
  // Add/Remove global mouse move/up listeners
  useEffect(() => {
  if (isResizing) {
  window.addEventListener('mousemove', handleMouseMove);
  window.addEventListener('mouseup', handleMouseUp);
  } else {
  window.removeEventListener('mousemove', handleMouseMove);
  window.removeEventListener('mouseup', handleMouseUp);
  }
  // Cleanup function
  return () => {
    window.removeEventListener('mousemove', handleMouseMove);
    window.removeEventListener('mouseup', handleMouseUp);
     // Ensure cursor/select reset if component unmounts during resize
     if (isResizing) {
       document.body.style.cursor = 'default';
       document.body.style.userSelect = 'auto';
     }
  };
  }, [isResizing, handleMouseMove, handleMouseUp]); // Effect depends on these states/callbacks
  // --- End Resizable Sidebar Handlers ---


  // --- Logout Handler ---
  const handleLogout = useCallback(() => {
    // Clear tokens from localStorage
    localStorage.removeItem('spotify_access_token');
    localStorage.removeItem('spotify_refresh_token');
    localStorage.removeItem('spotify_token_expiry');
    console.log('Home.jsx: User logged out, tokens cleared.');

    // Update state in this component
    setIsLoggedIn(false);
    setUserInfo(null);

    // Navigate to home or login page after logout
    navigate('/'); // Navigate to root/logged out view
    // Optionally force reload if needed: window.location.reload();
  }, [navigate]); // Include navigate in dependency array

  // --- Render ---
  console.log('Home.jsx - Rendering - isLoggedIn:', isLoggedIn);
  return (
    <div className={`home-layout ${isLoggedIn ? 'player-visible' : ''}`}>
      {/* Pass isLoggedIn, userInfo, and handleLogout down to Header */}
      <Header
        isLoggedIn={isLoggedIn}
        userInfo={userInfo}
        onLogout={handleLogout}
      />

      <div className="main-content-wrapper" ref={mainContentRef}>
        <div className="sidebar-container" ref={sidebarRef} style={{ width: `${sidebarWidth}px` }}>
          {/* Pass isLoggedIn to Sidebar if it needs it */}
          <Sidebar isLoggedIn={isLoggedIn} />
        </div>

        <div className="resizer" onMouseDown={handleMouseDown} title="Resize sidebar"/>

        <div className="center-panel-container">
        <CenterPanel isLoggedIn={isLoggedIn} userInfo={userInfo} />        </div>
      </div>

      {/* Conditional rendering based on state managed in Home.jsx */}
      {isLoggedIn && <NowPlaying />}
    </div>
  );
};

export default Home;