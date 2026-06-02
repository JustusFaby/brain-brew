import { useContext } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

export default function ProtectedRoute({ children }) {
  const { token, isStudying, currentRoomId } = useContext(AuthContext);
  const location = useLocation();

  // Redirect to login if not authenticated
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Hard navigation lock: if studying and not on the current room page, redirect back
  if (isStudying && currentRoomId) {
    const roomPath = `/room/${currentRoomId}`;
    if (location.pathname !== roomPath) {
      return <Navigate to={roomPath} replace />;
    }
  }

  return children;
}
