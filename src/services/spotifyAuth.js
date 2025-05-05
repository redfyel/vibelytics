export const loginWithSpotify = () => {
    window.location.href = 'http://localhost:8888/auth/login';
  };
  

  export const getAccessToken = () => {
    let accessToken = localStorage.getItem('spotify_access_token');
    const expiresIn = localStorage.getItem('spotify_expires_in');
  
    if (accessToken && expiresIn) {
      const expirationTime = Number(expiresIn) * 1000; // Convert to milliseconds
      const currentTime = new Date().getTime();
  
      // If the token has expired, refresh it
      if (currentTime >= expirationTime) {
        refreshAccessToken();
      }
    }
  
    return accessToken;
  };
  
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
  