import { useContext, createContext, useState, useEffect } from "react";
import { profile } from "../services/api-service";
import { logout as logoutApi } from "../services/api-service";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState();

  useEffect(() => {
    profile()
      .then((data) => setUser(data))
      .catch(() => setUser(null));
  }, []);

  function logout() {
    logoutApi()
      .then(() => {
        setUser(null);
      })
      .catch((error) => console.error("Logout error:", error));
  }

  function register(userData) {
    return registerApi(userData)
      .then((newUser) => {
        setUser(newUser);
      })
      .catch((error) => {
        console.error("Register error:", error);
        throw error; 
      });
  }

  function login(user) {
    setUser(user);
  }

  const contextData = {
    user,
    login,
    logout,
    register,
  };

  if (user === undefined) {
    return null;
  }

  return (
    <AuthContext.Provider value={contextData}>{children}</AuthContext.Provider>
  );
}

export function useAuthContext() {
  return useContext(AuthContext);
}
