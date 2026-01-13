import { useContext, createContext, useState } from "react";

const AuthContext = createContext(null);
import { useEffect } from "react";
import axios from "axios";

// REMINDER FOR MYSELF
// So /username end point returns the username if there's a token in the cookie
// if there is no token in cookie, it throws a 401 error.. this means that the token got expired..
// so fix it by logouting / using refresh token

/* 
This AuthProvider Checks
*/
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
      try {
        const response = await axios.get("/api/username", {
          withCredentials: true,
        });
        if (response.status == 200) {
          confirmLogin(response.data.username);
        }
      } catch (error) {
        console.log("AuthProvider Error: ", error);
        logout(); //run refresh token here instead of this logout
      } finally {
        setIsLoading(false);
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
