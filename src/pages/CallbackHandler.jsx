// src/components/CallbackHandler.jsx
import React, { useEffect, useRef } from 'react'; // Import useRef
import { useNavigate } from 'react-router-dom';

const CallbackHandler = () => {
  const navigate = useNavigate();
  // Ref to track if processing has occurred in this mount cycle
  const processedRef = useRef(false);

  useEffect(() => {
    // --- Check if already processed in this cycle (for StrictMode) ---
    // If the ref is true, it means we likely already stored tokens and navigated
    // on the first run of this effect in StrictMode. Don't do anything on the re-run.
    if (processedRef.current) {
      console.log("CallbackHandler: Effect re-run skipped (processedRef is true)");
      return;
    }
    // --- End StrictMode check ---

    const params = new URLSearchParams(window.location.search);
    const accessToken = params.get('access_token');
    const refreshToken = params.get('refresh_token');
    const expiresIn = params.get('expires_in');
    const error = params.get('error');

    if (error) {
       console.error('Authentication error from backend:', error);
       processedRef.current = true; // Mark as processed
       navigate(`/auth/login?error=${encodeURIComponent(error)}`);
       return; // Stop execution
    }

    if (accessToken && refreshToken && expiresIn) {
      // Store tokens
      localStorage.setItem('spotify_access_token', accessToken);
      localStorage.setItem('spotify_refresh_token', refreshToken);
      const expiryTime = new Date().getTime() + parseInt(expiresIn, 10) * 1000;
      localStorage.setItem('spotify_token_expiry', expiryTime.toString());
      console.log('Tokens stored successfully.');

      processedRef.current = true; // Mark as processed
      navigate('/'); // Navigate to main app
    } else {
      // This block now only runs if tokens were genuinely missing on the FIRST run
      // (or if error was also missing)
      console.error('Callback handler: Missing tokens or error in URL on initial load.');
      processedRef.current = true; // Mark as processed
      // Navigate to login indicating a failure in the callback process
      navigate('/auth/login?error=callback_failed_missing_tokens');
    }

  // Run only once on initial mount (in Production).
  // Ref helps manage StrictMode's double invocation in Development.
  }, [navigate]); // Dependency array includes navigate

  return <p>Processing authentication, please wait...</p>;
};

export default CallbackHandler;