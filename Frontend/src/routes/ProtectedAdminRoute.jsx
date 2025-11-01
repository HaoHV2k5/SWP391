import { Navigate } from "react-router-dom";

export default function ProtectedAdminRoute({ children, user }) {
  const token = localStorage.getItem("token");
  const userData = JSON.parse(localStorage.getItem("userData") || "null");
  
  // Kiểm tra role từ nhiều nguồn
  let userRole = null;
  if (user?.user?.role) {
    userRole = user.user.role;
  } else if (user?.role) {
    userRole = user.role;
  } else if (user?.roles && user.roles.length > 0) {
    userRole = user.roles[0].name || user.roles[0];
  } else if (userData?.user?.role) {
    userRole = userData.user.role;
  } else if (userData?.role) {
    userRole = userData.role;
  } else if (userData?.roles && userData.roles.length > 0) {
    userRole = userData.roles[0].name || userData.roles[0];
  }

  // Nếu không có token hoặc không phải admin thì redirect về trang chủ
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  
  if (userRole !== "ROLE_ADMIN" && userRole !== "ADMIN") {
    return <Navigate to="/" replace />;
  }

  return children;
}

