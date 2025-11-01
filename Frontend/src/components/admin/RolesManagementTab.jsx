import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import roleService from "../../services/roleService";
import permissionService from "../../services/permissionService";
import { 
  Shield, 
  Key, 
  Plus, 
  Trash2, 
  Edit2, 
  Users,
  Search
} from "lucide-react";

const RolesManagementTab = () => {
  const [activeTab, setActiveTab] = useState("roles"); // roles or permissions
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [searchRoleTerm, setSearchRoleTerm] = useState("");
  const [searchPermissionTerm, setSearchPermissionTerm] = useState("");

  // Form states
  const [roleForm, setRoleForm] = useState({
    name: "",
    description: "",
    permissions: []
  });

  const [permissionForm, setPermissionForm] = useState({
    name: "",
    description: ""
  });

  // Load data
  useEffect(() => {
    if (activeTab === "roles") {
      loadRoles();
    } else {
      loadPermissions();
    }
  }, [activeTab]);

  const loadRoles = async () => {
    setLoading(true);
    try {
      const result = await roleService.getAllRoles();
      if (result.success) {
        setRoles(result.data || []);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error("Lỗi khi tải danh sách roles");
    } finally {
      setLoading(false);
    }
  };

  const loadPermissions = async () => {
    setLoading(true);
    try {
      const result = await permissionService.getAllPermissions();
      if (result.success) {
        setPermissions(result.data || []);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error("Lỗi khi tải danh sách permissions");
    } finally {
      setLoading(false);
    }
  };

  // Handle create role
  const handleCreateRole = async () => {
    if (!roleForm.name || !roleForm.description) {
      toast.error("Vui lòng điền đầy đủ thông tin");
      return;
    }

    setLoading(true);
    try {
      const result = await roleService.createRole(roleForm);
      if (result.success) {
        toast.success("Tạo role thành công!");
        setShowRoleModal(false);
        setRoleForm({ name: "", description: "", permissions: [] });
        loadRoles();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error("Lỗi khi tạo role");
    } finally {
      setLoading(false);
    }
  };

  // Handle delete role
  const handleDeleteRole = async (roleName) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa role "${roleName}"?`)) {
      return;
    }

    setLoading(true);
    try {
      const result = await roleService.deleteRole(roleName);
      if (result.success) {
        toast.success("Xóa role thành công!");
        loadRoles();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error("Lỗi khi xóa role");
    } finally {
      setLoading(false);
    }
  };

  // Handle create permission
  const handleCreatePermission = async () => {
    if (!permissionForm.name || !permissionForm.description) {
      toast.error("Vui lòng điền đầy đủ thông tin");
      return;
    }

    setLoading(true);
    try {
      const result = await permissionService.createPermission(permissionForm);
      if (result.success) {
        toast.success("Tạo permission thành công!");
        setShowPermissionModal(false);
        setPermissionForm({ name: "", description: "" });
        loadPermissions();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error("Lỗi khi tạo permission");
    } finally {
      setLoading(false);
    }
  };

  // Handle delete permission
  const handleDeletePermission = async (permissionName) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa permission "${permissionName}"?`)) {
      return;
    }

    setLoading(true);
    try {
      const result = await permissionService.deletePermission(permissionName);
      if (result.success) {
        toast.success("Xóa permission thành công!");
        loadPermissions();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error("Lỗi khi xóa permission");
    } finally {
      setLoading(false);
    }
  };

  // Filter data
  const filteredRoles = roles.filter(role =>
    role.name?.toLowerCase().includes(searchRoleTerm.toLowerCase()) ||
    role.description?.toLowerCase().includes(searchRoleTerm.toLowerCase())
  );

  const filteredPermissions = permissions.filter(permission =>
    permission.name?.toLowerCase().includes(searchPermissionTerm.toLowerCase()) ||
    permission.description?.toLowerCase().includes(searchPermissionTerm.toLowerCase())
  );

  // Toggle permission in role form
  const togglePermission = (permissionName) => {
    const current = roleForm.permissions || [];
    if (current.includes(permissionName)) {
      setRoleForm({
        ...roleForm,
        permissions: current.filter(p => p !== permissionName)
      });
    } else {
      setRoleForm({
        ...roleForm,
        permissions: [...current, permissionName]
      });
    }
  };

  return (
    <div style={{ padding: "2rem" }}>
      {/* Header */}
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ color: "#fff", fontSize: "1.8rem", fontWeight: "700", marginBottom: "0.5rem" }}>
          Quản lý Phân quyền
        </h1>
        <p style={{ color: "rgba(255, 255, 255, 0.7)" }}>
          Quản lý roles và permissions của hệ thống
        </p>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "1rem", marginBottom: "2rem", borderBottom: "2px solid rgba(255, 255, 255, 0.1)" }}>
        <button
          onClick={() => setActiveTab("roles")}
          style={{
            padding: "0.75rem 1.5rem",
            border: "none",
            background: activeTab === "roles" ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" : "transparent",
            color: activeTab === "roles" ? "white" : "rgba(255, 255, 255, 0.6)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            fontSize: "1rem",
            fontWeight: "600",
            borderBottom: activeTab === "roles" ? "3px solid #667eea" : "3px solid transparent",
            transition: "all 0.3s",
          }}
        >
          <Shield size={20} />
          Roles
        </button>
        <button
          onClick={() => setActiveTab("permissions")}
          style={{
            padding: "0.75rem 1.5rem",
            border: "none",
            background: activeTab === "permissions" ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" : "transparent",
            color: activeTab === "permissions" ? "white" : "rgba(255, 255, 255, 0.6)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            fontSize: "1rem",
            fontWeight: "600",
            borderBottom: activeTab === "permissions" ? "3px solid #667eea" : "3px solid transparent",
            transition: "all 0.3s",
          }}
        >
          <Key size={20} />
          Permissions
        </button>
      </div>

      {/* Roles Tab */}
      {activeTab === "roles" && (
        <div>
          {/* Search & Add Button */}
          <div style={{ display: "flex", gap: "1rem", marginBottom: "1.5rem", alignItems: "center" }}>
            <div style={{ position: "relative", flex: 1 }}>
              <Search size={20} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "rgba(255, 255, 255, 0.5)" }} />
              <input
                type="text"
                placeholder="Tìm kiếm roles..."
                value={searchRoleTerm}
                onChange={(e) => setSearchRoleTerm(e.target.value)}
                style={{
                  width: "100%",
                  padding: "0.75rem 1rem 0.75rem 2.5rem",
                  background: "rgba(255, 255, 255, 0.05)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  borderRadius: "8px",
                  color: "#fff",
                  fontSize: "1rem",
                }}
              />
            </div>
            <button
              onClick={() => {
                setRoleForm({ name: "", description: "", permissions: [] });
                setShowRoleModal(true);
                loadPermissions(); // Load permissions for selection
              }}
              style={{
                padding: "0.75rem 1.5rem",
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                border: "none",
                borderRadius: "8px",
                color: "white",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                fontWeight: "600",
                transition: "transform 0.2s",
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.05)"}
              onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
            >
              <Plus size={20} />
              Thêm Role
            </button>
          </div>

          {/* Roles List */}
          {loading ? (
            <div style={{ textAlign: "center", padding: "3rem", color: "rgba(255, 255, 255, 0.7)" }}>
              Đang tải...
            </div>
          ) : filteredRoles.length === 0 ? (
            <div style={{ textAlign: "center", padding: "3rem", color: "rgba(255, 255, 255, 0.5)" }}>
              Không có role nào
            </div>
          ) : (
            <div style={{ display: "grid", gap: "1rem" }}>
              {filteredRoles.map((role) => (
                <div
                  key={role.name}
                  style={{
                    background: "rgba(255, 255, 255, 0.05)",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    borderRadius: "12px",
                    padding: "1.5rem",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    transition: "all 0.3s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "rgba(255, 255, 255, 0.08)";
                    e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.2)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)";
                    e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.1)";
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.5rem" }}>
                      <Shield size={24} style={{ color: "#667eea" }} />
                      <h3 style={{ color: "#fff", fontSize: "1.2rem", fontWeight: "600", margin: 0 }}>
                        {role.name}
                      </h3>
                    </div>
                    <p style={{ color: "rgba(255, 255, 255, 0.6)", margin: 0, marginLeft: "2rem" }}>
                      {role.description}
                    </p>
                    {role.permissions && role.permissions.length > 0 && (
                      <div style={{ marginTop: "0.75rem", marginLeft: "2rem", display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                        {role.permissions.map((perm, idx) => (
                          <span
                            key={idx}
                            style={{
                              background: "rgba(102, 126, 234, 0.2)",
                              color: "#667eea",
                              padding: "0.25rem 0.75rem",
                              borderRadius: "6px",
                              fontSize: "0.85rem",
                              fontWeight: "500",
                            }}
                          >
                            {typeof perm === "string" ? perm : perm.name}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => handleDeleteRole(role.name)}
                    style={{
                      padding: "0.5rem",
                      background: "rgba(239, 68, 68, 0.1)",
                      border: "1px solid rgba(239, 68, 68, 0.3)",
                      borderRadius: "8px",
                      color: "#ef4444",
                      cursor: "pointer",
                      transition: "all 0.2s",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "rgba(239, 68, 68, 0.2)";
                      e.currentTarget.style.borderColor = "rgba(239, 68, 68, 0.5)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "rgba(239, 68, 68, 0.1)";
                      e.currentTarget.style.borderColor = "rgba(239, 68, 68, 0.3)";
                    }}
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Permissions Tab */}
      {activeTab === "permissions" && (
        <div>
          {/* Search & Add Button */}
          <div style={{ display: "flex", gap: "1rem", marginBottom: "1.5rem", alignItems: "center" }}>
            <div style={{ position: "relative", flex: 1 }}>
              <Search size={20} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "rgba(255, 255, 255, 0.5)" }} />
              <input
                type="text"
                placeholder="Tìm kiếm permissions..."
                value={searchPermissionTerm}
                onChange={(e) => setSearchPermissionTerm(e.target.value)}
                style={{
                  width: "100%",
                  padding: "0.75rem 1rem 0.75rem 2.5rem",
                  background: "rgba(255, 255, 255, 0.05)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  borderRadius: "8px",
                  color: "#fff",
                  fontSize: "1rem",
                }}
              />
            </div>
            <button
              onClick={() => {
                setPermissionForm({ name: "", description: "" });
                setShowPermissionModal(true);
              }}
              style={{
                padding: "0.75rem 1.5rem",
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                border: "none",
                borderRadius: "8px",
                color: "white",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                fontWeight: "600",
                transition: "transform 0.2s",
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.05)"}
              onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
            >
              <Plus size={20} />
              Thêm Permission
            </button>
          </div>

          {/* Permissions List */}
          {loading ? (
            <div style={{ textAlign: "center", padding: "3rem", color: "rgba(255, 255, 255, 0.7)" }}>
              Đang tải...
            </div>
          ) : filteredPermissions.length === 0 ? (
            <div style={{ textAlign: "center", padding: "3rem", color: "rgba(255, 255, 255, 0.5)" }}>
              Không có permission nào
            </div>
          ) : (
            <div style={{ display: "grid", gap: "1rem" }}>
              {filteredPermissions.map((permission) => (
                <div
                  key={permission.name}
                  style={{
                    background: "rgba(255, 255, 255, 0.05)",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    borderRadius: "12px",
                    padding: "1.5rem",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    transition: "all 0.3s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "rgba(255, 255, 255, 0.08)";
                    e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.2)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)";
                    e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.1)";
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.5rem" }}>
                      <Key size={24} style={{ color: "#f59e0b" }} />
                      <h3 style={{ color: "#fff", fontSize: "1.2rem", fontWeight: "600", margin: 0 }}>
                        {permission.name}
                      </h3>
                    </div>
                    <p style={{ color: "rgba(255, 255, 255, 0.6)", margin: 0, marginLeft: "2rem" }}>
                      {permission.description}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDeletePermission(permission.name)}
                    style={{
                      padding: "0.5rem",
                      background: "rgba(239, 68, 68, 0.1)",
                      border: "1px solid rgba(239, 68, 68, 0.3)",
                      borderRadius: "8px",
                      color: "#ef4444",
                      cursor: "pointer",
                      transition: "all 0.2s",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "rgba(239, 68, 68, 0.2)";
                      e.currentTarget.style.borderColor = "rgba(239, 68, 68, 0.5)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "rgba(239, 68, 68, 0.1)";
                      e.currentTarget.style.borderColor = "rgba(239, 68, 68, 0.3)";
                    }}
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Create Role Modal */}
      {showRoleModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0, 0, 0, 0.7)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
          onClick={() => setShowRoleModal(false)}
        >
          <div
            style={{
              background: "rgba(26, 26, 46, 0.95)",
              borderRadius: "16px",
              padding: "2rem",
              width: "90%",
              maxWidth: "600px",
              border: "1px solid rgba(255, 255, 255, 0.1)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ color: "#fff", fontSize: "1.5rem", marginBottom: "1.5rem" }}>
              Tạo Role Mới
            </h2>

            <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginBottom: "1.5rem" }}>
              <div>
                <label style={{ color: "#fff", marginBottom: "0.5rem", display: "block" }}>
                  Tên Role <span style={{ color: "#ef4444" }}>*</span>
                </label>
                <input
                  type="text"
                  value={roleForm.name}
                  onChange={(e) => setRoleForm({ ...roleForm, name: e.target.value })}
                  placeholder="VD: ROLE_MANAGER"
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    background: "rgba(255, 255, 255, 0.05)",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    borderRadius: "8px",
                    color: "#fff",
                    fontSize: "1rem",
                  }}
                />
              </div>

              <div>
                <label style={{ color: "#fff", marginBottom: "0.5rem", display: "block" }}>
                  Mô tả <span style={{ color: "#ef4444" }}>*</span>
                </label>
                <textarea
                  value={roleForm.description}
                  onChange={(e) => setRoleForm({ ...roleForm, description: e.target.value })}
                  placeholder="Mô tả về role này..."
                  rows={3}
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    background: "rgba(255, 255, 255, 0.05)",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    borderRadius: "8px",
                    color: "#fff",
                    fontSize: "1rem",
                    resize: "vertical",
                  }}
                />
              </div>

              <div>
                <label style={{ color: "#fff", marginBottom: "0.5rem", display: "block" }}>
                  Permissions (Chọn quyền)
                </label>
                <div style={{
                  maxHeight: "200px",
                  overflowY: "auto",
                  background: "rgba(255, 255, 255, 0.03)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  borderRadius: "8px",
                  padding: "1rem",
                }}>
                  {permissions.length === 0 ? (
                    <p style={{ color: "rgba(255, 255, 255, 0.5)", textAlign: "center" }}>
                      Chưa có permission nào
                    </p>
                  ) : (
                    permissions.map((permission) => (
                      <label
                        key={permission.name}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.5rem",
                          padding: "0.5rem",
                          cursor: "pointer",
                          borderRadius: "6px",
                          transition: "background 0.2s",
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)"}
                        onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                      >
                        <input
                          type="checkbox"
                          checked={roleForm.permissions?.includes(permission.name)}
                          onChange={() => togglePermission(permission.name)}
                          style={{
                            width: "18px",
                            height: "18px",
                            cursor: "pointer",
                          }}
                        />
                        <span style={{ color: "#fff", fontSize: "0.95rem" }}>
                          {permission.name}
                        </span>
                      </label>
                    ))
                  )}
                </div>
              </div>
            </div>

            <div style={{ display: "flex", gap: "1rem", justifyContent: "flex-end" }}>
              <button
                onClick={() => setShowRoleModal(false)}
                style={{
                  padding: "0.75rem 1.5rem",
                  background: "rgba(255, 255, 255, 0.1)",
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                  borderRadius: "8px",
                  color: "#fff",
                  cursor: "pointer",
                  fontWeight: "600",
                }}
              >
                Hủy
              </button>
              <button
                onClick={handleCreateRole}
                style={{
                  padding: "0.75rem 1.5rem",
                  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  border: "none",
                  borderRadius: "8px",
                  color: "white",
                  cursor: "pointer",
                  fontWeight: "600",
                }}
              >
                Tạo Role
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Permission Modal */}
      {showPermissionModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0, 0, 0, 0.7)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
          onClick={() => setShowPermissionModal(false)}
        >
          <div
            style={{
              background: "rgba(26, 26, 46, 0.95)",
              borderRadius: "16px",
              padding: "2rem",
              width: "90%",
              maxWidth: "500px",
              border: "1px solid rgba(255, 255, 255, 0.1)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ color: "#fff", fontSize: "1.5rem", marginBottom: "1.5rem" }}>
              Tạo Permission Mới
            </h2>

            <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginBottom: "1.5rem" }}>
              <div>
                <label style={{ color: "#fff", marginBottom: "0.5rem", display: "block" }}>
                  Tên Permission <span style={{ color: "#ef4444" }}>*</span>
                </label>
                <input
                  type="text"
                  value={permissionForm.name}
                  onChange={(e) => setPermissionForm({ ...permissionForm, name: e.target.value })}
                  placeholder="VD: APPROVE_PRODUCT"
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    background: "rgba(255, 255, 255, 0.05)",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    borderRadius: "8px",
                    color: "#fff",
                    fontSize: "1rem",
                  }}
                />
              </div>

              <div>
                <label style={{ color: "#fff", marginBottom: "0.5rem", display: "block" }}>
                  Mô tả <span style={{ color: "#ef4444" }}>*</span>
                </label>
                <textarea
                  value={permissionForm.description}
                  onChange={(e) => setPermissionForm({ ...permissionForm, description: e.target.value })}
                  placeholder="Mô tả về permission này..."
                  rows={3}
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    background: "rgba(255, 255, 255, 0.05)",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    borderRadius: "8px",
                    color: "#fff",
                    fontSize: "1rem",
                    resize: "vertical",
                  }}
                />
              </div>
            </div>

            <div style={{ display: "flex", gap: "1rem", justifyContent: "flex-end" }}>
              <button
                onClick={() => setShowPermissionModal(false)}
                style={{
                  padding: "0.75rem 1.5rem",
                  background: "rgba(255, 255, 255, 0.1)",
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                  borderRadius: "8px",
                  color: "#fff",
                  cursor: "pointer",
                  fontWeight: "600",
                }}
              >
                Hủy
              </button>
              <button
                onClick={handleCreatePermission}
                style={{
                  padding: "0.75rem 1.5rem",
                  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  border: "none",
                  borderRadius: "8px",
                  color: "white",
                  cursor: "pointer",
                  fontWeight: "600",
                }}
              >
                Tạo Permission
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RolesManagementTab;

