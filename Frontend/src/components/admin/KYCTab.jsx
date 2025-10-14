import { Filter, Download, CheckCircle, XCircle, Eye } from "lucide-react";

const KYCTab = () => {
  const kycData = [
    {
      id: 1,
      name: "Nguyễn Văn A",
      email: "nguyenvana@email.com",
      phone: "0123456789",
      status: "pending",
      submitDate: "2024-01-15",
      images: ["cc_front.jpg", "cc_back.jpg", "selfie.jpg"],
    },
    {
      id: 2,
      name: "Trần Thị B",
      email: "tranthib@email.com",
      phone: "0987654321",
      status: "approved",
      submitDate: "2024-01-14",
      images: ["cc_front.jpg", "cc_back.jpg", "selfie.jpg"],
    },
    {
      id: 3,
      name: "Lê Văn C",
      email: "levanc@email.com",
      phone: "0369258147",
      status: "rejected",
      submitDate: "2024-01-13",
      images: ["cc_front.jpg", "cc_back.jpg", "selfie.jpg"],
    },
  ];

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
        <h3>Duyệt KYC - Xác thực danh tính</h3>
        <div style={{ display: "flex", gap: "1rem" }}>
          <button className="btn btn-secondary">
            <Filter size={16} className="mr-1" />
            Lọc
          </button>
          <button className="btn btn-primary">
            <Download size={16} className="mr-1" />
            Xuất báo cáo
          </button>
        </div>
      </div>

      {/* KYC Stats */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "1rem",
          marginBottom: "2rem",
        }}
      >
        <div
          style={{
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            color: "white",
            padding: "1.5rem",
            borderRadius: "10px",
            textAlign: "center",
          }}
        >
          <h4 style={{ margin: "0 0 0.5rem 0", fontSize: "1.5rem" }}>15</h4>
          <p style={{ margin: 0, opacity: 0.9 }}>Chờ duyệt</p>
        </div>
        <div
          style={{
            background: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
            color: "white",
            padding: "1.5rem",
            borderRadius: "10px",
            textAlign: "center",
          }}
        >
          <h4 style={{ margin: "0 0 0.5rem 0", fontSize: "1.5rem" }}>128</h4>
          <p style={{ margin: 0, opacity: 0.9 }}>Đã duyệt</p>
        </div>
        <div
          style={{
            background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
            color: "white",
            padding: "1.5rem",
            borderRadius: "10px",
            textAlign: "center",
          }}
        >
          <h4 style={{ margin: "0 0 0.5rem 0", fontSize: "1.5rem" }}>8</h4>
          <p style={{ margin: 0, opacity: 0.9 }}>Từ chối</p>
        </div>
        <div
          style={{
            background: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
            color: "white",
            padding: "1.5rem",
            borderRadius: "10px",
            textAlign: "center",
          }}
        >
          <h4 style={{ margin: "0 0 0.5rem 0", fontSize: "1.5rem" }}>151</h4>
          <p style={{ margin: 0, opacity: 0.9 }}>Tổng cộng</p>
        </div>
      </div>

      {/* KYC List */}
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
              <th style={{ padding: "1rem", textAlign: "left" }}>Ngày nộp</th>
              <th style={{ padding: "1rem", textAlign: "left" }}>Hình ảnh</th>
              <th style={{ padding: "1rem", textAlign: "left" }}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {kycData.map((kyc) => (
              <tr key={kyc.id} style={{ borderBottom: "1px solid #e9ecef" }}>
                <td style={{ padding: "1rem" }}>#{kyc.id}</td>
                <td style={{ padding: "1rem" }}>{kyc.name}</td>
                <td style={{ padding: "1rem" }}>{kyc.email}</td>
                <td style={{ padding: "1rem" }}>{kyc.phone}</td>
                <td style={{ padding: "1rem" }}>
                  <span
                    style={{
                      padding: "0.25rem 0.75rem",
                      borderRadius: "20px",
                      fontSize: "0.875rem",
                      fontWeight: "500",
                      backgroundColor:
                        kyc.status === "pending"
                          ? "#fff3cd"
                          : kyc.status === "approved"
                          ? "#d4edda"
                          : "#f8d7da",
                      color:
                        kyc.status === "pending"
                          ? "#856404"
                          : kyc.status === "approved"
                          ? "#155724"
                          : "#721c24",
                    }}
                  >
                    {kyc.status === "pending"
                      ? "Chờ duyệt"
                      : kyc.status === "approved"
                      ? "Đã duyệt"
                      : "Từ chối"}
                  </span>
                </td>
                <td style={{ padding: "1rem" }}>{kyc.submitDate}</td>
                <td style={{ padding: "1rem" }}>
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    {kyc.images.map((image, index) => (
                      <button
                        key={index}
                        style={{
                          padding: "0.5rem",
                          background: "#f8f9fa",
                          border: "1px solid #dee2e6",
                          borderRadius: "5px",
                          cursor: "pointer",
                          fontSize: "0.75rem",
                        }}
                        onClick={() => {
                          // Xem hình ảnh
                          alert(`Xem hình ảnh: ${image}`);
                        }}
                      >
                        {image}
                      </button>
                    ))}
                  </div>
                </td>
                <td style={{ padding: "1rem" }}>
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    {kyc.status === "pending" && (
                      <>
                        <button
                          className="btn btn-primary"
                          style={{
                            padding: "0.5rem 1rem",
                            fontSize: "0.875rem",
                            background: "#28a745",
                            border: "none",
                            borderRadius: "5px",
                            color: "white",
                            cursor: "pointer",
                          }}
                          onClick={() => {
                            // Duyệt KYC
                            alert(`Duyệt KYC cho ${kyc.name}`);
                          }}
                        >
                          <CheckCircle
                            size={16}
                            style={{ marginRight: "0.25rem" }}
                          />
                          Duyệt
                        </button>
                        <button
                          className="btn btn-secondary"
                          style={{
                            padding: "0.5rem 1rem",
                            fontSize: "0.875rem",
                            background: "#dc3545",
                            border: "none",
                            borderRadius: "5px",
                            color: "white",
                            cursor: "pointer",
                          }}
                          onClick={() => {
                            // Từ chối KYC
                            alert(`Từ chối KYC cho ${kyc.name}`);
                          }}
                        >
                          <XCircle
                            size={16}
                            style={{ marginRight: "0.25rem" }}
                          />
                          Từ chối
                        </button>
                      </>
                    )}
                    <button
                      className="btn btn-secondary"
                      style={{
                        padding: "0.5rem",
                        background: "#6c757d",
                        border: "none",
                        borderRadius: "5px",
                        color: "white",
                        cursor: "pointer",
                      }}
                      onClick={() => {
                        // Xem chi tiết
                        alert(`Xem chi tiết KYC của ${kyc.name}`);
                      }}
                    >
                      <Eye size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default KYCTab;

