
import axios from 'axios'; 

export const loginWithSpotify = () => {
    window.location.href = 'http://localhost:8888/auth/login';
  };

// Add a request interceptor
axios.interceptors.request.use(
  (config) => {
    // Log details of the request before it is sent
    console.log(
      `[AXIOS INTERCEPTOR] Sending ${config.method.toUpperCase()} request to: ${config.url}`
    );
    // ---> Log the specific Authorization header being sent <---
    if (config.headers?.Authorization) {
      // Only log a portion of the token for security/readability
      const tokenSnippet = config.headers.Authorization.substring(0, 20); // "Bearer 123abcDEF..."
      console.log(`[AXIOS INTERCEPTOR] Authorization Header: ${tokenSnippet}...`);
    } else {
      console.log('[AXIOS INTERCEPTOR] No Authorization Header present.');
    }
    // Log params if GET request
    if (config.method === 'get' && config.params) {
        console.log('[AXIOS INTERCEPTOR] Params:', config.params);
    }
     // Log body if POST/PUT request
     if ((config.method === 'post' || config.method === 'put') && config.data) {
        console.log('[AXIOS INTERCEPTOR] Data:', config.data);
    }

    return config; // Continue the request
  },
  (error) => {
    // Do something with request error
    console.error('[AXIOS INTERCEPTOR] Request Error:', error);
    return Promise.reject(error);
  }
);

// You might also want an interceptor for responses to see errors globally
axios.interceptors.response.use(
  (response) => response, // Just pass through successful responses
  (error) => {
     console.error(
       `[AXIOS INTERCEPTOR] Response Error Status: ${error.response?.status}, URL: ${error.config?.url}`
     );
     return Promise.reject(error); // Continue rejecting the promise
  }
);


const TOKEN_ENDPOINT = '/api/auth/refresh'; // Your backend refresh endpoint

// Function to check if token is expired (add buffer, e.g., 60 seconds)
const isTokenExpired = (expiryTime) => {
  if (!expiryTime) return true;
  const bufferSeconds = 60;
  return Date.now() / 1000 > expiryTime - bufferSeconds;
};

// Function to perform the refresh
const refreshToken = async () => {
  console.log('[getAccessToken] Attempting to refresh token...');
  const storedRefreshToken = localStorage.getItem('spotify_refresh_token');

  if (!storedRefreshToken) {
    console.error('[getAccessToken] No refresh token found in localStorage.');
    // Handle appropriately - maybe redirect to login?
    localStorage.removeItem('spotify_access_token');
    localStorage.removeItem('spotify_token_expiry');
    // window.location.href = '/'; // Or trigger logout state
    return null;
  }

  try {
    const response = await axios.post(TOKEN_ENDPOINT, {
      refresh_token: storedRefreshToken, // Send in request body
    });

    const { access_token, expires_in } = response.data;
    const newExpiryTime = Math.floor(Date.now() / 1000) + expires_in;

    localStorage.setItem('spotify_access_token', access_token);
    localStorage.setItem('spotify_token_expiry', newExpiryTime.toString());
    // Optional: Update refresh token if backend sends a new one
    // if (response.data.refresh_token) {
    //   localStorage.setItem('spotify_refresh_token', response.data.refresh_token);
    // }
    console.log('[getAccessToken] Token refreshed successfully.');
    return access_token;
  } catch (error) {
    console.error(
      '[getAccessToken] Failed to refresh token:',
      error.response?.data || error.message
    );
    // Handle failure - clear tokens, redirect to login?
    localStorage.removeItem('spotify_access_token');
    localStorage.removeItem('spotify_refresh_token');
    localStorage.removeItem('spotify_token_expiry');
    // window.location.href = '/'; // Or trigger logout state
    return null;
  }
};

// The main function called by service files
export const getAccessToken = async () => {
  console.log('[getAccessToken] Function called.'); // Log entry

  const accessToken = localStorage.getItem('spotify_access_token');
  const expiryTime = parseInt(localStorage.getItem('spotify_token_expiry') || '0', 10);

  console.log(`[getAccessToken] Current Time: ${Math.floor(Date.now() / 1000)}, Expiry Time: ${expiryTime}`);

  if (!accessToken || isTokenExpired(expiryTime)) {
    console.log(
      `[getAccessToken] Token missing or expired (Expired: ${isTokenExpired(expiryTime)}). Refreshing...`
    );
    const newAccessToken = await refreshToken(); // Await the refresh
    if (newAccessToken) {
       console.log('[getAccessToken] Returning NEWLY REFRESHED token.');
       return newAccessToken;
    } else {
       console.error('[getAccessToken] Refresh failed, returning null.');
       return null; // Indicate failure
    }
  } else {
    console.log('[getAccessToken] Returning existing, valid token.');
    return accessToken; // Return valid stored token
  }
};

// --- Utility functions for login/logout ---
export const logout = () => {
  localStorage.removeItem('spotify_access_token');
  localStorage.removeItem('spotify_refresh_token');
  localStorage.removeItem('spotify_token_expiry');
  console.log('[spotifyAuth] Tokens cleared on logout.');
  // Optionally redirect: window.location.href = '/';
};

// You'll also need functions to handle the initial login callback
// to *store* the tokens received from the backend.
export const handleLoginCallback = () => {
   const queryParams = new URLSearchParams(window.location.search);
   const accessToken = queryParams.get('access_token');
   const refreshToken = queryParams.get('refresh_token');
   const expiresIn = queryParams.get('expires_in');

   if (accessToken && refreshToken && expiresIn) {
      const expiryTime = Math.floor(Date.now() / 1000) + parseInt(expiresIn, 10);
      localStorage.setItem('spotify_access_token', accessToken);
      localStorage.setItem('spotify_refresh_token', refreshToken);
      localStorage.setItem('spotify_token_expiry', expiryTime.toString());
      console.log('[spotifyAuth] Tokens received and stored from callback.');
      // Remove tokens from URL bar for cleanliness
      window.history.pushState({}, document.title, window.location.pathname);
      return true;
   } else {
       console.error('[spotifyAuth] Missing tokens in callback URL.');
       return false;
   }
};

  // export const getAccessToken = () => {
  //   let accessToken = localStorage.getItem('spotify_access_token');
  //   const expiresIn = localStorage.getItem('spotify_expires_in');
  
  //   if (accessToken && expiresIn) {
  //     const expirationTime = Number(expiresIn) * 1000; // Convert to milliseconds
  //     const currentTime = new Date().getTime();
  
  //     // If the token has expired, refresh it
  //     if (currentTime >= expirationTime) {
  //       refreshAccessToken();
  //     }
  //   }
  
  //   return accessToken;
  // };
  
  export const refreshAccessToken = async () => {
    const refreshToken = localStorage.getItem('spotify_refresh_token');
  
    if (!refreshToken) {
      console.error('No refresh token found');
      return;
    }
  
    try {
      const response = await fetch(`http://localhost:8888/auth/refresh_token?refresh_token=${refreshToken}`);
      const data = await response.json();
      const { access_token, expires_in } = data;
  
      localStorage.setItem('spotify_access_token', access_token);
      localStorage.setItem('spotify_expires_in', expires_in);
    } catch (error) {
      console.error('Error refreshing token:', error);
    }
  };
  