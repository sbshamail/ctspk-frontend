// hooks/useUser.ts
import { useState, useEffect } from 'react';
import { getCookie } from 'cookies-next';

export const useUser = () => {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const getUserFromCookies = () => {
      try {
        const userSession = getCookie('user_session');
        if (userSession) {
          const userData = JSON.parse(decodeURIComponent(userSession as string));
          setUser(userData);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error("Error parsing user session:", error);
        setUser(null);
      }
    };

    getUserFromCookies();

    // Check for user session changes periodically
    const interval = setInterval(getUserFromCookies, 2000);

    return () => clearInterval(interval);
  }, []);

  return user;
};