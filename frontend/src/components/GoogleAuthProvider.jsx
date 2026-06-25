import React, { createContext, useContext, useEffect, useState } from 'react';

const GoogleAuthContext = createContext(null);

export const GoogleAuthProvider = ({ children }) => {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Check if google is already loaded
    if (window.google && window.google.accounts) {
      setIsLoaded(true);
      return;
    }

    // If not, load it or check if script is already present
    const script = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
    if (script) {
      const handleLoad = () => setIsLoaded(true);
      script.addEventListener('load', handleLoad);
      return () => script.removeEventListener('load', handleLoad);
    } else {
      const newScript = document.createElement('script');
      newScript.src = 'https://accounts.google.com/gsi/client';
      newScript.async = true;
      newScript.defer = true;
      newScript.onload = () => setIsLoaded(true);
      document.head.appendChild(newScript);
    }
  }, []);

  return (
    <GoogleAuthContext.Provider value={{ isLoaded }}>
      {children}
    </GoogleAuthContext.Provider>
  );
};

export const useGoogleAuth = () => useContext(GoogleAuthContext);
