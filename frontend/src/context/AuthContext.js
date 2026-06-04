import React, { createContext, useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import authService from '../services/authService';

const AuthContext = createContext(null);

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(
    localStorage.getItem('smartstudy_token') || '',
  );
  const [loading, setLoading] = useState(Boolean(token));

  useEffect(() => {
    if (token) {
      localStorage.setItem('smartstudy_token', token);
    } else {
      localStorage.removeItem('smartstudy_token');
      setUser(null);
    }
  }, [token]);

  useEffect(() => {
    const restoreSession = async () => {
      if (!token) return;

      try {
        const profile = await authService.getProfile();
        setUser(profile.user);
      } catch (error) {
        setToken('');
      } finally {
        setLoading(false);
      }
    };

    restoreSession();
  }, [token]);

  const login = (payload) => {
    setToken(payload.token);
    setUser(payload.user);
  };

  const logout = () => {
    setToken('');
  };

  const updateUser = (userData) => {
    setUser(userData);
  };

  const value = useMemo(
    () => ({
      user,
      token,
      login,
      logout,
      updateUser,
      isAuthenticated: Boolean(token),
      loading,
    }),
    [user, token, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export { AuthContext, AuthProvider };
