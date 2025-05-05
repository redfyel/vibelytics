import React, { useEffect, useRef } from 'react'; // Import useRef
import { useNavigate } from 'react-router-dom';

const CallbackHandler = () => {
  const navigate = useNavigate();
  // Ref to track if processing has occurred in this mount cycle
  const processedRef = useRef(false);

  useEffect(() => {
    // Check if the effect has already been processed (to avoid re-runs in StrictMode)
    if (processedRef.current) {
      console.log("CallbackHandler: Effect re-run skipped (processedRef is true)");
      return;
    }

    // Extract query parameters from the URL
    const params = new URLSearchParams(window.location.search);
    const accessToken = params.get('access_token');
    const refreshToken = params.get('refresh_token');
    const expiresIn = params.get('expires_in');
    const error = params.get('error');

    // Handle error case
    if (error) {
      console.error('Authentication error from Spotify:', error);
      processedRef.current = true;
      navigate(`/auth/login?error=${encodeURIComponent(error)}`);
      return; // Exit early if there was an error
    }

    // If both tokens and expiration time are found, store them
    if (accessToken && refreshToken && expiresIn) {
      // Store tokens in localStorage
      localStorage.setItem('spotify_access_token', accessToken);
      localStorage.setItem('spotify_refresh_token', refreshToken);
      const expiryTime = new Date().getTime() + parseInt(expiresIn, 10) * 1000;
      localStorage.setItem('spotify_token_expiry', expiryTime.toString());
      console.log('Tokens stored successfully.');

      processedRef.current = true;
      navigate('/home' || '/'); // Redirect to the main app or dashboard
    } else {
      // If tokens or expiration time is missing
      console.error('CallbackHandler: Missing tokens or expiration time.');
      processedRef.current = true;
      navigate('/auth/login?error=callback_failed_missing_tokens'); // Redirect to error page
    }

  }, [navigate]); // Only re-run if navigate changes (which is rare in this case)

  return <p>Processing authentication, please wait...</p>;
};

export default CallbackHandler;
