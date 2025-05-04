import axios from "axios";
import React, { createContext, useEffect, useState } from "react";
import { toast } from "react-toastify";

export const AppContext = createContext();

export const AppContextProvider = (props) => {

  axios.defaults.withCredentials = true;

  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState(null);

  const getAuthState = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/auth/is-auth`);
      if (data.success) {
        setIsLoggedIn(true);
        getUserData(); // Fetch user data only if authenticated
      }
    } catch (error) {
      console.error(error); // Log error for debugging
      toast.error(error?.response?.data?.message || "Failed to check authentication.");
    }
  };

  const getUserData = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/user/data`);
      if (data.success) {
        setUserData(data.userData);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error(error); // Log error for debugging
      toast.error(error?.response?.data?.message || "Failed to fetch user data.");
    }
  };

  useEffect(() => {
    getAuthState(); // This will check authentication and fetch user data
  }, []);

  const value = {
    backendUrl,
    isLoggedIn, setIsLoggedIn,
    userData, setUserData,
    getUserData
  };

  return (
    <AppContext.Provider value={value}>
      {props.children}
    </AppContext.Provider>
  );
};
