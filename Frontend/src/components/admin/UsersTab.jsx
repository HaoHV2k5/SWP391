import { useState } from "react";
import { UserPlus, Edit, Lock, Unlock } from "lucide-react";
import adminService from "../../services/adminService";
import { toast } from "react-toastify";

const UsersTab = ({ users, setUsers, loading, setLoading }) => {
  const [showCreateUserModal, setShowCreateUserModal] = useState(false);
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

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "#28a745";
      case "inactive":
        return "#dc3545";
      default:
        return "#6c757d";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "active":
        return "Hoạt động";
      case "inactive":
        return "Không hoạt động";
      default:
        return status;
    }
  };

  return (
    <div className="card">
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
            {users.map((user) => (
              <tr key={user.id} style={{ borderBottom: "1px solid #e9ecef" }}>
                <td style={{ padding: "1rem" }}>#{user.id}</td>
                <td style={{ padding: "1rem" }}>
                  {user.fullname || user.name || "Chưa có tên"}
                </td>
                <td style={{ padding: "1rem" }}>{user.email}</td>
                <td style={{ padding: "1rem" }}>{user.phone}</td>
                <td style={{ padding: "1rem" }}>
                  <span
                    style={{
                      padding: "0.25rem 0.75rem",
                      borderRadius: "15px",
                      fontSize: "0.8rem",
                      backgroundColor: getStatusColor(user.status) + "20",
                      color: getStatusColor(user.status),
                    }}
                  >
                    {getStatusText(user.status)}
                  </span>
                </td>
                <td style={{ padding: "1rem" }}>{user.joinDate}</td>
                <td style={{ padding: "1rem" }}>
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    <button
                      className="btn btn-secondary"
                      style={{ padding: "0.5rem" }}
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
            ))}
          </tbody>
        </table>
      </div>

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
