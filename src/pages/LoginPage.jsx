import React, { useState } from 'react';

const LoginPage = () => {
  const [loading, setLoading] = useState(false);

  const handleLogin = () => {
    console.log('VITE_CLIENT_ID:', import.meta.env.VITE_CLIENT_ID);
    console.log('VITE_REDIRECT_URI:', import.meta.env.VITE_REDIRECT_URI);
    setLoading(true);

    const clientId = import.meta.env.VITE_CLIENT_ID;
    const redirectUri = import.meta.env.VITE_REDIRECT_URI;
    const scope = [
      'user-read-private',
      'user-read-email',
      'user-top-read', 
      'user-read-recently-played', 
      'user-library-read',
      'playlist-read-private', 
      'user-read-playback-state', 
      'user-modify-playback-state', 
      'user-read-currently-playing' 
    ].join(' ');
    const responseType = 'code'; 

    const authUrl = `https://accounts.spotify.com/authorize?client_id=${clientId}&response_type=${responseType}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scope)}`;

    console.log('Redirecting to:', authUrl);
    
    
    window.location = authUrl;
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <h1 className="login-title">Welcome to Spotify</h1>
        <p className="login-description">Log in to access your music and playlists</p>
        <button className="login-button" onClick={handleLogin} disabled={loading}>
          {loading ? 'Redirecting to Spotify...' : 'Log in with Spotify'}
        </button>
      </div>
    </div>
  );
};

export default LoginPage;
