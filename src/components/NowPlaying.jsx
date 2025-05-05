// src/components/NowPlaying.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Heart, Play, Pause, SkipBack, SkipForward, Shuffle, Repeat, Mic2, ListMusic, Laptop2, Volume1, Volume2, VolumeX } from 'lucide-react';
import { getCurrentPlaybackState, playTrack, pauseTrack, nextTrack, previousTrack } from '../services/spotifyService'; // Adjust path as needed
import '../styles/nowplaying.css'; // Ensure this path is correct

// Helper to format milliseconds to mm:ss
const formatDuration = (ms) => {
  if (typeof ms !== 'number' || ms < 0) return '0:00';
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
};

const NowPlaying = () => {
  const [playbackState, setPlaybackState] = useState(null);
  const [isLoading, setIsLoading] = useState(true); // Start loading initially
  const [error, setError] = useState(null);
  // Optional: State for local progress update for perceived smoothness
  // const [displayProgressMs, setDisplayProgressMs] = useState(0);

  // --- Fetch Logic using useCallback ---
  const fetchPlaybackState = useCallback(async (isInitialLoad = false) => {
    try {
      const state = await getCurrentPlaybackState();
      setPlaybackState(state); // Update the state with fetched data (or null)
      setError(null); // Clear previous errors on success
    } catch (err) {
      console.error("Error fetching playback state in component:", err);
      setError('Could not load player state.'); // Set user-friendly error
      setPlaybackState(null); // Clear state on error
    } finally {
      // Only set isLoading to false after the very first attempt
      if (isInitialLoad) {
        setIsLoading(false);
      }
    }
  }, []); // Empty dependency array: fetchPlaybackState function itself doesn't change

  // --- Effect for Initial Load and Polling ---
  useEffect(() => {
    console.log("NowPlaying Mounted: Fetching initial state...");
    // Fetch immediately on mount, mark as initial load
    fetchPlaybackState(true);

    // Set up polling interval
    const intervalId = setInterval(() => {
      // Subsequent fetches are not the initial load
      fetchPlaybackState(false);
    }, 5000); // Poll every 5 seconds

    // Cleanup interval on component unmount
    return () => {
      console.log("NowPlaying Unmounted: Cleaning up interval.");
      clearInterval(intervalId);
    };
  }, [fetchPlaybackState]); // Depend only on the stable fetchPlaybackState function


  // --- Playback Control Handlers ---
  const handlePlayPause = async () => {
    if (!playbackState || !playbackState.device?.id) {
      console.warn("Play/Pause: No active device found.");
      // TODO: Add user feedback (e.g., toast notification)
      return;
    }
    const success = playbackState.is_playing ? await pauseTrack() : await playTrack();
    if (success) {
      // Optimistically update UI slightly faster than polling
      setPlaybackState(prev => prev ? ({ ...prev, is_playing: !prev.is_playing }) : null);
      // Fetch immediately after action for accurate state
      setTimeout(() => fetchPlaybackState(false), 300);
    }
  };

  const handleNext = async () => {
      if (!playbackState || !playbackState.device?.id) return;
      const success = await nextTrack();
      if (success) setTimeout(() => fetchPlaybackState(false), 300);
  };

  const handlePrevious = async () => {
      if (!playbackState || !playbackState.device?.id) return;
      const success = await previousTrack();
      if (success) setTimeout(() => fetchPlaybackState(false), 300);
   };

  // --- Render Logic ---

  // 1. Loading State (Only on initial mount)
  if (isLoading) {
    console.log("NowPlaying Rendering: Loading State");
    // You can return a minimal placeholder or null
    return (
        <div className="now-playing-bar loading">
            {/* Optionally add a spinner or minimal layout */}
            Loading Player...
        </div>
    );
  }
  if (!playbackState && !isLoading) {
    return <div className="nowplaying-empty">No active playback</div>;
  }
  // 2. Empty State (If not loading, but no track/item is playing)
  if (!playbackState || !playbackState.item) {
     console.log("NowPlaying Rendering: Empty State (No active track)", playbackState);
     // Render a visually distinct empty/placeholder bar
     return (
        <div className="now-playing-bar empty">
            <div className="now-playing-left">
                 {/* Placeholder image/icon */}
                 <div className="album-art placeholder"></div>
                 <div className="track-info">
                    <span className="track-title">-</span>
                    <span className="artist-name">-</span>
                 </div>
            </div>
            <div className="now-playing-center">
                 <div className="player-controls">
                     <button className="control-button icon-only secondary-control" disabled><Shuffle size={18} /></button>
                     <button className="control-button icon-only" disabled><SkipBack size={18} /></button>
                     <button className="control-button play-button" disabled><Play size={20} /></button>
                     <button className="control-button icon-only" disabled><SkipForward size={18} /></button>
                     <button className="control-button icon-only secondary-control" disabled><Repeat size={18} /></button>
                 </div>
                 <div className="playback-bar">
                    <span className="time-text">0:00</span>
                    <div className="progress-bar-wrapper">
                        {/* Empty bar track */}
                    </div>
                    <span className="time-text">0:00</span>
                 </div>
            </div>
            <div className="now-playing-right">
                 {/* Placeholder/disabled controls */}
                 <button className="control-button icon-only" disabled><Mic2 size={18} /></button>
                 <button className="control-button icon-only" disabled><ListMusic size={18} /></button>
                 <button className="control-button icon-only" disabled><Laptop2 size={18} /></button>
                 <div className="volume-control">
                     <button className="control-button icon-only" disabled><Volume1 size={18} /></button>
                     <div className="progress-bar-wrapper volume-slider"></div>
                 </div>
            </div>
        </div>
     );
   }

  // 3. Full Player Bar (Loading finished, and a track item exists)
  // console.log("NowPlaying Rendering: Full Player Bar", playbackState);
  const { item: track, is_playing, device, progress_ms, repeat_state, shuffle_state } = playbackState;
  // Safely access properties with fallbacks
  const albumImageUrl = track?.album?.images?.[0]?.url || '/default_album_art.png'; // Have a default image in public folder
  const trackTitle = track?.name || 'Unknown Track';
  const artistName = track?.artists?.map(artist => artist.name).join(', ') || 'Unknown Artist';
  const durationMs = track?.duration_ms || 0;
  const currentProgressMs = progress_ms || 0;
  const progressPercent = durationMs > 0 ? (currentProgressMs / durationMs) * 100 : 0;
  // TODO: Add state and logic for liked status, volume, shuffle, repeat

  return (
    <div className="now-playing-bar">
      {/* Left Section: Track Info */}
      <div className="now-playing-left">
        <img src={albumImageUrl} alt={track?.album?.name || 'Album art'} className="album-art" />
        <div className="track-info">
          {/* TODO: Make these links if desired */}
          <span className="track-title">{trackTitle}</span>
          <span className="artist-name">{artistName}</span>
        </div>
        {/* TODO: Add is_liked state and onClick handler */}
        <button className="control-button icon-only like-button">
          <Heart size={18} />
        </button>
      </div>

      {/* Center Section: Playback Controls & Progress */}
      <div className="now-playing-center">
        <div className="player-controls">
          {/* TODO: Add shuffle toggle logic and active class */}
          <button className={`control-button icon-only secondary-control ${shuffle_state ? 'active' : ''}`}>
            <Shuffle size={18} />
          </button>
          <button className="control-button icon-only" onClick={handlePrevious} title="Previous">
            <SkipBack size={18} />
          </button>
          <button className="control-button play-button" onClick={handlePlayPause} title={is_playing ? 'Pause' : 'Play'}>
            {is_playing ? <Pause size={20} /> : <Play size={20} />}
          </button>
          <button className="control-button icon-only" onClick={handleNext} title="Next">
            <SkipForward size={18} />
          </button>
          {/* TODO: Add repeat toggle logic and active class (handle different repeat states: off, context, track) */}
          <button className={`control-button icon-only secondary-control ${repeat_state !== 'off' ? 'active' : ''}`}>
            <Repeat size={18} />
          </button>
        </div>
        <div className="playback-bar">
           <span className="time-text">{formatDuration(currentProgressMs)}</span>
           {/* TODO: Add seeking functionality to the progress bar */}
           <div className="progress-bar-wrapper" title="Seek">
             <div className="progress-bar" style={{ width: `${progressPercent}%` }}>
                <div className="progress-handle"></div>
             </div>
           </div>
           <span className="time-text">{formatDuration(durationMs)}</span>
        </div>
      </div>

      {/* Right Section: Other Controls */}
      <div className="now-playing-right">
        {/* TODO: Add onClick handlers */}
        <button className="control-button icon-only" title="Lyrics"><Mic2 size={18} /></button>
        <button className="control-button icon-only" title="Queue"><ListMusic size={18} /></button>
        {/* TODO: Add device selection popup */}
        <button className="control-button icon-only" title="Connect to a device"><Laptop2 size={18} /></button>
        {/* TODO: Add volume control logic */}
        <div className="volume-control">
          <button className="control-button icon-only" title="Mute">
            {/* TODO: Change icon based on volume level */}
            <Volume2 size={18} />
          </button>
          <div className="progress-bar-wrapper volume-slider" title="Volume">
             {/* TODO: Add volume slider interaction */}
             <div className="progress-bar" style={{ width: `${device?.volume_percent || 80}%` }}> {/* Use actual volume */}
                 <div className="progress-handle"></div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NowPlaying;