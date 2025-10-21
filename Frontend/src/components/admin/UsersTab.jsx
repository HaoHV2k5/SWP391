import { useState, useEffect } from "react";
import { UserPlus, Edit, Lock, Unlock, Trash2 } from "lucide-react";
import adminService from "../../services/adminService";
import { toast } from "react-toastify";

const UsersTab = ({
  users,
  setUsers,
  loading,
  setLoading,
  setIsManualUpdate,
}) => {
  const [showCreateUserModal, setShowCreateUserModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [userToEdit, setUserToEdit] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [refreshKey, setRefreshKey] = useState(0); // Thêm key để force re-render
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

  const [editUser, setEditUser] = useState({
    fullname: "",
    gender: "Nam",
    yob: "",
    phone: "",
    address: "",
    avatar: "",
  });

  // Debug useEffect để theo dõi thay đổi của users
  useEffect(() => {
    console.log("🔄 Users state changed:", users.length, "users");
    if (users.length > 0) {
      console.log("🔍 First user after update:", users[0]);
      // Tìm user có ID 37 để debug cụ thể
      const user37 = users.find((u) => u.id === 37);
      if (user37) {
        console.log("🔍 User ID 37 current data:", user37);
      }
    }
  }, [users]);

  // Debug useEffect để theo dõi thay đổi của userToEdit
  useEffect(() => {
    if (userToEdit) {
      console.log("🔄 userToEdit changed:", userToEdit);
      if (userToEdit.id === 37) {
        console.log("🔍 userToEdit ID 37:", userToEdit);
      }
    }
  }, [userToEdit]);

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

  // Xóa user
  const handleDeleteUser = async (userId) => {
    try {
      console.log("🗑️ Deleting user:", userId);
      setLoading(true);

      // Gọi API xóa user
      await adminService.deleteUser(userId);
      console.log("✅ User deleted successfully");

      // Cập nhật danh sách users local ngay lập tức
      setUsers((prevUsers) => {
        const updatedUsers = prevUsers.filter((user) => user.id !== userId);
        console.log("🔄 Updating users list:", {
          before: prevUsers.length,
          after: updatedUsers.length,
          deletedUserId: userId,
        });

        // Cập nhật currentPage nếu cần
        const newTotalPages = Math.ceil(updatedUsers.length / itemsPerPage);
        if (currentPage > newTotalPages && newTotalPages > 0) {
          setCurrentPage(newTotalPages);
        }

        return updatedUsers;
      });

      // Hiển thị thông báo thành công
      toast.success("Xóa user thành công!");

      // Force re-render component
      setRefreshKey((prev) => prev + 1);

      // Đóng modal
      setShowDeleteModal(false);
      setUserToDelete(null);
    } catch (error) {
      console.error("❌ Error deleting user:", error);
      toast.error("Lỗi khi xóa user!");
    } finally {
      setLoading(false);
    }
  };

  // Mở modal xác nhận xóa
  const openDeleteModal = (user) => {
    setUserToDelete(user);
    setShowDeleteModal(true);
  };

  // Đóng modal xác nhận xóa
  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setUserToDelete(null);
  };

  // Mở modal chỉnh sửa user
  const openEditModal = (user) => {
    console.log("📝 Opening edit modal for user:", user);

    // Tìm user hiện tại từ danh sách users để đảm bảo có data mới nhất
    const currentUser = users.find((u) => u.id === user.id) || user;
    console.log("🔍 Current user from users list:", currentUser);

    setUserToEdit(currentUser);

    // Format date từ backend (yyyy-mm-dd) sang frontend (dd/mm/yyyy)
    const formatDateForInput = (dateString) => {
      if (!dateString) return "";
      try {
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, "0");
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
      } catch {
        return "";
      }
    };

    setEditUser({
      fullname: currentUser.fullname || "",
      gender: currentUser.gender || "Nam",
      yob: formatDateForInput(currentUser.yob),
      phone: currentUser.phone || "",
      address: currentUser.address || "",
      avatar: currentUser.avatar || "",
    });

    setShowEditModal(true);
  };

  // Đóng modal chỉnh sửa user
  const closeEditModal = () => {
    setShowEditModal(false);
    setUserToEdit(null);
    setEditUser({
      fullname: "",
      gender: "Nam",
      yob: "",
      phone: "",
      address: "",
      avatar: "",
    });
  };

  // Cập nhật user
  const handleUpdateUser = async () => {
    try {
      console.log("📝 Updating user:", userToEdit.id, editUser);
      setLoading(true);

      // Format date từ frontend (dd/mm/yyyy) sang backend (dd/MM/yyyy)
      const formatDateForBackend = (dateString) => {
        if (!dateString) return null;
        try {
          const [day, month, year] = dateString.split("/");
          return `${day}/${month}/${year}`;
        } catch {
          return null;
        }
      };

      const updateData = {
        ...editUser,
        yob: formatDateForBackend(editUser.yob),
      };

      console.log("📡 Sending update data:", updateData);

      // Gọi API cập nhật user
      const response = await adminService.updateUser(userToEdit.id, updateData);
      console.log("✅ User updated successfully:", response);
      console.log("🔍 Response data structure:", response.data);

      // Set flag để ngăn AdminPage reload data
      if (setIsManualUpdate) {
        setIsManualUpdate(true);
        console.log("🚫 Set isManualUpdate flag to prevent reload");
      }

      // Cập nhật danh sách users local
      let updatedUserData = null;
      setUsers((prevUsers) => {
        const updatedUsers = prevUsers.map((user) => {
          if (user.id === userToEdit.id) {
            // Merge data từ response với user hiện tại
            const updatedUser = {
              ...user,
              ...response.data,
              // Đảm bảo các trường quan trọng được cập nhật
              fullname: response.data.fullname || user.fullname,
              gender: response.data.gender || user.gender,
              yob: response.data.yob || user.yob,
              phone: response.data.phone || user.phone,
              address: response.data.address || user.address,
              avatar: response.data.avatar || user.avatar,
            };
            console.log("🔄 Updated user:", updatedUser);

            // Lưu data mới để cập nhật userToEdit sau
            updatedUserData = updatedUser;

            return updatedUser;
          }
          return user;
        });
        console.log("🔄 Updated users list:", updatedUsers.length);
        return updatedUsers;
      });

      // Cập nhật userToEdit với data mới sau khi setUsers hoàn tất
      if (updatedUserData) {
        setUserToEdit(updatedUserData);
        console.log("🔄 Updated userToEdit with new data:", updatedUserData);
      }

      // Hiển thị thông báo thành công
      toast.success("Cập nhật user thành công!");

      // Force re-render component với delay để đảm bảo state đã được cập nhật
      setTimeout(() => {
        setRefreshKey((prev) => prev + 1);
      }, 100);

      // Đóng modal
      closeEditModal();
    } catch (error) {
      console.error("❌ Error updating user:", error);
      console.error("❌ Error details:", error.response?.data);
      toast.error(
        `Lỗi khi cập nhật user: ${
          error.response?.data?.message || error.message
        }`
      );
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
        <table
          key={refreshKey}
          style={{ width: "100%", borderCollapse: "collapse" }}
        >
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
                    key={`${user.id}-${refreshKey}`}
                    style={{ borderBottom: "1px solid #e9ecef" }}
                  >
                    <td style={{ padding: "1rem" }}>#{user.id}</td>
                    <td style={{ padding: "1rem" }}>
                      {(() => {
                        const displayName =
                          user.fullname ||
                          user.name ||
                          user.username ||
                          user.firstName + " " + user.lastName ||
                          "Chưa có tên";

                        // Debug log cho user ID 37
                        if (user.id === 37) {
                          console.log("🎨 Rendering user ID 37:", {
                            user: user,
                            displayName: displayName,
                            fullname: user.fullname,
                            name: user.name,
                            username: user.username,
                          });
                        }

                        return displayName;
                      })()}
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
                          backgroundColor:
                            user.status || user.isActive
                              ? "#28a74520"
                              : "#dc354520",
                          color:
                            user.status || user.isActive
                              ? "#28a745"
                              : "#dc3545",
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
                          onClick={() => openEditModal(user)}
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
                        <button
                          className="btn btn-secondary"
                          style={{
                            padding: "0.5rem",
                            backgroundColor: "#dc3545",
                          }}
                          onClick={() => openDeleteModal(user)}
                          title="Xóa user"
                        >
                          <Trash2 size={16} />
                        </button>
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

      {/* Modal xác nhận xóa user */}
      {showDeleteModal && userToDelete && (
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
              width: "400px",
              maxWidth: "90vw",
              textAlign: "center",
            }}
          >
            <div
              style={{
                fontSize: "3rem",
                color: "#dc3545",
                marginBottom: "1rem",
              }}
            >
              ⚠️
            </div>
            <h3 style={{ marginBottom: "1rem", color: "#333" }}>
              Xác nhận xóa user
            </h3>
            <p style={{ marginBottom: "1.5rem", color: "#666" }}>
              Bạn có chắc chắn muốn xóa user{" "}
              <strong>
                {userToDelete.fullname ||
                  userToDelete.name ||
                  userToDelete.username ||
                  "Chưa có tên"}
              </strong>{" "}
              không?
            </p>
            <p
              style={{
                marginBottom: "2rem",
                color: "#dc3545",
                fontSize: "0.9rem",
              }}
            >
              ⚠️ Hành động này không thể hoàn tác!
            </p>
            <div
              style={{
                display: "flex",
                gap: "1rem",
                justifyContent: "center",
              }}
            >
              <button
                onClick={closeDeleteModal}
                disabled={loading}
                style={{
                  padding: "0.75rem 1.5rem",
                  backgroundColor: "#6c757d",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  cursor: loading ? "not-allowed" : "pointer",
                  fontSize: "1rem",
                  fontWeight: "600",
                  transition: "all 0.3s ease",
                  opacity: loading ? 0.6 : 1,
                  boxShadow: "0 2px 8px rgba(108, 117, 125, 0.3)",
                }}
                onMouseEnter={(e) => {
                  if (!loading) {
                    e.target.style.backgroundColor = "#5a6268";
                    e.target.style.transform = "translateY(-2px)";
                    e.target.style.boxShadow =
                      "0 4px 12px rgba(108, 117, 125, 0.4)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!loading) {
                    e.target.style.backgroundColor = "#6c757d";
                    e.target.style.transform = "translateY(0)";
                    e.target.style.boxShadow =
                      "0 2px 8px rgba(108, 117, 125, 0.3)";
                  }
                }}
              >
                Hủy
              </button>
              <button
                onClick={() => handleDeleteUser(userToDelete.id)}
                disabled={loading}
                style={{
                  padding: "0.75rem 1.5rem",
                  backgroundColor: "#dc3545",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  cursor: loading ? "not-allowed" : "pointer",
                  fontSize: "1rem",
                  fontWeight: "600",
                  transition: "all 0.3s ease",
                  opacity: loading ? 0.6 : 1,
                  boxShadow: "0 2px 8px rgba(220, 53, 69, 0.3)",
                }}
                onMouseEnter={(e) => {
                  if (!loading) {
                    e.target.style.backgroundColor = "#c82333";
                    e.target.style.transform = "translateY(-2px)";
                    e.target.style.boxShadow =
                      "0 4px 12px rgba(220, 53, 69, 0.4)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!loading) {
                    e.target.style.backgroundColor = "#dc3545";
                    e.target.style.transform = "translateY(0)";
                    e.target.style.boxShadow =
                      "0 2px 8px rgba(220, 53, 69, 0.3)";
                  }
                }}
              >
                {loading ? "Đang xóa..." : "Xóa user"}
              </button>
            </div>
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

      {/* Modal chỉnh sửa user */}
      {showEditModal && userToEdit && (
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
              maxHeight: "90vh",
              overflowY: "auto",
            }}
          >
            <h3 style={{ marginBottom: "1.5rem", color: "#333" }}>
              Chỉnh sửa thông tin user
            </h3>
            <p
              style={{
                marginBottom: "1.5rem",
                color: "#666",
                fontSize: "0.9rem",
              }}
            >
              Chỉnh sửa thông tin cho user:{" "}
              <strong>
                {userToEdit.fullname || userToEdit.username || "Chưa có tên"}
              </strong>
            </p>

            <div style={{ marginBottom: "1rem" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "0.5rem",
                  fontWeight: "bold",
                }}
              >
                Họ tên: *
              </label>
              <input
                type="text"
                value={editUser.fullname}
                onChange={(e) =>
                  setEditUser({ ...editUser, fullname: e.target.value })
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
                Giới tính:
              </label>
              <select
                value={editUser.gender}
                onChange={(e) =>
                  setEditUser({ ...editUser, gender: e.target.value })
                }
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  border: "2px solid #e9ecef",
                  borderRadius: "5px",
                  fontSize: "1rem",
                }}
              >
                <option value="Nam">Nam</option>
                <option value="Nữ">Nữ</option>
                <option value="Khác">Khác</option>
              </select>
            </div>

            <div style={{ marginBottom: "1rem" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "0.5rem",
                  fontWeight: "bold",
                }}
              >
                Ngày sinh: *
              </label>
              <input
                type="text"
                value={editUser.yob}
                onChange={(e) =>
                  setEditUser({ ...editUser, yob: e.target.value })
                }
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  border: "2px solid #e9ecef",
                  borderRadius: "5px",
                  fontSize: "1rem",
                }}
                placeholder="dd/mm/yyyy (ví dụ: 01/01/1990)"
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
                value={editUser.phone}
                onChange={(e) =>
                  setEditUser({ ...editUser, phone: e.target.value })
                }
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  border: "2px solid #e9ecef",
                  borderRadius: "5px",
                  fontSize: "1rem",
                }}
                placeholder="Nhập số điện thoại (ví dụ: 0838661345)"
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
                Địa chỉ:
              </label>
              <textarea
                value={editUser.address}
                onChange={(e) =>
                  setEditUser({ ...editUser, address: e.target.value })
                }
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  border: "2px solid #e9ecef",
                  borderRadius: "5px",
                  fontSize: "1rem",
                  minHeight: "80px",
                  resize: "vertical",
                }}
                placeholder="Nhập địa chỉ"
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
                Avatar URL:
              </label>
              <input
                type="url"
                value={editUser.avatar}
                onChange={(e) =>
                  setEditUser({ ...editUser, avatar: e.target.value })
                }
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  border: "2px solid #e9ecef",
                  borderRadius: "5px",
                  fontSize: "1rem",
                }}
                placeholder="Nhập URL avatar"
              />
            </div>

            <div
              style={{
                display: "flex",
                gap: "1rem",
                justifyContent: "flex-end",
              }}
            >
              <button
                onClick={closeEditModal}
                disabled={loading}
                style={{
                  padding: "0.75rem 1.5rem",
                  backgroundColor: "#6c757d",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  cursor: loading ? "not-allowed" : "pointer",
                  fontSize: "1rem",
                  fontWeight: "600",
                  transition: "all 0.3s ease",
                  opacity: loading ? 0.6 : 1,
                }}
              >
                Hủy
              </button>
              <button
                onClick={handleUpdateUser}
                disabled={loading}
                style={{
                  padding: "0.75rem 1.5rem",
                  backgroundColor: "#007bff",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  cursor: loading ? "not-allowed" : "pointer",
                  fontSize: "1rem",
                  fontWeight: "600",
                  transition: "all 0.3s ease",
                  opacity: loading ? 0.6 : 1,
                }}
              >
                {loading ? "Đang cập nhật..." : "Cập nhật"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersTab;
