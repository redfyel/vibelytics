// src/components/Sidebar.jsx
import React, { useState, useEffect } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { GoHome, GoHomeFill, GoSearch } from "react-icons/go";
// Choose one library icon based on reference - TbLayoutSidebarLeftCollapse seems good
import { TbLayoutSidebarLeftCollapse, TbPlaylist } from "react-icons/tb"; // Or BiLibrary
import { LuPlus } from "react-icons/lu";
// Use a better icon for expand/show more - RiExpandDiagonalSFill might be okay
import { RiExpandDiagonalSFill } from "react-icons/ri"; // Or LuArrowRight if that's the intent
import { IoGlobeOutline } from 'react-icons/io5';
import { CiSearch } from "react-icons/ci";
// Use a List icon for the sort display toggle, not MenuAlt
import { LuList } from "react-icons/lu"; // Recommended for sort view toggle
import { getUserPlaylists } from '../services/spotifyService';
import '../styles/sidebar.css';

const DEFAULT_PLAYLIST_IMAGE = '/default_playlist_art.png'; // Ensure this exists in /public

const Sidebar = () => {
  const [userPlaylists, setUserPlaylists] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  // TODO: Add state for active filter (e.g., 'Playlists', 'Artists')
  const [activeFilter, setActiveFilter] = useState('Playlists');
  // TODO: Add state for sort order (e.g., 'Recents')
  const [sortOrder, setSortOrder] = useState('Recents');
  // TODO: Add state for list/grid view if implementing
  // const [viewMode, setViewMode] = useState('list');

  useEffect(() => {
    const fetchPlaylists = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // TODO: Fetch data based on activeFilter
        if (activeFilter === 'Playlists') {
          const playlists = await getUserPlaylists();
          setUserPlaylists(playlists || []);
        } else {
           setUserPlaylists([]); // Clear or fetch Artists/Albums data
        }
      } catch (err) {
        console.error("Sidebar fetch error:", err);
        setError("Could not load library.");
        setUserPlaylists([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPlaylists();
  }, [activeFilter]); // Refetch when filter changes

  // Filter playlists based on activeFilter (basic example)
  // You'd likely fetch different data entirely for Artists/Albums
  const filteredItems = activeFilter === 'Playlists' ? userPlaylists : [];


  return (
    <div className="sidebar">
  

      {/* Library Section */}
      <div className="sidebar-section sidebar-library">
        <div className="library-header">
          <button className="nav-item library-title-button" title="Collapse Your Library">
            {/* Use the correct library icon */}
            <TbLayoutSidebarLeftCollapse size={24} />
            <span>Your Library</span>
          </button>
          <div className="library-actions">
            {/* The "Create" button combines icon and text visually */}
            <button className="icon-button create-button" title="Create playlist or folder">
              <LuPlus size={18} />
              {/* Maybe add text 'Create' via CSS pseudo-element or keep icon only */}
            </button>
            <button className="icon-button" title="Show more options">
               {/* Use appropriate icon for expand/more */}
              <RiExpandDiagonalSFill size={18} />
            </button>
          </div>
        </div>

        <div className="library-filters">
           {/* TODO: Add onClick handlers to change activeFilter */}
           <button className={`filter-chip ${activeFilter === 'Playlists' ? 'active' : ''}`} onClick={() => setActiveFilter('Playlists')}>Playlists</button>
           <button className={`filter-chip ${activeFilter === 'Artists' ? 'active' : ''}`} onClick={() => setActiveFilter('Artists')}>Artists</button>
           <button className={`filter-chip ${activeFilter === 'Albums' ? 'active' : ''}`} onClick={() => setActiveFilter('Albums')}>Albums</button>
           {/* Add more filters if needed */}
        </div>

        <div className="library-view-options">
          <button className="icon-button view-option-button search-in-library-btn" title="Search in Your Library">
            <CiSearch size={18} />
          </button>
          {/* TODO: Add onClick to open sort dropdown */}
          <button className="library-sort-button view-option-button" title="Sort by Recents">
            <span>{sortOrder}</span>
            <LuList size={16} />
          </button>
        </div>

        <div className="library-content">
          {isLoading && <p className="loading-text">Loading...</p>}
          {error && <p className="error-text">{error}</p>}
          {!isLoading && !error && (
            <ul className="library-list">
              {filteredItems.length > 0 ? (
                filteredItems.map(item => ( // Use 'item' as it might be playlist/artist/album
                  <li key={item.id} className="library-item">
                    <Link to={`/${item.type}/${item.id}`} className="library-item-link">
                      <img
                        src={item.imageUrl || DEFAULT_PLAYLIST_IMAGE}
                        alt={`${item.name} cover`}
                        className="library-item-image"
                        onError={(e) => { e.target.src = DEFAULT_PLAYLIST_IMAGE }}
                      />
                      <div className="library-item-info">
                        <span className="library-item-name">{item.name}</span>
                        {/* Show different details based on type */}
                        <span className="library-item-details">
                           {item.type === 'playlist' ? `Playlist • ${item.owner}` : item.type} {/* Capitalize type? */}
                           {/* TODO: Add pinned icon if applicable */}
                        </span>
                      </div>
                    </Link>
                  </li>
                ))
              ) : (
                activeFilter === 'Playlists' && // Only show prompts if filtering playlists and it's empty
                 <>
                    {/* Use the specific card classes */}
                    <div className="library-prompt-card">
                        <h5>Create your first playlist</h5>
                        <p>It's easy, we'll help you</p>
                        <button className="prompt-button">Create playlist</button>
                    </div>

                    <div className="library-prompt-card">
                        <h5>Let's find some podcasts to follow</h5>
                        <p>We'll keep you updated on new episodes</p>
                        <button className="prompt-button">Browse podcasts</button>
                    </div>
                     {/* Footer Section - Moved outside library conditional rendering */}
      <div className="sidebar-footer">
        <div className="footer-links">
          <a href="https://www.spotify.com/legal/end-user-agreement/" target="_blank" rel="noopener noreferrer">Legal</a>
          <a href="https://www.spotify.com/privacy" target="_blank" rel="noopener noreferrer">Privacy Center</a>
          <a href="https://www.spotify.com/legal/privacy-policy/" target="_blank" rel="noopener noreferrer">Privacy Policy</a>
          <a href="https://www.spotify.com/legal/cookies-policy/" target="_blank" rel="noopener noreferrer">Cookies</a>
          <a href="https://www.spotify.com/legal/privacy-policy/#s3" target="_blank" rel="noopener noreferrer">About Ads</a>
          <a href="https://www.spotify.com/accessibility" target="_blank" rel="noopener noreferrer">Accessibility</a>
        </div>
        <button className="language-button">
          <IoGlobeOutline />
          <span>English</span>
        </button>
      </div>
                 </>
              )}
            </ul>
          )}
        </div>
      </div>

     
    </div>
  );
};

export default Sidebar;