import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import bannerService from '../../../services/home/bannerService';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

const Banner = () => {
  const navigate = useNavigate();
  const [banners, setBanners] = useState([]);

  // Load banners on component mount
  useEffect(() => {
    const activeBanners = bannerService.getActiveBanners();
    setBanners(activeBanners);
  }, []);

  // Handle banner click navigation
  const handleBannerClick = (banner) => {
    switch (banner.linkType) {
      case 'product':
        // Navigate to product detail page
        if (banner.productId) {
          navigate(`/products/${banner.productId}`);
        } else {
          navigate(`/products/${banner.linkTarget.split('/').pop()}`);
        }
        break;
      case 'category':
        // Navigate to category page with filters
        if (banner.categoryId) {
          navigate(`/category/${banner.categoryId}`);
        } else {
          navigate(`/category/${banner.linkTarget.split('/').pop()}`);
        }
        break;
      case 'promotion':
        // Navigate to promotion page
        navigate(banner.linkTarget);
        break;
      case 'external':
        // Open external link in new tab
        window.open(banner.linkTarget, '_blank');
        break;
      default:
        console.log('Unknown link type:', banner.linkType);
    }
  };

  // Don't render Swiper if no banners
  if (banners.length === 0) {
    return (
      <div className="banner-container">
        <div style={{ 
          height: '300px', 
          background: '#f0f0f0', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          color: '#666'
        }}>
          Loading banners...
        </div>
      </div>
    );
  }

  return (
    <div className="banner-container">
      <Swiper
        modules={[Navigation, Pagination, Autoplay]}
        spaceBetween={30}
        slidesPerView={1}
        navigation={true}
        pagination={{ clickable: true }}
        autoplay={{delay: 5000}}
        loop={banners.length > 1} // Only enable loop if more than 1 banner
      >
        {banners.map((banner) => (
          <SwiperSlide key={banner.id}>
            <div 
              className="banner-slide"
              onClick={() => handleBannerClick(banner)}
              style={{
                cursor: 'pointer',
                position: 'relative'
              }}
            >
              <img
                src={banner.image}
                alt={banner.alt}
                className="banner-image"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }}
              />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default Banner;
