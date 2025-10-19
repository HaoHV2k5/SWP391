import { useState } from "react";
import { UserPlus, Edit, Lock, Unlock } from "lucide-react";
import adminService from "../../services/adminService";
import { toast } from "react-toastify";

const UsersTab = ({ users, setUsers, loading, setLoading }) => {
  const [showCreateUserModal, setShowCreateUserModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [newUser, setNewUser] = useState({
    fullname: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    gender: "Nam",
    yob: "01/01/1990",
    address: "Địa chỉ mặc định",
    role: "member",
  });

  // Tạo user mới
  const handleCreateUser = async () => {
    try {
      setLoading(true);
      await adminService.createUser(newUser);
      toast.success("Tạo user thành công!");
      setShowCreateUserModal(false);
      setNewUser({
        fullname: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: "",
        gender: "Nam",
        yob: "01/01/1990",
        address: "Địa chỉ mặc định",
        role: "member",
      });
      // Reload danh sách users
      loadUsers();
    } catch (error) {
      console.error("Error creating user:", error);
      console.error("Error response:", error.response?.data);
      console.error("Error status:", error.response?.status);
      toast.error(
        `Lỗi khi tạo user: ${error.response?.data?.message || error.message}`
      );
    } finally {
      setLoading(false);
    }
  };

  // Load users từ API
  const loadUsers = async () => {
    try {
      console.log("🔄 Starting loadUsers...");
      setLoading(true);

      const token = localStorage.getItem("token");
      console.log("🔑 Current token:", token);

      if (!token || token === "admin-token-123") {
        console.error("❌ Invalid token! Please login properly.");
        toast.error("Vui lòng đăng nhập lại!");
        return;
      }

      console.log("📡 Calling adminService.getAllUsers()...");
      const response = await adminService.getAllUsers();
      console.log("📡 API Response:", response);

      setUsers(response.data || response);
      console.log("📋 Users loaded:", response.data || response);
    } catch (error) {
      console.error("❌ Error loading users:", error);
      console.error("❌ Error details:", error.response?.data);
      console.error("❌ Error status:", error.response?.status);
      toast.error("Lỗi khi tải danh sách users!");
    } finally {
      setLoading(false);
    }
  };

  // Khóa user
  const handleLockUser = async (userId) => {
    try {
      console.log("🔒 Locking user:", userId);
      setLoading(true);
      await adminService.lockUser(userId);
      console.log("✅ User locked successfully");
      toast.success("Khóa user thành công!");
      loadUsers(); // Reload danh sách
    } catch (error) {
      console.error("❌ Error locking user:", error);
      toast.error("Lỗi khi khóa user!");
    } finally {
      setLoading(false);
    }
  };

  // Mở khóa user
  const handleUnlockUser = async (userId) => {
    try {
      console.log("🔓 Unlocking user:", userId);
      setLoading(true);
      await adminService.unlockUser(userId);
      console.log("✅ User unlocked successfully");
      toast.success("Mở khóa user thành công!");
      loadUsers(); // Reload danh sách
    } catch (error) {
      console.error("❌ Error unlocking user:", error);
      toast.error("Lỗi khi mở khóa user!");
    } finally {
      setLoading(false);
    }
  };

  // Pagination logic
  const totalPages = Math.ceil(users.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentUsers = users.slice(startIndex, endIndex);

  console.log("📊 Pagination debug:", {
    totalUsers: users.length,
    itemsPerPage,
    totalPages,
    currentPage,
    startIndex,
    endIndex,
    currentUsersLength: currentUsers.length,
  });

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Chưa có";
    try {
      return new Date(dateString).toLocaleDateString("vi-VN");
    } catch {
      return "Chưa có";
    }
  };

  if (loading) {
    return (
      <div className="card">
        <div style={{ textAlign: "center", padding: "2rem" }}>
          <div>Đang tải danh sách người dùng...</div>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        backgroundColor: "rgba(26, 26, 46, 0.8)",
        backdropFilter: "blur(20px)",
        border: "1px solid rgba(255, 255, 255, 0.1)",
        borderRadius: "15px",
        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
        padding: "2rem",
        color: "white",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "2rem",
        }}
      >
        <h3>Danh sách người dùng</h3>
        <button
          className="btn btn-primary"
          onClick={() => setShowCreateUserModal(true)}
        >
          <UserPlus size={16} className="mr-1" />
          Thêm người dùng
        </button>
      </div>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "2px solid #e9ecef" }}>
              <th style={{ padding: "1rem", textAlign: "left" }}>ID</th>
              <th style={{ padding: "1rem", textAlign: "left" }}>Tên</th>
              <th style={{ padding: "1rem", textAlign: "left" }}>Email</th>
              <th style={{ padding: "1rem", textAlign: "left" }}>
                Số điện thoại
              </th>
              <th style={{ padding: "1rem", textAlign: "left" }}>Trạng thái</th>
              <th style={{ padding: "1rem", textAlign: "left" }}>
                Ngày tham gia
              </th>
              <th style={{ padding: "1rem", textAlign: "left" }}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {currentUsers.length === 0 ? (
              <tr>
                <td
                  colSpan="7"
                  style={{ padding: "2rem", textAlign: "center" }}
                >
                  Không có người dùng nào
                </td>
              </tr>
            ) : (
              currentUsers.map((user, index) => {
                if (index === 0) {
                  console.log("🔍 First user data structure:", user);
                  console.log("🔍 Available fields:", Object.keys(user));
                }
                return (
                  <tr
                    key={user.id}
                    style={{ borderBottom: "1px solid #e9ecef" }}
                  >
                    <td style={{ padding: "1rem" }}>#{user.id}</td>
                    <td style={{ padding: "1rem" }}>
                      {user.fullname ||
                        user.name ||
                        user.username ||
                        user.firstName + " " + user.lastName ||
                        "Chưa có tên"}
                    </td>
                    <td style={{ padding: "1rem" }}>
                      {user.email || "Chưa có email"}
                    </td>
                    <td style={{ padding: "1rem" }}>
                      {user.phone ||
                        user.phoneNumber ||
                        user.phoneNumber ||
                        "Chưa có SĐT"}
                    </td>
                    <td style={{ padding: "1rem" }}>
                      <span
                        style={{
                          padding: "0.25rem 0.75rem",
                          borderRadius: "15px",
                          fontSize: "0.8rem",
                          backgroundColor: "#28a74520",
                          color: "#28a745",
                        }}
                      >
                        {user.status || user.isActive
                          ? "Hoạt động"
                          : "Không hoạt động"}
                      </span>
                    </td>
                    <td style={{ padding: "1rem" }}>
                      {formatDate(
                        user.joinDate ||
                          user.createdAt ||
                          user.created_at ||
                          user.dateCreated
                      )}
                    </td>
                    <td style={{ padding: "1rem" }}>
                      <div style={{ display: "flex", gap: "0.5rem" }}>
                        <button
                          className="btn btn-secondary"
                          style={{ padding: "0.5rem" }}
                          title="Chỉnh sửa"
                        >
                          <Edit size={16} />
                        </button>
                        {!user.locked ? (
                          <button
                            className="btn btn-secondary"
                            style={{
                              padding: "0.5rem",
                              backgroundColor: "#ffc107",
                            }}
                            onClick={() => handleLockUser(user.id)}
                            title="Khóa user"
                          >
                            <Unlock size={16} />
                          </button>
                        ) : (
                          <button
                            className="btn btn-secondary"
                            style={{
                              padding: "0.5rem",
                              backgroundColor: "#28a745",
                            }}
                            onClick={() => handleUnlockUser(user.id)}
                            title="Mở khóa user"
                          >
                            <Lock size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {users.length > 0 && (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: "2rem",
            padding: "1.5rem",
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            borderRadius: "12px",
            boxShadow: "0 4px 15px rgba(102, 126, 234, 0.3)",
          }}
        >
          <div
            style={{
              fontSize: "14px",
              color: "rgba(255, 255, 255, 0.9)",
              fontWeight: "500",
            }}
          >
            Hiển thị {startIndex + 1}-{Math.min(endIndex, users.length)} trong{" "}
            <span style={{ color: "#fff", fontWeight: "bold" }}>
              {users.length}
            </span>{" "}
            người dùng
          </div>
          <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              style={{
                padding: "0.75rem 1.25rem",
                fontSize: "14px",
                fontWeight: "600",
                background:
                  currentPage === 1
                    ? "rgba(255, 255, 255, 0.2)"
                    : "rgba(255, 255, 255, 0.9)",
                color:
                  currentPage === 1 ? "rgba(255, 255, 255, 0.5)" : "#667eea",
                border: "none",
                borderRadius: "8px",
                cursor: currentPage === 1 ? "not-allowed" : "pointer",
                transition: "all 0.3s ease",
                boxShadow:
                  currentPage === 1 ? "none" : "0 2px 8px rgba(0,0,0,0.15)",
              }}
              onMouseEnter={(e) => {
                if (currentPage !== 1) {
                  e.target.style.background = "#fff";
                  e.target.style.transform = "translateY(-2px)";
                  e.target.style.boxShadow = "0 4px 12px rgba(0,0,0,0.2)";
                }
              }}
              onMouseLeave={(e) => {
                if (currentPage !== 1) {
                  e.target.style.background = "rgba(255, 255, 255, 0.9)";
                  e.target.style.transform = "translateY(0)";
                  e.target.style.boxShadow = "0 2px 8px rgba(0,0,0,0.15)";
                }
              }}
            >
              ← Trước
            </button>

            <div style={{ display: "flex", gap: "0.25rem" }}>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                let page;
                if (totalPages <= 5) {
                  page = i + 1;
                } else if (currentPage <= 3) {
                  page = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  page = totalPages - 4 + i;
                } else {
                  page = currentPage - 2 + i;
                }

                return (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    style={{
                      padding: "0.75rem 1rem",
                      fontSize: "14px",
                      fontWeight: "600",
                      background:
                        currentPage === page
                          ? "#fff"
                          : "rgba(255, 255, 255, 0.2)",
                      color:
                        currentPage === page
                          ? "#667eea"
                          : "rgba(255, 255, 255, 0.9)",
                      border: "none",
                      borderRadius: "8px",
                      cursor: "pointer",
                      transition: "all 0.3s ease",
                      boxShadow:
                        currentPage === page
                          ? "0 4px 12px rgba(0,0,0,0.2)"
                          : "0 2px 8px rgba(0,0,0,0.1)",
                      minWidth: "40px",
                    }}
                    onMouseEnter={(e) => {
                      if (currentPage !== page) {
                        e.target.style.background = "rgba(255, 255, 255, 0.3)";
                        e.target.style.transform = "translateY(-2px)";
                        e.target.style.boxShadow =
                          "0 4px 12px rgba(0,0,0,0.15)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (currentPage !== page) {
                        e.target.style.background = "rgba(255, 255, 255, 0.2)";
                        e.target.style.transform = "translateY(0)";
                        e.target.style.boxShadow = "0 2px 8px rgba(0,0,0,0.1)";
                      }
                    }}
                  >
                    {page}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              style={{
                padding: "0.75rem 1.25rem",
                fontSize: "14px",
                fontWeight: "600",
                background:
                  currentPage === totalPages
                    ? "rgba(255, 255, 255, 0.2)"
                    : "rgba(255, 255, 255, 0.9)",
                color:
                  currentPage === totalPages
                    ? "rgba(255, 255, 255, 0.5)"
                    : "#667eea",
                border: "none",
                borderRadius: "8px",
                cursor: currentPage === totalPages ? "not-allowed" : "pointer",
                transition: "all 0.3s ease",
                boxShadow:
                  currentPage === totalPages
                    ? "none"
                    : "0 2px 8px rgba(0,0,0,0.15)",
              }}
              onMouseEnter={(e) => {
                if (currentPage !== totalPages) {
                  e.target.style.background = "#fff";
                  e.target.style.transform = "translateY(-2px)";
                  e.target.style.boxShadow = "0 4px 12px rgba(0,0,0,0.2)";
                }
              }}
              onMouseLeave={(e) => {
                if (currentPage !== totalPages) {
                  e.target.style.background = "rgba(255, 255, 255, 0.9)";
                  e.target.style.transform = "translateY(0)";
                  e.target.style.boxShadow = "0 2px 8px rgba(0,0,0,0.15)";
                }
              }}
            >
              Sau →
            </button>
          </div>
        </div>
      )}

      {/* Modal tạo user mới */}
      {showCreateUserModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              backgroundColor: "white",
              padding: "2rem",
              borderRadius: "10px",
              width: "500px",
              maxWidth: "90vw",
            }}
          >
            <h3 style={{ marginBottom: "1.5rem", color: "#333" }}>
              Tạo user mới
            </h3>

            <div style={{ marginBottom: "1rem" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "0.5rem",
                  fontWeight: "bold",
                }}
              >
                Họ tên:
              </label>
              <input
                type="text"
                value={newUser.fullname}
                onChange={(e) =>
                  setNewUser({ ...newUser, fullname: e.target.value })
                }
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  border: "2px solid #e9ecef",
                  borderRadius: "5px",
                  fontSize: "1rem",
                }}
                placeholder="Nhập họ tên"
              />
            </div>

            <div style={{ marginBottom: "1rem" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "0.5rem",
                  fontWeight: "bold",
                }}
              >
                Email:
              </label>
              <input
                type="email"
                value={newUser.email}
                onChange={(e) =>
                  setNewUser({ ...newUser, email: e.target.value })
                }
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  border: "2px solid #e9ecef",
                  borderRadius: "5px",
                  fontSize: "1rem",
                }}
                placeholder="Nhập email"
              />
            </div>

            <div style={{ marginBottom: "1rem" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "0.5rem",
                  fontWeight: "bold",
                }}
              >
                Số điện thoại:
              </label>
              <input
                type="tel"
                value={newUser.phone}
                onChange={(e) =>
                  setNewUser({ ...newUser, phone: e.target.value })
                }
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  border: "2px solid #e9ecef",
                  borderRadius: "5px",
                  fontSize: "1rem",
                }}
                placeholder="Nhập số điện thoại"
              />
            </div>

            <div style={{ marginBottom: "1rem" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "0.5rem",
                  fontWeight: "bold",
                }}
              >
                Mật khẩu:
              </label>
              <input
                type="password"
                value={newUser.password}
                onChange={(e) =>
                  setNewUser({ ...newUser, password: e.target.value })
                }
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  border: "2px solid #e9ecef",
                  borderRadius: "5px",
                  fontSize: "1rem",
                }}
                placeholder="Nhập mật khẩu"
              />
            </div>

            <div style={{ marginBottom: "1rem" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "0.5rem",
                  fontWeight: "bold",
                }}
              >
                Xác nhận mật khẩu:
              </label>
              <input
                type="password"
                value={newUser.confirmPassword}
                onChange={(e) =>
                  setNewUser({ ...newUser, confirmPassword: e.target.value })
                }
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  border: "2px solid #e9ecef",
                  borderRadius: "5px",
                  fontSize: "1rem",
                }}
                placeholder="Nhập lại mật khẩu"
              />
            </div>

            <div style={{ marginBottom: "1.5rem" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "0.5rem",
                  fontWeight: "bold",
                }}
              >
                Vai trò:
              </label>
              <select
                value={newUser.role}
                onChange={(e) =>
                  setNewUser({ ...newUser, role: e.target.value })
                }
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  border: "2px solid #e9ecef",
                  borderRadius: "5px",
                  fontSize: "1rem",
                }}
              >
                <option value="member">Member</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <div
              style={{
                display: "flex",
                gap: "1rem",
                justifyContent: "flex-end",
              }}
            >
              <button
                className="btn btn-secondary"
                onClick={() => setShowCreateUserModal(false)}
                disabled={loading}
              >
                Hủy
              </button>
              <button
                className="btn btn-primary"
                onClick={handleCreateUser}
                disabled={loading}
              >
                {loading ? "Đang tạo..." : "Tạo user"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersTab;
