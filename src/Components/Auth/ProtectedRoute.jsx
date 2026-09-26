import React, { useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { apiGet } from '../../api.js';

const ProtectedRoute = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const location = useLocation();

  useEffect(() => {
    const verifyToken = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setIsAuthenticated(false);
        return;
      }

      try {
        // Ping the backend to verify the token is actually valid
        const user = await apiGet('/api/auth/me');

        // Resolving the request is not proof of a session: require a real
        // identity field (the JWT payload carries id + email) before letting
        // the user in. `{}`, null, arrays or an HTML/error payload all fail here.
        const hasIdentity =
          user !== null &&
          typeof user === 'object' &&
          Boolean(user._id || user.id || user.email);

        if (!hasIdentity) {
          throw new Error('Session response did not contain a user identity');
        }

        setIsAuthenticated(true);
      } catch (err) {
        // If the token is invalid or expired, clear it and redirect
        localStorage.removeItem('token');
        setIsAuthenticated(false);
      }
    };

    verifyToken();
  }, [location.pathname]);

  // Wait until we know if they are authenticated before rendering children
  if (isAuthenticated === null) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', margin: '50px' }}>
        <h2>Verifying session...</h2>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // To cleanly handle React children array wrapping:
  return <>{children}</>;
};

export default ProtectedRoute;
