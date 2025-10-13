import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
// Simple static banner list (remove mock data dependency)
const bannerData = [
  { id: 1, image: 'https://shop.vinfastauto.com/on/demandware.static/-/Sites-app_vinfast_vn-Library/default/dw90ac0a73/images/PDP-XMD/verox/img-top-verox-green.webp', alt: 'Banner 1' },
  { id: 2, image: 'https://shop.vinfastauto.com/on/demandware.static/-/Sites-app_vinfast_vn-Library/default/dw10933beb/reserves/DrgnFly/overview-03.png', alt: 'Banner 2' },
  { id: 3, image: 'https://shop.vinfastauto.com/on/demandware.static/-/Sites-app_vinfast_vn-Library/default/dwc56a5d3b/images/PDP-XMD/evoneo/img-top-evoneo-black.webp', alt: 'Banner 3' },
  { id: 4, image: 'https://shop.vinfastauto.com/on/demandware.static/-/Sites-app_vinfast_vn-Library/default/dwac8426a2/landingpage/lp-xmd/evo-grand/banner-1.webp', alt: 'Banner 4' },
];

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

const Banner = () => {
  return (
    <div className="banner-container">
      <Swiper
        modules={[Navigation, Pagination, Autoplay]}
        spaceBetween={30}
        slidesPerView={1}
        navigation={true}
        pagination={{ clickable: true }}
        autoplay={{delay: 5000}}
        loop={true}
      >
        {bannerData.map((banner) => (
          <SwiperSlide key={banner.id}>
            <div className="banner-slide">
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
