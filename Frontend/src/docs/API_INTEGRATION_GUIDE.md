# Backend API Integration Guide

## Tổng quan

Tài liệu này mô tả cách tích hợp với các API endpoints thực từ backend cho Staff interface.

## Base URL
```
http://localhost:3979
```

## Authentication
Tất cả API calls đều cần JWT token trong header:
```javascript
headers: {
  'Authorization': `Bearer ${localStorage.getItem('token')}`,
  'Content-Type': 'application/json'
}
```

## KYC Management APIs

### 1. Lấy danh sách KYC cho Staff
```javascript
GET /kyc/staff
```

**Response:**
```json
{
  "code": 1000,
  "message": "Success",
  "data": [
    {
      "id": 1,
      "userId": 101,
      "fullName": "Nguyễn Văn A",
      "email": "nguyenvana@email.com",
      "phone": "0123456789",
      "status": "PENDING",
      "frontImage": "cccd_front.jpg",
      "backImage": "cccd_back.jpg",
      "submittedAt": "2024-01-20",
      "reason": "",
      "address": "123 Đường ABC, Quận 1, TP.HCM",
      "idNumber": "123456789",
      "dateOfBirth": "1990-01-01",
      "gender": "Nam",
      "nationality": "Việt Nam",
      "occupation": "Kỹ sư",
      "company": "Công ty ABC",
      "monthlyIncome": 15000000,
      "bankAccount": "1234567890",
      "bankName": "Vietcombank",
      "createdAt": "2024-01-20T10:00:00Z",
      "updatedAt": "2024-01-20T10:00:00Z"
    }
  ],
  "timestamp": "2024-01-20T10:00:00Z"
}
```

### 2. Duyệt KYC (Staff approve)
```javascript
POST /kyc/{id}/staff/approve
```

**Response:**
```json
{
  "code": 1000,
  "message": "KYC approved successfully",
  "data": {
    "id": 1,
    "status": "STAFF_APPROVED",
    "updatedAt": "2024-01-20T11:00:00Z"
  },
  "timestamp": "2024-01-20T11:00:00Z"
}
```

### 3. Từ chối KYC
```javascript
POST /kyc/{id}/reject
```

**Request Body:**
```json
{
  "reason": "Lý do từ chối"
}
```

**Response:**
```json
{
  "code": 1000,
  "message": "KYC rejected successfully",
  "data": {
    "id": 1,
    "status": "REJECTED",
    "reason": "Lý do từ chối",
    "updatedAt": "2024-01-20T11:00:00Z"
  },
  "timestamp": "2024-01-20T11:00:00Z"
}
```

## Product Management APIs

### 1. Lấy danh sách tin đăng chờ duyệt
```javascript
GET /products/pending/seller/staff
```

**Response:**
```json
{
  "code": 1000,
  "message": "Success",
  "data": [
    {
      "id": 1,
      "title": "Pin Lithium-ion 48V 20Ah",
      "seller": "Nguyễn Văn A",
      "price": 2500000,
      "status": "PENDING",
      "category": "Pin xe điện",
      "description": "Pin lithium-ion chất lượng cao cho xe điện",
      "images": ["pin1.jpg", "pin2.jpg"],
      "createdAt": "2024-01-20",
      "reason": "",
      "sellerId": 101,
      "sellerName": "Nguyễn Văn A",
      "sellerEmail": "nguyenvana@email.com",
      "sellerPhone": "0123456789",
      "location": "TP.HCM",
      "condition": "Mới",
      "warranty": "12 tháng",
      "updatedAt": "2024-01-20T10:00:00Z"
    }
  ],
  "timestamp": "2024-01-20T10:00:00Z"
}
```

### 2. Duyệt tin đăng (Staff approve)
```javascript
POST /products/{id}/approve/staff
```

**Response:**
```json
{
  "code": 1000,
  "message": "Product approved successfully",
  "data": {
    "id": 1,
    "status": "STAFF_APPROVED",
    "updatedAt": "2024-01-20T11:00:00Z",
    "approvedBy": "staff@test.com",
    "approvedAt": "2024-01-20T11:00:00Z"
  },
  "timestamp": "2024-01-20T11:00:00Z"
}
```

### 3. Từ chối tin đăng
```javascript
POST /products/{id}/reject
```

**Request Body:**
```json
{
  "reason": "Lý do từ chối"
}
```

**Response:**
```json
{
  "code": 1000,
  "message": "Product rejected successfully",
  "data": {
    "id": 1,
    "status": "REJECTED",
    "reason": "Lý do từ chối",
    "updatedAt": "2024-01-20T11:00:00Z",
    "rejectedBy": "staff@test.com",
    "rejectedAt": "2024-01-20T11:00:00Z"
  },
  "timestamp": "2024-01-20T11:00:00Z"
}
```

### 4. Xem chi tiết tin đăng
```javascript
GET /products/{id}
```

**Response:**
```json
{
  "code": 1000,
  "message": "Success",
  "data": {
    "id": 1,
    "title": "Pin Lithium-ion 48V 20Ah",
    "description": "Pin lithium-ion chất lượng cao cho xe điện",
    "price": 2500000,
    "category": "Pin xe điện",
    "status": "PENDING",
    "images": [
      {
        "id": 1,
        "url": "pin1.jpg",
        "isPrimary": true
      },
      {
        "id": 2,
        "url": "pin2.jpg",
        "isPrimary": false
      }
    ],
    "seller": {
      "id": 101,
      "name": "Nguyễn Văn A",
      "email": "nguyenvana@email.com",
      "phone": "0123456789"
    },
    "location": "TP.HCM",
    "condition": "Mới",
    "warranty": "12 tháng",
    "createdAt": "2024-01-20T10:00:00Z",
    "updatedAt": "2024-01-20T10:00:00Z"
  },
  "timestamp": "2024-01-20T10:00:00Z"
}
```

## Error Handling

### Error Response Format
```json
{
  "code": 1001,
  "message": "Error message",
  "data": null,
  "timestamp": "2024-01-20T10:00:00Z"
}
```

### Common Error Codes
- `1001`: General error
- `1002`: Authentication failed
- `1003`: Authorization failed
- `1004`: Resource not found
- `1005`: Validation error

## Implementation Example

### Loading KYC Data
```javascript
const loadKycData = async () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error("No authentication token found");
    }

    const response = await fetch('http://localhost:3979/kyc/staff', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();
    
    if (response.ok && data.code === 1000) {
      setKycList(data.data || []);
      toast.success(`Đã tải ${data.data?.length || 0} hồ sơ KYC`);
    } else {
      throw new Error(data.message || "Failed to load KYC data");
    }
  } catch (error) {
    console.error("Error loading KYC data:", error);
    toast.error("Không thể tải dữ liệu KYC: " + error.message);
    setKycList([]);
  }
};
```

### Approving KYC
```javascript
const handleApproveKyc = async (kycId) => {
  setLoading(true);
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error("No authentication token found");
    }

    const response = await fetch(`http://localhost:3979/kyc/${kycId}/staff/approve`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();

    if (response.ok && data.code === 1000) {
      setKycList(kycList.map(k => 
        k.id === kycId ? data.data : k
      ));
      toast.success("Duyệt KYC thành công!");
    } else {
      throw new Error(data.message || "Approval failed");
    }
  } catch (error) {
    console.error("Error approving KYC:", error);
    toast.error("Có lỗi xảy ra khi duyệt KYC: " + error.message);
  } finally {
    setLoading(false);
  }
};
```

### Loading Products Data
```javascript
const loadProductsData = async () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error("No authentication token found");
    }

    const response = await fetch('http://localhost:3979/products/pending/seller/staff', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();
    
    if (response.ok && data.code === 1000) {
      setProducts(data.data || []);
      toast.success(`Đã tải ${data.data?.length || 0} tin đăng`);
    } else {
      throw new Error(data.message || "Failed to load Products data");
    }
  } catch (error) {
    console.error("Error loading Products data:", error);
    toast.error("Không thể tải dữ liệu tin đăng: " + error.message);
    setProducts([]);
  }
};
```

### Approving Product
```javascript
const handleApproveProduct = async (productId) => {
  setLoading(true);
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error("No authentication token found");
    }

    const response = await fetch(`http://localhost:3979/products/${productId}/approve/staff`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();

    if (response.ok && data.code === 1000) {
      setProducts(products.map(p => 
        p.id === productId ? data.data : p
      ));
      toast.success("Duyệt tin đăng thành công!");
    } else {
      throw new Error(data.message || "Approval failed");
    }
  } catch (error) {
    console.error("Error approving Product:", error);
    toast.error("Có lỗi xảy ra khi duyệt tin đăng: " + error.message);
  } finally {
    setLoading(false);
  }
};
```

## Loading States & Error Handling

### Loading States
- **Initial Loading**: Hiển thị spinner khi load data lần đầu
- **Action Loading**: Disable buttons khi đang thực hiện action
- **Refresh Loading**: Hiển thị loading khi refresh data

### Error Handling
- **Network Errors**: Hiển thị toast error với message cụ thể
- **Authentication Errors**: Redirect về login page
- **Authorization Errors**: Hiển thị message không có quyền
- **Validation Errors**: Hiển thị lỗi validation từ backend

### Empty States
- **No Data**: Hiển thị message "Chưa có dữ liệu"
- **No Results**: Hiển thị message "Không tìm thấy kết quả"

## Security Considerations

1. **Token Management**: Luôn check token trước khi gọi API
2. **Error Messages**: Không hiển thị sensitive information trong error messages
3. **Input Validation**: Validate input trước khi gửi lên server
4. **Rate Limiting**: Implement retry logic cho API calls

## Testing

### Manual Testing Checklist
- [ ] Load KYC data successfully
- [ ] Approve KYC successfully
- [ ] Reject KYC with reason
- [ ] Load Products data successfully
- [ ] Approve Product successfully
- [ ] Reject Product with reason
- [ ] Handle network errors
- [ ] Handle authentication errors
- [ ] Handle empty data states
- [ ] Refresh data functionality
- [ ] Loading states display correctly
- [ ] Stats update correctly after actions

### API Testing Tools
- **Postman**: Test API endpoints manually
- **Browser DevTools**: Monitor network requests
- **Console Logs**: Check API responses and errors
