// src/components/CentralPanel.jsx
import React, { useState, useEffect, useCallback } from 'react'; // Added useCallback
import { Link } from 'react-router-dom';
import Section from './HomePageSections.jsx';       // Used by both views
import MediaCard from './MediaCard';               // Used by both views
import TopGridCard from './TopGridCard';           // Used by LoggedIn view
import Footer from './Footer.jsx';                 // Used by both views
import '../styles/centralPanel.css';

// Import necessary service functions for LoggedIn view
import {
  getRecentlyPlayedTracks,
  getUserPlaylists,
} from '../services/spotifyService'; // Adjust path

// Base URL for generic data (LoggedOut view)
const API_BASE_URL = 'http://localhost:8888/api/spotify';

// Helper function for greeting (LoggedIn view)
const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
};

// === Main Component ===
const CenterPanel = ({ isLoggedIn, userInfo }) => { // Accept props from Home

  // --- State for BOTH views ---
  // LoggedIn specific state
  const [greeting, setGreeting] = useState('');
  const [topGridData, setTopGridData] = useState([]);
  const [recentlyPlayed, setRecentlyPlayed] = useState([]);
  const [userPlaylists, setUserPlaylists] = useState([]);
  const [madeForYou, setMadeForYou] = useState([]); // Placeholder
  const [jumpBackInData, setJumpBackInData] = useState([]); // Placeholder
  const [activeFilter, setActiveFilter] = useState('All');

  // LoggedOut specific state (and potentially shared generic)
  const [trendingSongs, setTrendingSongs] = useState([]);
  const [popularArtists, setPopularArtists] = useState([]);
  const [newReleases, setNewReleases] = useState([]);
  const [popularRadio, setPopularRadio] = useState([]);
  const [featuredCharts, setFeaturedCharts] = useState([]);
  const [indiasBest, setIndiasBest] = useState([]);

  // Shared state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- Data Fetching Logic ---

  // Fetch data for the LOGGED OUT view
  const fetchLoggedOutData = useCallback(async () => {
    console.log("CenterPanel: Fetching Logged Out data...");
    setLoading(true);
    setError(null);
    // Clear logged-in specific state
    setTopGridData([]); setRecentlyPlayed([]); setUserPlaylists([]); setMadeForYou([]); setJumpBackInData([]);

    try {
      const fetchSectionData = async (endpoint, setter) => {
         try { // Inner try for individual fetches
            const res = await fetch(`${API_BASE_URL}${endpoint}`);
            if (!res.ok) {
              console.warn(`LoggedOut Fetch Error: ${endpoint} - ${res.status}`);
              setter([]); // Set empty array on failure
              return; // Allow other fetches to continue
            }
            const data = await res.json();
            setter(data || []);
         } catch (fetchErr) {
             console.error(`LoggedOut Fetch Failed for ${endpoint}:`, fetchErr);
             setter([]);
         }
      };

      await Promise.all([
        fetchSectionData('/trending-songs', setTrendingSongs),
        fetchSectionData('/popular-artists', setPopularArtists),
        fetchSectionData('/new-releases', setNewReleases),
        fetchSectionData('/popular-radio', setPopularRadio),
        fetchSectionData('/featured-charts', setFeaturedCharts),
        fetchSectionData('/indias-best', setIndiasBest),
      ]);
    } catch (err) {
      // Should be less likely to hit this outer catch now
      console.error('Error fetching logged out data:', err);
      setError('Failed to load content.');
    } finally {
      setLoading(false);
      console.log("CenterPanel: Logged Out data fetch complete.");
    }
  }, []); // Empty dependency array, function doesn't change

  // Fetch data for the LOGGED IN view
  const fetchLoggedInData = useCallback(async () => {
    console.log("CenterPanel: Fetching Logged In data...");
    setLoading(true);
    setError(null);
    setGreeting(getGreeting()); // Set greeting on fetch
    // Clear logged-out specific state (or maybe keep generic ones?)
    // Decide if you want to keep e.g., trendingSongs when logged in
    // setTrendingSongs([]); setPopularArtists([]); setPopularRadio([]); setFeaturedCharts([]); setIndiasBest([]);

    try {
      // Fetch personalized data
      const [recentData, playlistsData] = await Promise.all([
        getRecentlyPlayedTracks(12),
        getUserPlaylists(20),        
      ]).catch(err => {
          console.error("Error fetching personalized data:", err);
          setError("Failed to load personalized sections.");
          return [[], []];
      });
      console.log("Fetched Playlists:", playlistsData);
      console.log("Fetched Recently Played:", recentData);
      
        setTopGridData(recentData.slice(0, 6) || []); // Use recent data for top grid (or other logic)

      setRecentlyPlayed(recentData || []);
      setUserPlaylists(playlistsData || []);
      // setMadeForYou(madeForYouData || []);

      // Optionally fetch some GENERIC data even when logged in
      // (Example: Keep New Releases)
      const releasesRes = await fetch(`${API_BASE_URL}/new-releases`);
      if (releasesRes.ok) setNewReleases(await releasesRes.json() || []); else setNewReleases([]);
      // TODO: Decide which other generic sections to fetch/keep for logged-in view

    } catch (err) {
      console.error("General fetch error in LoggedIn CenterPanel:", err);
      setError('Failed to load page data.');
    } finally {
      setLoading(false);
      console.log("CenterPanel: Logged In data fetch complete.");
    }
  }, [activeFilter]); // Refetch if filter changes (add other dependencies if needed)

  // --- Effect to trigger fetch based on login state ---
  useEffect(() => {
    if (isLoggedIn === undefined) return; // Wait until isLoggedIn prop is available

    if (isLoggedIn) {
      fetchLoggedInData();
    } else {
      fetchLoggedOutData();
    }
  }, [isLoggedIn, fetchLoggedInData, fetchLoggedOutData]); // Add fetch functions as dependencies


  // --- Render Logic ---

  // 1. Loading State
  if (loading) {
    return <div className="center-panel">Loading...</div>;
  }

  // 2. Logged Out View
  if (!isLoggedIn) {
    console.log("CenterPanel Rendering: Logged Out View");
    // Use original structure for logged out
    return (
      <div className="center-panel logged-out-view">
        {error && <div className="center-panel error-message">{error}</div>}

        {!error && (
            <div className="center-panel-sections"> {/* Add wrapper */}
                {trendingSongs.length > 0 && (
                    <Section title="Trending songs">
                    {trendingSongs.map((item, index) => (
                        <MediaCard key={`trending-${item.id || index}`} {...item} />
                    ))}
                    </Section>
                )}
                {popularArtists.length > 0 && (
                    <Section title="Popular artists">
                    {popularArtists.map((item, index) => (
                        <MediaCard key={`artist-${item.id || index}`} {...item} type="round" />
                    ))}
                    </Section>
                )}
                {newReleases.length > 0 && (
                    <Section title="Popular albums and singles">
                    {newReleases.map((item, index) => (
                        <MediaCard key={`album-${item.id || index}`} {...item} />
                    ))}
                    </Section>
                )}
                {popularRadio.length > 0 && (
                    <Section title="Popular radio">
                    {popularRadio.map((item, index) => (
                        <MediaCard key={`radio-${item.id || index}`} {...item} />
                    ))}
                    </Section>
                )}
                {featuredCharts.length > 0 && (
                    <Section title="Featured charts">
                    {featuredCharts.map((item, index) => (
                        <MediaCard key={`chart-${item.id || index}`} {...item} />
                    ))}
                    </Section>
                )}
                {indiasBest.length > 0 && (
                    <Section title="India's Best">
                    {indiasBest.map((item, index) => (
                        <MediaCard key={`india-${item.id || index}`} {...item} />
                    ))}
                    </Section>
                )}
                <Footer />
            </div>
        )}
      </div>
    );
  }

  // 3. Logged In View (isLoading is false and isLoggedIn is true)
  console.log("CenterPanel Rendering: Logged In View");
  return (
    <div className="center-panel logged-in-view">
      {/* --- Top Bar Area --- */}
      <div className="center-panel-top-bar">
        <h1 className="greeting">{greeting}</h1>
        <div className="filter-chips-container">
          <button className={`filter-chip ${activeFilter === 'All' ? 'active' : ''}`} onClick={() => setActiveFilter('All')}>All</button>
          <button className={`filter-chip ${activeFilter === 'Music' ? 'active' : ''}`} onClick={() => setActiveFilter('Music')}>Music</button>
          <button className={`filter-chip ${activeFilter === 'Podcasts' ? 'active' : ''}`} onClick={() => setActiveFilter('Podcasts')}>Podcasts</button>
        </div>
      </div>

      {/* --- Top Grid --- */}
      {topGridData.length > 0 && (
        <div className="top-grid-section">
          <div className="top-grid">
            {topGridData.map((item, index) => (
              <TopGridCard key={`top-grid-${item?.track?.id || item?.id || index}`} item={item?.track || item} />
            ))}
          </div>
        </div>
      )}

      {/* --- Content Sections (Scrollable Area) --- */}
      <div className="center-panel-sections">

        {/* --- Personalized Sections --- */}
        {/* TODO: Jump Back In */}
         {newReleases.length > 0 && ( // Using New Releases as placeholder for Jump Back In
             <Section title="Jump back in">
               {newReleases.slice(0,6).map((item, index) => ( // Limit items shown
                 <MediaCard key={`jump-back-${item.id || index}`} {...item} />
               ))}
             </Section>
          )}



{recentlyPlayed?.length > 0 && (
  <Section title="Recently Played">
    {recentlyPlayed.map((track, index) => (
      <MediaCard
        key={`recent-${track.id || index}`}
        title={track.name}
        subtitle={track.artists?.map(artist => artist.name).join(', ') || 'Unknown Artist'}
        image={track.album?.images?.[0]?.url}
        type="square"
      />
    ))}
  </Section>
)}


<Section title="Your Playlists">
  {userPlaylists.map((playlist, index) => (
    <MediaCard
      key={`playlist-${playlist.id || index}`}
      title={playlist.name}
      subtitle={playlist.owner?.display_name || playlist.owner || 'Spotify'}
      image={playlist.imageUrl}
      type="square"
    />
  ))}
</Section>



  

        {/* --- Generic Sections (Filtered) --- */}
         {(activeFilter === 'All' || activeFilter === 'Music') && (
            <>
              {/* Decide which generic sections to keep for logged in view */}
              {trendingSongs.length > 0 && ( <Section title="Trending Now">{trendingSongs.map((item, index) => <MediaCard key={`trending-${item.id || index}`} {...item} />)}</Section> )}
              {popularArtists.length > 0 && ( <Section title="Popular Artists">{popularArtists.map((item, index) => <MediaCard key={`artist-${item.id || index}`} {...item} type="round" />)}</Section> )}
            </>
          )}
        {/* TODO: Podcast sections */}

        {error && <div className="center-panel error-message partial-error">{error}</div>}
      </div>
    </div>
  );
};

export default CenterPanel;