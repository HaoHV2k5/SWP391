import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Container, Button, Form, Spinner } from "react-bootstrap";
import { toast } from "react-toastify";
import "bootstrap-icons/font/bootstrap-icons.css";
import MemberHeader from "../../components/member/MemberHeader";
import PostStatsCards from "../../components/member/PostStatsCards";
import PostsList from "../../components/member/PostsList";
import EditProductModal from "../../components/member/EditProductModal";
import DeleteConfirmationModal from "../../components/member/DeleteConfirmationModal";
import productService from "../../services/productService";
import { memberService } from "../../services/memberService";
import "../../styles/member/index.css";
import "../../styles/member/MyPosts.css";

const MyPosts = ({ user }) => {
  const navigate = useNavigate();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  
  const brands = [
    { value: "Dibao", label: "Dibao" },
    { value: "Osakar", label: "Osakar" },
    { value: "Pega", label: "Pega" },
    { value: "Vinfast", label: "Vinfast" },
    { value: "Yadea", label: "Yadea" }
  ];

  const batteryTypes = [
    { value: "Lithium-Ion", label: "Lithium-Ion" },
    { value: "Lithium-Polymer", label: "Lithium-Polymer" },
    { value: "Lead-Acid", label: "Lead-Acid" },
    { value: "Nickel-Metal Hydride", label: "Nickel-Metal Hydride" },
    { value: "Khác", label: "Khác" }
  ];

  const [editFormData, setEditFormData] = useState({
    title: "",
    description: "",
    price: 0,
    productType: "VEHICLE",
    // Vehicle fields
    brand: "",
    model: "",
    yearManufactured: new Date().getFullYear(),
    odometer: "",
    vehicleBatteryType: "",
    batteryCapacityKWh: "",
    rangePerChargeKm: "",
    // Battery fields
    batteryLevel: 80,
    batteryBatteryType: "",
    voltage: "",
    capacityAh: "",
    sohPercent: "",
  });

  const [posts, setPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [postingProducts, setPostingProducts] = useState(new Set());
  const hasShownError = useRef(false); // Track xem đã hiển thị lỗi chưa
  const [currentImageIndexes, setCurrentImageIndexes] = useState({}); // Track current image index for each post

  const loadPosts = async () => {
    setLoadingPosts(true);
    try {
      localStorage.removeItem("recentPendingPost");
      const username = user?.username || user?.user?.username || user?.email || user?.user?.email;
      const result = await productService.getMyPosts(username);
      if (result.success) {
        setPosts(result.data || []);
        hasShownError.current = false; // Reset flag khi thành công
      } else {
        // Chỉ hiển thị lỗi 1 lần
        if (!hasShownError.current) {
          toast.error(result.message);
          hasShownError.current = true;
        }
        setPosts([]);
      }
    } catch (error) {
      // Chỉ hiển thị lỗi 1 lần
      if (!hasShownError.current) {
        toast.error("Có lỗi xảy ra khi tải danh sách tin đăng");
        hasShownError.current = true;
      }
      setPosts([]);
    } finally {
      setLoadingPosts(false);
    }
  };

  useEffect(() => {
    let filtered = posts;
    if (filterStatus !== "ALL") {
      filtered = filtered.filter((p) => (p.status || "").toUpperCase() === filterStatus);
    }
    setFilteredPosts(filtered);
  }, [posts, filterStatus]);

  useEffect(() => {
    localStorage.removeItem("recentPendingPost");
    if (!user) {
      setIsCheckingAuth(true);
      const timer = setTimeout(() => {
        if (!user) navigate("/login");
      }, 1000);
      return () => clearTimeout(timer);
    }
    setIsCheckingAuth(false);
    const userRole = user.user?.role || user.role;
    if (userRole !== "member") {
      navigate("/");
      return;
    }
    loadPosts();
    const onFocus = () => loadPosts();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [user, navigate]);

  const getStatusColor = (status) => {
    const s = (status || "").toUpperCase();
    switch (s) {
      case "PENDING":
        return "warning";
      case "STAFF_APPROVED":
        return "info";
      case "ADMIN_APPROVED":
      case "ACTIVE":
        return "success";
      case "REJECTED":
        return "danger";
      case "SOLD":
        return "secondary";
      case "INACTIVE":
        return "secondary";
      default:
        return "secondary";
    }
  };

  const getStatusText = (status) => {
    const s = (status || "").toUpperCase();
    switch (s) {
      case "PENDING":
        return "Chờ duyệt";
      case "STAFF_APPROVED":
        return "Đã duyệt Staff";
      case "ADMIN_APPROVED":
        return "Đã duyệt Admin";
      case "ACTIVE":
        return "Đang hiển thị";
      case "REJECTED":
        return "Bị từ chối";
      case "SOLD":
        return "Đã bán";
      case "INACTIVE":
        return "Không hoạt động";
      default:
        return status || "Không rõ";
    }
  };

  const formatCurrency = (amount) => {
    if (!amount || amount === 0) return "0 ₫";
    
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    if (isNaN(numAmount)) return "0 ₫";
    
    // Format với dấu phẩy và đơn vị ₫
    return new Intl.NumberFormat("vi-VN").format(numAmount) + " ₫";
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return "";
      }
      return date.toLocaleDateString("vi-VN");
    } catch (error) {
      return "";
    }
  };

  const handleDeletePost = (post) => {
    setSelectedPost(post);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    setLoading(true);
    try {
      const result = await productService.deleteProduct(selectedPost.id);
      if (result.success) {
        setPosts(posts.filter((post) => post.id !== selectedPost.id));
        toast.success("Xóa tin đăng thành công!");
        setShowDeleteModal(false);
        setSelectedPost(null);
      } else {
        toast.error(result.message || "Có lỗi xảy ra khi xóa tin đăng!");
      }
    } catch (error) {
      toast.error("Có lỗi xảy ra khi xóa tin đăng!");
    } finally {
      setLoading(false);
    }
  };

  const handleEditPost = (post) => {
    setSelectedPost(post);
    const productType = post.productType || post.category || "VEHICLE";
    
    if (productType === "VEHICLE" && post.vehicle) {
      setEditFormData({
        title: post.title || post.productName || "",
        description: post.description || "",
        price: post.price || 0,
        productType: productType,
        // Vehicle fields
        brand: post.vehicle.brand || "",
        model: post.vehicle.model || "",
        yearManufactured: post.vehicle.yearManufactured || new Date().getFullYear(),
        odometer: post.vehicle.odometer || "",
        vehicleBatteryType: post.vehicle.batteryType || "",
        batteryCapacityKWh: post.vehicle.batteryCapacityKWh || "",
        rangePerChargeKm: post.vehicle.rangePerChargeKm || "",
        // Battery fields (empty for VEHICLE)
        batteryLevel: 80,
        batteryBatteryType: "",
        voltage: "",
        capacityAh: "",
        sohPercent: "",
      });
    } else if (productType === "BATTERY" && post.battery) {
      setEditFormData({
        title: post.title || post.productName || "",
        description: post.description || "",
        price: post.price || 0,
        productType: productType,
        // Vehicle fields (empty for BATTERY)
        brand: post.battery.brand || "",
        model: post.battery.model || "",
        yearManufactured: post.battery.yearManufactured || new Date().getFullYear(),
        odometer: "",
        vehicleBatteryType: "",
        batteryCapacityKWh: "",
        rangePerChargeKm: "",
        // Battery fields
        batteryLevel: post.battery.batteryLevel || 80,
        batteryBatteryType: post.battery.batteryType || "",
        voltage: post.battery.voltage || "",
        capacityAh: post.battery.capacityAh || "",
        sohPercent: post.battery.sohPercent || "",
      });
    } else {
      // Fallback if no vehicle/battery data
    setEditFormData({
      title: post.title || post.productName || "",
      description: post.description || "",
        price: post.price || 0,
        productType: productType,
        brand: "",
        model: "",
        yearManufactured: new Date().getFullYear(),
        odometer: "",
        vehicleBatteryType: "",
        batteryCapacityKWh: "",
        rangePerChargeKm: "",
        batteryLevel: 80,
        batteryBatteryType: "",
        voltage: "",
        capacityAh: "",
        sohPercent: "",
      });
    }
    setShowEditModal(true);
  };

  const handleEditFormChange = (field, value) => {
    setEditFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const confirmEdit = async () => {
    setLoading(true);
    try {
      // Prepare update data with vehicle/battery objects
      const updateData = {
        title: editFormData.title,
        description: editFormData.description || "",
        price: editFormData.price,
        productType: editFormData.productType,
      };

      // Add vehicle or battery object based on productType
      if (editFormData.productType === "VEHICLE") {
        updateData.vehicle = {
          brand: editFormData.brand || "",
          model: editFormData.model || "",
          yearManufactured: editFormData.yearManufactured,
          odometer: editFormData.odometer ? parseInt(editFormData.odometer) : null,
          batteryType: editFormData.vehicleBatteryType || null,
          batteryCapacityKWh: editFormData.batteryCapacityKWh ? parseFloat(editFormData.batteryCapacityKWh) : null,
          rangePerChargeKm: editFormData.rangePerChargeKm ? parseInt(editFormData.rangePerChargeKm) : null,
        };
        updateData.battery = null;
      } else if (editFormData.productType === "BATTERY") {
        updateData.battery = {
          brand: editFormData.brand || "",
          model: editFormData.model || "",
          yearManufactured: editFormData.yearManufactured,
          batteryLevel: editFormData.batteryLevel || 80,
          batteryType: editFormData.batteryBatteryType || null,
          voltage: editFormData.voltage ? parseFloat(editFormData.voltage) : null,
          capacityAh: editFormData.capacityAh ? parseFloat(editFormData.capacityAh) : null,
          sohPercent: editFormData.sohPercent ? parseInt(editFormData.sohPercent) : null,
        };
        updateData.vehicle = null;
      }

      const result = await productService.updateProduct(selectedPost.id, updateData);
      if (result.success) {
        await loadPosts();
        toast.success("Cập nhật tin đăng thành công!");
        setShowEditModal(false);
        setSelectedPost(null);
      } else {
        toast.error(result.message || "Có lỗi xảy ra khi cập nhật tin đăng!");
      }
    } catch (error) {
      toast.error("Có lỗi xảy ra khi cập nhật tin đăng!");
    } finally {
      setLoading(false);
    }
  };

  const handlePostProduct = async (productId) => {
    try {
      setPostingProducts(prev => new Set(prev).add(productId));
      
      const result = await memberService.postProduct(productId);
      
      if (result.success) {
        toast.success(result.message || "Đã POST sản phẩm thành công!");
        // Reload danh sách để cập nhật trạng thái
        await loadPosts();
      } else {
        toast.error(result.message || "Không thể POST sản phẩm");
      }
    } catch (err) {
      toast.error("Lỗi khi POST sản phẩm");
    } finally {
      setPostingProducts(prev => {
        const newSet = new Set(prev);
        newSet.delete(productId);
        return newSet;
      });
    }
  };

  // Handle image navigation
  const handlePrevImage = (postId, images) => {
    setCurrentImageIndexes(prev => {
      const currentIndex = prev[postId] || 0;
      const newIndex = currentIndex === 0 ? images.length - 1 : currentIndex - 1;
      return { ...prev, [postId]: newIndex };
    });
  };

  const handleNextImage = (postId, images) => {
    setCurrentImageIndexes(prev => {
      const currentIndex = prev[postId] || 0;
      const newIndex = currentIndex === images.length - 1 ? 0 : currentIndex + 1;
      return { ...prev, [postId]: newIndex };
    });
  };

  // Get images array for a post
  const getPostImages = (post) => {
    const images = [];
    
    // Add images from imageUrls array
    if (post.imageUrls && Array.isArray(post.imageUrls) && post.imageUrls.length > 0) {
      images.push(...post.imageUrls);
    }
    // Add single image if exists
    else if (post.image) {
      images.push(post.image);
    }
    // Add vehicle image
    else if (post.vehicle?.image) {
      images.push(post.vehicle.image);
    }
    // Add battery image
    else if (post.battery?.image) {
      images.push(post.battery.image);
    }
    // Add from images array
    else if (post.images && Array.isArray(post.images) && post.images.length > 0) {
      images.push(...post.images);
    }

    // Return images or placeholder
    return images.length > 0 ? images : ["data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtc2l6ZT0iMTQiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiM5OTkiPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg=="];
  };

  if (isCheckingAuth) {
    return (
      <Container
        fluid
        className="d-flex justify-content-center align-items-center"
        style={{ minHeight: "100vh" }}
      >
        <div className="text-center">
          <Spinner animation="border" variant="success" className="mb-3" />
          <p className="text-muted">Đang kiểm tra quyền truy cập...</p>
        </div>
      </Container>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <Container fluid className="p-0 bg-light" style={{ minHeight: "100vh" }}>
      <div className="p-4">
        {/* Header */}
        <MemberHeader activeTab="my-posts" />

        {/* Stats Cards */}
        <PostStatsCards posts={posts} />

        {/* Action Bar với Filter */}
        <div className="mb-4">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h3 className="h5 mb-0 text-dark">
              Tin đăng của tôi ({filteredPosts.length}/{posts.length})
            </h3>
            <Button
              variant="success"
              onClick={() => navigate("/post-ad")}
              className="px-4"
            >
              Đăng tin mới
            </Button>
          </div>

          <div>
            <Form.Select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              size="sm"
              style={{ maxWidth: "250px" }}
            >
              <option value="ALL">Tất cả trạng thái</option>
              <option value="PENDING">Chờ duyệt</option>
              <option value="STAFF_APPROVED">Đã duyệt Staff</option>
              <option value="ACTIVE">Đang hiển thị</option>
              <option value="REJECTED">Bị từ chối</option>
            </Form.Select>
          </div>
        </div>

        {/* Posts List */}
        <PostsList
          loadingPosts={loadingPosts}
          posts={posts}
          filteredPosts={filteredPosts}
          currentImageIndexes={currentImageIndexes}
          postingProducts={postingProducts}
          getPostImages={getPostImages}
          handlePrevImage={handlePrevImage}
          handleNextImage={handleNextImage}
          handleEditPost={handleEditPost}
          handleDeletePost={handleDeletePost}
          handlePostProduct={handlePostProduct}
          getStatusText={getStatusText}
          getStatusColor={getStatusColor}
          formatDate={formatDate}
          formatCurrency={formatCurrency}
          navigate={navigate}
        />
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        show={showDeleteModal}
        onHide={() => setShowDeleteModal(false)}
        loading={loading}
        selectedPost={selectedPost}
        onConfirm={confirmDelete}
        formatCurrency={formatCurrency}
      />

      {/* Edit Product Modal */}
      <EditProductModal
        show={showEditModal}
        onHide={() => setShowEditModal(false)}
        loading={loading}
        editFormData={editFormData}
        onFormChange={handleEditFormChange}
        onSubmit={confirmEdit}
        brands={brands}
        batteryTypes={batteryTypes}
      />
    </Container>
  );
};

export default MyPosts;
