import { createContext, useState, useEffect } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [isStudying, setIsStudying] = useState(() => {
    return sessionStorage.getItem("isStudying") === "true";
  });
  const [currentRoomId, setCurrentRoomId] = useState(() => {
    return sessionStorage.getItem("currentRoomId") || null;
  });
  const [sessionId, setSessionId] = useState(null);

  // Persist isStudying to sessionStorage
  useEffect(() => {
    sessionStorage.setItem("isStudying", isStudying ? "true" : "false");
  }, [isStudying]);

  // Persist currentRoomId to sessionStorage
  useEffect(() => {
    if (currentRoomId) {
      sessionStorage.setItem("currentRoomId", currentRoomId);
    } else {
      sessionStorage.removeItem("currentRoomId");
    }
  }, [currentRoomId]);

  // Hydrate user from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser && token) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const login = (userData, tokenValue) => {
    setUser(userData);
    setToken(tokenValue);
    localStorage.setItem("token", tokenValue);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setIsStudying(false);
    setCurrentRoomId(null);
    setSessionId(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    sessionStorage.removeItem("isStudying");
    sessionStorage.removeItem("currentRoomId");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        logout,
        isStudying,
        setIsStudying,
        currentRoomId,
        setCurrentRoomId,
        sessionId,
        setSessionId,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
