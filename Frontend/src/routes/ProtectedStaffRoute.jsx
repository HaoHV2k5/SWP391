// src/routes/ProtectedStaffRoute.jsx
import { Navigate } from "react-router-dom";
import { isStaff } from "../utils/auth";

export default function ProtectedStaffRoute({ user, children }) {
  const role = user?.user?.role || user?.role;
  return isStaff(role) ? children : <Navigate to="/" replace />;
}
