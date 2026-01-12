import { useContext, createContext, useState } from "react";

const AuthContext = createContext(null);
import { useEffect } from "react";
import axios from "axios";
const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const confirmLogin = (userData) => {
    setUser(userData);
    setIsAuthenticated(true);
    setIsLoading(false);
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    setIsLoading(false);
  };

  const value = {
    user,
    isLoading,
    isAuthenticated,
    confirmLogin,
    logout,
  };

  useEffect(() => {
    const checkRouteState = async () => {
      const response = await axios.get("/api/username", {
        withCredentials: true,
      });

      if (response.status == 401) {
        // console.clear();
        console.log("rjkbgrkj");
        logout();
      } else if (response.status == 200) {
        confirmLogin(response.data.username);
      }
    };
    checkRouteState();
  }, []);
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
