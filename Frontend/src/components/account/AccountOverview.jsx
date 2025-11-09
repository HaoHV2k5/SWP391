import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, CheckCircle, Clock, XCircle, Gift, Calendar, FileText, Wallet as WalletIcon } from 'lucide-react';
import { kycService } from '../../services/kycService';
import { paymentService } from '../../services/paymentService';
import productService from '../../services/productService';
import memberService from '../../services/memberService';

const AccountOverview = ({ user }) => {
  const navigate = useNavigate();
  const [kycStatus, setKycStatus] = useState(null);
  const [currentPackage, setCurrentPackage] = useState(null);
  const [stats, setStats] = useState({
    totalPosts: 0,
    totalSaved: 0,
    totalOrders: 0
  });
  const [loading, setLoading] = useState(true);

  const loadKycStatus = useCallback(async () => {
    if (!user?.id) return;
    try {
      const result = await kycService.getMyKyc(user.id);
      if (result.success && result.data) {
        setKycStatus(result.data);
      }
    } catch (error) {
      setKycStatus(null);
    }
  }, [user?.id]);

  const loadCurrentPackage = useCallback(async () => {
    try {
      const result = await paymentService.getCurrentPackage();
      if (result.data) {
        setCurrentPackage(result.data);
      }
    } catch (error) {
      setCurrentPackage(null);
    }
  }, []);

  const loadStats = useCallback(async () => {
    if (!user?.id) return;
    try {
      const postsResult = await productService.getMyPosts(user.id);
      if (postsResult.success) {
        const posts = postsResult.data || [];
        setStats(prev => ({
          ...prev,
          totalPosts: posts.length
        }));
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  }, [user?.id]);

  const loadData = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      await Promise.all([
        loadKycStatus(),
        loadCurrentPackage(),
        loadStats()
      ]);
    } catch (error) {
      console.error('Error loading overview:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.id, loadKycStatus, loadCurrentPackage, loadStats]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const getKycStatusBadge = () => {
    if (!kycStatus) {
      return {
        icon: <Clock size={18} />,
        label: 'Chưa xác thực',
        color: '#666',
        bgColor: '#f0f0f0',
        message: 'Xác thực danh tính để sử dụng đầy đủ tính năng'
      };
    }

    switch (kycStatus.status) {
      case 'PENDING':
        return {
          icon: <Clock size={18} />,
          label: 'Đang chờ duyệt',
          color: '#faad14',
          bgColor: '#fff7e6',
          message: 'KYC của bạn đang được xem xét'
        };
      case 'STAFF_APPROVED':
        return {
          icon: <CheckCircle size={18} />,
          label: 'Đã duyệt sơ bộ',
          color: '#52c41a',
          bgColor: '#f6ffed',
          message: 'Đang chờ admin duyệt cuối cùng'
        };
      case 'ADMIN_APPROVED':
        return {
          icon: <ShieldCheck size={18} />,
          label: 'Đã xác thực',
          color: '#00A86B',
          bgColor: '#f0f9f0',
          message: 'Tài khoản đã được xác thực hoàn toàn'
        };
      case 'REJECTED':
        return {
          icon: <XCircle size={18} />,
          label: 'Bị từ chối',
          color: '#f5222d',
          bgColor: '#fff1f0',
          message: kycStatus.rejectionReason || 'KYC không hợp lệ'
        };
      default:
        return {
          icon: <Clock size={18} />,
          label: 'Không xác định',
          color: '#666',
          bgColor: '#f0f0f0',
          message: 'Trạng thái không hợp lệ'
        };
    }
  };

  const kycBadge = getKycStatusBadge();

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const getPackageDaysRemaining = () => {
    if (!currentPackage?.endTime) return 0;
    const endDate = new Date(currentPackage.endTime);
    const today = new Date();
    const diffTime = endDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const getGradientColor = (packageName) => {
    if (!packageName) return 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
    const name = packageName.toLowerCase();
    if (name.includes('premium')) {
      return 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)';
    } else if (name.includes('nâng cao') || name.includes('nang cao')) {
      return 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)';
    }
    return 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)';
  };

  if (loading) {
    return (
      <div style={{ 
        backgroundColor: 'white', 
        borderRadius: '12px', 
        padding: '30px',
        marginBottom: '20px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '200px'
      }}>
        <div className="spinner-border text-success" role="status">
          <span className="visually-hidden">Đang tải...</span>
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      backgroundColor: 'white', 
      borderRadius: '12px', 
      padding: '30px',
      marginBottom: '20px',
      boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
    }}>
      <h2 style={{ 
        margin: '0 0 20px 0', 
        fontSize: '20px', 
        color: '#333',
        fontWeight: '600',
        display: 'flex',
        alignItems: 'center',
        gap: '10px'
      }}>
        <ShieldCheck size={20} />
        Tổng quan tài khoản
      </h2>

      <div style={{ display: 'grid', gap: '20px' }}>
        {/* KYC Status */}
        <div
          onClick={() => navigate('/kyc')}
          style={{
            padding: '20px',
            borderRadius: '12px',
            background: kycBadge.bgColor,
            border: `2px solid ${kycBadge.color}`,
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <div style={{ 
              width: '48px', 
              height: '48px', 
              borderRadius: '12px',
              background: kycBadge.color,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white'
            }}>
              {kycBadge.icon}
            </div>
            <div>
              <p style={{ 
                margin: '0 0 4px 0', 
                fontSize: '12px', 
                color: '#666',
                fontWeight: '500'
              }}>
                Trạng thái KYC
              </p>
              <p style={{ 
                margin: '0', 
                fontSize: '16px',
                fontWeight: '600',
                color: kycBadge.color
              }}>
                {kycBadge.label}
              </p>
              <p style={{ 
                margin: '8px 0 0 0', 
                fontSize: '14px',
                color: '#666'
              }}>
                {kycBadge.message}
              </p>
            </div>
          </div>
        </div>

        {/* Current Package */}
        {currentPackage && (
          <div
            onClick={() => navigate('/payment')}
            style={{
              padding: '20px',
              borderRadius: '12px',
              background: getGradientColor(currentPackage.name),
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              color: 'white'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '12px' }}>
              <Gift size={24} />
              <div style={{ flex: 1 }}>
                <p style={{ 
                  margin: '0 0 4px 0', 
                  fontSize: '12px', 
                  opacity: 0.9
                }}>
                  Gói đang sử dụng
                </p>
                <p style={{ 
                  margin: '0', 
                  fontSize: '18px',
                  fontWeight: '600'
                }}>
                  {currentPackage.name}
                </p>
              </div>
            </div>

            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(3, 1fr)', 
              gap: '15px',
              paddingTop: '15px',
              borderTop: '1px solid rgba(255,255,255,0.3)'
            }}>
              <div>
                <Calendar size={16} style={{ opacity: 0.9 }} />
                <p style={{ 
                  margin: '8px 0 0 0', 
                  fontSize: '14px',
                  opacity: 0.9
                }}>
                  {getPackageDaysRemaining()} ngày còn lại
                </p>
              </div>
              <div>
                <FileText size={16} style={{ opacity: 0.9 }} />
                <p style={{ 
                  margin: '8px 0 0 0', 
                  fontSize: '14px',
                  opacity: 0.9
                }}>
                  {currentPackage.postPossible || 0} bài đăng
                </p>
              </div>
              <div>
                <WalletIcon size={16} style={{ opacity: 0.9 }} />
                <p style={{ 
                  margin: '8px 0 0 0', 
                  fontSize: '14px',
                  opacity: 0.9
                }}>
                  {formatPrice(currentPackage.price)}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Quick Stats */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '15px'
        }}>
          <div style={{
            padding: '20px',
            borderRadius: '12px',
            backgroundColor: '#f0f9f0',
            border: '1px solid #d9f7be',
            textAlign: 'center',
            cursor: 'pointer',
            transition: 'all 0.3s ease'
          }}
          onClick={() => navigate('/my-posts')}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#d9f7be';
            e.currentTarget.style.transform = 'translateY(-2px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#f0f9f0';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
          >
            <div style={{ 
              fontSize: '28px', 
              fontWeight: 'bold', 
              color: '#00A86B', 
              marginBottom: '8px' 
            }}>
              {stats.totalPosts}
            </div>
            <div style={{ fontSize: '14px', color: '#666' }}>
              Tin đã đăng
            </div>
          </div>

          <div style={{
            padding: '20px',
            borderRadius: '12px',
            backgroundColor: '#f0f4ff',
            border: '1px solid #d4e4ff',
            textAlign: 'center',
            cursor: 'pointer',
            transition: 'all 0.3s ease'
          }}
          onClick={() => navigate('/saved-posts')}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#d4e4ff';
            e.currentTarget.style.transform = 'translateY(-2px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#f0f4ff';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
          >
            <div style={{ 
              fontSize: '28px', 
              fontWeight: 'bold', 
              color: '#1890ff', 
              marginBottom: '8px' 
            }}>
              {stats.totalSaved}
            </div>
            <div style={{ fontSize: '14px', color: '#666' }}>
              Tin đã lưu
            </div>
          </div>

          <div style={{
            padding: '20px',
            borderRadius: '12px',
            backgroundColor: '#fff7e6',
            border: '1px solid #ffe7ba',
            textAlign: 'center',
            cursor: 'pointer',
            transition: 'all 0.3s ease'
          }}
          onClick={() => navigate('/my-orders')}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#ffe7ba';
            e.currentTarget.style.transform = 'translateY(-2px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#fff7e6';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
          >
            <div style={{ 
              fontSize: '28px', 
              fontWeight: 'bold', 
              color: '#fa8c16', 
              marginBottom: '8px' 
            }}>
              {stats.totalOrders}
            </div>
            <div style={{ fontSize: '14px', color: '#666' }}>
              Đơn hàng
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountOverview;

