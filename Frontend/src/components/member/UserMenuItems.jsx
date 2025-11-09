import React from "react";
import { Link } from "react-router-dom";
import { 
  Settings, 
  CheckCircle, 
  BarChart3, 
  FileText, 
  MessageSquare, 
  ShoppingCart, 
  Heart, 
  Briefcase, 
  User, 
  MessageCircle,
  Info,
  PlusCircle,
  AlertCircle,
  ShieldAlert
} from "lucide-react";

const UserMenuItems = ({ user, onItemClick }) => {
  // Check if user is seller - enhanced detection
  const isSeller = () => {
    // Always check from localStorage first (most reliable)
    try {
      const raw = localStorage.getItem("userData");
      if (raw) {
        const parsed = JSON.parse(raw);

        // Check direct role field
        const role = parsed?.role || parsed?.user?.role;
        if (role === "ROLE_SELLER" || role === "SELLER") {
          return true;
        }

        // Check roles array
        const roles = parsed?.roles || parsed?.user?.roles || [];
        if (Array.isArray(roles)) {
          const hasSellerRole = roles.some((r) => {
            const rName = typeof r === "string" ? r : r?.name;
            return rName === "ROLE_SELLER" || rName === "SELLER";
          });
          if (hasSellerRole) {
            return true;
          }
        }
      }
    } catch (e) {
      // Parse error, ignore
    }

    // Check from user prop (if provided)
    if (user) {
      const role = user?.role || user?.user?.role;
      if (role === "ROLE_SELLER" || role === "SELLER") {
        return true;
      }

      const roles = user?.roles || user?.user?.roles || [];
      if (
        Array.isArray(roles) &&
        roles.some((r) => {
          const rName = typeof r === "string" ? r : r?.name;
          return rName === "ROLE_SELLER" || rName === "SELLER";
        })
      ) {
        return true;
      }
    }

    // Check from JWT token scope (fallback)
    try {
      const token = localStorage.getItem("token");
      if (token) {
        const payload = JSON.parse(atob(token.split(".")[1]));
        const scope = (payload?.scope || "").toUpperCase();
        if (scope.includes("ROLE_SELLER")) {
          return true;
        }
      }
    } catch (e) {
      // Token decode error, ignore
    }

    return false;
  };

  // Check if user is buyer (ROLE_USER = BUYER in this system, but NOT SELLER, ADMIN, STAFF)
  const isBuyer = () => {
    // Not seller and has BUYER or USER role, or default member role
    if (isSeller()) return false;

    // Check if admin or staff (should not see buyer menu)
    const isAdminOrStaff = () => {
      try {
        const raw = localStorage.getItem("userData");
        if (raw) {
          const parsed = JSON.parse(raw);
          const role = parsed?.role || parsed?.user?.role;
          const roles = parsed?.roles || parsed?.user?.roles || [];

          const roleStr = role?.toUpperCase() || "";
          const rolesStr = Array.isArray(roles)
            ? roles.map(
                (r) =>
                  (typeof r === "string" ? r : r?.name)?.toUpperCase() || ""
              )
            : [];

          if (
            roleStr.includes("ADMIN") ||
            roleStr.includes("STAFF") ||
            rolesStr.some((r) => r.includes("ADMIN") || r.includes("STAFF"))
          ) {
            return true;
          }
        }

        if (user) {
          const role = (user?.role || user?.user?.role || "").toUpperCase();
          const roles = user?.roles || user?.user?.roles || [];
          const rolesStr = Array.isArray(roles)
            ? roles.map(
                (r) =>
                  (typeof r === "string" ? r : r?.name)?.toUpperCase() || ""
              )
            : [];

          if (
            role.includes("ADMIN") ||
            role.includes("STAFF") ||
            rolesStr.some((r) => r.includes("ADMIN") || r.includes("STAFF"))
          ) {
            return true;
          }
        }
      } catch (e) {
        // Ignore
      }
      return false;
    };

    if (isAdminOrStaff()) return false;

    // Default: if not seller, not admin, not staff, then assume buyer
    // But also check explicit roles for safety
    try {
      const raw = localStorage.getItem("userData");
      if (raw) {
        const parsed = JSON.parse(raw);

        // Check direct role field
        const role = (parsed?.role || parsed?.user?.role || "").toUpperCase();
        if (
          role === "ROLE_BUYER" ||
          role === "ROLE_USER" ||
          role === "BUYER" ||
          role === "USER" ||
          role === "MEMBER" ||
          role === "" ||
          !role
        ) {
          return true; // Default role or member/user = buyer
        }

        // Check roles array
        const roles = parsed?.roles || parsed?.user?.roles || [];
        if (Array.isArray(roles)) {
          const hasBuyerRole = roles.some((r) => {
            const rName = (
              typeof r === "string" ? r : r?.name || ""
            ).toUpperCase();
            return (
              rName === "ROLE_BUYER" ||
              rName === "ROLE_USER" ||
              rName === "BUYER" ||
              rName === "USER" ||
              rName === "MEMBER" ||
              rName === ""
            );
          });
          if (hasBuyerRole || roles.length === 0) {
            return true;
          }
        }
      }
    } catch (e) {
      // Parse error, ignore
    }

    // Check from user prop (if provided)
    if (user) {
      const role = (user?.role || user?.user?.role || "").toUpperCase();
      if (
        role === "ROLE_BUYER" ||
        role === "ROLE_USER" ||
        role === "BUYER" ||
        role === "USER" ||
        role === "MEMBER" ||
        role === "" ||
        !role
      ) {
        return true;
      }

      const roles = user?.roles || user?.user?.roles || [];
      if (Array.isArray(roles)) {
        const hasBuyerRole = roles.some((r) => {
          const rName = (
            typeof r === "string" ? r : r?.name || ""
          ).toUpperCase();
          return (
            rName === "ROLE_BUYER" ||
            rName === "ROLE_USER" ||
            rName === "BUYER" ||
            rName === "USER" ||
            rName === "MEMBER"
          );
        });
        if (hasBuyerRole || roles.length === 0) {
          return true;
        }
      }
    }

    // Check from JWT token scope (fallback)
    try {
      const token = localStorage.getItem("token");
      if (token) {
        const payload = JSON.parse(atob(token.split(".")[1]));
        const scope = (payload?.scope || "").toUpperCase();
        if (scope.includes("ROLE_BUYER") || scope.includes("ROLE_USER")) {
          return true;
        }
      }
    } catch (e) {
      // Token decode error, ignore
    }

    // Default: if user exists and not seller/admin/staff, assume buyer
    if (user || localStorage.getItem("userData")) {
      return true;
    }

    return false;
  };

  const menuItems = [
    { to: "/account", label: "Tài khoản", icon: Settings },
    { to: "/kyc", label: "Xác thực danh tính", icon: CheckCircle },
    { to: "/payment", label: "Quản lý ví & gói", icon: BarChart3 },
    { to: "/my-posts", label: "Tin đăng của tôi", icon: FileText },
    { to: "/my-orders", label: "Yêu cầu mua hàng", icon: MessageSquare },
    { to: "/ordered", label: "Các đơn hàng đã mua", icon: ShoppingCart },
    { to: "/saved-posts", label: "Tin đã lưu", icon: Heart },
    { to: "/contracts", label: "Hợp đồng", icon: Briefcase },
    // Reviews menu items
    ...(isSeller()
      ? [{ to: "/reviews-about-me", label: "Đánh giá về tôi", icon: User }]
      : []),
    { to: "/my-reviews", label: "Đánh giá tôi đã viết", icon: MessageCircle },
    // Complaints menu items
    // Seller: có cả "Khiếu nại của tôi" và "Khiếu nại về tôi"
    // Buyer: chỉ có "Khiếu nại của tôi"
    ...(isSeller()
      ? [
          { to: "/my-complaints", label: "Khiếu nại của tôi", icon: AlertCircle },
          { to: "/complaints-about-me", label: "Khiếu nại về tôi", icon: ShieldAlert },
        ]
      : []),
    ...(isBuyer()
      ? [{ to: "/my-complaints", label: "Khiếu nại của tôi", icon: AlertCircle }]
      : []),
  ];

  return (
    <>
      {menuItems.map((item, index) => {
        const Icon = item.icon;
        return (
          <Link
            key={index}
            to={item.to}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              padding: "10px 15px",
              color: "#333",
              textDecoration: "none",
              fontSize: "14px",
              transition: "background-color 0.2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f8f9fa")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
            onClick={onItemClick}
          >
            {Icon && <Icon size={18} style={{ flexShrink: 0 }} />}
            <span>{item.label}</span>
          </Link>
        );
      })}
    </>
  );
};

export default UserMenuItems;
