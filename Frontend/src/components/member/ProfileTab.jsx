// Icons removed - no longer using lucide-react icons

const ProfileTab = ({ user }) => {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      {/* Profile Info */}
      <div className="member-card" style={{ padding: "2rem" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "2rem",
          }}
        >
          <h3 style={{ color: "#333", margin: 0 }}>Thông tin cá nhân</h3>
          <button
            className="member-btn"
            style={{
              padding: "0.5rem 1rem",
              borderRadius: "8px",
            }}
          >
            Chỉnh sửa
          </button>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "2rem",
          }}
        >
          <div>
            <div style={{ marginBottom: "1.5rem" }}>
              <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600", color: "#333" }}>
                Họ và tên
              </label>
              <div style={{ padding: "0.75rem", background: "#f8f9fa", borderRadius: "8px" }}>
                <span>{user?.fullName || user?.fullname || user?.user?.fullname || "Chưa cập nhật"}</span>
              </div>
            </div>

            <div style={{ marginBottom: "1.5rem" }}>
              <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600", color: "#333" }}>
                Email
              </label>
              <div style={{ padding: "0.75rem", background: "#f8f9fa", borderRadius: "8px" }}>
                <span>{user?.email || user?.user?.email || "Chưa cập nhật"}</span>
              </div>
            </div>

            <div style={{ marginBottom: "1.5rem" }}>
              <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600", color: "#333" }}>
                Số điện thoại
              </label>
              <div style={{ padding: "0.75rem", background: "#f8f9fa", borderRadius: "8px" }}>
                <span>{user?.phone || user?.user?.phone || "Chưa cập nhật"}</span>
              </div>
            </div>
          </div>

          <div>
            <div style={{ marginBottom: "1.5rem" }}>
              <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600", color: "#333" }}>
                Giới tính
              </label>
              <div style={{ padding: "0.75rem", background: "#f8f9fa", borderRadius: "8px" }}>
                <span>{user?.gender || user?.user?.gender || "Chưa cập nhật"}</span>
              </div>
            </div>

            <div style={{ marginBottom: "1.5rem" }}>
              <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600", color: "#333" }}>
                Ngày sinh
              </label>
              <div style={{ padding: "0.75rem", background: "#f8f9fa", borderRadius: "8px" }}>
                <span>{user?.yob || user?.user?.yob || user?.dateOfBirth || "Chưa cập nhật"}</span>
              </div>
            </div>

            <div style={{ marginBottom: "1.5rem" }}>
              <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600", color: "#333" }}>
                Địa chỉ
              </label>
              <div style={{ padding: "0.75rem", background: "#f8f9fa", borderRadius: "8px" }}>
                <span>{user?.address || user?.user?.address || "Chưa cập nhật"}</span>
              </div>
            </div>

            <div style={{ marginBottom: "1.5rem" }}>
              <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600", color: "#333" }}>
                Phương thức thanh toán
              </label>
              <div style={{ padding: "0.75rem", background: "#f8f9fa", borderRadius: "8px" }}>
                <span>**** **** **** 1234</span>
              </div>
            </div>

            <div style={{ marginBottom: "1.5rem" }}>
              <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600", color: "#333" }}>
                Ngày tham gia
              </label>
              <div style={{ padding: "0.75rem", background: "#f8f9fa", borderRadius: "8px" }}>
                <span>{user?.joinDate || user?.user?.joinDate || "2024-01-15"}</span>
              </div>
            </div>

            <div style={{ marginBottom: "1.5rem" }}>
              <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600", color: "#333" }}>
                Trạng thái xác minh
              </label>
              <div style={{ padding: "0.75rem", background: "#f8f9fa", borderRadius: "8px" }}>
                <span style={{ color: "#28a745" }}>Đã xác minh</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Security Settings */}
      <div className="member-card" style={{ padding: "2rem" }}>
        <h3 style={{ color: "#333", marginBottom: "2rem" }}>Bảo mật</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <button
            className="member-btn"
            style={{
              padding: "1rem",
              borderRadius: "8px",
              textAlign: "left",
              width: "100%",
            }}
          >
            <span>Đổi mật khẩu</span>
          </button>
          
          <button
            className="member-btn"
            style={{
              padding: "1rem",
              borderRadius: "8px",
              textAlign: "left",
              width: "100%",
            }}
          >
            <span>Xác thực 2 bước</span>
          </button>

          <button
            className="member-btn"
            style={{
              padding: "1rem",
              borderRadius: "8px",
              textAlign: "left",
              width: "100%",
            }}
          >
            <span>Lịch sử đăng nhập</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileTab;
