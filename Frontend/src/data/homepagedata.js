// Banner data
export const bannerData = [
  {
    id: 1,
    image: "https://cmu-cdn.vinfast.vn/2024/01/9f258fd9-vf3-8-1024x574.webp",
    alt: "VinFast VF3"
  },
  {
    id: 2,
    image: "https://cdn.24h.com.vn/upload/1-2025/images/2025-01-22/xe-3-1737521538-858-width740height381.jpg",
    alt: "VinFast Klara S"
  },
  {
    id: 3,
    image: "https://vinfastecoxe.vn/wp-content/uploads/2025/08/bia-hien-28-1024x576.png",
    alt: "Vinfast Dragonfly"
  },
  {
    id: 4,
    image: "https://www.techi.com/wp-content/uploads/2025/04/Everything-You-Need-to-Know-About-the-Tesla-Model-2-Release-Date-Price-Features-and-More-.webp",
    alt: "Tesla Model 3"
  },
]

// Category data cho dropdown menu
export const categoryData = {
  "xe-co": {
    title: "🪪 Xe cộ",
    children: {
      "electric-scooter": { title: "🛵 Xe máy điện" },
      "electric-car": { title: "🚗 Xe hơi điện" },
      "electric-bicycle": { title: "🚴 Xe đạp điện" },
    }
  },
  "phu-kien-&-dich-vu": {
    title: "📦 Phụ kiện & dịch vụ",
    children: {
      "battery-charger": { title: "🔋 Ắc quy" },
      "accessories": { title: "🛡️ Bảo vệ" },
      "service": { title: "🔧 Dịch vụ" },
    }
  },
};


// Store locations data
export const storeLocations = [
  {
    id: 1,
    name: "Cửa hàng Hà Nội",
    address: "123 Đường ABC, Quận 1, Hà Nội",
    phone: "024-1234-5678",
    distance: "2.5 km"
  },
  {
    id: 2,
    name: "Cửa hàng TP.HCM",
    address: "456 Đường XYZ, Quận 3, TP.HCM",
    phone: "028-8765-4321",
    distance: "1.8 km"
  },
  {
    id: 3,
    name: "Cửa hàng Đà Nẵng",
    address: "789 Đường DEF, Quận Hải Châu, Đà Nẵng",
    phone: "0236-1111-2222",
    distance: "3.2 km"
  }
];

// App constants
export const appConstants = {
  APP_NAME: "ElectricStore",
  TAGLINE: "Xe điện & Pin chính hãng",
  PHONE: "1900-xxxx",
  EMAIL: "support@electricstore.com"
};

//TopInfo data
export const messages = [
  "⚡ Xe & Pin đã qua sử dụng — Kiểm tra kỹ, giá tốt",
  "🔋 Pin còn tốt — Thay thế, bảo hành và test trước khi giao",
  "🔁 Thu cũ giá hợp lý — Đổi mới tiết kiệm cho khách hàng",
  "🚚 Giao dịch nhanh, hỗ trợ kiểm tra tại chỗ — Uy tín, an tâm"
  ];