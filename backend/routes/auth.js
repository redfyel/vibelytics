import express from 'express';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();
console.log('ENV DEBUG:', {
  SPOTIFY_CLIENT_ID: process.env.SPOTIFY_CLIENT_ID,
  SPOTIFY_CLIENT_SECRET: process.env.SPOTIFY_CLIENT_SECRET,
  REDIRECT_URI: process.env.REDIRECT_URI,
  FRONTEND_URI: process.env.FRONTEND_URI,
});

// LOGIN ROUTE (Step 1)
router.get('/login', (req, res) => {
  const scope = [
   'user-read-private',
'user-read-email',
'user-top-read', // Needed for getTopTracks
'user-read-recently-played', // Needed for getRecentlyPlayedTracks
'user-library-read',
'playlist-read-private', // Needed for getUserPlaylists
'user-read-playback-state', // Needed for getCurrentPlaybackState, etc.
'user-modify-playback-state', // Needed for playback controls
'user-read-currently-playing' // Needed for getCurrentPlaybackState
  ].join(' ');

  // DEBUG: Check client credentials
  console.log('Login route hit');
  console.log('CLIENT_ID:', process.env.SPOTIFY_CLIENT_ID);
  console.log('REDIRECT_URI:', process.env.REDIRECT_URI);

  const queryParams = new URLSearchParams({
    response_type: 'code',
    client_id: process.env.SPOTIFY_CLIENT_ID,
    scope,
    redirect_uri: process.env.REDIRECT_URI,
  });

  const authUrl = `https://accounts.spotify.com/authorize?${queryParams}`;
  console.log('Redirecting to:', authUrl);

  // Redirect user to Spotify's OAuth authorization page
  res.redirect(authUrl);
});

// CALLBACK ROUTE (Step 2)
router.get('/callback', async (req, res) => {
  const code = req.query.code || null;
  console.log('Callback hit with code:', code);

  if (!code) {
    return res.status(400).send('Missing code parameter');
  }

  try {
    const body = new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: process.env.REDIRECT_URI,
      client_id: process.env.SPOTIFY_CLIENT_ID,
      client_secret: process.env.SPOTIFY_CLIENT_SECRET,
    });

    const response = await axios.post(
      'https://accounts.spotify.com/api/token',
      body.toString(),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    const { access_token, refresh_token, expires_in } = response.data;

    // Sending tokens to frontend
    const query = new URLSearchParams({
      access_token,
      refresh_token,
      expires_in,
    });

    res.redirect(`${process.env.FRONTEND_URI}/callback?${query}`);
  } catch (err) {
    console.error('Token exchange error:', err.response?.data || err.message);
    res.status(500).send('Authentication failed');
  }
});

router.post('/refresh', async (req, res) => {
  const { refresh_token } = req.body; // Get refresh token from request body

  if (!refresh_token) {
    return res.status(400).json({ error: 'Refresh token is required' });
  }

  console.log("Backend /refresh hit with token:", refresh_token ? 'Present' : 'Missing');

  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
      console.error("FATAL: Missing Spotify Client ID or Secret on backend for refresh.");
      return res.status(500).json({ error: 'Server configuration error' });
  }

  // Prepare credentials for Basic Auth header
  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

  try {
    const body = new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refresh_token,
    });

    const response = await axios.post(
      'https://accounts.spotify.com/api/token',
      body.toString(),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${credentials}`, // Use Basic Auth for refresh
        },
      }
    );

    const { access_token, expires_in, scope, token_type } = response.data;
    // Note: Spotify might sometimes return a new refresh_token here as well.
    // If response.data.refresh_token exists, you might want to send it back
    // to the client to update localStorage, but it's often the same.

    console.log("Backend /refresh successful. New access token obtained.");
    res.json({
      access_token: access_token,
      expires_in: expires_in,
      // refresh_token: response.data.refresh_token // Optional: Send back if needed
    });

  } catch (err) {
    console.error('Backend /refresh - Token refresh error:', err.response?.data || err.message);
    // Send specific error status back if possible
    res.status(err.response?.status || 500).json({
        error: 'Failed to refresh token',
        details: err.response?.data || err.message
     });
  }
});


export default router;
