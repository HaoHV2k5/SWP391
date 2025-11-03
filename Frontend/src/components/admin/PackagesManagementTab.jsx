import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, RefreshCw } from "lucide-react";
import adminService from "../../services/adminService";
import { toast } from "react-toastify";

const PackagesManagementTab = () => {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    duration: "",
    postLimit: "",
    isActive: true,
    requireApproval: false,
  });

  // Load packages từ API
  const loadPackages = async () => {
    try {
      setLoading(true);
      const response = await adminService.getAllPackages();
      const packagesList = response?.data || [];
      setPackages(packagesList);
    } catch (error) {
      console.error("Error loading packages:", error);
      toast.error("Lỗi khi tải danh sách gói dịch vụ!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPackages();
  }, []);

  // Format price
  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  // Tạo gói mới
  const handleCreatePackage = async () => {
    try {
      if (!formData.name || !formData.price || !formData.duration || !formData.postLimit) {
        toast.error("Vui lòng điền đầy đủ thông tin!");
        return;
      }

      setLoading(true);
      const packageData = {
        name: formData.name,
        description: formData.description || "",
        price: parseFloat(formData.price),
        duration: parseInt(formData.duration),
        postLimit: parseInt(formData.postLimit),
        isActive: formData.isActive,
        requireApproval: formData.requireApproval,
      };

      await adminService.createPackage(packageData);
      toast.success("Tạo gói dịch vụ thành công!");
      setShowCreateModal(false);
      resetForm();
      loadPackages();
    } catch (error) {
      console.error("Error creating package:", error);
      toast.error(
        `Lỗi khi tạo gói: ${error.response?.data?.message || error.message}`
      );
    } finally {
      setLoading(false);
    }
  };

  // Cập nhật gói
  const handleUpdatePackage = async () => {
    try {
      if (!formData.name || !formData.price || !formData.duration || !formData.postLimit) {
        toast.error("Vui lòng điền đầy đủ thông tin!");
        return;
      }

      setLoading(true);
      const packageData = {
        name: formData.name,
        description: formData.description || "",
        price: parseFloat(formData.price),
        duration: parseInt(formData.duration),
        postLimit: parseInt(formData.postLimit),
        isActive: formData.isActive,
        requireApproval: formData.requireApproval,
      };

      await adminService.updatePackage(selectedPackage.id, packageData);
      toast.success("Cập nhật gói dịch vụ thành công!");
      setShowEditModal(false);
      setSelectedPackage(null);
      resetForm();
      loadPackages();
    } catch (error) {
      console.error("Error updating package:", error);
      toast.error(
        `Lỗi khi cập nhật gói: ${error.response?.data?.message || error.message}`
      );
    } finally {
      setLoading(false);
    }
  };

  // Xóa gói
  const handleDeletePackage = async () => {
    try {
      setLoading(true);
      await adminService.deletePackage(selectedPackage.id);
      toast.success("Xóa gói dịch vụ thành công!");
      setShowDeleteModal(false);
      setSelectedPackage(null);
      loadPackages();
    } catch (error) {
      console.error("Error deleting package:", error);
      toast.error("Lỗi khi xóa gói!");
    } finally {
      setLoading(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      price: "",
      duration: "",
      postLimit: "",
      isActive: true,
      requireApproval: false,
    });
  };

  // Mở modal chỉnh sửa
  const openEditModal = (pkg) => {
    setSelectedPackage(pkg);
    setFormData({
      name: pkg.name || "",
      description: pkg.description || "",
      price: pkg.price?.toString() || "",
      duration: pkg.duration?.toString() || "",
      postLimit: pkg.postLimit?.toString() || "",
      isActive: pkg.isActive !== undefined ? pkg.isActive : true,
      requireApproval: pkg.requireApproval || false,
    });
    setShowEditModal(true);
  };

  // Mở modal xóa
  const openDeleteModal = (pkg) => {
    setSelectedPackage(pkg);
    setShowDeleteModal(true);
  };

  return (
    <div>
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "2rem",
        }}
      >
        <h3 style={{ margin: 0, fontSize: "1.5rem", fontWeight: "600" }}>
          Quản lý Gói Dịch Vụ Đăng Tin
        </h3>
        <div style={{ display: "flex", gap: "1rem" }}>
          <button
            className="btn btn-secondary"
            onClick={loadPackages}
            disabled={loading}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            <RefreshCw size={16} />
            Làm mới
          </button>
          <button
            className="btn btn-primary"
            onClick={() => {
              resetForm();
              setShowCreateModal(true);
            }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            <Plus size={16} />
            Tạo gói mới
          </button>
        </div>
      </div>

      {/* Table */}
      {loading && packages.length === 0 ? (
        <div style={{ textAlign: "center", padding: "3rem" }}>
          <p>Đang tải...</p>
        </div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              backgroundColor: "rgba(255, 255, 255, 0.05)",
              borderRadius: "8px",
            }}
          >
            <thead>
              <tr style={{ borderBottom: "2px solid rgba(255, 255, 255, 0.1)" }}>
                <th style={{ padding: "1rem", textAlign: "left" }}>ID</th>
                <th style={{ padding: "1rem", textAlign: "left" }}>Tên gói</th>
                <th style={{ padding: "1rem", textAlign: "left" }}>Mô tả</th>
                <th style={{ padding: "1rem", textAlign: "left" }}>Giá</th>
                <th style={{ padding: "1rem", textAlign: "left" }}>Thời hạn (ngày)</th>
                <th style={{ padding: "1rem", textAlign: "left" }}>Giới hạn đăng</th>
                <th style={{ padding: "1rem", textAlign: "left" }}>Trạng thái</th>
                <th style={{ padding: "1rem", textAlign: "left" }}>Kiểm duyệt</th>
                <th style={{ padding: "1rem", textAlign: "center" }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {packages.length === 0 ? (
                <tr>
                  <td
                    colSpan="9"
                    style={{
                      padding: "2rem",
                      textAlign: "center",
                      color: "rgba(255, 255, 255, 0.6)",
                    }}
                  >
                    Chưa có gói dịch vụ nào
                  </td>
                </tr>
              ) : (
                packages.map((pkg) => (
                  <tr
                    key={pkg.id}
                    style={{
                      borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
                      transition: "background-color 0.2s",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.05)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "transparent";
                    }}
                  >
                    <td style={{ padding: "1rem" }}>{pkg.id}</td>
                    <td style={{ padding: "1rem", fontWeight: "600" }}>
                      {pkg.name}
                    </td>
                    <td style={{ padding: "1rem" }}>
                      {pkg.description || "-"}
                    </td>
                    <td style={{ padding: "1rem", color: "#52c41a" }}>
                      {formatPrice(pkg.price)}
                    </td>
                    <td style={{ padding: "1rem" }}>{pkg.duration}</td>
                    <td style={{ padding: "1rem" }}>
                      {pkg.postLimit === 9999 ? "Không giới hạn" : pkg.postLimit}
                    </td>
                    <td style={{ padding: "1rem" }}>
                      <span
                        style={{
                          padding: "0.25rem 0.75rem",
                          borderRadius: "12px",
                          fontSize: "0.85rem",
                          backgroundColor: pkg.isActive
                            ? "rgba(82, 196, 26, 0.2)"
                            : "rgba(255, 77, 79, 0.2)",
                          color: pkg.isActive ? "#52c41a" : "#ff4d4f",
                        }}
                      >
                        {pkg.isActive ? "Hoạt động" : "Tạm dừng"}
                      </span>
                    </td>
                    <td style={{ padding: "1rem" }}>
                      <span
                        style={{
                          padding: "0.25rem 0.75rem",
                          borderRadius: "12px",
                          fontSize: "0.85rem",
                          backgroundColor: pkg.requireApproval
                            ? "rgba(255, 165, 0, 0.2)"
                            : "rgba(82, 196, 26, 0.2)",
                          color: pkg.requireApproval ? "#faad14" : "#52c41a",
                        }}
                      >
                        {pkg.requireApproval ? "Có" : "Không"}
                      </span>
                    </td>
                    <td style={{ padding: "1rem" }}>
                      <div
                        style={{
                          display: "flex",
                          gap: "0.5rem",
                          justifyContent: "center",
                        }}
                      >
                        <button
                          className="btn btn-secondary"
                          onClick={() => openEditModal(pkg)}
                          disabled={loading}
                          style={{
                            padding: "0.5rem",
                            display: "flex",
                            alignItems: "center",
                          }}
                          title="Chỉnh sửa"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          className="btn btn-secondary"
                          onClick={() => openDeleteModal(pkg)}
                          disabled={loading}
                          style={{
                            padding: "0.5rem",
                            display: "flex",
                            alignItems: "center",
                            color: "#ff4d4f",
                          }}
                          title="Xóa"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.7)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
          onClick={() => setShowCreateModal(false)}
        >
          <div
            style={{
              backgroundColor: "rgba(26, 26, 46, 0.95)",
              borderRadius: "15px",
              padding: "2rem",
              width: "90%",
              maxWidth: "600px",
              border: "1px solid rgba(255, 255, 255, 0.1)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ marginTop: 0, marginBottom: "1.5rem" }}>
              Tạo gói dịch vụ mới
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div>
                <label style={{ display: "block", marginBottom: "0.5rem" }}>
                  Tên gói *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    borderRadius: "8px",
                    border: "1px solid rgba(255, 255, 255, 0.2)",
                    backgroundColor: "rgba(255, 255, 255, 0.1)",
                    color: "white",
                  }}
                />
              </div>
              <div>
                <label style={{ display: "block", marginBottom: "0.5rem" }}>
                  Mô tả
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows="3"
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    borderRadius: "8px",
                    border: "1px solid rgba(255, 255, 255, 0.2)",
                    backgroundColor: "rgba(255, 255, 255, 0.1)",
                    color: "white",
                  }}
                />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div>
                  <label style={{ display: "block", marginBottom: "0.5rem" }}>
                    Giá (VND) *
                  </label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({ ...formData, price: e.target.value })
                    }
                    style={{
                      width: "100%",
                      padding: "0.75rem",
                      borderRadius: "8px",
                      border: "1px solid rgba(255, 255, 255, 0.2)",
                      backgroundColor: "rgba(255, 255, 255, 0.1)",
                      color: "white",
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", marginBottom: "0.5rem" }}>
                    Thời hạn (ngày) *
                  </label>
                  <input
                    type="number"
                    value={formData.duration}
                    onChange={(e) =>
                      setFormData({ ...formData, duration: e.target.value })
                    }
                    style={{
                      width: "100%",
                      padding: "0.75rem",
                      borderRadius: "8px",
                      border: "1px solid rgba(255, 255, 255, 0.2)",
                      backgroundColor: "rgba(255, 255, 255, 0.1)",
                      color: "white",
                    }}
                  />
                </div>
              </div>
              <div>
                <label style={{ display: "block", marginBottom: "0.5rem" }}>
                  Giới hạn số bài đăng * (nhập 9999 cho không giới hạn)
                </label>
                <input
                  type="number"
                  value={formData.postLimit}
                  onChange={(e) =>
                    setFormData({ ...formData, postLimit: e.target.value })
                  }
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    borderRadius: "8px",
                    border: "1px solid rgba(255, 255, 255, 0.2)",
                    backgroundColor: "rgba(255, 255, 255, 0.1)",
                    color: "white",
                  }}
                />
              </div>
              <div style={{ display: "flex", gap: "1rem" }}>
                <label style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) =>
                      setFormData({ ...formData, isActive: e.target.checked })
                    }
                  />
                  Kích hoạt
                </label>
                <label style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <input
                    type="checkbox"
                    checked={formData.requireApproval}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        requireApproval: e.target.checked,
                      })
                    }
                  />
                  Yêu cầu kiểm duyệt
                </label>
              </div>
              <div
                style={{
                  display: "flex",
                  gap: "1rem",
                  justifyContent: "flex-end",
                  marginTop: "1rem",
                }}
              >
                <button
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowCreateModal(false);
                    resetForm();
                  }}
                  disabled={loading}
                  style={{
                    backgroundColor: "#ef4444",
                    color: "#fff",
                    border: "none",
                  }}
                >
                  Hủy
                </button>
                <button
                  className="btn btn-primary"
                  onClick={handleCreatePackage}
                  disabled={loading}
                >
                  {loading ? "Đang tạo..." : "Tạo gói"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.7)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
          onClick={() => {
            setShowEditModal(false);
            setSelectedPackage(null);
            resetForm();
          }}
        >
          <div
            style={{
              backgroundColor: "rgba(26, 26, 46, 0.95)",
              borderRadius: "15px",
              padding: "2rem",
              width: "90%",
              maxWidth: "600px",
              border: "1px solid rgba(255, 255, 255, 0.1)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ marginTop: 0, marginBottom: "1.5rem" }}>
              Chỉnh sửa gói dịch vụ
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {/* Same form fields as create modal */}
              <div>
                <label style={{ display: "block", marginBottom: "0.5rem" }}>
                  Tên gói *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    borderRadius: "8px",
                    border: "1px solid rgba(255, 255, 255, 0.2)",
                    backgroundColor: "rgba(255, 255, 255, 0.1)",
                    color: "white",
                  }}
                />
              </div>
              <div>
                <label style={{ display: "block", marginBottom: "0.5rem" }}>
                  Mô tả
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows="3"
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    borderRadius: "8px",
                    border: "1px solid rgba(255, 255, 255, 0.2)",
                    backgroundColor: "rgba(255, 255, 255, 0.1)",
                    color: "white",
                  }}
                />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div>
                  <label style={{ display: "block", marginBottom: "0.5rem" }}>
                    Giá (VND) *
                  </label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({ ...formData, price: e.target.value })
                    }
                    style={{
                      width: "100%",
                      padding: "0.75rem",
                      borderRadius: "8px",
                      border: "1px solid rgba(255, 255, 255, 0.2)",
                      backgroundColor: "rgba(255, 255, 255, 0.1)",
                      color: "white",
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", marginBottom: "0.5rem" }}>
                    Thời hạn (ngày) *
                  </label>
                  <input
                    type="number"
                    value={formData.duration}
                    onChange={(e) =>
                      setFormData({ ...formData, duration: e.target.value })
                    }
                    style={{
                      width: "100%",
                      padding: "0.75rem",
                      borderRadius: "8px",
                      border: "1px solid rgba(255, 255, 255, 0.2)",
                      backgroundColor: "rgba(255, 255, 255, 0.1)",
                      color: "white",
                    }}
                  />
                </div>
              </div>
              <div>
                <label style={{ display: "block", marginBottom: "0.5rem" }}>
                  Giới hạn số bài đăng * (nhập 9999 cho không giới hạn)
                </label>
                <input
                  type="number"
                  value={formData.postLimit}
                  onChange={(e) =>
                    setFormData({ ...formData, postLimit: e.target.value })
                  }
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    borderRadius: "8px",
                    border: "1px solid rgba(255, 255, 255, 0.2)",
                    backgroundColor: "rgba(255, 255, 255, 0.1)",
                    color: "white",
                  }}
                />
              </div>
              <div style={{ display: "flex", gap: "1rem" }}>
                <label style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) =>
                      setFormData({ ...formData, isActive: e.target.checked })
                    }
                  />
                  Kích hoạt
                </label>
                <label style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <input
                    type="checkbox"
                    checked={formData.requireApproval}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        requireApproval: e.target.checked,
                      })
                    }
                  />
                  Yêu cầu kiểm duyệt
                </label>
              </div>
              <div
                style={{
                  display: "flex",
                  gap: "1rem",
                  justifyContent: "flex-end",
                  marginTop: "1rem",
                }}
              >
                <button
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedPackage(null);
                    resetForm();
                  }}
                  disabled={loading}
                  style={{
                    backgroundColor: "#ef4444",
                    color: "#fff",
                    border: "none",
                  }}
                >
                  Hủy
                </button>
                <button
                  className="btn btn-primary"
                  onClick={handleUpdatePackage}
                  disabled={loading}
                >
                  {loading ? "Đang cập nhật..." : "Cập nhật"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.7)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
          onClick={() => {
            setShowDeleteModal(false);
            setSelectedPackage(null);
          }}
        >
          <div
            style={{
              backgroundColor: "rgba(26, 26, 46, 0.95)",
              borderRadius: "15px",
              padding: "2rem",
              width: "90%",
              maxWidth: "400px",
              border: "1px solid rgba(255, 255, 255, 0.1)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ marginTop: 0, marginBottom: "1rem" }}>
              Xác nhận xóa
            </h3>
            <p style={{ marginBottom: "1.5rem", color: "rgba(255, 255, 255, 0.8)" }}>
              Bạn có chắc chắn muốn xóa gói "{selectedPackage?.name}"? Hành động này không thể hoàn tác.
            </p>
            <div
              style={{
                display: "flex",
                gap: "1rem",
                justifyContent: "flex-end",
              }}
            >
              <button
                className="btn btn-secondary"
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedPackage(null);
                }}
                disabled={loading}
                style={{
                  backgroundColor: "#6c757d",
                  color: "#fff",
                  border: "none",
                }}
              >
                Hủy
              </button>
              <button
                className="btn btn-secondary"
                onClick={handleDeletePackage}
                disabled={loading}
                style={{
                  backgroundColor: "#ef4444",
                  color: "#fff",
                  border: "none",
                }}
              >
                {loading ? "Đang xóa..." : "Xóa"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PackagesManagementTab;

