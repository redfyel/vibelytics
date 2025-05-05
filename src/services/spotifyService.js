import axios from 'axios';
// Assuming getAccessToken manages getting a valid token (from localStorage or refresh)
import { getAccessToken } from './spotifyAuth';

export async function getCurrentPlaybackState() {
    // console.log('SVC: getCurrentPlaybackState - Attempting fetch');
    try {
      const token = await getAccessToken(); // Make sure this handles token fetching/refreshing
      if (!token) {
        throw new Error('No access token available');
      }
  
      const response = await axios.get('https://api.spotify.com/v1/me/player', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        // No params needed, endpoint gives current state
      });
  
      // Spotify returns 204 No Content if nothing is playing/active
      if (response.status === 204) {
        // console.log('SVC: getCurrentPlaybackState - No active device or playback.');
        // Optionally, fetch recently played here as a fallback
        // const recent = await getRecentlyPlayed(1); // Need to implement getRecentlyPlayed
        // return recent ? { item: recent[0]?.track, is_playing: false } : null;
        return null; // Return null if nothing is playing
      }
  
      if (response.status === 200 && response.data) {
          // Basic validation: Ensure there's an item (track) being played
          if (!response.data.item) {
              // console.log('SVC: getCurrentPlaybackState - Active device, but no item playing.');
              return { ...response.data, item: null }; // Return state but indicate no item
          }
          // console.log('SVC: getCurrentPlaybackState - Successfully fetched state:', response.data.item?.name);
          return response.data; // Return the full playback state object
      }
  
      // Handle unexpected success statuses?
      console.warn('SVC: getCurrentPlaybackState - Unexpected response status:', response.status);
      return null;
  
  
    } catch (error) {
      const status = error.response?.status;
      const message = error.response?.data?.error?.message || error.message;
  
      // Don't spam console for expected errors like 401 (token expired) if getAccessToken handles refresh
      if (status !== 401) {
           console.error(
              `SVC: getCurrentPlaybackState - FAILED. Status: ${status || 'N/A'}. Message: ${message}`
          );
      } else {
           console.log('SVC: getCurrentPlaybackState - Token potentially expired (401). Refresh might be attempted.');
      }
  
      // Handle specific errors if needed (e.g., 403 Forbidden - missing scope)
      if (status === 403) {
          console.error("SVC: getCurrentPlaybackState - ERROR: Check if 'user-read-playback-state' and 'user-read-currently-playing' scopes are granted.");
      }
  
      return null; // Return null on any failure
    }
  }
  
  // --- Optional: Helper function for recently played (as fallback) ---
  // export async function getRecentlyPlayed(limit = 1) {
  //    // ... implementation similar to getCurrentPlaybackState but using /me/player/recently-played ...
  // }
  
  // --- Add Play/Pause/Next/Prev functions ---
  async function controlPlayback(method, url) {
      try {
          const token = await getAccessToken();
          if (!token) throw new Error('No access token');
          await axios({
              method,
              url: `https://api.spotify.com/v1/me/player/${url}`,
              headers: { Authorization: `Bearer ${token}` }
          });
          console.log(`SVC: Playback control ${method} ${url} successful.`);
          return true;
      } catch (error) {
          const status = error.response?.status;
          const message = error.response?.data?.error?.message || error.message;
          console.error(`SVC: Playback control ${method} ${url} FAILED. Status: ${status || 'N/A'}. Message: ${message}`);
          // Handle 403 (e.g., premium required), 404 (no active device)
          return false;
      }
  }
  
  export const playTrack = () => controlPlayback('put', 'play');
  export const pauseTrack = () => controlPlayback('put', 'pause');
  export const nextTrack = () => controlPlayback('post', 'next');
  export const previousTrack = () => controlPlayback('post', 'previous');

  export async function getUserPlaylists(limit = 50) { // Fetch up to 50 playlists
    console.log('SVC: getUserPlaylists - Attempting fetch');
    try {
      const token = await getAccessToken();
      if (!token) throw new Error('No access token available');
  
      const response = await axios.get('https://api.spotify.com/v1/me/playlists', {
        headers: { Authorization: `Bearer ${token}` },
        params: { limit },
      });
  
      if (response.status === 200 && response.data && Array.isArray(response.data.items)) {
        console.log(`SVC: getUserPlaylists - Successfully fetched ${response.data.items.length} playlists.`);
        // Map to a simpler format if needed, or return items directly
        return response.data.items.map(item => ({
          id: item.id,
          name: item.name,
          imageUrl: item.images?.[0]?.url || '/default_playlist_art.png', // Add a default image
          owner: item.owner?.display_name || 'Spotify',
          type: item.type, // 'playlist'
          uri: item.uri // Useful for playback later
        }));
      }
      console.warn('SVC: getUserPlaylists - Unexpected response structure:', response.data);
      return []; // Return empty array if structure is wrong
  
    } catch (error) {
      const status = error.response?.status;
      const message = error.response?.data?.error?.message || error.message;
      console.error(`SVC: getUserPlaylists - FAILED. Status: ${status || 'N/A'}. Message: ${message}`);
       if (status === 403) {
          console.error("SVC: getUserPlaylists - ERROR: Check if 'playlist-read-private' scope is granted.");
      }
      return []; // Return empty array on failure
    }
  }

  export async function getUserProfile() {
    console.log('SVC: getUserProfile - Attempting fetch');
    try {
      const token = await getAccessToken();
      if (!token) throw new Error('No access token available');
  
      const response = await axios.get('https://api.spotify.com/v1/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
  
      if (response.status === 200 && response.data) {
        console.log(`SVC: getUserProfile - Success. User: ${response.data.display_name}`);
        return response.data; // Return the full user profile object
      }
      console.warn('SVC: getUserProfile - Unexpected response status:', response.status);
      return null;
  
    } catch (error) {
      const status = error.response?.status;
      const message = error.response?.data?.error?.message || error.message;
      console.error(`SVC: getUserProfile - FAILED. Status: ${status || 'N/A'}. Message: ${message}`);
      // Handle 403 Forbidden if scopes are missing? (Unlikely if login worked)
      return null; // Return null on failure
    }
  }

 
/**
 * Fetches the user's recently played tracks from Spotify.
 * @param {number} limit - Number of tracks to fetch (max 50).
 * @returns {Promise<object[]>} - Array of valid track objects.
 */
export async function getRecentlyPlayedTracks(limit = 50) {
  console.log(`SVC: getRecentlyPlayedTracks - Fetching last ${limit} tracks...`);

  try {
    const token = await getAccessToken();
    if (!token) throw new Error('No access token available');

    const response = await axios.get('https://api.spotify.com/v1/me/player/recently-played', {
      headers: { Authorization: `Bearer ${token}` },
      params: { limit },
    });

    const items = response.data?.items || [];

    // Filter tracks with valid ID
    const validTracks = items
      .map(item => item.track)
      .filter(track => track && track.id);

    console.log(`SVC: getRecentlyPlayedTracks - Valid tracks found: ${validTracks.length}`);

    if (validTracks.length === 0) {
      console.warn('SVC: getRecentlyPlayedTracks - No valid tracks found in history.');
    }

    return validTracks;
  } catch (error) {
    console.error(`SVC: getRecentlyPlayedTracks - FAILED`, error.response?.data || error.message);
    return [];
  }
}
  
  
/**
 * Fetches audio features for multiple Spotify track IDs.
 * @param {string[]} trackIds - Array of Spotify track IDs (max 100).
 * @returns {Promise<object[]>} - Array of audio feature objects.
 */
export async function getAudioFeaturesForTracks(trackIds) {
  if (!Array.isArray(trackIds) || trackIds.length === 0) {
    console.warn('SVC: getAudioFeaturesForTracks - No track IDs provided.');
    return [];
  }

  const uniqueTrackIds = [...new Set(trackIds.filter(id => !!id))];
  if (uniqueTrackIds.length === 0) { /* ... */ return []; }

  console.log(`SVC: getAudioFeaturesForTracks - Requesting features for IDs: ${uniqueTrackIds.join(',')}`); // Log IDs being sent

  try {
    const token = await getAccessToken();
    if (!token) throw new Error('No access token available');

    const response = await axios.get('https://api.spotify.com/v1/audio-features', {
      headers: { Authorization: `Bearer ${token}` },
      params: { ids: uniqueTrackIds.join(',') },
    });

    // *** ADDED LOGGING ***
    console.log('SVC: getAudioFeaturesForTracks - Raw API Response Data:', response.data);

    const features = response.data?.audio_features || [];
    console.log('SVC: getAudioFeaturesForTracks - Features array BEFORE filtering nulls:', features);

    const validFeatures = features.filter(f => f !== null);
    console.log(`SVC: getAudioFeaturesForTracks - Valid audio features AFTER filtering nulls: ${validFeatures.length}`);

    return validFeatures;
  } catch (error) {
    const status = error.response?.status;
    const message = error.response?.data?.error?.message || error.message;
     // *** ADDED LOGGING ***
     console.error(`SVC: getAudioFeaturesForTracks - CAUGHT ERROR. Status: ${status || 'N/A'}. Message: ${message}`, error);
    return [];
  }
}

export const getTopTracks = async (limit = 50, time_range = 'short_term') => {
  const token = await getAccessToken();
  const resp = await axios.get('https://api.spotify.com/v1/me/top/tracks', {
    headers: { Authorization: `Bearer ${token}` },
    params: { limit, time_range }
  });
  return (resp.data.items || []).filter(t => t && t.id);
};
