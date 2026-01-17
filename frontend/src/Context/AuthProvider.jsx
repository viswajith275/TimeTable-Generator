import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";

const AuthContext = createContext(null);

/*
  Single responsibility:
  - fetchCurrentUser: gets user if token is valid
  - refreshToken: refreshes token then retries fetch
  - confirmLogin / logout: state transitions
*/

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const confirmLogin = (username) => {
    setUser(username);
    setIsAuthenticated(true);
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
  };

  const fetchCurrentUser = async () => {
    const response = await axios.get("/api/username", {
      withCredentials: true,
    });
    return response.data.username;
  };

  const refreshToken = async () => {
    await axios.post("/api/refresh", { withCredentials: true });
    return fetchCurrentUser();
  };

  useEffect(() => {
    const initAuth = async () => {
      try {
        const username = await fetchCurrentUser();
        confirmLogin(username);
      } catch (error) {
        try {
          const username = await refreshToken();
          confirmLogin(username);
        } catch (refreshError) {
          logout();
        }
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const value = {
    user,
    isAuthenticated,
    isLoading,
    confirmLogin,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
