import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const CallbackHandler = () => {
  const navigate = useNavigate();
  const location = useLocation(); // Use useLocation to get search params easily
  const processedRef = useRef(false); // Prevent double execution in StrictMode
  const [message, setMessage] = useState('Processing authentication, please wait...');

  useEffect(() => {
    // Prevent execution if already processed or if running again due to StrictMode
    if (processedRef.current) {
      console.log("CallbackHandler: Effect re-run skipped.");
      return;
    }
    processedRef.current = true; // Mark as processed for this mount

    const exchangeCodeForTokens = async (code, verifier) => {
      const clientId = import.meta.env.VITE_CLIENT_ID;
      const redirectUri = import.meta.env.VITE_REDIRECT_URI;
      const tokenUrl = 'https://accounts.spotify.com/api/token';

      const payload = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: clientId,
          grant_type: 'authorization_code',
          code: code,
          redirect_uri: redirectUri,
          code_verifier: verifier, // Send the original verifier
        }),
      };

      try {
        console.log("CallbackHandler: Exchanging code for tokens...");
        const response = await fetch(tokenUrl, payload);
        const data = await response.json();

        if (!response.ok) {
          // Throw an error if response status is not OK
          throw new Error(`Token exchange failed: ${data.error || response.statusText} - ${data.error_description || ''}`);
        }

        console.log('Tokens received:', data);

        // Store tokens and expiry time
        localStorage.setItem('spotify_access_token', data.access_token);
        localStorage.setItem('spotify_refresh_token', data.refresh_token);
        const expiryTime = new Date().getTime() + data.expires_in * 1000;
        localStorage.setItem('spotify_token_expiry', expiryTime.toString());

        // Clean up the verifier from localStorage
        localStorage.removeItem('pkce_code_verifier');
        console.log('Tokens stored and verifier cleaned.');

        // Redirect to the main application page
        navigate('/home'); // Or '/' or '/profile' etc.

      } catch (error) {
        console.error('CallbackHandler: Token Exchange Error:', error);
        setMessage(`Authentication failed: ${error.message}. Redirecting to login...`);
        // Clean up potentially invalid stored items
        localStorage.removeItem('pkce_code_verifier');
        // Redirect back to login with an error indicator
        setTimeout(() => navigate(`/auth/login?error=token_exchange_failed`), 3000); // Delay redirect slightly
      }
    };

    // --- Main logic ---
    const params = new URLSearchParams(location.search);
    const code = params.get('code');
    const error = params.get('error');
    // Optional: Check state parameter if you used one

    if (error) {
      console.error('CallbackHandler: Error received from Spotify:', error);
      setMessage(`Authentication error from Spotify: ${error}. Redirecting to login...`);
      localStorage.removeItem('pkce_code_verifier'); // Clean up
      setTimeout(() => navigate(`/auth/login?error=${encodeURIComponent(error)}`), 3000);
      return; // Stop processing
    }

    if (code) {
      // Retrieve the verifier stored earlier
      const verifier = localStorage.getItem('pkce_code_verifier');

      if (verifier) {
        console.log("CallbackHandler: Found code and verifier. Proceeding with token exchange.");
        exchangeCodeForTokens(code, verifier);
      } else {
        console.error('CallbackHandler: Code received but PKCE verifier missing from storage.');
        setMessage('Authentication flow error: Missing internal state (verifier). Redirecting to login...');
        setTimeout(() => navigate('/auth/login?error=missing_verifier'), 3000);
      }
    } else {
        // This case should ideally not happen if Spotify redirects correctly without error
        console.error('CallbackHandler: No code or error found in URL parameters.');
        setMessage('Invalid callback state. Redirecting to login...');
        localStorage.removeItem('pkce_code_verifier'); // Clean up
        setTimeout(() => navigate('/auth/login?error=invalid_callback'), 3000);
    }

  }, [navigate, location]); // Depend on navigate and location

  return <p>{message}</p>; // Display status message to the user
};

export default CallbackHandler;