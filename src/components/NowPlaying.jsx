// src/components/NowPlaying.jsx
import React, { useState, useEffect, useCallback } from 'react';

// Core Playback Icons (Lucide)
import { Heart, Play, Pause, SkipBack, SkipForward, Shuffle, Repeat } from 'lucide-react';

// Right Controls Icons (React Icons) & Bootstrap Components
import { Button, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { FaHeadphones, FaExpand } from 'react-icons/fa';
import { PiMicrophoneStageLight, PiMonitorPlayBold } from 'react-icons/pi';
import { HiOutlineQueueList, HiMiniSpeakerWave } from "react-icons/hi2";
import { CgMiniPlayer } from "react-icons/cg";
import { IoIosArrowUp } from "react-icons/io";
import { SlLoop } from "react-icons/sl";



// Spotify Service & CSS
import { getCurrentPlaybackState, playTrack, pauseTrack, nextTrack, previousTrack } from '../services/spotifyService'; // Adjust path
import '../styles/nowplaying.css'; // Main CSS
// We might need styles for the react-bootstrap overrides or the input range
// import '../styles/rightcontrols.css'; // Optional: If specific styles are needed

// Helper to format milliseconds to mm:ss
const formatDuration = (ms) => {
    if (typeof ms !== 'number' || ms < 0) return '0:00';
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
};

// NowPlaying component integrating RightControls structure
const NowPlaying = ({
    showNowPlayingView = false, // Prop to control sidebar view
    onToggleNowPlayingView, // Function to toggle sidebar
    // Manage volume internally for this example, can be props if needed
}) => {
    // --- State Hooks ---
    const [playbackState, setPlaybackState] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isLiked, setIsLiked] = useState(false); // Placeholder for like status

    // State for Right Controls interaction
    const [activeRightControl, setActiveRightControl] = useState(null);

    // Internal volume state
    const [currentVolume, setCurrentVolume] = useState(80); // Default volume
    const [isMuted, setIsMuted] = useState(false); // Mute state isn't directly from Spotify API easily
    const [lastVolume, setLastVolume] = useState(80); // To restore volume after unmute

    // --- Define Right Controls Data ---
    const rightControlsDefinition = [
        // Use PiMonitorPlayBold for Now Playing View toggle
        { id: 'nowplaying', icon: <PiMonitorPlayBold size={23} />, tooltip: 'Now Playing View', action: onToggleNowPlayingView },
        { id: 'lyrics', icon: <PiMicrophoneStageLight size={23} />, tooltip: 'Lyrics', action: () => console.warn('Lyrics action not implemented') },
        { id: 'queue', icon: <HiOutlineQueueList size={23} />, tooltip: 'Queue', action: () => console.warn('Queue action not implemented') },
        { id: 'connect', icon: <FaHeadphones size={23} />, tooltip: 'Connect to a device', action: () => console.warn('Connect action not implemented') },
        // Volume Slider is handled separately
        { id: 'miniplayer', icon: <CgMiniPlayer size={23} />, tooltip: 'Miniplayer', action: () => console.warn('Miniplayer action not implemented') },
        { id: 'fullscreen', icon: <FaExpand size={23} />, tooltip: 'Fullscreen', action: () => console.warn('Fullscreen action not implemented') },
    ];

    // --- Fetch Logic ---
    const fetchPlaybackState = useCallback(async (isInitialLoad = false) => {
        try {
            const state = await getCurrentPlaybackState();
            setPlaybackState(state);
            // Sync volume if device info is present
            if (state?.device?.volume_percent !== undefined) {
                 const spotifyVolume = state.device.volume_percent;
                 // Don't directly set muted state from volume 0, handle via explicit mute toggle
                 setCurrentVolume(spotifyVolume);
                 if (spotifyVolume > 0) setLastVolume(spotifyVolume); // Update last known volume
            }
            // TODO: Fetch liked status for state?.item?.id
            setError(null);
        } catch (err) {
            console.error("Error fetching playback state:", err);
            setError('Could not load player state.');
            setPlaybackState(null);
        } finally {
            if (isInitialLoad) {
                setIsLoading(false);
            }
        }
    }, []);

    // --- Effect for Initial Load and Polling ---
    useEffect(() => {
        fetchPlaybackState(true);
        const intervalId = setInterval(() => fetchPlaybackState(false), 5000);
        return () => clearInterval(intervalId);
    }, [fetchPlaybackState]);

    // --- Playback Control Handlers (Center) ---
    const handlePlayPause = async () => {
        if (!playbackState?.device?.id) return;
        const success = playbackState.is_playing ? await pauseTrack() : await playTrack();
        if (success) {
            setPlaybackState(prev => prev ? ({ ...prev, is_playing: !prev.is_playing }) : null);
            setTimeout(() => fetchPlaybackState(false), 300);
        }
    };
    const handleNext = async () => {
        if (!playbackState?.device?.id) return;
        const success = await nextTrack();
        if (success) setTimeout(() => fetchPlaybackState(false), 300);
    };
    const handlePrevious = async () => {
        if (!playbackState?.device?.id) return;
        const success = await previousTrack();
        if (success) setTimeout(() => fetchPlaybackState(false), 300);
    };
    const handleToggleShuffle = () => console.warn('Shuffle toggle not implemented'); // TODO
    const handleToggleRepeat = () => console.warn('Repeat toggle not implemented'); // TODO
    const handleSeek = (event) => console.warn('Seek not implemented'); // TODO

    // --- Like Handler (Left) ---
     const handleToggleLike = () => {
        console.warn('Like toggle not implemented');
        setIsLiked(prev => !prev);
        // TODO: Call API to save/unsave track
    };

    // --- Right Controls Handlers ---
    const handleRightControlClick = (id, action) => {
        setActiveRightControl(id === activeRightControl ? null : id);
        // Execute the associated action if provided
        if (action && typeof action === 'function') {
            action();
        }
    };

    const handleVolumeInputChange = (event) => {
        const newVolume = parseInt(event.target.value, 10);
        setCurrentVolume(newVolume);
        setIsMuted(newVolume === 0); // Assume mute if slider goes to 0
        if (newVolume > 0) setLastVolume(newVolume); // Store if unmuting via slider
        // TODO: Debounce and call Spotify API: await setVolume(newVolume);
        console.log("Volume changed to:", newVolume); // Placeholder
    };

     // Separate Mute Toggle Logic (if needed, e.g., clicking the speaker icon)
     const handleToggleMute = () => {
         let newVolume;
         if (currentVolume > 0) {
             // Mute
             setLastVolume(currentVolume); // Store current volume
             newVolume = 0;
             setIsMuted(true);
         } else {
             // Unmute
             newVolume = lastVolume > 0 ? lastVolume : 50; // Restore or default
             setIsMuted(false);
         }
         setCurrentVolume(newVolume);
         // TODO: Call Spotify API: await setVolume(newVolume);
         console.log("Toggled mute, new volume:", newVolume); // Placeholder
     };


    // --- Render Logic ---

    if (isLoading) {
        return <div className="now-playing-bar loading">Loading Player...</div>;
    }
    // Simplified Error/Empty state for brevity - adjust as needed
    if (error || !playbackState || !playbackState.item) {
        return (
             <div className={`now-playing-bar ${error ? 'error' : 'empty-item'}`}>
                {/* You can add placeholder structure here if needed */}
                 <span style={{ gridColumn: '1 / -1', textAlign: 'center' }}>
                     {error || 'Spotify'}
                 </span>
             </div>
        );
    }

    // --- Full Player Render ---
    const { item: track, is_playing, device, progress_ms, repeat_state, shuffle_state } = playbackState;
    const albumImageUrl = track.album?.images?.[0]?.url || '/default_album_art.png';
    const trackTitle = track.name || 'Unknown Track';
    const artistName = track.artists?.map(artist => artist.name).join(', ') || 'Unknown Artist';
    const albumName = track.album?.name || 'Unknown Album';
    const durationMs = track.duration_ms || 0;
    const currentProgressMs = progress_ms || 0;
    const progressPercent = durationMs > 0 ? (currentProgressMs / durationMs) * 100 : 0;

    // Determine volume for the slider input
    const displayVolume = currentVolume;

    // Split controls for layout
    const controlsBeforeVolume = rightControlsDefinition.slice(0, 4);
    const controlsAfterVolume = rightControlsDefinition.slice(4);


    return (
        <>
            {/* --- Bottom Now Playing Bar --- */}
            <div className="now-playing-bar">
            <div className="now-playing-left">
  <div className="album-wrapper">
    <img src={albumImageUrl} alt={albumName} className="album-art" />

    {/* Expand Arrow on Hover */}
    <div className="phover-icon">
      <OverlayTrigger
        placement="top"
        overlay={<Tooltip id="tooltip-expand">Expand</Tooltip>}
      >
        <IoIosArrowUp />
      </OverlayTrigger>
    </div>
  </div>

  <div className="track-info">
    <span className="track-title hover-link" title={trackTitle}>
      {trackTitle}
    </span>
    <span className="artist-name hover-link" title={artistName}>
      {artistName}
    </span>
  </div>

  {/* Action Buttons , -, +) */}
  <div className="left-icon-buttons">
    <OverlayTrigger
      placement="top"
      overlay={<Tooltip id="tooltip-hide">Hide</Tooltip>}
    >
      <Button variant="outline-light" className="left-circle-icon-btn">
        −
      </Button>
    </OverlayTrigger>

    <OverlayTrigger
      placement="top"
      overlay={<Tooltip id="tooltip-like">Add to Liked Songs</Tooltip>}
    >
      <Button variant="outline-light" className="left-circle-icon-btn">
        +
      </Button>
    </OverlayTrigger>

  </div>
</div>


                {/* Center Section (Keep as before) */}
                <div className="now-playing-center">
                <div className="player-controls">
  <OverlayTrigger
    placement="top"
    overlay={<Tooltip id="tooltip-shuffle">Shuffle</Tooltip>}
  >
    <button
      className={`control-button icon-only secondary-control ${shuffle_state ? 'active' : ''}`}
      onClick={handleToggleShuffle}
      title={`Shuffle ${shuffle_state ? 'on' : 'off'}`}
    >
      <Shuffle size={18} />
    </button>
  </OverlayTrigger>

  <OverlayTrigger
    placement="top"
    overlay={<Tooltip id="tooltip-previous">Previous</Tooltip>}
  >
    <button
      className="control-button icon-only"
      onClick={handlePrevious}
      title="Previous"
    >
      <SkipBack size={18} fill="currentColor" />
    </button>
  </OverlayTrigger>

  <OverlayTrigger
    placement="top"
    overlay={
      <Tooltip id="tooltip-play-pause">{is_playing ? 'Pause' : 'Play'}</Tooltip>
    }
  >
    <button
      className="control-button play-button"
      onClick={handlePlayPause}
      title={is_playing ? 'Pause' : 'Play'}
    >
      {is_playing ? (
        <Pause size={20} fill="currentColor" />
      ) : (
        <Play size={20} fill="currentColor" />
      )}
    </button>
  </OverlayTrigger>

  <OverlayTrigger
    placement="top"
    overlay={<Tooltip id="tooltip-next">Next</Tooltip>}
  >
    <button
      className="control-button icon-only"
      onClick={handleNext}
      title="Next"
    >
      <SkipForward size={18} fill="currentColor" />
    </button>
  </OverlayTrigger>

  <OverlayTrigger
    placement="top"
    overlay={
      <Tooltip id="tooltip-repeat">
        {repeat_state === 'track'
          ? 'Repeat Track'
          : repeat_state === 'context'
          ? 'Repeat Playlist'
          : 'Repeat Off'}
      </Tooltip>
    }
  >
    <button
      className={`control-button icon-only secondary-control ${repeat_state !== 'off' ? 'active' : ''}`}
      onClick={handleToggleRepeat}
      title={`Repeat ${repeat_state}`}
    >
      <SlLoop size={18} />
    </button>
  </OverlayTrigger>
</div>

                     <div className="playback-bar">
                         <span className="time-text">{formatDuration(currentProgressMs)}</span>
                         {/* Using the div-based progress bar for better styling control */}
                         <div className="pprogress-bar-wrapper" title="Seek" onClick={handleSeek}>
                             <div className="pprogress-bar" style={{ width: `${progressPercent}%` }}>
                                 <div className="pprogress-handle"></div>
                             </div>
                         </div>
                         <span className="time-text">{formatDuration(durationMs)}</span>
                     </div>
                </div>

                {/* Right Section (Using RightControls Structure) */}
                <div className="now-playing-right"> {/* Use the same class for CSS targeting */}
                    {/* Controls Before Volume */}
                    {controlsBeforeVolume.map(({ id, icon, tooltip, action }) => (
                        <OverlayTrigger key={id} placement="top" overlay={<Tooltip id={`tooltip-${id}`}>{tooltip}</Tooltip>}>
                            {/* Special handling for Now Playing View button's active state */}
                            <Button
                                variant="link"
                                className={`icon-btn ${
                                    (id === 'nowplaying' && showNowPlayingView) || // Active if sidebar is shown
                                    (id !== 'nowplaying' && activeRightControl === id) // Active if clicked (for others)
                                    ? 'active' : ''}`}
                                onClick={() => handleRightControlClick(id, action)}
                            >
                                {icon}
                            </Button>
                        </OverlayTrigger>
                    ))}

                    {/* Volume Control */}
                    <div className="volume-control"> {/* Keep this wrapper class if CSS uses it */}
                         {/* Optional: Make speaker icon clickable for mute */}
                         <OverlayTrigger placement="top" overlay={<Tooltip id="tooltip-mute">{displayVolume === 0 ? 'Unmute' : 'Mute'}</Tooltip>}>
                            <Button variant='link' className='icon-btn volume-icon-button' onClick={handleToggleMute}>
                                <HiMiniSpeakerWave size={23} />
                            </Button>
                         </OverlayTrigger>
                         <input
                            type="range"
                            min="0"
                            max="100"
                            value={displayVolume}
                            onChange={handleVolumeInputChange}
                            className="volume-slider" // Target this with CSS
                            aria-label="Volume"
                         />
                    </div>

                    {/* Controls After Volume */}
                    {controlsAfterVolume.map(({ id, icon, tooltip, action }) => (
                        <OverlayTrigger key={id} placement="top" overlay={<Tooltip id={`tooltip-${id}`}>{tooltip}</Tooltip>}>
                            <Button
                                variant="link"
                                className={`icon-btn ${activeRightControl === id ? 'active' : ''}`}
                                onClick={() => handleRightControlClick(id, action)}
                            >
                                {icon}
                            </Button>
                        </OverlayTrigger>
                    ))}
                </div>
            </div>

            {/* --- Right Now Playing View (Sidebar Content - Keep as before) --- */}
            {showNowPlayingView && track && (
                <div className="now-playing-view">
                    {/* (Structure from previous answer: npv-header, npv-content, npv-art, etc.) */}
                    <div className="npv-header">
                        <span>{albumName}</span>
                        <button className="control-button icon-only" onClick={onToggleNowPlayingView} title="Close">
                           ×
                        </button>
                    </div>
                    <div className="npv-content">
                         <img src={albumImageUrl} alt={albumName} className="npv-art" />
                         <div className="npv-track-info">
                             <span className="npv-title hover-link" title={trackTitle}>{trackTitle}</span>
                             <span className="npv-artist hover-link" title={artistName}>{artistName}</span>
                         </div>
                         <button
                             className={`control-button icon-only npv-like-button ${isLiked ? 'active' : ''}`}
                             onClick={handleToggleLike}
                             title={isLiked ? 'Remove from Your Library' : 'Save to Your Library'}
                         >
                             <Heart size={22} fill={isLiked ? 'currentColor' : 'none'}/>
                         </button>
                    </div>
                    <div className="npv-footer">
                         {device && <span className="npv-device-info"><FaHeadphones size={14} /> {device.name}</span> } {/* Use FaHeadphones */}
                    </div>
                </div>
            )}
        </>
    );
};

export default NowPlaying;