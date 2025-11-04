import Banner from "../components/homepageContainer/banner/Banner";
import ProductGrid from "../components/homepageContainer/home/ProductGrid";
import FilterBar from "../components/homepageContainer/filters/FilterBar";
import "../components/homepageContainer/styles/HomePage.css";
import useProducts from "../hooks/useProducts";
import { useFilter } from "../hooks/useFilter";

const HomePage = () => {
  const { products, loading, error } = useProducts();
  const { filteredProducts, handleFiltersChange } = useFilter(products);

  // Debug logs
  console.log("🏠 HomePage: products:", products);
  console.log("🏠 HomePage: loading:", loading);
  console.log("🏠 HomePage: error:", error);

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

      {/* Vehicle Listings Section */}
      {loading ? (
        <div
          style={{ maxWidth: "1200px", margin: "20px auto", padding: "0 15px" }}
        >
          Đang tải dữ liệu…
        </div>
      ) : error ? (
        <div
          style={{
            maxWidth: "1200px",
            margin: "20px auto",
            padding: "0 15px",
            color: "#e74c3c",
          }}
        >
          {error}
        </div>
      ) : (
        <>
          {/* Filter Section */}
          <section
            style={{
              padding: "20px 0",
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
              <FilterBar onFilterChange={handleFiltersChange} />
            </div>
          </section>

          {/* Products Grid */}
          <ProductGrid products={filteredProducts} />
        </>
      )}
    </div>
  );
};

export default HomePage;
