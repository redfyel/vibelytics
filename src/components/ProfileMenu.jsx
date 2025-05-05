// src/components/ProfileMenu.jsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom'; // Use Link for internal navigation
import { ExternalLink, LogOut, Settings, HelpCircle, Download, Crown, User } from 'lucide-react'; // Example using lucide-react icons
import '../styles/profileMenu.css'; // We'll create this CSS file next

// Assume onLogout is passed as a prop
const ProfileMenu = ({ onLogout, onClose }) => {
  const navigate = useNavigate();

  const handleLogoutClick = () => {
    if (onLogout) {
      onLogout(); // Call the function passed from parent (Home -> Header -> ProfileMenu)
   }
  };

  const handleNavigation = (path) => {
      navigate(path);
      onClose(); // Close the menu on navigation
  };

  return (
    <div className="profile-menu-container">
      <ul className="profile-menu-list">
        <li>
          {/* Using <a> for external link example, adjust if needed */}
          <a href="https://www.spotify.com/account/overview/" target="_blank" rel="noopener noreferrer" onClick={onClose}>
            <span>Account</span>
            <ExternalLink size={16} />
          </a>
        </li>
        <li>
          {/* Use button/div + navigate for internal SPA navigation */}
          <button onClick={() => handleNavigation('/profile')}>
             <span>Profile</span>
             {/* No icon for profile usually */}
          </button>
        </li>
        <li>
          <a href="https://www.spotify.com/premium/" target="_blank" rel="noopener noreferrer" onClick={onClose}>
            <span>Upgrade to Premium</span>
            <ExternalLink size={16} />
          </a>
        </li>
          
        <li>
          <a href="https://support.spotify.com/" target="_blank" rel="noopener noreferrer" onClick={onClose}>
            <span>Support</span>
            <ExternalLink size={16} />
          </a>
        </li>
        <li>
          <a href="https://www.spotify.com/download/" target="_blank" rel="noopener noreferrer" onClick={onClose}>
            <span>Download</span>
            <ExternalLink size={16} />
          </a>
        </li>
       
         <li>
           {/* Example internal navigation to Settings page */}
           <button onClick={() => handleNavigation('/settings')}>
             <span>Settings</span>
             {/* <Settings size={16} /> */}
           </button>
        </li>
        <li className="separator"></li> {/* Separator line */}
        <li>

          
      <button onClick={handleLogoutClick}>
        <span>Log out</span>
      </button>
   </li>
        {/* Add other items like Support, Download if needed, mapping to appropriate actions/links */}
        
      </ul>
    </div>
  );
};

export default ProfileMenu;