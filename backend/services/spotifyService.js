// backend/services/spotifyService.js
import axios from 'axios';
import 'dotenv/config';

const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;

let accessToken = null;
let tokenExpiryTime = 0;

async function getAccessToken() {
  if (accessToken && Date.now() < tokenExpiryTime) return accessToken;
  const resp = await axios.post(
    'https://accounts.spotify.com/api/token',
    'grant_type=client_credentials',
    {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization:
          'Basic ' + Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64'),
      },
    }
  );
  accessToken = resp.data.access_token;
  tokenExpiryTime = Date.now() + (resp.data.expires_in - 60) * 1000;
  return accessToken;
}

// --- Helper for Mapping Track Data (Used by multiple functions) ---
const mapTrackData = (track) => {
    if (!track) return null; // Handle null tracks
    return {
        id: track.id,
        title: track.name || 'Unknown Title',
        image: track.album?.images?.[0]?.url || '/assets/default-album.png', // Safer image access
        subtitle: track.artists?.map(a => a.name).join(', ') || 'Unknown Artist', // Safer artist access
        type: 'track',
    };
};

// 1. Trending Songs → Top 50 Global playlist tracks
export async function getTrendingSongs(limit = 10) {
    console.log("SVC: getTrendingSongs (using Search)");
    try {
      const token = await getAccessToken();
      // Search for pop tracks, sort by relevance (default), filter by market
      const resp = await axios.get('https://api.spotify.com/v1/search', {
          headers: { Authorization: `Bearer ${token}` },
          params: {
              q: 'tag:new category:pop', // Try searching for new pop tracks
              type: 'track',
              market: 'IN',
              limit: limit // Get requested limit directly
          }
      });
      return resp.data?.tracks?.items?.map(mapTrackData).filter(t => t !== null) || []; // Map and filter nulls
    } catch(err) {
      console.error('❌ SVC [getTrendingSongs] error:', err.response?.status, err.message);
      return [];
    }
  }

// 2. Popular Artists → Search “pop” artists
export async function getPopularArtists(limit = 10) {
    try {
      const token = await getAccessToken();
      const searchQuery = 'b'; 
        
      const searchRes = await axios.get('https://api.spotify.com/v1/search', {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          q: searchQuery,
          type: 'artist',
          // market: market, // Temporarily removed
          limit: 50
        },
      });
  
  
      if (!searchRes.data?.artists?.items) {
           console.warn('🔍 [getPopularArtists] No artists found or unexpected response structure from search.');
           return [];
      }
    //   console.log(`🔍 [getPopularArtists] TEST: Found ${searchRes.data.artists.items.length} artists from search.`);
       // ... rest of the sorting/mapping logic ...
       // (Keep the existing logic for sorting by popularity and mapping)
       const artistsWithImages = searchRes.data.artists.items.filter(artist => artist.images && artist.images.length > 0);
       const popularArtists = artistsWithImages
         .sort((a, b) => b.popularity - a.popularity)
         .slice(0, limit);
    //    console.log(`🔍 [getPopularArtists] TEST: Returning top ${popularArtists.length} popular artists.`);
       return popularArtists.map(artist => ({
         id: artist.id,
         title: artist.name,
         image: artist.images[0].url,
         type: 'artist',
         subtitle: "Artist"
       }));
  
  
    } catch (err) {
      const status = err.response?.status;
      const failedUrl = err.config?.url;
      console.error(`❌ [getPopularArtists] Search error: ${status} on URL ${failedUrl} - ${err.message}`);
      // Add more detail if possible
      if (err.response?.data) {
          console.error('❌ Spotify Error Response:', JSON.stringify(err.response.data, null, 2));
      }
      return []; // Return empty array on error
    }
  }
  
// 3. New Releases → Latest albums & singles
export async function getNewReleases() {
  try {
    const token = await getAccessToken();
    const resp = await axios.get('https://api.spotify.com/v1/browse/new-releases', {
      headers: { Authorization: `Bearer ${token}` },
      params: { limit: 10 },
    });
    return resp.data.albums.items.map(album => ({
      id: album.id,
      title: album.name,
      image: album.images[0]?.url || '',
      subtitle: album.artists.map(a => a.name).join(', '),
      type: 'album',
    }));
  } catch {
    return [];
  }
}

// 4. Popular Radio → “Toplists” category playlists
export async function getPopularRadio(limit = 10, market = 'IN') {
    try {
      const token = await getAccessToken();
  
      const response = await axios.get('https://api.spotify.com/v1/browse/featured-playlists', {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        params: {
          limit: limit,
          market: market,
        },
      });
  
      const playlists = response.data.playlists?.items || [];
  
      return playlists.map(p => ({
        id: p.id,
        title: p.name,
        image: p.images?.[0]?.url || '',
        description: p.description,
        type: 'playlist',
      }));
    } catch (err) {
      console.error(
        `❌ [getPopularRadio] error: ${err.response?.status || '??'} ${err.response?.data?.error?.message || err.message}`
      );
      return [];
    }
  }
  


// 5. Featured Charts → Featured playlists
export async function getFeaturedCharts() {
    try {
      const token = await getAccessToken();
      const resp = await axios.get(
        'https://api.spotify.com/v1/browse/categories/toplists/playlists',
        {
          headers: { Authorization: `Bearer ${token}` },
          params: { country: 'IN', limit: 10 },
        }
      );
      return resp.data.playlists.items.map(pl => ({
        id: pl.id,
        title: pl.name,
        image: pl.images[0]?.url || '',
        type: 'playlist',
      }));
    } catch {
      return [];
    }
  }

// 6. India’s Best → Top 50 India playlist tracks
export async function getIndiasBest() {
    const playlistId = '37i9dQZEVXbLZ52XmnySJg'; // Updated Top 50 – India
    try {
      const token = await getAccessToken();
      const response = await axios.get(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          limit: 10,
          market: 'IN', // Specify market to ensure region-specific content
        },
      });
  
      const tracks = response.data.items || [];
  
      return tracks
        .filter(item => item.track && item.track.id)
        .map(item => ({
          id: item.track.id,
          title: item.track.name,
          image: item.track.album?.images?.[0]?.url || '',
          subtitle: item.track.artists.map(artist => artist.name).join(', '),
          type: 'track',
        }));
    } catch (error) {
      console.error('Failed to fetch India’s Best tracks:', error?.response?.data || error.message);
      return [];
    }
  }

  
export default {
  getTrendingSongs,
  getPopularArtists,
  getNewReleases,
  getPopularRadio,
  getFeaturedCharts,
  getIndiasBest,
  getAccessToken
};
