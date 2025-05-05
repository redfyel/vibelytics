import React, { useEffect, useState } from 'react';
import { getAccessToken } from '../services/spotifyAuth';

const UserProfile = () => {
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const accessToken = getAccessToken();
    if (accessToken) {
      fetch('https://api.spotify.com/v1/me', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })
        .then((response) => response.json())
        .then((data) => setUserData(data))
        .catch((error) => console.error('Error fetching profile data:', error));
    }
  }, []);

  return (
    <div>
      {userData ? (
        <div>
          <h1>{userData.display_name}</h1>
          <img src={userData.images[0]?.url} alt="Profile" />
        </div>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
};

export default UserProfile;
