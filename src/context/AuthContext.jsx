import { createContext, useContext, useState } from "react";

const AuthContext = createContext(null);

function loadStoredAuth() {
  try {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");
    if (token && userData) {
      return JSON.parse(userData);
    }
  } catch {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  }
  return null;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(loadStoredAuth);

  const login = (token, userData) => {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  const updateUser = (userData) => {
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
  };

  return (
    // loading is always false because localStorage is read synchronously via lazy useState init
    <AuthContext.Provider value={{ user, loading: false, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  return useContext(AuthContext);
}
