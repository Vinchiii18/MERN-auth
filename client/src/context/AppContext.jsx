import { createContext, useState } from "react";
import { toast } from "react-toastify";
import axios from "axios";

export const AppContent = createContext();

export const AppContextProvider = ({ children }) => {
  axios.defaults.withCredentials = true;

  // Dynamic backend URL
  const backendURL = import.meta.env.VITE_BACKEND_URL || window.location.origin;

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState(null);

  // Check if user is authenticated
  const getAuthState = async (fetchUserData = true) => {
    try {
      const { data } = await axios.get(`${backendURL}/api/auth/is-auth`);

      if (data.success) {
        setIsLoggedIn(true);

        // Only fetch user data if requested
        if (fetchUserData) {
          await getUserData();
        }
      } else {
        setIsLoggedIn(false);
        setUserData(null);
      }
    } catch (error) {
      setIsLoggedIn(false);
      setUserData(null);
      console.error("Auth check failed:", error.message);
    }
  };

  // Fetch user data
  const getUserData = async () => {
    try {
      const { data } = await axios.get(`${backendURL}/api/user/data`);
      if (data.success) {
        setUserData(data.userData);
      } else {
        setUserData(null);
        toast.error(data.message || "Failed to fetch user data");
      }
    } catch (error) {
      setUserData(null);
      if (error.response?.status === 401) {
        setIsLoggedIn(false);
        toast.error("Session expired. Please login again.");
      } else {
        toast.error(error.message);
      }
    }
  };

  const value = {
    backendURL,
    isLoggedIn,
    setIsLoggedIn,
    userData,
    setUserData,
    getAuthState,
    getUserData,
  };

  return <AppContent.Provider value={value}>{children}</AppContent.Provider>;
};
