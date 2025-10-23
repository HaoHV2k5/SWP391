import React, { useState, useEffect } from 'react';
import { memberService } from '../../services/memberService';
import '../../styles/member/ApprovedProductsTab.css';

const ApprovedProductsTab = ({ sellerId }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [postingProducts, setPostingProducts] = useState(new Set());

  useEffect(() => {
    loadApprovedProducts();
  }, [sellerId]);

  const loadApprovedProducts = async () => {
    try {
      setLoading(true);
      setError('');
      const result = await memberService.getApprovedProducts(sellerId);
      
      if (result.success) {
        setProducts(Array.isArray(result.data) ? result.data : []);
        console.log('📦 Approved products loaded:', result.data);
      } else {
        setError(result.message || 'Không thể tải danh sách sản phẩm');
      }
    } catch (err) {
      setError('Lỗi khi tải danh sách sản phẩm');
      console.error('Error loading approved products:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePostProduct = async (productId) => {
    try {
      setPostingProducts(prev => new Set(prev).add(productId));
      
      const result = await memberService.postProduct(productId);
      
      if (result.success) {
        alert(result.message || 'Đã POST sản phẩm thành công!');
        // Reload danh sách để cập nhật trạng thái
        await loadApprovedProducts();
      } else {
        alert(result.message || 'Không thể POST sản phẩm');
      }
    } catch (err) {
      alert('Lỗi khi POST sản phẩm');
      console.error('Error posting product:', err);
    } finally {
      setPostingProducts(prev => {
        const newSet = new Set(prev);
        newSet.delete(productId);
        return newSet;
      });
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      'ADMIN_APPROVED': { text: 'Đã duyệt', class: 'status-approved' },
      'ACTIVE': { text: 'Đã đăng', class: 'status-active' },
      'PENDING': { text: 'Chờ duyệt', class: 'status-pending' },
      'REJECTED': { text: 'Bị từ chối', class: 'status-rejected' }
    };
    
    const statusInfo = statusMap[status] || { text: status, class: 'status-default' };
    return (
      <span className={`status-badge ${statusInfo.class}`}>
        {statusInfo.text}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="approved-products-container">
        <div className="loading">Đang tải danh sách sản phẩm...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="approved-products-container">
        <div className="error">{error}</div>
        <button onClick={loadApprovedProducts} className="retry-btn">
          Thử lại
        </button>
      </div>
    );
  }

  return (
    <div className="approved-products-container">
      <div className="tab-header">
        <h3>Sản phẩm đã được Admin duyệt</h3>
        <p className="tab-description">
          Các sản phẩm đã được admin duyệt. Bạn có thể POST để hiển thị trên trang chủ.
        </p>
      </div>

      {products.length === 0 ? (
        <div className="no-products">
          <p>Chưa có sản phẩm nào được admin duyệt.</p>
        </div>
      ) : (
        <div className="products-grid">
          {products.map((product) => (
            <div key={product.id} className="product-card">
              <div className="product-image">
                {product.imageUrls && product.imageUrls.length > 0 ? (
                  <img 
                    src={product.imageUrls[0]} 
                    alt={product.title}
                    onError={(e) => {
                      e.target.src = '/placeholder-image.png';
                    }}
                  />
                ) : (
                  <div className="placeholder-image">Không có ảnh</div>
                )}
              </div>
              
              <div className="product-info">
                <h4 className="product-title">{product.title}</h4>
                <p className="product-description">{product.description}</p>
                <div className="product-price">{formatPrice(product.price)}</div>
                
                <div className="product-status">
                  {getStatusBadge(product.status)}
                </div>
                
                <div className="product-actions">
                  {product.status === 'ADMIN_APPROVED' ? (
                    <button
                      className="post-btn"
                      onClick={() => handlePostProduct(product.id)}
                      disabled={postingProducts.has(product.id)}
                    >
                      {postingProducts.has(product.id) ? 'Đang POST...' : 'POST sản phẩm'}
                    </button>
                  ) : product.status === 'ACTIVE' ? (
                    <span className="posted-badge">Đã đăng</span>
                  ) : (
                    <span className="status-text">Trạng thái: {product.status}</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ApprovedProductsTab;
