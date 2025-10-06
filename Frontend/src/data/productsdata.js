// Vehicle listings data - Tin đăng xe điện
export const vehicleListings = [
  {
    id: 1,
    name: "VinFast Klara S 2023",
    type: "electric-scooter",
    brand: "VinFast",
    image: "https://img.tinxe.vn/resize/1000x-/2021/08/26/XForF7yt/vinfast-klara-a2-2-024a.png",
    price: "18.500.000₫",
    description: "Xe máy điện VinFast Klara S 2023, đã qua sử dụng 1 năm, tình trạng tốt",

    // Thông tin chi tiết xe
    vehicleInfo: {
      year: "2023", // Năm sản xuất
      engineDisplacement: "50kW", // Dung tích xe
      origin: "Việt Nam", // Xuất xứ
      mileage: "5000", // Số Km đã đi
    },

    // Thông tin tin đăng
    listingInfo: {
      title: "VinFast Klara S 2023 - Xe điện tiết kiệm",
      detailedDescription: "- Xuất xứ: Việt Nam, tình trạng xe còn rất tốt\n- Bảo hành chính hãng còn 1 năm\n- Địa chỉ giao nhận: Hà Nội\n- Thời gian sử dụng: 8 tháng\n- Bảo trì định kỳ tại VinFast",
      sellerAddress: "Hà Nội"
    },

    createdAt: "2024-01-15",
    isActive: true
  },

  {
    id: 2,
    name: "Honda PCX Electric 2024",
    type: "electric-scooter",
    brand: "Honda",
    image: "https://xexangchaydien.com/wp-content/uploads/2023/07/Honda-PCX-Electric.png",
    price: "42.000.000₫",
    description: "Xe máy điện Honda PCX Electric 2024, mới 100%, bảo hành chính hãng",

    vehicleInfo: {
      year: "2024",
      engineDisplacement: "75kW",
      origin: "Nhật Bản",
      mileage: "0",
    },

    listingInfo: {
      title: "Honda PCX Electric 2024 - Xe điện cao cấp",
      detailedDescription: "- Xuất xứ: Nhật Bản, xe mới 100%\n- Bảo hành chính hãng 2 năm\n- Địa chỉ giao nhận: TP.HCM\n- Xe mới chưa sử dụng\n- Bảo trì tại Honda Service Center",
      sellerAddress: "TP.HCM"
    },

    createdAt: "2024-01-20",
    isActive: true
  },

  {
    id: 3,
    name: "Tesla Model 3 2023",
    type: "electric-car",
    brand: "Tesla",
    image: "https://giaxedien.com/wp-content/uploads/2023/11/tesla-model-3-thumb.png",
    price: "1.100.000.000₫",
    description: "Xe hơi điện Tesla Model 3 2023, đã qua sử dụng, tình trạng tốt",

    vehicleInfo: {
      year: "2023",
      engineDisplacement: "283kW",
      origin: "Mỹ",
      mileage: "15000",
    },

    listingInfo: {
      title: "Tesla Model 3 2023 - Xe điện cao cấp",
      detailedDescription: "- Xuất xứ: Mỹ, tình trạng xe rất tốt\n- Bảo hành chính hãng còn 2 năm\n- Địa chỉ giao nhận: TP.HCM\n- Thời gian sử dụng: 1 năm\n- Bảo trì tại Tesla Service Center",
      sellerAddress: "TP.HCM"
    },

    createdAt: "2024-01-25",
    isActive: true
  },

  {
    id: 4,
    name: "VinFast VF3 2024",
    type: "electric-car",
    brand: "VinFast",
    image: "https://xevinfastvn.com/wp-content/uploads/2024/05/download-2.png",
    price: "299.000.000₫",
    description: "Xe hơi điện VinFast VF3 2024, mới 100%, bảo hành chính hãng",

    vehicleInfo: {
      year: "2024",
      engineDisplacement: "150kW",
      origin: "Việt Nam",
      mileage: "0",
    },

    listingInfo: {
      title: "VinFast VF3 2024 - Xe điện Việt Nam",
      detailedDescription: "- Xuất xứ: Việt Nam, xe mới 100%\n- Bảo hành chính hãng 3 năm\n- Địa chỉ giao nhận: Hà Nội\n- Xe mới chưa sử dụng\n- Bảo trì tại VinFast Service Center",
      sellerAddress: "Hà Nội"
    },

    createdAt: "2024-02-01",
    isActive: true
  },

  {
    id: 5,
    name: "VinFast Feliz Bike 2024",
    type: "electric-bicycle",
    brand: "VinFast",
    image: "https://vinfastthienan.vn/wp-content/uploads/2023/07/Xe-may-dien-Vinfast-Feliz-xanh.png",
    price: "19.500.000₫",
    description: "Xe đạp điện VinFast Feliz Bike 2024, pin Lithium 48V, mới 100%",

    vehicleInfo: {
      year: "2024",
      engineDisplacement: "48V",
      origin: "Việt Nam",
      mileage: "0",
    },

    listingInfo: {
      title: "VinFast Feliz Bike 2024 - Xe đạp điện thông minh",
      detailedDescription: "- Xuất xứ: Việt Nam, xe mới 100%\n- Bảo hành chính hãng 2 năm\n- Địa chỉ giao nhận: TP.HCM\n- Xe mới chưa sử dụng\n- Bảo trì tại VinFast Service Center",
      sellerAddress: "TP.HCM"
    },

    createdAt: "2024-02-05",
    isActive: true
  },

  {
    id: 6,
    name: "Yamaha E01 2024",
    type: "electric-scooter",
    brand: "Yamaha",
    image: "https://thanhnienviet.mediacdn.vn/zoom/700_438/uploads/2022_05/yamaha-e01-front-left-angle-view-7018.jpg",
    price: "35.000.000₫",
    description: "Xe máy điện Yamaha E01 2024, công nghệ tiên tiến, tiết kiệm điện",

    vehicleInfo: {
      year: "2024",
      engineDisplacement: "65kW",
      origin: "Nhật Bản",
      mileage: "2000",
    },

    listingInfo: {
      title: "Yamaha E01 2024 - Xe điện công nghệ cao",
      detailedDescription: "- Xuất xứ: Nhật Bản, xe đã sử dụng 6 tháng\n- Bảo hành chính hãng còn 1.5 năm\n- Địa chỉ giao nhận: Đà Nẵng\n- Tình trạng xe rất tốt, ít sử dụng\n- Bảo trì tại Yamaha Service Center",
      sellerAddress: "Đà Nẵng"
    },

    createdAt: "2024-02-10",
    isActive: true
  }
];

// Backward compatibility - giữ tên cũ để không break code hiện tại
export const products = vehicleListings;