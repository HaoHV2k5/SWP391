import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  Users,
  Package,
  TrendingUp,
  DollarSign,
  Plus,
  Edit,
  Trash2,
  Search,
  Filter,
  Download,
} from "lucide-react";

const AdminPage = ({ user }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);

  // Mock data
  const [stats, setStats] = useState({
    totalUsers: 1250,
    totalProducts: 89,
    totalOrders: 456,
    totalRevenue: 1250000000,
  });

  const [users, setUsers] = useState([
    {
      id: 1,
      name: "Nguyễn Văn A",
      email: "nguyenvana@email.com",
      phone: "0123456789",
      status: "active",
      joinDate: "2024-01-15",
    },
    {
      id: 2,
      name: "Trần Thị B",
      email: "tranthib@email.com",
      phone: "0987654321",
      status: "active",
      joinDate: "2024-01-20",
    },
    {
      id: 3,
      name: "Lê Văn C",
      email: "levanc@email.com",
      phone: "0369258147",
      status: "inactive",
      joinDate: "2024-02-01",
    },
  ]);

  const [products, setProducts] = useState([
    {
      id: 1,
      name: "Pin Lithium-ion 48V 20Ah",
      price: 2500000,
      category: "Pin",
      status: "active",
      stock: 15,
      createdAt: "2024-01-10",
    },
    {
      id: 2,
      name: "Xe điện VinFast Klara S",
      price: 15000000,
      category: "Xe điện",
      status: "active",
      stock: 3,
      createdAt: "2024-01-12",
    },
    {
      id: 3,
      name: "Pin sắt phosphate 60V 30Ah",
      price: 3200000,
      category: "Pin",
      status: "inactive",
      stock: 0,
      createdAt: "2024-01-15",
    },
  ]);

  const [orders, setOrders] = useState([
    {
      id: 1,
      customer: "Nguyễn Văn A",
      product: "Pin Lithium-ion 48V 20Ah",
      amount: 2500000,
      status: "completed",
      date: "2024-01-20",
    },
    {
      id: 2,
      customer: "Trần Thị B",
      product: "Xe điện VinFast Klara S",
      amount: 15000000,
      status: "pending",
      date: "2024-01-22",
    },
    {
      id: 3,
      customer: "Lê Văn C",
      product: "Pin sắt phosphate 60V 30Ah",
      amount: 3200000,
      status: "cancelled",
      date: "2024-01-25",
    },
  ]);

  useEffect(() => {
    console.log("AdminPage - User object:", user);
    if (!user) {
      console.log("No user, redirecting to login");
      navigate("/login");
    } else if (user.user && user.user.role !== "admin") {
      console.log("User role is not admin:", user.user.role);
      navigate("/");
      toast.error("Bạn không có quyền truy cập trang admin!");
    } else if (user.role && user.role !== "admin") {
      console.log("User role is not admin:", user.role);
      navigate("/");
      toast.error("Bạn không có quyền truy cập trang admin!");
    } else {
      console.log("Admin access granted");
    }
  }, [user, navigate]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
      case "completed":
        return "#28a745";
      case "inactive":
      case "cancelled":
        return "#dc3545";
      case "pending":
        return "#ffc107";
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
      case "completed":
        return "Hoàn thành";
      case "pending":
        return "Chờ xử lý";
      case "cancelled":
        return "Đã hủy";
      default:
        return status;
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f8f9fa" }}>
      <div style={{ display: "flex" }}>
        {/* Sidebar */}
        <div
          style={{
            width: "250px",
            backgroundColor: "white",
            boxShadow: "2px 0 5px rgba(0,0,0,0.1)",
            minHeight: "100vh",
            padding: "2rem 0",
          }}
        >
          <div style={{ padding: "0 2rem", marginBottom: "2rem" }}>
            <h2 style={{ color: "#333", fontSize: "1.5rem" }}>Admin Panel</h2>
            <p style={{ color: "#666", fontSize: "0.9rem" }}>
              Quản lý hệ thống
            </p>
          </div>

          <nav>
            {[
              {
                id: "dashboard",
                label: "Tổng quan",
                icon: <TrendingUp size={20} />,
              },
              { id: "users", label: "Người dùng", icon: <Users size={20} /> },
              {
                id: "products",
                label: "Sản phẩm",
                icon: <Package size={20} />,
              },
              {
                id: "orders",
                label: "Đơn hàng",
                icon: <DollarSign size={20} />,
              },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  width: "100%",
                  padding: "1rem 2rem",
                  border: "none",
                  background: activeTab === tab.id ? "#667eea" : "transparent",
                  color: activeTab === tab.id ? "white" : "#333",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  textAlign: "left",
                  transition: "all 0.3s",
                }}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Main Content */}
        <div style={{ flex: 1, padding: "2rem" }}>
          {/* Header */}
          <div
            style={{
              backgroundColor: "white",
              padding: "1.5rem 2rem",
              borderRadius: "10px",
              boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
              marginBottom: "2rem",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <h1 style={{ color: "#333", fontSize: "2rem" }}>
              {activeTab === "dashboard" && "Tổng quan"}
              {activeTab === "users" && "Quản lý người dùng"}
              {activeTab === "products" && "Quản lý sản phẩm"}
              {activeTab === "orders" && "Quản lý đơn hàng"}
            </h1>

            <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
              <div style={{ position: "relative" }}>
                <Search
                  size={20}
                  style={{
                    position: "absolute",
                    left: "1rem",
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "#666",
                  }}
                />
                <input
                  type="text"
                  placeholder="Tìm kiếm..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    padding: "0.75rem 1rem 0.75rem 3rem",
                    border: "2px solid #e9ecef",
                    borderRadius: "5px",
                    fontSize: "1rem",
                    width: "300px",
                  }}
                />
              </div>
              <button className="btn btn-secondary">
                <Filter size={16} className="mr-1" />
                Lọc
              </button>
              <button className="btn btn-secondary">
                <Download size={16} className="mr-1" />
                Xuất
              </button>
            </div>
          </div>

          {/* Dashboard Tab */}
          {activeTab === "dashboard" && (
            <div>
              {/* Stats Cards */}
              <div className="grid grid-2" style={{ marginBottom: "2rem" }}>
                <div className="card" style={{ textAlign: "center" }}>
                  <Users
                    size={48}
                    style={{ color: "#667eea", marginBottom: "1rem" }}
                  />
                  <h3
                    style={{
                      fontSize: "2rem",
                      marginBottom: "0.5rem",
                      color: "#333",
                    }}
                  >
                    {stats.totalUsers.toLocaleString()}
                  </h3>
                  <p style={{ color: "#666" }}>Tổng người dùng</p>
                </div>
                <div className="card" style={{ textAlign: "center" }}>
                  <Package
                    size={48}
                    style={{ color: "#28a745", marginBottom: "1rem" }}
                  />
                  <h3
                    style={{
                      fontSize: "2rem",
                      marginBottom: "0.5rem",
                      color: "#333",
                    }}
                  >
                    {stats.totalProducts}
                  </h3>
                  <p style={{ color: "#666" }}>Sản phẩm</p>
                </div>
                <div className="card" style={{ textAlign: "center" }}>
                  <DollarSign
                    size={48}
                    style={{ color: "#ffc107", marginBottom: "1rem" }}
                  />
                  <h3
                    style={{
                      fontSize: "2rem",
                      marginBottom: "0.5rem",
                      color: "#333",
                    }}
                  >
                    {stats.totalOrders}
                  </h3>
                  <p style={{ color: "#666" }}>Đơn hàng</p>
                </div>
                <div className="card" style={{ textAlign: "center" }}>
                  <TrendingUp
                    size={48}
                    style={{ color: "#dc3545", marginBottom: "1rem" }}
                  />
                  <h3
                    style={{
                      fontSize: "2rem",
                      marginBottom: "0.5rem",
                      color: "#333",
                    }}
                  >
                    {formatCurrency(stats.totalRevenue)}
                  </h3>
                  <p style={{ color: "#666" }}>Doanh thu</p>
                </div>
              </div>

              {/* Recent Orders */}
              <div className="card">
                <h3 style={{ marginBottom: "1.5rem", color: "#333" }}>
                  Đơn hàng gần đây
                </h3>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr style={{ borderBottom: "2px solid #e9ecef" }}>
                        <th style={{ padding: "1rem", textAlign: "left" }}>
                          ID
                        </th>
                        <th style={{ padding: "1rem", textAlign: "left" }}>
                          Khách hàng
                        </th>
                        <th style={{ padding: "1rem", textAlign: "left" }}>
                          Sản phẩm
                        </th>
                        <th style={{ padding: "1rem", textAlign: "left" }}>
                          Số tiền
                        </th>
                        <th style={{ padding: "1rem", textAlign: "left" }}>
                          Trạng thái
                        </th>
                        <th style={{ padding: "1rem", textAlign: "left" }}>
                          Ngày
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.slice(0, 5).map((order) => (
                        <tr
                          key={order.id}
                          style={{ borderBottom: "1px solid #e9ecef" }}
                        >
                          <td style={{ padding: "1rem" }}>#{order.id}</td>
                          <td style={{ padding: "1rem" }}>{order.customer}</td>
                          <td style={{ padding: "1rem" }}>{order.product}</td>
                          <td style={{ padding: "1rem" }}>
                            {formatCurrency(order.amount)}
                          </td>
                          <td style={{ padding: "1rem" }}>
                            <span
                              style={{
                                padding: "0.25rem 0.75rem",
                                borderRadius: "15px",
                                fontSize: "0.8rem",
                                backgroundColor:
                                  getStatusColor(order.status) + "20",
                                color: getStatusColor(order.status),
                              }}
                            >
                              {getStatusText(order.status)}
                            </span>
                          </td>
                          <td style={{ padding: "1rem" }}>{order.date}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Users Tab */}
          {activeTab === "users" && (
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
                <button className="btn btn-primary">
                  <Plus size={16} className="mr-1" />
                  Thêm người dùng
                </button>
              </div>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ borderBottom: "2px solid #e9ecef" }}>
                      <th style={{ padding: "1rem", textAlign: "left" }}>ID</th>
                      <th style={{ padding: "1rem", textAlign: "left" }}>
                        Tên
                      </th>
                      <th style={{ padding: "1rem", textAlign: "left" }}>
                        Email
                      </th>
                      <th style={{ padding: "1rem", textAlign: "left" }}>
                        Số điện thoại
                      </th>
                      <th style={{ padding: "1rem", textAlign: "left" }}>
                        Trạng thái
                      </th>
                      <th style={{ padding: "1rem", textAlign: "left" }}>
                        Ngày tham gia
                      </th>
                      <th style={{ padding: "1rem", textAlign: "left" }}>
                        Thao tác
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr
                        key={user.id}
                        style={{ borderBottom: "1px solid #e9ecef" }}
                      >
                        <td style={{ padding: "1rem" }}>#{user.id}</td>
                        <td style={{ padding: "1rem" }}>{user.name}</td>
                        <td style={{ padding: "1rem" }}>{user.email}</td>
                        <td style={{ padding: "1rem" }}>{user.phone}</td>
                        <td style={{ padding: "1rem" }}>
                          <span
                            style={{
                              padding: "0.25rem 0.75rem",
                              borderRadius: "15px",
                              fontSize: "0.8rem",
                              backgroundColor:
                                getStatusColor(user.status) + "20",
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
                            <button
                              className="btn btn-secondary"
                              style={{
                                padding: "0.5rem",
                                backgroundColor: "#dc3545",
                              }}
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Products Tab */}
          {activeTab === "products" && (
            <div className="card">
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "2rem",
                }}
              >
                <h3>Danh sách sản phẩm</h3>
                <button className="btn btn-primary">
                  <Plus size={16} className="mr-1" />
                  Thêm sản phẩm
                </button>
              </div>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ borderBottom: "2px solid #e9ecef" }}>
                      <th style={{ padding: "1rem", textAlign: "left" }}>ID</th>
                      <th style={{ padding: "1rem", textAlign: "left" }}>
                        Tên sản phẩm
                      </th>
                      <th style={{ padding: "1rem", textAlign: "left" }}>
                        Giá
                      </th>
                      <th style={{ padding: "1rem", textAlign: "left" }}>
                        Danh mục
                      </th>
                      <th style={{ padding: "1rem", textAlign: "left" }}>
                        Tồn kho
                      </th>
                      <th style={{ padding: "1rem", textAlign: "left" }}>
                        Trạng thái
                      </th>
                      <th style={{ padding: "1rem", textAlign: "left" }}>
                        Ngày tạo
                      </th>
                      <th style={{ padding: "1rem", textAlign: "left" }}>
                        Thao tác
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((product) => (
                      <tr
                        key={product.id}
                        style={{ borderBottom: "1px solid #e9ecef" }}
                      >
                        <td style={{ padding: "1rem" }}>#{product.id}</td>
                        <td style={{ padding: "1rem" }}>{product.name}</td>
                        <td style={{ padding: "1rem" }}>
                          {formatCurrency(product.price)}
                        </td>
                        <td style={{ padding: "1rem" }}>{product.category}</td>
                        <td style={{ padding: "1rem" }}>{product.stock}</td>
                        <td style={{ padding: "1rem" }}>
                          <span
                            style={{
                              padding: "0.25rem 0.75rem",
                              borderRadius: "15px",
                              fontSize: "0.8rem",
                              backgroundColor:
                                getStatusColor(product.status) + "20",
                              color: getStatusColor(product.status),
                            }}
                          >
                            {getStatusText(product.status)}
                          </span>
                        </td>
                        <td style={{ padding: "1rem" }}>{product.createdAt}</td>
                        <td style={{ padding: "1rem" }}>
                          <div style={{ display: "flex", gap: "0.5rem" }}>
                            <button
                              className="btn btn-secondary"
                              style={{ padding: "0.5rem" }}
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              className="btn btn-secondary"
                              style={{
                                padding: "0.5rem",
                                backgroundColor: "#dc3545",
                              }}
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Orders Tab */}
          {activeTab === "orders" && (
            <div className="card">
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "2rem",
                }}
              >
                <h3>Danh sách đơn hàng</h3>
                <button className="btn btn-primary">
                  <Plus size={16} className="mr-1" />
                  Tạo đơn hàng
                </button>
              </div>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ borderBottom: "2px solid #e9ecef" }}>
                      <th style={{ padding: "1rem", textAlign: "left" }}>ID</th>
                      <th style={{ padding: "1rem", textAlign: "left" }}>
                        Khách hàng
                      </th>
                      <th style={{ padding: "1rem", textAlign: "left" }}>
                        Sản phẩm
                      </th>
                      <th style={{ padding: "1rem", textAlign: "left" }}>
                        Số tiền
                      </th>
                      <th style={{ padding: "1rem", textAlign: "left" }}>
                        Trạng thái
                      </th>
                      <th style={{ padding: "1rem", textAlign: "left" }}>
                        Ngày
                      </th>
                      <th style={{ padding: "1rem", textAlign: "left" }}>
                        Thao tác
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => (
                      <tr
                        key={order.id}
                        style={{ borderBottom: "1px solid #e9ecef" }}
                      >
                        <td style={{ padding: "1rem" }}>#{order.id}</td>
                        <td style={{ padding: "1rem" }}>{order.customer}</td>
                        <td style={{ padding: "1rem" }}>{order.product}</td>
                        <td style={{ padding: "1rem" }}>
                          {formatCurrency(order.amount)}
                        </td>
                        <td style={{ padding: "1rem" }}>
                          <span
                            style={{
                              padding: "0.25rem 0.75rem",
                              borderRadius: "15px",
                              fontSize: "0.8rem",
                              backgroundColor:
                                getStatusColor(order.status) + "20",
                              color: getStatusColor(order.status),
                            }}
                          >
                            {getStatusText(order.status)}
                          </span>
                        </td>
                        <td style={{ padding: "1rem" }}>{order.date}</td>
                        <td style={{ padding: "1rem" }}>
                          <div style={{ display: "flex", gap: "0.5rem" }}>
                            <button
                              className="btn btn-secondary"
                              style={{ padding: "0.5rem" }}
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              className="btn btn-secondary"
                              style={{
                                padding: "0.5rem",
                                backgroundColor: "#dc3545",
                              }}
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
