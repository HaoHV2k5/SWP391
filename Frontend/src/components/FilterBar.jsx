// Import React hooks để quản lý state
import { useState } from "react";
// Import các icon từ thư viện lucide-react để hiển thị trong UI
import { Filter, Truck, Star, DollarSign, ChevronDown, X } from "lucide-react";

// Component FilterBar - Thanh lọc sản phẩm theo tiêu chí với màu sắc đồng nhất
// Nhận props onFilterChange từ component cha để truyền dữ liệu lọc lên
const FilterBar = ({ onFilterChange }) => {
  // State quản lý các bộ lọc được chọn - object chứa tất cả filter types
  const [filters, setFilters] = useState({
    availability: null, // Sẵn hàng - null = chưa chọn, 'inStock' = đã chọn
    priceRange: null, // Khoảng giá - null = chưa chọn, 'under10m' = dưới 10 triệu, etc.
    brand: null, // Thương hiệu - null = chưa chọn, 'vinfast' = VinFast, etc.
    batteryType: null, // Loại pin - null = chưa chọn, 'lithium' = Lithium-ion, etc.
    batteryCapacity: null, // Dung lượng pin - null = chưa chọn, '20ah' = 20Ah, etc.
    usageType: null, // Nhu cầu sử dụng - null = chưa chọn, 'daily' = đi lại hàng ngày, etc.
    condition: null, // Tình trạng - null = chưa chọn, 'new' = hàng mới
    specialFeatures: null, // Tính năng đặc biệt - null = chưa chọn, 'gps' = GPS, etc.
    vehicleType: null // Loại xe - null = chưa chọn, 'xe-dien' = xe điện 2 bánh, etc.
  });

  // State quản lý hiển thị dropdown - null = không có dropdown nào mở, 'price' = dropdown giá đang mở
  const [activeDropdown, setActiveDropdown] = useState(null);

  // Hàm xử lý thay đổi bộ lọc - được gọi khi user chọn một filter option
  const handleFilterChange = (filterType, value) => {
    // Tạo object mới với filter được cập nhật bằng spread operator
    const newFilters = { ...filters, [filterType]: value };
    // Cập nhật state filters với giá trị mới
    setFilters(newFilters);
    // Truyền dữ liệu filter lên component cha (HomePage) để lọc sản phẩm
    onFilterChange(newFilters);
    // Đóng dropdown sau khi user chọn để UX tốt hơn
    setActiveDropdown(null);
  };

  // Hàm reset tất cả bộ lọc về trạng thái ban đầu
  const resetFilters = () => {
    // Reset tất cả filters về null (chưa chọn)
    setFilters({
      availability: null, // Reset sẵn hàng
      priceRange: null, // Reset khoảng giá
      brand: null, // Reset thương hiệu
      batteryType: null, // Reset loại pin
      batteryCapacity: null, // Reset dung lượng pin
      usageType: null, // Reset nhu cầu sử dụng
      condition: null, // Reset tình trạng
      specialFeatures: null, // Reset tính năng đặc biệt
      vehicleType: null // Reset loại xe
    });
    // Truyền object rỗng lên component cha để hiển thị tất cả sản phẩm
    onFilterChange({});
  };

  // Đếm số bộ lọc đang áp dụng để hiển thị badge trên nút "Bộ lọc"
  // Object.values(filters) lấy tất cả giá trị, filter() loại bỏ null, length đếm số lượng
  const activeFiltersCount = Object.values(filters).filter(filter => filter !== null).length;

  return (
    // Container chính của FilterBar với background trắng và shadow nhẹ
    <div style={{
      background: "#fff", // Nền trắng để nổi bật
      padding: "20px 30px", // Padding trên/dưới 20px, trái/phải 30px
      borderBottom: "1px solid #e0e0e0", // Border dưới màu xám nhẹ để phân cách
      boxShadow: "0 2px 8px rgba(0,0,0,0.05)" // Shadow nhẹ để tạo độ sâu
    }}>
      {/* Tiêu đề bộ lọc với icon và text */}
      <h3 style={{
        fontSize: "18px", // Font size lớn để nổi bật
        fontWeight: "bold", // Font weight đậm
        color: "#333", // Màu xám đậm cho text
        marginBottom: "20px", // Margin dưới để tạo khoảng cách với filter buttons
        display: "flex", // Flexbox để icon và text cùng hàng
        alignItems: "center", // Căn giữa theo chiều dọc
        gap: "8px" // Khoảng cách giữa icon và text
      }}>
        {/* Icon Filter màu xanh chủ đạo */}
        <Filter size={20} color="#00A86B" />
        {/* Text tiêu đề */}
        Chọn theo tiêu chí
      </h3>

      {/* Container chứa tất cả bộ lọc trong 1 hàng ngang */}
      <div style={{
        display: "flex", // Flexbox để các filter buttons xếp ngang
        flexWrap: "wrap", // Cho phép wrap xuống hàng dưới khi không đủ chỗ
        gap: "10px", // Khoảng cách giữa các buttons
        alignItems: "center", // Căn giữa theo chiều dọc
        justifyContent: "flex-start" // Căn trái để bắt đầu từ bên trái
      }}>
        {/* Nút "Bộ lọc" chính - Reset tất cả filters */}
        <button
          onClick={resetFilters} // Gọi hàm resetFilters khi click
          style={{
            display: "flex", // Flexbox để icon, text và badge cùng hàng
            alignItems: "center", // Căn giữa theo chiều dọc
            gap: "8px", // Khoảng cách giữa icon, text và badge
            padding: "10px 16px", // Padding trên/dưới 10px, trái/phải 16px
            border: "2px solid #00A86B", // Border xanh đậm 2px để nổi bật
            borderRadius: "25px", // Bo tròn góc để tạo hình viên thuốc
            background: "white", // Nền trắng ban đầu
            color: "#00A86B", // Text màu xanh
            fontSize: "14px", // Font size vừa phải
            fontWeight: "600", // Font weight đậm
            cursor: "pointer", // Con trỏ pointer khi hover
            transition: "all 0.3s ease", // Animation mượt mà 0.3s
            boxShadow: "0 2px 8px rgba(0, 168, 107, 0.2)" // Shadow xanh nhẹ
          }}
          // Event handler khi hover vào button
          onMouseEnter={(e) => {
            e.target.style.background = "#00A86B"; // Đổi nền thành xanh
            e.target.style.color = "white"; // Đổi text thành trắng
            e.target.style.transform = "translateY(-2px)"; // Nhấc lên 2px
            e.target.style.boxShadow = "0 4px 12px rgba(0, 168, 107, 0.3)"; // Shadow đậm hơn
          }}
          // Event handler khi rời khỏi button
          onMouseLeave={(e) => {
            e.target.style.background = "white"; // Trở về nền trắng
            e.target.style.color = "#00A86B"; // Trở về text xanh
            e.target.style.transform = "translateY(0)"; // Về vị trí ban đầu
            e.target.style.boxShadow = "0 2px 8px rgba(0, 168, 107, 0.2)"; // Shadow nhẹ lại
          }}
        >
          {/* Icon Filter */}
          <Filter size={16} />
          {/* Text "Bộ lọc" */}
          Bộ lọc
          {/* Badge hiển thị số lượng filter đang active - chỉ hiện khi có filter */}
          {activeFiltersCount > 0 && (
            <span style={{
              background: "#00A86B", // Nền xanh
              color: "white", // Text trắng
              borderRadius: "50%", // Hình tròn
              width: "18px", // Chiều rộng 18px
              height: "18px", // Chiều cao 18px
              fontSize: "11px", // Font size nhỏ
              display: "flex", // Flexbox để căn giữa số
              alignItems: "center", // Căn giữa theo chiều dọc
              justifyContent: "center", // Căn giữa theo chiều ngang
              fontWeight: "bold" // Font weight đậm
            }}>
              {/* Hiển thị số lượng filter đang active */}
              {activeFiltersCount}
            </span>
          )}
        </button>

        {/* Nút "Sẵn hàng" - Filter theo tình trạng có sẵn hàng */}
        <button
          // Toggle filter availability: nếu đang 'inStock' thì set null, ngược lại set 'inStock'
          onClick={() => handleFilterChange('availability', filters.availability === 'inStock' ? null : 'inStock')}
          style={{
            display: "flex", // Flexbox để icon và text cùng hàng
            alignItems: "center", // Căn giữa theo chiều dọc
            gap: "8px", // Khoảng cách giữa icon và text
            padding: "10px 16px", // Padding để tạo không gian bên trong
            border: "1px solid #e0e0e0", // Border xám nhẹ
            borderRadius: "25px", // Bo tròn góc để tạo hình viên thuốc
            // Conditional styling: nếu đang active thì nền xanh, ngược lại nền trắng
            background: filters.availability === 'inStock' ? "#00A86B" : "white",
            // Conditional styling: nếu đang active thì text trắng, ngược lại text xám
            color: filters.availability === 'inStock' ? "white" : "#666",
            fontSize: "14px", // Font size vừa phải
            fontWeight: "500", // Font weight trung bình
            cursor: "pointer", // Con trỏ pointer khi hover
            transition: "all 0.3s ease", // Animation mượt mà 0.3s
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)" // Shadow nhẹ để tạo độ sâu
          }}
          // Event handler khi hover vào button - chỉ áp dụng khi chưa active
          onMouseEnter={(e) => {
            if (filters.availability !== 'inStock') { // Chỉ hover effect khi chưa active
              e.target.style.backgroundColor = "#f0f9f0"; // Nền xanh nhạt
              e.target.style.borderColor = "#00A86B"; // Border xanh
              e.target.style.color = "#00A86B"; // Text xanh
              e.target.style.transform = "translateY(-2px)"; // Nhấc lên 2px
              e.target.style.boxShadow = "0 4px 12px rgba(0, 168, 107, 0.2)"; // Shadow đậm hơn
            }
          }}
          // Event handler khi rời khỏi button - chỉ áp dụng khi chưa active
          onMouseLeave={(e) => {
            if (filters.availability !== 'inStock') { // Chỉ reset khi chưa active
              e.target.style.backgroundColor = "white"; // Trở về nền trắng
              e.target.style.borderColor = "#e0e0e0"; // Trở về border xám
              e.target.style.color = "#666"; // Trở về text xám
              e.target.style.transform = "translateY(0)"; // Về vị trí ban đầu
              e.target.style.boxShadow = "0 2px 8px rgba(0,0,0,0.1)"; // Shadow nhẹ lại
            }
          }}
        >
          {/* Icon Truck để biểu thị sẵn hàng */}
          <Truck size={16} />
          {/* Text "Sẵn hàng" */}
          Sẵn hàng
        </button>

        {/* Nút "Hàng mới về" - Filter theo tình trạng hàng mới */}
        <button
          // Toggle filter condition: nếu đang 'new' thì set null, ngược lại set 'new'
          onClick={() => handleFilterChange('condition', filters.condition === 'new' ? null : 'new')}
          style={{
            display: "flex", // Flexbox để icon và text cùng hàng
            alignItems: "center", // Căn giữa theo chiều dọc
            gap: "8px", // Khoảng cách giữa icon và text
            padding: "10px 16px", // Padding để tạo không gian bên trong
            border: "1px solid #e0e0e0", // Border xám nhẹ
            borderRadius: "25px", // Bo tròn góc để tạo hình viên thuốc
            // Conditional styling: nếu đang active thì nền xanh, ngược lại nền trắng
            background: filters.condition === 'new' ? "#00A86B" : "white",
            // Conditional styling: nếu đang active thì text trắng, ngược lại text xám
            color: filters.condition === 'new' ? "white" : "#666",
            fontSize: "14px", // Font size vừa phải
            fontWeight: "500", // Font weight trung bình
            cursor: "pointer", // Con trỏ pointer khi hover
            transition: "all 0.3s ease", // Animation mượt mà 0.3s
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)" // Shadow nhẹ để tạo độ sâu
          }}
          // Event handler khi hover vào button - chỉ áp dụng khi chưa active
          onMouseEnter={(e) => {
            if (filters.condition !== 'new') { // Chỉ hover effect khi chưa active
              e.target.style.backgroundColor = "#f0f9f0"; // Nền xanh nhạt
              e.target.style.borderColor = "#00A86B"; // Border xanh
              e.target.style.color = "#00A86B"; // Text xanh
              e.target.style.transform = "translateY(-2px)"; // Nhấc lên 2px
              e.target.style.boxShadow = "0 4px 12px rgba(0, 168, 107, 0.2)"; // Shadow đậm hơn
            }
          }}
          // Event handler khi rời khỏi button - chỉ áp dụng khi chưa active
          onMouseLeave={(e) => {
            if (filters.condition !== 'new') { // Chỉ reset khi chưa active
              e.target.style.backgroundColor = "white"; // Trở về nền trắng
              e.target.style.borderColor = "#e0e0e0"; // Trở về border xám
              e.target.style.color = "#666"; // Trở về text xám
              e.target.style.transform = "translateY(0)"; // Về vị trí ban đầu
              e.target.style.boxShadow = "0 2px 8px rgba(0,0,0,0.1)"; // Shadow nhẹ lại
            }
          }}
        >
          {/* Icon Star để biểu thị hàng mới về */}
          <Star size={16} />
          {/* Text "Hàng mới về" */}
          Hàng mới về
        </button>

        {/* Dropdown "Xem theo giá" - Filter theo khoảng giá */}
        <div style={{ position: "relative" }}> {/* Container với position relative để dropdown absolute */}
          <button
            // Toggle dropdown price: nếu đang mở thì đóng, ngược lại mở
            onClick={() => setActiveDropdown(activeDropdown === 'price' ? null : 'price')}
            style={{
              display: "flex", // Flexbox để icon và text cùng hàng
              alignItems: "center", // Căn giữa theo chiều dọc
              gap: "8px", // Khoảng cách giữa icon và text
              padding: "10px 16px", // Padding để tạo không gian bên trong
              border: "1px solid #e0e0e0", // Border xám nhẹ
              borderRadius: "25px", // Bo tròn góc để tạo hình viên thuốc
              // Conditional styling: nếu đang active thì nền xanh, ngược lại nền trắng
              background: filters.priceRange ? "#00A86B" : "white",
              // Conditional styling: nếu đang active thì text trắng, ngược lại text xám
              color: filters.priceRange ? "white" : "#666",
              fontSize: "14px", // Font size vừa phải
              fontWeight: "500", // Font weight trung bình
              cursor: "pointer", // Con trỏ pointer khi hover
              transition: "all 0.3s ease", // Animation mượt mà 0.3s
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)" // Shadow nhẹ để tạo độ sâu
            }}
            // Event handler khi hover vào button - chỉ áp dụng khi chưa active
            onMouseEnter={(e) => {
              if (!filters.priceRange) { // Chỉ hover effect khi chưa active
                e.target.style.backgroundColor = "#f0f9f0"; // Nền xanh nhạt
                e.target.style.borderColor = "#00A86B"; // Border xanh
                e.target.style.color = "#00A86B"; // Text xanh
                e.target.style.transform = "translateY(-2px)"; // Nhấc lên 2px
                e.target.style.boxShadow = "0 4px 12px rgba(0, 168, 107, 0.2)"; // Shadow đậm hơn
              }
            }}
            // Event handler khi rời khỏi button - chỉ áp dụng khi chưa active
            onMouseLeave={(e) => {
              if (!filters.priceRange) { // Chỉ reset khi chưa active
                e.target.style.backgroundColor = "white"; // Trở về nền trắng
                e.target.style.borderColor = "#e0e0e0"; // Trở về border xám
                e.target.style.color = "#666"; // Trở về text xám
                e.target.style.transform = "translateY(0)"; // Về vị trí ban đầu
                e.target.style.boxShadow = "0 2px 8px rgba(0,0,0,0.1)"; // Shadow nhẹ lại
              }
            }}
          >
            {/* Icon DollarSign để biểu thị giá tiền */}
            <DollarSign size={16} />
            {/* Text "Xem theo giá" */}
            Xem theo giá
            {/* Icon ChevronDown để biểu thị dropdown */}
            <ChevronDown size={14} />
          </button>

          {/* Dropdown menu giá - chỉ hiện khi activeDropdown === 'price' */}
          {activeDropdown === 'price' && (
            <div style={{
              position: "absolute", // Position absolute để float trên các element khác
              top: "100%", // Đặt ngay dưới button
              left: "0", // Căn trái với button
              background: "white", // Nền trắng
              border: "1px solid #e0e0e0", // Border xám nhẹ
              borderRadius: "8px", // Bo góc nhẹ
              boxShadow: "0 8px 25px rgba(0,0,0,0.15)", // Shadow đậm để nổi bật
              zIndex: 1000, // Z-index cao để hiện trên các element khác
              minWidth: "200px", // Chiều rộng tối thiểu
              padding: "10px 0" // Padding trên/dưới để tạo không gian
            }}>
              {/* Danh sách các khoảng giá */}
              {[
                { label: "Dưới 10 triệu", value: "under10m" }, // Dưới 10 triệu VNĐ
                { label: "10 - 20 triệu", value: "10m-20m" }, // 10-20 triệu VNĐ
                { label: "20 - 30 triệu", value: "20m-30m" }, // 20-30 triệu VNĐ
                { label: "30 - 50 triệu", value: "30m-50m" }, // 30-50 triệu VNĐ
                { label: "50 - 100 triệu", value: "50m-100m" }, // 50-100 triệu VNĐ
                { label: "100 - 500 triệu", value: "100m-500m" }, // 100-500 triệu VNĐ
                { label: "500 triệu - 1 tỷ", value: "500m-1b" }, // 500 triệu - 1 tỷ VNĐ
                { label: "Trên 1 tỷ", value: "over1b" } // Trên 1 tỷ VNĐ
              ].map((option) => (
                <button
                  key={option.value} // Key unique cho React
                  // Gọi handleFilterChange với filterType 'priceRange' và value của option
                  onClick={() => handleFilterChange('priceRange', option.value)}
                  style={{
                    width: "100%", // Chiều rộng 100% của dropdown
                    padding: "10px 16px", // Padding để tạo không gian
                    border: "none", // Không có border
                    // Conditional styling: nếu đang active thì nền xanh nhạt, ngược lại trong suốt
                    background: filters.priceRange === option.value ? "#f0f9f0" : "transparent",
                    // Conditional styling: nếu đang active thì text xanh, ngược lại text đen
                    color: filters.priceRange === option.value ? "#00A86B" : "#333",
                    fontSize: "14px", // Font size vừa phải
                    textAlign: "left", // Căn trái text
                    cursor: "pointer", // Con trỏ pointer khi hover
                    transition: "all 0.3s ease" // Animation mượt mà
                  }}
                  // Event handler khi hover vào option - chỉ áp dụng khi chưa active
                  onMouseEnter={(e) => {
                    if (filters.priceRange !== option.value) { // Chỉ hover khi chưa active
                      e.target.style.background = "#f8f9fa"; // Nền xám nhạt
                    }
                  }}
                  // Event handler khi rời khỏi option - chỉ áp dụng khi chưa active
                  onMouseLeave={(e) => {
                    if (filters.priceRange !== option.value) { // Chỉ reset khi chưa active
                      e.target.style.background = "transparent"; // Trở về trong suốt
                    }
                  }}
                >
                  {/* Hiển thị label của option */}
                  {option.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Dropdown "Thương hiệu" - Filter theo thương hiệu xe điện */}
        <div style={{ position: "relative" }}> {/* Container với position relative để dropdown absolute */}
          <button
            // Toggle dropdown brand: nếu đang mở thì đóng, ngược lại mở
            onClick={() => setActiveDropdown(activeDropdown === 'brand' ? null : 'brand')}
            style={{
              display: "flex", // Flexbox để icon và text cùng hàng
              alignItems: "center", // Căn giữa theo chiều dọc
              gap: "8px", // Khoảng cách giữa icon và text
              padding: "10px 16px", // Padding để tạo không gian bên trong
              border: "1px solid #e0e0e0", // Border xám nhẹ
              borderRadius: "25px", // Bo tròn góc để tạo hình viên thuốc
              // Conditional styling: nếu đang active thì nền xanh, ngược lại nền trắng
              background: filters.brand ? "#00A86B" : "white",
              // Conditional styling: nếu đang active thì text trắng, ngược lại text xám
              color: filters.brand ? "white" : "#666",
              fontSize: "14px", // Font size vừa phải
              fontWeight: "500", // Font weight trung bình
              cursor: "pointer", // Con trỏ pointer khi hover
              transition: "all 0.3s ease", // Animation mượt mà 0.3s
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)" // Shadow nhẹ để tạo độ sâu
            }}
            // Event handler khi hover vào button - chỉ áp dụng khi chưa active
            onMouseEnter={(e) => {
              if (!filters.brand) { // Chỉ hover effect khi chưa active
                e.target.style.backgroundColor = "#f0f9f0"; // Nền xanh nhạt
                e.target.style.borderColor = "#00A86B"; // Border xanh
                e.target.style.color = "#00A86B"; // Text xanh
                e.target.style.transform = "translateY(-2px)"; // Nhấc lên 2px
                e.target.style.boxShadow = "0 4px 12px rgba(0, 168, 107, 0.2)"; // Shadow đậm hơn
              }
            }}
            // Event handler khi rời khỏi button - chỉ áp dụng khi chưa active
            onMouseLeave={(e) => {
              if (!filters.brand) { // Chỉ reset khi chưa active
                e.target.style.backgroundColor = "white"; // Trở về nền trắng
                e.target.style.borderColor = "#e0e0e0"; // Trở về border xám
                e.target.style.color = "#666"; // Trở về text xám
                e.target.style.transform = "translateY(0)"; // Về vị trí ban đầu
                e.target.style.boxShadow = "0 2px 8px rgba(0,0,0,0.1)"; // Shadow nhẹ lại
              }
            }}
          >
            {/* Text "Thương hiệu" */}
            Thương hiệu
            {/* Icon ChevronDown để biểu thị dropdown */}
            <ChevronDown size={14} />
          </button>

          {/* Dropdown menu thương hiệu - chỉ hiện khi activeDropdown === 'brand' */}
          {activeDropdown === 'brand' && (
            <div style={{
              position: "absolute", // Position absolute để float trên các element khác
              top: "100%", // Đặt ngay dưới button
              left: "0", // Căn trái với button
              background: "white", // Nền trắng
              border: "1px solid #e0e0e0", // Border xám nhẹ
              borderRadius: "8px", // Bo góc nhẹ
              boxShadow: "0 8px 25px rgba(0,0,0,0.15)", // Shadow đậm để nổi bật
              zIndex: 1000, // Z-index cao để hiện trên các element khác
              minWidth: "200px", // Chiều rộng tối thiểu
              padding: "10px 0" // Padding trên/dưới để tạo không gian
            }}>
              {/* Danh sách các thương hiệu xe điện */}
              {[
                { label: "VinFast", value: "vinfast" }, // Thương hiệu VinFast
                { label: "Honda", value: "honda" }, // Thương hiệu Honda
                { label: "Yamaha", value: "yamaha" }, // Thương hiệu Yamaha
                { label: "Piaggio", value: "piaggio" }, // Thương hiệu Piaggio
                { label: "SYM", value: "sym" }, // Thương hiệu SYM
                { label: "Kymco", value: "kymco" }, // Thương hiệu Kymco
                { label: "Tesla", value: "tesla" } // Thương hiệu Tesla
              ].map((option) => (
                <button
                  key={option.value} // Key unique cho React
                  // Gọi handleFilterChange với filterType 'brand' và value của option
                  onClick={() => handleFilterChange('brand', option.value)}
                  style={{
                    width: "100%", // Chiều rộng 100% của dropdown
                    padding: "10px 16px", // Padding để tạo không gian
                    border: "none", // Không có border
                    // Conditional styling: nếu đang active thì nền xanh nhạt, ngược lại trong suốt
                    background: filters.brand === option.value ? "#f0f9f0" : "transparent",
                    // Conditional styling: nếu đang active thì text xanh, ngược lại text đen
                    color: filters.brand === option.value ? "#00A86B" : "#333",
                    fontSize: "14px", // Font size vừa phải
                    textAlign: "left", // Căn trái text
                    cursor: "pointer", // Con trỏ pointer khi hover
                    transition: "all 0.3s ease" // Animation mượt mà
                  }}
                  // Event handler khi hover vào option - chỉ áp dụng khi chưa active
                  onMouseEnter={(e) => {
                    if (filters.brand !== option.value) { // Chỉ hover khi chưa active
                      e.target.style.background = "#f8f9fa"; // Nền xám nhạt
                    }
                  }}
                  // Event handler khi rời khỏi option - chỉ áp dụng khi chưa active
                  onMouseLeave={(e) => {
                    if (filters.brand !== option.value) { // Chỉ reset khi chưa active
                      e.target.style.background = "transparent"; // Trở về trong suốt
                    }
                  }}
                >
                  {/* Hiển thị label của option */}
                  {option.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Dropdown "Loại xe" - Filter theo loại phương tiện điện */}
        <div style={{ position: "relative" }}> {/* Container với position relative để dropdown absolute */}
          <button
            // Toggle dropdown vehicleType: nếu đang mở thì đóng, ngược lại mở
            onClick={() => setActiveDropdown(activeDropdown === 'vehicleType' ? null : 'vehicleType')}
            style={{
              display: "flex", // Flexbox để icon và text cùng hàng
              alignItems: "center", // Căn giữa theo chiều dọc
              gap: "8px", // Khoảng cách giữa icon và text
              padding: "10px 16px", // Padding để tạo không gian bên trong
              border: "1px solid #e0e0e0", // Border xám nhẹ
              borderRadius: "25px", // Bo tròn góc để tạo hình viên thuốc
              // Conditional styling: nếu đang active thì nền xanh, ngược lại nền trắng
              background: filters.vehicleType ? "#00A86B" : "white",
              // Conditional styling: nếu đang active thì text trắng, ngược lại text xám
              color: filters.vehicleType ? "white" : "#666",
              fontSize: "14px", // Font size vừa phải
              fontWeight: "500", // Font weight trung bình
              cursor: "pointer", // Con trỏ pointer khi hover
              transition: "all 0.3s ease", // Animation mượt mà 0.3s
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)" // Shadow nhẹ để tạo độ sâu
            }}
            // Event handler khi hover vào button - chỉ áp dụng khi chưa active
            onMouseEnter={(e) => {
              if (!filters.vehicleType) { // Chỉ hover effect khi chưa active
                e.target.style.backgroundColor = "#f0f9f0"; // Nền xanh nhạt
                e.target.style.borderColor = "#00A86B"; // Border xanh
                e.target.style.color = "#00A86B"; // Text xanh
                e.target.style.transform = "translateY(-2px)"; // Nhấc lên 2px
                e.target.style.boxShadow = "0 4px 12px rgba(0, 168, 107, 0.2)"; // Shadow đậm hơn
              }
            }}
            // Event handler khi rời khỏi button - chỉ áp dụng khi chưa active
            onMouseLeave={(e) => {
              if (!filters.vehicleType) { // Chỉ reset khi chưa active
                e.target.style.backgroundColor = "white"; // Trở về nền trắng
                e.target.style.borderColor = "#e0e0e0"; // Trở về border xám
                e.target.style.color = "#666"; // Trở về text xám
                e.target.style.transform = "translateY(0)"; // Về vị trí ban đầu
                e.target.style.boxShadow = "0 2px 8px rgba(0,0,0,0.1)"; // Shadow nhẹ lại
              }
            }}
          >
            {/* Text "Loại xe" */}
            Loại xe
            {/* Icon ChevronDown để biểu thị dropdown */}
            <ChevronDown size={14} />
          </button>

          {/* Dropdown menu loại xe - chỉ hiện khi activeDropdown === 'vehicleType' */}
          {activeDropdown === 'vehicleType' && (
            <div style={{
              position: "absolute", // Position absolute để float trên các element khác
              top: "100%", // Đặt ngay dưới button
              left: "0", // Căn trái với button
              background: "white", // Nền trắng
              border: "1px solid #e0e0e0", // Border xám nhẹ
              borderRadius: "8px", // Bo góc nhẹ
              boxShadow: "0 8px 25px rgba(0,0,0,0.15)", // Shadow đậm để nổi bật
              zIndex: 1000, // Z-index cao để hiện trên các element khác
              minWidth: "200px", // Chiều rộng tối thiểu
              padding: "10px 0" // Padding trên/dưới để tạo không gian
            }}>
              {/* Danh sách các loại phương tiện điện */}
              {[
                { label: "Xe điện 2 bánh", value: "xe-dien" }, // Xe máy điện, xe đạp điện
                { label: "Xe hơi điện", value: "xe-hoi-dien" }, // Ô tô điện
                { label: "Pin & Sạc", value: "pin" } // Pin và phụ kiện sạc
              ].map((option) => (
                <button
                  key={option.value} // Key unique cho React
                  // Gọi handleFilterChange với filterType 'vehicleType' và value của option
                  onClick={() => handleFilterChange('vehicleType', option.value)}
                  style={{
                    width: "100%", // Chiều rộng 100% của dropdown
                    padding: "10px 16px", // Padding để tạo không gian
                    border: "none", // Không có border
                    // Conditional styling: nếu đang active thì nền xanh nhạt, ngược lại trong suốt
                    background: filters.vehicleType === option.value ? "#f0f9f0" : "transparent",
                    // Conditional styling: nếu đang active thì text xanh, ngược lại text đen
                    color: filters.vehicleType === option.value ? "#00A86B" : "#333",
                    fontSize: "14px", // Font size vừa phải
                    textAlign: "left", // Căn trái text
                    cursor: "pointer", // Con trỏ pointer khi hover
                    transition: "all 0.3s ease" // Animation mượt mà
                  }}
                  // Event handler khi hover vào option - chỉ áp dụng khi chưa active
                  onMouseEnter={(e) => {
                    if (filters.vehicleType !== option.value) { // Chỉ hover khi chưa active
                      e.target.style.background = "#f8f9fa"; // Nền xám nhạt
                    }
                  }}
                  // Event handler khi rời khỏi option - chỉ áp dụng khi chưa active
                  onMouseLeave={(e) => {
                    if (filters.vehicleType !== option.value) { // Chỉ reset khi chưa active
                      e.target.style.background = "transparent"; // Trở về trong suốt
                    }
                  }}
                >
                  {/* Hiển thị label của option */}
                  {option.label}
                </button>
              ))}
            </div>
          )}
        </div>
        {/* Dropdown "Loại pin" - Filter theo công nghệ pin */}
        <div style={{ position: "relative" }}> {/* Container với position relative để dropdown absolute */}
          <button
            // Toggle dropdown batteryType: nếu đang mở thì đóng, ngược lại mở
            onClick={() => setActiveDropdown(activeDropdown === 'batteryType' ? null : 'batteryType')}
            style={{
              display: "flex", // Flexbox để icon và text cùng hàng
              alignItems: "center", // Căn giữa theo chiều dọc
              gap: "8px", // Khoảng cách giữa icon và text
              padding: "10px 16px", // Padding để tạo không gian bên trong
              border: "1px solid #e0e0e0", // Border xám nhẹ
              borderRadius: "25px", // Bo tròn góc để tạo hình viên thuốc
              // Conditional styling: nếu đang active thì nền xanh, ngược lại nền trắng
              background: filters.batteryType ? "#00A86B" : "white",
              // Conditional styling: nếu đang active thì text trắng, ngược lại text xám
              color: filters.batteryType ? "white" : "#666",
              fontSize: "14px", // Font size vừa phải
              fontWeight: "500", // Font weight trung bình
              cursor: "pointer", // Con trỏ pointer khi hover
              transition: "all 0.3s ease", // Animation mượt mà 0.3s
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)" // Shadow nhẹ để tạo độ sâu
            }}
            // Event handler khi hover vào button - chỉ áp dụng khi chưa active
            onMouseEnter={(e) => {
              if (!filters.batteryType) { // Chỉ hover effect khi chưa active
                e.target.style.backgroundColor = "#f0f9f0"; // Nền xanh nhạt
                e.target.style.borderColor = "#00A86B"; // Border xanh
                e.target.style.color = "#00A86B"; // Text xanh
                e.target.style.transform = "translateY(-2px)"; // Nhấc lên 2px
                e.target.style.boxShadow = "0 4px 12px rgba(0, 168, 107, 0.2)"; // Shadow đậm hơn
              }
            }}
            // Event handler khi rời khỏi button - chỉ áp dụng khi chưa active
            onMouseLeave={(e) => {
              if (!filters.batteryType) { // Chỉ reset khi chưa active
                e.target.style.backgroundColor = "white"; // Trở về nền trắng
                e.target.style.borderColor = "#e0e0e0"; // Trở về border xám
                e.target.style.color = "#666"; // Trở về text xám
                e.target.style.transform = "translateY(0)"; // Về vị trí ban đầu
                e.target.style.boxShadow = "0 2px 8px rgba(0,0,0,0.1)"; // Shadow nhẹ lại
              }
            }}
          >
            {/* Text "Loại pin" */}
            Loại pin
            {/* Icon ChevronDown để biểu thị dropdown */}
            <ChevronDown size={14} />
          </button>

          {/* Dropdown menu loại pin - chỉ hiện khi activeDropdown === 'batteryType' */}
          {activeDropdown === 'batteryType' && (
            <div style={{
              position: "absolute", // Position absolute để float trên các element khác
              top: "100%", // Đặt ngay dưới button
              left: "0", // Căn trái với button
              background: "white", // Nền trắng
              border: "1px solid #e0e0e0", // Border xám nhẹ
              borderRadius: "8px", // Bo góc nhẹ
              boxShadow: "0 8px 25px rgba(0,0,0,0.15)", // Shadow đậm để nổi bật
              zIndex: 1000, // Z-index cao để hiện trên các element khác
              minWidth: "200px", // Chiều rộng tối thiểu
              padding: "10px 0" // Padding trên/dưới để tạo không gian
            }}>
              {/* Danh sách các công nghệ pin */}
              {[
                { label: "Lithium-ion", value: "lithium" }, // Pin Lithium-ion phổ biến
                { label: "Sắt phosphate", value: "lifepo4" }, // Pin LiFePO4 an toàn hơn
                { label: "NMC", value: "nmc" }, // Pin NMC hiệu suất cao
                { label: "LTO", value: "lto" } // Pin LTO tuổi thọ cao
              ].map((option) => (
                <button
                  key={option.value} // Key unique cho React
                  // Gọi handleFilterChange với filterType 'batteryType' và value của option
                  onClick={() => handleFilterChange('batteryType', option.value)}
                  style={{
                    width: "100%", // Chiều rộng 100% của dropdown
                    padding: "10px 16px", // Padding để tạo không gian
                    border: "none", // Không có border
                    // Conditional styling: nếu đang active thì nền xanh nhạt, ngược lại trong suốt
                    background: filters.batteryType === option.value ? "#f0f9f0" : "transparent",
                    // Conditional styling: nếu đang active thì text xanh, ngược lại text đen
                    color: filters.batteryType === option.value ? "#00A86B" : "#333",
                    fontSize: "14px", // Font size vừa phải
                    textAlign: "left", // Căn trái text
                    cursor: "pointer", // Con trỏ pointer khi hover
                    transition: "all 0.3s ease" // Animation mượt mà
                  }}
                  // Event handler khi hover vào option - chỉ áp dụng khi chưa active
                  onMouseEnter={(e) => {
                    if (filters.batteryType !== option.value) { // Chỉ hover khi chưa active
                      e.target.style.background = "#f8f9fa"; // Nền xám nhạt
                    }
                  }}
                  // Event handler khi rời khỏi option - chỉ áp dụng khi chưa active
                  onMouseLeave={(e) => {
                    if (filters.batteryType !== option.value) { // Chỉ reset khi chưa active
                      e.target.style.background = "transparent"; // Trở về trong suốt
                    }
                  }}
                >
                  {/* Hiển thị label của option */}
                  {option.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Dropdown "Dung lượng pin" - Filter theo dung lượng pin */}
        <div style={{ position: "relative" }}> {/* Container với position relative để dropdown absolute */}
          <button
            // Toggle dropdown batteryCapacity: nếu đang mở thì đóng, ngược lại mở
            onClick={() => setActiveDropdown(activeDropdown === 'batteryCapacity' ? null : 'batteryCapacity')}
            style={{
              display: "flex", // Flexbox để icon và text cùng hàng
              alignItems: "center", // Căn giữa theo chiều dọc
              gap: "8px", // Khoảng cách giữa icon và text
              padding: "10px 16px", // Padding để tạo không gian bên trong
              border: "1px solid #e0e0e0", // Border xám nhẹ
              borderRadius: "25px", // Bo tròn góc để tạo hình viên thuốc
              // Conditional styling: nếu đang active thì nền xanh, ngược lại nền trắng
              background: filters.batteryCapacity ? "#00A86B" : "white",
              // Conditional styling: nếu đang active thì text trắng, ngược lại text xám
              color: filters.batteryCapacity ? "white" : "#666",
              fontSize: "14px", // Font size vừa phải
              fontWeight: "500", // Font weight trung bình
              cursor: "pointer", // Con trỏ pointer khi hover
              transition: "all 0.3s ease", // Animation mượt mà 0.3s
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)" // Shadow nhẹ để tạo độ sâu
            }}
            // Event handler khi hover vào button - chỉ áp dụng khi chưa active
            onMouseEnter={(e) => {
              if (!filters.batteryCapacity) { // Chỉ hover effect khi chưa active
                e.target.style.backgroundColor = "#f0f9f0"; // Nền xanh nhạt
                e.target.style.borderColor = "#00A86B"; // Border xanh
                e.target.style.color = "#00A86B"; // Text xanh
                e.target.style.transform = "translateY(-2px)"; // Nhấc lên 2px
                e.target.style.boxShadow = "0 4px 12px rgba(0, 168, 107, 0.2)"; // Shadow đậm hơn
              }
            }}
            // Event handler khi rời khỏi button - chỉ áp dụng khi chưa active
            onMouseLeave={(e) => {
              if (!filters.batteryCapacity) { // Chỉ reset khi chưa active
                e.target.style.backgroundColor = "white"; // Trở về nền trắng
                e.target.style.borderColor = "#e0e0e0"; // Trở về border xám
                e.target.style.color = "#666"; // Trở về text xám
                e.target.style.transform = "translateY(0)"; // Về vị trí ban đầu
                e.target.style.boxShadow = "0 2px 8px rgba(0,0,0,0.1)"; // Shadow nhẹ lại
              }
            }}
          >
            {/* Text "Dung lượng pin" */}
            Dung lượng pin
            {/* Icon ChevronDown để biểu thị dropdown */}
            <ChevronDown size={14} />
          </button>

          {/* Dropdown menu dung lượng pin - chỉ hiện khi activeDropdown === 'batteryCapacity' */}
          {activeDropdown === 'batteryCapacity' && (
            <div style={{
              position: "absolute", // Position absolute để float trên các element khác
              top: "100%", // Đặt ngay dưới button
              left: "0", // Căn trái với button
              background: "white", // Nền trắng
              border: "1px solid #e0e0e0", // Border xám nhẹ
              borderRadius: "8px", // Bo góc nhẹ
              boxShadow: "0 8px 25px rgba(0,0,0,0.15)", // Shadow đậm để nổi bật
              zIndex: 1000, // Z-index cao để hiện trên các element khác
              minWidth: "200px", // Chiều rộng tối thiểu
              padding: "10px 0" // Padding trên/dưới để tạo không gian
            }}>
              {/* Danh sách các dung lượng pin */}
              {[
                { label: "20Ah", value: "20ah" }, // Pin 20Ah cho xe nhỏ
                { label: "30Ah", value: "30ah" }, // Pin 30Ah cho xe trung bình
                { label: "40Ah", value: "40ah" }, // Pin 40Ah cho xe lớn
                { label: "50Ah", value: "50ah" }, // Pin 50Ah cho xe công suất cao
                { label: "60Ah", value: "60ah" } // Pin 60Ah cho xe cao cấp
              ].map((option) => (
                <button
                  key={option.value} // Key unique cho React
                  // Gọi handleFilterChange với filterType 'batteryCapacity' và value của option
                  onClick={() => handleFilterChange('batteryCapacity', option.value)}
                  style={{
                    width: "100%", // Chiều rộng 100% của dropdown
                    padding: "10px 16px", // Padding để tạo không gian
                    border: "none", // Không có border
                    // Conditional styling: nếu đang active thì nền xanh nhạt, ngược lại trong suốt
                    background: filters.batteryCapacity === option.value ? "#f0f9f0" : "transparent",
                    // Conditional styling: nếu đang active thì text xanh, ngược lại text đen
                    color: filters.batteryCapacity === option.value ? "#00A86B" : "#333",
                    fontSize: "14px", // Font size vừa phải
                    textAlign: "left", // Căn trái text
                    cursor: "pointer", // Con trỏ pointer khi hover
                    transition: "all 0.3s ease" // Animation mượt mà
                  }}
                  // Event handler khi hover vào option - chỉ áp dụng khi chưa active
                  onMouseEnter={(e) => {
                    if (filters.batteryCapacity !== option.value) { // Chỉ hover khi chưa active
                      e.target.style.background = "#f8f9fa"; // Nền xám nhạt
                    }
                  }}
                  // Event handler khi rời khỏi option - chỉ áp dụng khi chưa active
                  onMouseLeave={(e) => {
                    if (filters.batteryCapacity !== option.value) { // Chỉ reset khi chưa active
                      e.target.style.background = "transparent"; // Trở về trong suốt
                    }
                  }}
                >
                  {/* Hiển thị label của option */}
                  {option.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Dropdown "Nhu cầu sử dụng" - Filter theo mục đích sử dụng */}
        <div style={{ position: "relative" }}> {/* Container với position relative để dropdown absolute */}
          <button
            // Toggle dropdown usageType: nếu đang mở thì đóng, ngược lại mở
            onClick={() => setActiveDropdown(activeDropdown === 'usageType' ? null : 'usageType')}
            style={{
              display: "flex", // Flexbox để icon và text cùng hàng
              alignItems: "center", // Căn giữa theo chiều dọc
              gap: "8px", // Khoảng cách giữa icon và text
              padding: "10px 16px", // Padding để tạo không gian bên trong
              border: "1px solid #e0e0e0", // Border xám nhẹ
              borderRadius: "25px", // Bo tròn góc để tạo hình viên thuốc
              // Conditional styling: nếu đang active thì nền xanh, ngược lại nền trắng
              background: filters.usageType ? "#00A86B" : "white",
              // Conditional styling: nếu đang active thì text trắng, ngược lại text xám
              color: filters.usageType ? "white" : "#666",
              fontSize: "14px", // Font size vừa phải
              fontWeight: "500", // Font weight trung bình
              cursor: "pointer", // Con trỏ pointer khi hover
              transition: "all 0.3s ease", // Animation mượt mà 0.3s
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)" // Shadow nhẹ để tạo độ sâu
            }}
            // Event handler khi hover vào button - chỉ áp dụng khi chưa active
            onMouseEnter={(e) => {
              if (!filters.usageType) { // Chỉ hover effect khi chưa active
                e.target.style.backgroundColor = "#f0f9f0"; // Nền xanh nhạt
                e.target.style.borderColor = "#00A86B"; // Border xanh
                e.target.style.color = "#00A86B"; // Text xanh
                e.target.style.transform = "translateY(-2px)"; // Nhấc lên 2px
                e.target.style.boxShadow = "0 4px 12px rgba(0, 168, 107, 0.2)"; // Shadow đậm hơn
              }
            }}
            // Event handler khi rời khỏi button - chỉ áp dụng khi chưa active
            onMouseLeave={(e) => {
              if (!filters.usageType) { // Chỉ reset khi chưa active
                e.target.style.backgroundColor = "white"; // Trở về nền trắng
                e.target.style.borderColor = "#e0e0e0"; // Trở về border xám
                e.target.style.color = "#666"; // Trở về text xám
                e.target.style.transform = "translateY(0)"; // Về vị trí ban đầu
                e.target.style.boxShadow = "0 2px 8px rgba(0,0,0,0.1)"; // Shadow nhẹ lại
              }
            }}
          >
            {/* Text "Nhu cầu sử dụng" */}
            Nhu cầu sử dụng
            {/* Icon ChevronDown để biểu thị dropdown */}
            <ChevronDown size={14} />
          </button>

          {/* Dropdown menu nhu cầu sử dụng - chỉ hiện khi activeDropdown === 'usageType' */}
          {activeDropdown === 'usageType' && (
            <div style={{
              position: "absolute", // Position absolute để float trên các element khác
              top: "100%", // Đặt ngay dưới button
              left: "0", // Căn trái với button
              background: "white", // Nền trắng
              border: "1px solid #e0e0e0", // Border xám nhẹ
              borderRadius: "8px", // Bo góc nhẹ
              boxShadow: "0 8px 25px rgba(0,0,0,0.15)", // Shadow đậm để nổi bật
              zIndex: 1000, // Z-index cao để hiện trên các element khác
              minWidth: "200px", // Chiều rộng tối thiểu
              padding: "10px 0" // Padding trên/dưới để tạo không gian
            }}>
              {/* Danh sách các mục đích sử dụng */}
              {[
                { label: "Đi lại hàng ngày", value: "daily" }, // Sử dụng hàng ngày
                { label: "Giao hàng", value: "delivery" }, // Dùng để giao hàng
                { label: "Du lịch", value: "travel" }, // Dùng để du lịch
                { label: "Thể thao", value: "sports" }, // Dùng cho thể thao
                { label: "Công việc", value: "work" } // Dùng cho công việc
              ].map((option) => (
                <button
                  key={option.value} // Key unique cho React
                  // Gọi handleFilterChange với filterType 'usageType' và value của option
                  onClick={() => handleFilterChange('usageType', option.value)}
                  style={{
                    width: "100%", // Chiều rộng 100% của dropdown
                    padding: "10px 16px", // Padding để tạo không gian
                    border: "none", // Không có border
                    // Conditional styling: nếu đang active thì nền xanh nhạt, ngược lại trong suốt
                    background: filters.usageType === option.value ? "#f0f9f0" : "transparent",
                    // Conditional styling: nếu đang active thì text xanh, ngược lại text đen
                    color: filters.usageType === option.value ? "#00A86B" : "#333",
                    fontSize: "14px", // Font size vừa phải
                    textAlign: "left", // Căn trái text
                    cursor: "pointer", // Con trỏ pointer khi hover
                    transition: "all 0.3s ease" // Animation mượt mà
                  }}
                  // Event handler khi hover vào option - chỉ áp dụng khi chưa active
                  onMouseEnter={(e) => {
                    if (filters.usageType !== option.value) { // Chỉ hover khi chưa active
                      e.target.style.background = "#f8f9fa"; // Nền xám nhạt
                    }
                  }}
                  // Event handler khi rời khỏi option - chỉ áp dụng khi chưa active
                  onMouseLeave={(e) => {
                    if (filters.usageType !== option.value) { // Chỉ reset khi chưa active
                      e.target.style.background = "transparent"; // Trở về trong suốt
                    }
                  }}
                >
                  {/* Hiển thị label của option */}
                  {option.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Dropdown "Tính năng đặc biệt" - Filter theo tính năng nâng cao */}
        <div style={{ position: "relative" }}> {/* Container với position relative để dropdown absolute */}
          <button
            // Toggle dropdown specialFeatures: nếu đang mở thì đóng, ngược lại mở
            onClick={() => setActiveDropdown(activeDropdown === 'specialFeatures' ? null : 'specialFeatures')}
            style={{
              display: "flex", // Flexbox để icon và text cùng hàng
              alignItems: "center", // Căn giữa theo chiều dọc
              gap: "8px", // Khoảng cách giữa icon và text
              padding: "10px 16px", // Padding để tạo không gian bên trong
              border: "1px solid #e0e0e0", // Border xám nhẹ
              borderRadius: "25px", // Bo tròn góc để tạo hình viên thuốc
              // Conditional styling: nếu đang active thì nền xanh, ngược lại nền trắng
              background: filters.specialFeatures ? "#00A86B" : "white",
              // Conditional styling: nếu đang active thì text trắng, ngược lại text xám
              color: filters.specialFeatures ? "white" : "#666",
              fontSize: "14px", // Font size vừa phải
              fontWeight: "500", // Font weight trung bình
              cursor: "pointer", // Con trỏ pointer khi hover
              transition: "all 0.3s ease", // Animation mượt mà 0.3s
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)" // Shadow nhẹ để tạo độ sâu
            }}
            // Event handler khi hover vào button - chỉ áp dụng khi chưa active
            onMouseEnter={(e) => {
              if (!filters.specialFeatures) { // Chỉ hover effect khi chưa active
                e.target.style.backgroundColor = "#f0f9f0"; // Nền xanh nhạt
                e.target.style.borderColor = "#00A86B"; // Border xanh
                e.target.style.color = "#00A86B"; // Text xanh
                e.target.style.transform = "translateY(-2px)"; // Nhấc lên 2px
                e.target.style.boxShadow = "0 4px 12px rgba(0, 168, 107, 0.2)"; // Shadow đậm hơn
              }
            }}
            // Event handler khi rời khỏi button - chỉ áp dụng khi chưa active
            onMouseLeave={(e) => {
              if (!filters.specialFeatures) { // Chỉ reset khi chưa active
                e.target.style.backgroundColor = "white"; // Trở về nền trắng
                e.target.style.borderColor = "#e0e0e0"; // Trở về border xám
                e.target.style.color = "#666"; // Trở về text xám
                e.target.style.transform = "translateY(0)"; // Về vị trí ban đầu
                e.target.style.boxShadow = "0 2px 8px rgba(0,0,0,0.1)"; // Shadow nhẹ lại
              }
            }}
          >
            {/* Text "Tính năng đặc biệt" */}
            Tính năng đặc biệt
            {/* Icon ChevronDown để biểu thị dropdown */}
            <ChevronDown size={14} />
          </button>

          {/* Dropdown menu tính năng đặc biệt - chỉ hiện khi activeDropdown === 'specialFeatures' */}
          {activeDropdown === 'specialFeatures' && (
            <div style={{
              position: "absolute", // Position absolute để float trên các element khác
              top: "100%", // Đặt ngay dưới button
              left: "0", // Căn trái với button
              background: "white", // Nền trắng
              border: "1px solid #e0e0e0", // Border xám nhẹ
              borderRadius: "8px", // Bo góc nhẹ
              boxShadow: "0 8px 25px rgba(0,0,0,0.15)", // Shadow đậm để nổi bật
              zIndex: 1000, // Z-index cao để hiện trên các element khác
              minWidth: "200px", // Chiều rộng tối thiểu
              padding: "10px 0" // Padding trên/dưới để tạo không gian
            }}>
              {/* Danh sách các tính năng đặc biệt */}
              {[
                { label: "Chống nước", value: "waterproof" }, // Tính năng chống nước IP67/IP68
                { label: "GPS", value: "gps" }, // Định vị GPS tích hợp
                { label: "Bluetooth", value: "bluetooth" }, // Kết nối Bluetooth
                { label: "Sạc nhanh", value: "fastCharge" }, // Sạc nhanh QC/PD
                { label: "Khóa thông minh", value: "smartLock" } // Khóa thông minh app
              ].map((option) => (
                <button
                  key={option.value} // Key unique cho React
                  // Gọi handleFilterChange với filterType 'specialFeatures' và value của option
                  onClick={() => handleFilterChange('specialFeatures', option.value)}
                  style={{
                    width: "100%", // Chiều rộng 100% của dropdown
                    padding: "10px 16px", // Padding để tạo không gian
                    border: "none", // Không có border
                    // Conditional styling: nếu đang active thì nền xanh nhạt, ngược lại trong suốt
                    background: filters.specialFeatures === option.value ? "#f0f9f0" : "transparent",
                    // Conditional styling: nếu đang active thì text xanh, ngược lại text đen
                    color: filters.specialFeatures === option.value ? "#00A86B" : "#333",
                    fontSize: "14px", // Font size vừa phải
                    textAlign: "left", // Căn trái text
                    cursor: "pointer", // Con trỏ pointer khi hover
                    transition: "all 0.3s ease" // Animation mượt mà
                  }}
                  // Event handler khi hover vào option - chỉ áp dụng khi chưa active
                  onMouseEnter={(e) => {
                    if (filters.specialFeatures !== option.value) { // Chỉ hover khi chưa active
                      e.target.style.background = "#f8f9fa"; // Nền xám nhạt
                    }
                  }}
                  // Event handler khi rời khỏi option - chỉ áp dụng khi chưa active
                  onMouseLeave={(e) => {
                    if (filters.specialFeatures !== option.value) { // Chỉ reset khi chưa active
                      e.target.style.background = "transparent"; // Trở về trong suốt
                    }
                  }}
                >
                  {/* Hiển thị label của option */}
                  {option.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div> {/* Kết thúc container chứa tất cả filter buttons */}

      {/* Phần hiển thị số lượng bộ lọc đang áp dụng - chỉ hiện khi có filter active */}
      {activeFiltersCount > 0 && (
        <div style={{
          marginTop: "15px", // Margin trên để tạo khoảng cách với filter buttons
          padding: "10px 16px", // Padding để tạo không gian bên trong
          background: "#f0f9f0", // Nền xanh nhạt để nổi bật
          borderRadius: "8px", // Bo góc nhẹ
          border: "1px solid #f0f9f0", // Border cùng màu nền
          display: "flex", // Flexbox để text và nút X cùng hàng
          alignItems: "center", // Căn giữa theo chiều dọc
          justifyContent: "space-between" // Text bên trái, nút X bên phải
        }}>
          {/* Text hiển thị số lượng filter đang active */}
          <span style={{
            fontSize: "14px", // Font size vừa phải
            color: "#00A86B", // Màu xanh chủ đạo
            fontWeight: "500" // Font weight trung bình
          }}>
            Đang áp dụng {activeFiltersCount} bộ lọc
          </span>
          {/* Nút X để reset filters */}
          <button
            onClick={resetFilters} // Gọi hàm resetFilters khi click
            style={{
              background: "none", // Không có nền
              border: "none", // Không có border
              color: "#00A86B", // Màu xanh
              cursor: "pointer", // Con trỏ pointer
              padding: "4px", // Padding nhỏ để dễ click
              borderRadius: "4px", // Bo góc nhẹ
              transition: "all 0.3s ease" // Animation mượt mà
            }}
            // Event handler khi hover vào nút X
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = "#f0f9f0"; // Nền xanh nhạt khi hover
            }}
            // Event handler khi rời khỏi nút X
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = "transparent"; // Trở về trong suốt
            }}
          >
            {/* Icon X để đóng/reset */}
            <X size={16} />
          </button>
        </div>
      )}
    </div>
  );
};

// Export component FilterBar để sử dụng trong các component khác
export default FilterBar;
