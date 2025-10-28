// Banner Service - Quản lý dữ liệu banner
// Có thể mở rộng để gọi API từ Backend khi có

class BannerService {
  constructor() {
    // Static banner data - có thể thay thế bằng API call
    this.bannerData = [
      { 
        id: 1, 
        image: 'https://shop.vinfastauto.com/on/demandware.static/-/Sites-app_vinfast_vn-Library/default/dw90ac0a73/images/PDP-XMD/verox/img-top-verox-green.webp', 
        alt: 'VinFast VF e34',
        linkType: 'product',
        productId: 1
      },
      { 
        id: 2, 
        image: 'https://shop.vinfastauto.com/on/demandware.static/-/Sites-app_vinfast_vn-Library/default/dw10933beb/reserves/DrgnFly/overview-03.png', 
        alt: 'VinFast VF 8',
        linkType: 'product',
        productId: 2
      },
      { 
        id: 3, 
        image: 'https://shop.vinfastauto.com/on/demandware.static/-/Sites-app_vinfast_vn-Library/default/dwc56a5d3b/images/PDP-XMD/evoneo/img-top-evoneo-black.webp', 
        alt: 'VinFast EVOneo',
        linkType: 'category',
        categoryId: 'electric-vehicles'
      },
      { 
        id: 4, 
        image: 'https://shop.vinfastauto.com/on/demandware.static/-/Sites-app_vinfast_vn-Library/default/dwac8426a2/landingpage/lp-xmd/evo-grand/banner-1.webp', 
        alt: 'Khuyến mãi đặc biệt',
        linkType: 'promotion',
        linkTarget: '/promotions/special-sale'
      },
    ];
  }

  // Lấy tất cả banner
  getActiveBanners() {
    return this.bannerData;
  }

}

// Export singleton instance
export default new BannerService();
