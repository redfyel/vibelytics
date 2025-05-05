import React, { useState } from 'react';
import { generatePKCECodes } from '../utils/pkce'; // Adjust path if needed

const LoginPage = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null); // To display errors

  const handleLogin = async () => {
    setLoading(true);
    setError(null); // Clear previous errors

    try {
      // 1. Generate PKCE codes
      const { verifier, challenge } = await generatePKCECodes();

      // 2. Store the verifier in localStorage (or sessionStorage)
      //    It needs to persist until the callback page loads
      localStorage.setItem('pkce_code_verifier', verifier);
      console.log('Stored PKCE Verifier');

      // 3. Prepare Spotify authorization URL
      const clientId = import.meta.env.VITE_CLIENT_ID;
      const redirectUri = import.meta.env.VITE_REDIRECT_URI;
      const scope = [
        'user-read-private', 'user-read-email', 'user-top-read',
        'user-read-recently-played', 'user-library-read', 'playlist-read-private',
        'user-read-playback-state', 'user-modify-playback-state', 'user-read-currently-playing'
      ].join(' ');
      const responseType = 'code'; // Correct type for this flow

      const params = new URLSearchParams({
        client_id: clientId,
        response_type: responseType,
        redirect_uri: redirectUri,
        scope: scope,
        code_challenge_method: 'S256', // Method used for challenge
        code_challenge: challenge,     // The generated challenge
        // Optional: Add state for CSRF protection
        // state: generateRandomString(16) // Generate and store state if needed
      });

      const authUrl = `https://accounts.spotify.com/authorize?${params.toString()}`;

      console.log('VITE_CLIENT_ID:', clientId);
      console.log('VITE_REDIRECT_URI:', redirectUri);
      console.log('Redirecting to:', authUrl);

      // 4. Redirect user to Spotify
      window.location = authUrl;

    } catch (err) {
      console.error("Login Error:", err);
      setError("Failed to initiate login. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <h1 className="login-title">Welcome to Vibelytics</h1> {/* Updated Title */}
        <p className="login-description">Log in with Spotify to analyze your vibes</p> {/* Updated Desc */}
        {error && <p className="login-error">{error}</p>} {/* Display errors */}
        <button className="login-button" onClick={handleLogin} disabled={loading}>
          {loading ? 'Redirecting to Spotify...' : 'Log in with Spotify'}
        </button>
      </div>
    </div>
  );
};

export default LoginPage;