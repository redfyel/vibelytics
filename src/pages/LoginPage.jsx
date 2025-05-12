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
  <div className="flex items-center justify-center min-h-screen bg-[#121212] text-white">
    <div className="text-center p-8 rounded-lg shadow-lg max-w-md w-full bg-[#1a1a1a]">
      <h1 className="text-3xl font-bold mb-4">Welcome to <span className="text-[#1ED760]">Vibelytics</span></h1>
      <p className="mb-6 text-gray-300">Log in with Spotify to analyze your weekly vibes</p>
      {error && <p className="mb-4 text-red-500">{error}</p>}
      <button
        className="w-full bg-[#1ED760] hover:bg-[#1fdf64] text-black font-semibold py-3 px-6 rounded-full transition-all duration-200"
        onClick={handleLogin}
        disabled={loading}
      >
        {loading ? 'Redirecting to Spotify...' : 'Log in with Spotify'}
      </button>
    </div>
  </div>
);


export default LoginPage;
