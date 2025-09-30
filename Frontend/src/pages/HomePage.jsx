import FilterBar from "../components/FilterBar";
import Banner from "../components/Banner";
import ProductGrid from "../components/homepageContainer/home/ProductGrid";
import ServicesSection from "../components/homepageContainer/home/ServicesSection";
import useProductFilter from "../hooks/useProductFilter";
import { products } from "../data/productsdata";

const HomePage = () => {
  // Sử dụng useProductFilter hook
  const {
    filteredProducts,
    handleFiltersChange,
    filters
  } = useProductFilter(products);

  // Đơn giản chỉ gọi hook với filters từ FilterBar
  const handleFilterChange = (filters) => {
    console.log('HomePage - Received filters:', filters);
    handleFiltersChange(filters);
  };

  return (
    <div style={{
      width: "100%",
      overflowX: "hidden",
      background: "#f5f5f5",
      minWidth: "320px" // Prevent too narrow layout
    }}>
      {/* Banner Section */}
      <section style={{
        padding: window.innerWidth < 768 ? "15px 0" : "20px 0",
        background: "#fff"
      }}>
        <div style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "0 15px"
        }}>
          <Banner />
        </div>
      </section>

      {/* Special Event Banner */}
      <section style={{
        padding: window.innerWidth < 768 ? "12px 0" : "15px 0",
        background: "#2BB673",
        color: "white"
      }}>
        <div style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "0 15px",
          textAlign: "center"
        }}>
          <h2 style={{
            fontSize: "22px",
            fontWeight: "bold",
            margin: 0,
            textShadow: "1px 1px 2px rgba(0,0,0,0.3)"
          }}>
            Ngày hội Xe điện 2025 - Săn deal ngay!
          </h2>
        </div>
      </section>

      {/* Filter Bar Section */}
      <FilterBar onFilterChange={handleFilterChange} />

      {/* Products Section */}
      <ProductGrid
        products={products}
        filteredProducts={filteredProducts}
        hasActiveFilters={Object.values(filters).some(filter => filter !== null && filter !== ''
          && (Array.isArray(filter) ? filter.length > 0 : true))}
      />

      {/* Services Section */}
      <ServicesSection />
    </div>
  );
};

export default HomePage;
