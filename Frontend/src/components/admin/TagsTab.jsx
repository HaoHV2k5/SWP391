import { useState } from "react";
import { Tag as TagIcon, Plus, X } from "lucide-react";
import tagService from "../../services/tagService";
import { toast } from "react-toastify";

const TagsTab = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    slugs: "",
    displayName: "",
    brand: "",
    model: "",
    yearModel: "",
    type: "VEHICLE", // VEHICLE hoặc BATTERY
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "yearModel" ? (value ? parseInt(value) : "") : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate
    if (!formData.slugs || !formData.displayName || !formData.brand || !formData.model || !formData.yearModel || !formData.type) {
      toast.error("Vui lòng điền đầy đủ thông tin");
      return;
    }

    if (!formData.yearModel || isNaN(formData.yearModel) || formData.yearModel < 1900 || formData.yearModel > new Date().getFullYear() + 1) {
      toast.error("Năm sản xuất không hợp lệ");
      return;
    }

    setLoading(true);
    try {
      const result = await tagService.createTag(formData);
      
      if (result.success) {
        toast.success(result.message || "Tạo tag thành công!");
        setShowCreateModal(false);
        setFormData({
          slugs: "",
          displayName: "",
          brand: "",
          model: "",
          yearModel: "",
          type: "VEHICLE",
        });
      } else {
        toast.error(result.message || "Tạo tag thất bại");
      }
    } catch (error) {
      console.error("Error creating tag:", error);
      toast.error("Có lỗi xảy ra khi tạo tag");
    } finally {
      setLoading(false);
    }
  };

  const handleCloseModal = () => {
    setShowCreateModal(false);
    setFormData({
      slugs: "",
      displayName: "",
      brand: "",
      model: "",
      yearModel: "",
      type: "VEHICLE",
    });
  };

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "2rem",
        }}
      >
        <h3 style={{ margin: 0 }}>Quản lý Tags</h3>
        <button
          className="btn btn-primary"
          onClick={() => setShowCreateModal(true)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
          }}
        >
          <Plus size={16} />
          Tạo Tag mới
        </button>
      </div>

      <div
        style={{
          backgroundColor: "rgba(255, 255, 255, 0.05)",
          borderRadius: "12px",
          padding: "2rem",
          textAlign: "center",
          color: "rgba(255, 255, 255, 0.7)",
        }}
      >
        <TagIcon size={48} style={{ marginBottom: "1rem", opacity: 0.5 }} />
        <p>Click vào nút "Tạo Tag mới" để tạo tag cho sản phẩm</p>
        <p style={{ fontSize: "0.9rem", marginTop: "0.5rem" }}>
          Tag giúp phân loại sản phẩm theo brand, model, năm sản xuất
        </p>
      </div>

      {/* Modal Tạo Tag */}
      {showCreateModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 9999,
          }}
          onClick={handleCloseModal}
        >
          <div
            style={{
              backgroundColor: "white",
              borderRadius: "12px",
              padding: "2rem",
              maxWidth: "500px",
              width: "90%",
              maxHeight: "90vh",
              overflowY: "auto",
              boxShadow: "0 10px 40px rgba(0, 0, 0, 0.2)",
              color: "#333",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "1.5rem",
              }}
            >
              <h3 style={{ margin: 0, color: "#333" }}>Tạo Tag mới</h3>
              <button
                onClick={handleCloseModal}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "1.5rem",
                  cursor: "pointer",
                  color: "#666",
                }}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: "1rem" }}>
                <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600", color: "#333" }}>
                  Slugs <span style={{ color: "red" }}>*</span>
                </label>
                <input
                  type="text"
                  name="slugs"
                  value={formData.slugs}
                  onChange={handleInputChange}
                  placeholder="VD: vinfast-vf8-2024"
                  required
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    border: "1px solid #ddd",
                    borderRadius: "8px",
                    fontSize: "1rem",
                  }}
                />
                <small style={{ color: "#666", fontSize: "0.85rem" }}>
                  URL-friendly identifier (không dấu, cách nhau bằng dấu gạch ngang)
                </small>
              </div>

              <div style={{ marginBottom: "1rem" }}>
                <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600", color: "#333" }}>
                  Tên hiển thị <span style={{ color: "red" }}>*</span>
                </label>
                <input
                  type="text"
                  name="displayName"
                  value={formData.displayName}
                  onChange={handleInputChange}
                  placeholder="VD: VinFast VF8 2024"
                  required
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    border: "1px solid #ddd",
                    borderRadius: "8px",
                    fontSize: "1rem",
                  }}
                />
              </div>

              <div style={{ marginBottom: "1rem" }}>
                <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600", color: "#333" }}>
                  Hãng <span style={{ color: "red" }}>*</span>
                </label>
                <input
                  type="text"
                  name="brand"
                  value={formData.brand}
                  onChange={handleInputChange}
                  placeholder="VD: VinFast, Tesla, LG"
                  required
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    border: "1px solid #ddd",
                    borderRadius: "8px",
                    fontSize: "1rem",
                  }}
                />
              </div>

              <div style={{ marginBottom: "1rem" }}>
                <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600", color: "#333" }}>
                  Model <span style={{ color: "red" }}>*</span>
                </label>
                <input
                  type="text"
                  name="model"
                  value={formData.model}
                  onChange={handleInputChange}
                  placeholder="VD: VF8, Model 3, RESU10H"
                  required
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    border: "1px solid #ddd",
                    borderRadius: "8px",
                    fontSize: "1rem",
                  }}
                />
              </div>

              <div style={{ marginBottom: "1rem" }}>
                <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600", color: "#333" }}>
                  Năm sản xuất <span style={{ color: "red" }}>*</span>
                </label>
                <input
                  type="number"
                  name="yearModel"
                  value={formData.yearModel}
                  onChange={handleInputChange}
                  placeholder="VD: 2024"
                  min="1900"
                  max={new Date().getFullYear() + 1}
                  required
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    border: "1px solid #ddd",
                    borderRadius: "8px",
                    fontSize: "1rem",
                  }}
                />
              </div>

              <div style={{ marginBottom: "1.5rem" }}>
                <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600", color: "#333" }}>
                  Loại sản phẩm <span style={{ color: "red" }}>*</span>
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  required
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    border: "1px solid #ddd",
                    borderRadius: "8px",
                    fontSize: "1rem",
                  }}
                >
                  <option value="VEHICLE">Xe điện (VEHICLE)</option>
                  <option value="BATTERY">Pin (BATTERY)</option>
                </select>
              </div>

              <div style={{ display: "flex", gap: "1rem", justifyContent: "flex-end" }}>
                <button
                  type="button"
                  onClick={handleCloseModal}
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
                  }}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    padding: "0.75rem 1.5rem",
                    backgroundColor: loading ? "#ccc" : "#007bff",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    cursor: loading ? "not-allowed" : "pointer",
                    fontSize: "1rem",
                    fontWeight: "600",
                  }}
                >
                  {loading ? "Đang tạo..." : "Tạo Tag"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TagsTab;

