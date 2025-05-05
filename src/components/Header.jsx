// src/components/Header.jsx
import React, { useState, useRef, useEffect } from "react"; // Consolidate imports
import { useLocation, useNavigate } from "react-router-dom";
import { FaSearch, FaBell, FaRegBell, FaRegFolderOpen } from "react-icons/fa"; // Combine react-icons/fa
import { GoHomeFill, GoHome } from "react-icons/go";
import { GrInstallOption } from "react-icons/gr";
import { RxDividerVertical } from "react-icons/rx";
import { Tooltip, OverlayTrigger } from "react-bootstrap"; // Keep if used
import "../styles/header.css";

import MoodForecastModal from "./MoodForecastModal";

import logo from "../assets/Primary_Logo_White_RGB.svg";
import icon from "../assets/image.png"; // Assuming this is the browse icon
import ProfileMenu from "./ProfileMenu"; // Ensure path is correct
import moodIcon from '../assets/image_001.svg'

const loginWithSpotify = () => {
  window.location.href = "https://vibelytics.onrender.com/auth/login";
};

// Accept props from Home: isLoggedIn, userInfo, onLogout
const Header = ({ isLoggedIn, userInfo, onLogout, isSearchVisible = true }) => {
  // REMOVE internal isLoggedIn state: const [isLoggedIn, setIsLoggedIn] = useState(...)

  const [notificationsOn, setNotificationsOn] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const navigate = useNavigate(); // Keep for internal navigation if needed
  const location = useLocation();
  const profileMenuRef = useRef(null);
  const [showMoodModal, setShowMoodModal] = useState(false);

  // Effect to close menu on outside click (remains the same)
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target)
      ) {
        setIsProfileMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []); // Empty dependency array is fine here

  const toggleNotifications = () => {
    setNotificationsOn((prev) => !prev);
  };

  const toggleProfileMenu = () => {
    setIsProfileMenuOpen((prev) => !prev);
  };

  // REMOVE internal handleLogout logic - now passed via onLogout prop

  // Determine if the Home icon should be filled
  const isHomeActive = location.pathname === "/";

  // Calculate user initial - Use optional chaining and provide fallback
  const userInitial = userInfo?.display_name?.charAt(0)?.toUpperCase() || "?";

  return (
    // Use the isLoggedIn prop for the main class
    <header
      className={`spotify-header ${isLoggedIn ? "logged-in" : "logged-out"}`}
    >
      {/* Left Section */}
      <div className="header-left-group">
        <div className="header-logo-container">
          <img src={logo} alt="Spotify Logo" />
        </div>
        {/* --- Logged OUT specific items --- */}
        {!isLoggedIn && (
          <>
            {/* Logged out Home button/Search - Keep as is */}
            <OverlayTrigger
              placement="bottom"
              overlay={<Tooltip id="tooltip-home-lo">Home</Tooltip>}
            >
              <button className="icon-btn home-btn">
                <GoHomeFill size={25} />
              </button>
            </OverlayTrigger>
            {isSearchVisible && (
              <div className="search-container logged-out-search">
                <FaSearch className="search-icon" />
                <input
                  type="text"
                  placeholder="What do you want to play?"
                  className="search-input"
                />
                <RxDividerVertical size={30} />
                <OverlayTrigger
                  placement="bottom"
                  overlay={<Tooltip id="tooltip-search">Browse</Tooltip>}
                >
                  <button className="icon-btn browse-btn" aria-label="Browse">
                    <img src={icon} className="browse" />
                  </button>
                </OverlayTrigger>
              </div>
            )}
          </>
        )}
      </div>

      {/* Center Section (ONLY for logged-in users) */}
      {isLoggedIn && (
        <div className="header-center-group">
          <OverlayTrigger
            placement="bottom"
            overlay={<Tooltip id="tooltip-home-li">Home</Tooltip>}
          >
            <button
              className={`icon-btn home-btn ${isHomeActive ? "active" : ""}`}
            >
              {isHomeActive ? <GoHomeFill size={25} /> : <GoHome size={25} />}
            </button>
          </OverlayTrigger>
          {isSearchVisible && (
            <div className="search-container logged-in-search">
              <FaSearch className="search-icon" />
              <input
                type="text"
                placeholder="What do you want to play?"
                className="search-input"
              />
              <RxDividerVertical size={30} />
              <OverlayTrigger
                placement="bottom"
                overlay={<Tooltip id="tooltip-search">Browse</Tooltip>}
              >
                <button className="icon-btn browse-btn" aria-label="Browse">
                  <img src={icon} className="browse" />
                </button>
              </OverlayTrigger>
            </div>
          )}
        </div>
      )}

      {/* Right Section (User Controls) */}
      <div className="header-user-controls">
        {/* Use isLoggedIn prop here */}
        {isLoggedIn ? (
          <>
            {/* --- Logged IN controls --- */}
            <OverlayTrigger
              placement="bottom"
              overlay={<Tooltip id="tooltip-notifications">Explore your weekly mood patterns through your music</Tooltip>}
            > 
              <button
                className="icon-btn mood-forecast-btn" // Use a specific class
                aria-label="Mood Forecast"
                onClick={() => setShowMoodModal(true)}
              >
                <img src={moodIcon} alt="Mood Forecast" className="mood-icon" />
              </button>
              </OverlayTrigger>
            <MoodForecastModal
              show={showMoodModal}
              handleClose={() => setShowMoodModal(false)}
            />
            <button className="explore-premium-btn">Explore Premium</button>
            <button className="install-app-btn">
              {" "}
              {/* Changed span to button */}
              <GrInstallOption style={{ marginRight: "8px" }} /> Install App
            </button>
            <OverlayTrigger
              placement="bottom"
              overlay={<Tooltip id="tooltip-notifications">What's New</Tooltip>}
            >
              <button
                className="icon-btn"
                aria-label="Notifications"
                onClick={toggleNotifications}
              >
                {notificationsOn ? (
                  <FaBell size={20} />
                ) : (
                  <FaRegBell size={20} />
                )}
              </button>
            </OverlayTrigger>
            <div className="profile-menu-area" ref={profileMenuRef}>
              <button
                className="avatar-btn"
                aria-label="Profile menu"
                onClick={toggleProfileMenu}
                aria-expanded={isProfileMenuOpen}
              >
                {/* Display calculated user initial */}
                <div className="avatar-circle">{userInitial}</div>
              </button>
              {/* Pass the onLogout prop down to ProfileMenu */}
              {isProfileMenuOpen && (
                <ProfileMenu
                  onLogout={onLogout}
                  onClose={() => setIsProfileMenuOpen(false)}
                />
              )}
            </div>
          </>
        ) : (
          <>
            {/* --- Logged OUT controls --- */}
            {/* Keep logged out controls as they were */}
            <div className="header-user-controls logged-out-controls">
              <span className="header-link">Premium</span>
              <span className="header-link">Support</span>
              <span className="header-link">Download</span>
              <RxDividerVertical size={33} />
              <span className="header-link">
                <GrInstallOption /> Install App
              </span>
              <button className="signup-btn">Sign up</button>
              <button className="login-btn" onClick={loginWithSpotify}>
                Log in
              </button>
            </div>
          </>
        )}
      </div>
    </header>
  );
};

export default Header;
