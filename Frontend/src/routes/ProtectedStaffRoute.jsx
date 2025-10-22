import { Navigate } from "react-router-dom";

export default function ProtectedStaffRoute({ children }) {
  const token = localStorage.getItem("token");
  const userData = JSON.parse(localStorage.getItem("userData") || "null");
  const role = userData?.user?.role || userData?.role || userData?.data?.role;

  if (!token) return <Navigate to="/login" replace />;
  if (role !== "ROLE_STAFF" && role !== "staff")
    return <Navigate to="/" replace />;

  return children;
}
