import FilterBar from "../components/FilterBar";
import Banner from "../components/Banner";
import ProductGrid from "../components/homepageContainer/home/ProductGrid";
import useProductFilter from "../hooks/useProductFilter";
import { vehicleListings } from "../data/productsData";
import "../components/homepageContainer/styles/HomePage.css";

const HomePage = () => {
  // Lấy tất cả tin đăng xe điện đang hoạt động
  const activeListings = vehicleListings.filter((listing) => listing.isActive);

  // Sử dụng useProductFilter hook với tin đăng xe điện
  const { filteredProducts, handleFiltersChange, filters } =
    useProductFilter(activeListings);

  // Đơn giản chỉ gọi hook với filters từ FilterBar
  const handleFilterChange = (filters) => {
    console.log("HomePage - Received filters:", filters);
    handleFiltersChange(filters);
  };

  return (
    <div
      style={{
        width: "100%",
        overflowX: "hidden",
        background: "#f5f5f5",
        minWidth: "320px", // Ngăn chặn bố cục quá hẹp
      }}
    >
      {/* Banner Section */}
      <section
        style={{
          padding: window.innerWidth < 768 ? "15px 0" : "20px 0",
          background: "#fff",
        }}
      >
        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            padding: "0 15px",
          }}
        >
          <Banner />
        </div>
      </section>

      {/* Special Event Banner */}
      <section
        style={{
          padding: window.innerWidth < 768 ? "12px 0" : "15px 0",
          background: "#2BB673",
          color: "white",
        }}
      >
        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            padding: "0 15px",
            textAlign: "center",
          }}
        >
          <h2
            style={{
              fontSize: "22px",
              fontWeight: "bold",
              margin: 0,
              textShadow: "1px 1px 2px rgba(0,0,0,0.3)",
            }}
          >
            Marketplace Xe điện 2025 - Mua bán uy tín!
          </h2>
        </div>
      </section>

      {/* Filter Bar Section */}
      <FilterBar onFilterChange={handleFilterChange} />

      {/* Vehicle Listings Section */}
      <ProductGrid
        products={activeListings}
        filteredProducts={filteredProducts}
        hasActiveFilters={Object.values(filters).some(
          (filter) => filter !== null && filter !== ""
        )}
      />
    </div>
  );
};

export default HomePage;
