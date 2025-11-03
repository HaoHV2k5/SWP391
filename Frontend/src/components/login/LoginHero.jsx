import { Zap, Battery, TrendingUp } from "lucide-react";

export default function LoginHero() {
  return (
    <div style={{
      display: 'none',
      '@media (min-width: 1024px)': {
        display: 'flex'
      },
      flex: 1,
      background: 'linear-gradient(to bottom right, #1e3a8a 0%, #1e40af 50%, #172554 100%)',
      position: 'relative',
      overflow: 'hidden',
      justifyContent: 'center',
      alignItems: 'center'
    }} className="login-hero">
      {/* Animated gradient orbs */}
      <div style={{ position: 'absolute', inset: 0 }}>
        <div style={{
          position: 'absolute',
          top: '25%',
          left: '-5rem',
          width: '20rem',
          height: '20rem',
          background: '#22c55e',
          borderRadius: '50%',
          mixBlendMode: 'multiply',
          filter: 'blur(60px)',
          opacity: 0.15,
          animation: 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite'
        }}></div>
        <div style={{
          position: 'absolute',
          bottom: '25%',
          right: '-5rem',
          width: '20rem',
          height: '20rem',
          background: '#60a5fa',
          borderRadius: '50%',
          mixBlendMode: 'multiply',
          filter: 'blur(60px)',
          opacity: 0.15,
          animation: 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
          animationDelay: '2s'
        }}></div>
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          width: '24rem',
          height: '24rem',
          background: '#4ade80',
          borderRadius: '50%',
          mixBlendMode: 'screen',
          filter: 'blur(60px)',
          opacity: 0.1,
          animation: 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
          animationDelay: '4s'
        }}></div>
      </div>

      {/* Grid pattern overlay */}
      <div style={{
        position: 'absolute',
        inset: 0,
        opacity: 0.05,
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60'%3E%3Crect width='60' height='60' fill='none' stroke='white' strokeWidth='1'/%3E%3C/svg%3E")`
      }}></div>

      {/* Content */}
      <div style={{
        position: 'relative',
        zIndex: 10,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '4rem',
        color: 'white',
        maxWidth: '32rem'
      }}>
        {/* Logo & Brand */}
        <div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            marginBottom: '0.5rem',
            cursor: 'pointer'
          }} className="hero-brand">
            <img 
              src="/logo.jpg" 
              alt="GREENLOOP Logo"
              style={{
                width: '5rem',
                height: '5rem',
                objectFit: 'contain',
                borderRadius: '0rem'
              }}
            />
            <div>
              <span style={{
                fontSize: '1.5rem',
                fontWeight: 'bold',
                color: 'white'
              }}>GREENLOOP</span>
              <p style={{
                fontSize: '0.75rem',
                color: '#86efac',
                fontWeight: '600',
                marginTop: '-0.25rem',
                marginBottom: 0
              }}>Electric Store</p>
            </div>
          </div>
        </div>

        {/* Main heading */}
        <div style={{ marginTop: '3rem', marginBottom: '3rem' }}>
          <div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginBottom: '1rem'
            }}>
              <Battery style={{ width: '1.25rem', height: '1.25rem', color: '#4ade80' }} />
              <span style={{
                fontSize: '0.875rem',
                fontWeight: '600',
                color: '#86efac',
                textTransform: 'uppercase',
                letterSpacing: '0.1em'
              }}>Đăng nhập</span>
            </div>
            <h2 style={{
              fontSize: '3rem',
              fontWeight: 'bold',
              lineHeight: 1.2,
              color: 'white',
              marginBottom: '1rem'
            }}>
              Bán. Trao đổi.
              <br />
              <span style={{
                background: 'linear-gradient(to right, #86efac, #4ade80)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>
                Xanh hóa
              </span>
            </h2>
            <p style={{
              color: '#bfdbfe',
              fontSize: '1.125rem',
              lineHeight: 1.75
            }}>
              Tham gia cộng đồng yêu thích xe điện. Mua bán và trao đổi pin, xe điện chất lượng cao.
            </p>
          </div>

          {/* Features */}
          <div style={{ marginTop: '1.5rem' }}>
            <div style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '1rem',
              marginBottom: '1rem',
              cursor: 'pointer'
            }} className="hero-feature">
              <div style={{
                width: '3rem',
                height: '3rem',
                borderRadius: '0.5rem',
                background: 'linear-gradient(to bottom right, #22c55e, #16a34a)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                boxShadow: '0 10px 15px -3px rgba(34, 197, 94, 0.2)'
              }}>
                <Zap style={{ width: '1.5rem', height: '1.5rem', color: 'white' }} />
              </div>
              <div>
                <p style={{
                  fontWeight: '600',
                  color: 'white',
                  marginBottom: '0.25rem',
                  transition: 'color 0.3s'
                }}>Công nghệ sạch</p>
                <p style={{
                  color: '#bfdbfe',
                  fontSize: '0.875rem',
                  marginTop: '0.25rem',
                  marginBottom: 0
                }}>Hỗ trợ tương lai xanh cho giao thông</p>
              </div>
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '1rem',
              marginBottom: '1rem',
              cursor: 'pointer'
            }} className="hero-feature">
              <div style={{
                width: '3rem',
                height: '3rem',
                borderRadius: '0.5rem',
                background: 'linear-gradient(to bottom right, #60a5fa, #3b82f6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                boxShadow: '0 10px 15px -3px rgba(59, 130, 246, 0.2)'
              }}>
                <TrendingUp style={{ width: '1.5rem', height: '1.5rem', color: 'white' }} />
              </div>
              <div>
                <p style={{
                  fontWeight: '600',
                  color: 'white',
                  marginBottom: '0.25rem',
                  transition: 'color 0.3s'
                }}>Giá cạnh tranh</p>
                <p style={{
                  color: '#bfdbfe',
                  fontSize: '0.875rem',
                  marginTop: '0.25rem',
                  marginBottom: 0
                }}>Thỏa thuận tốt nhất cho xe và pin</p>
              </div>
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '1rem',
              cursor: 'pointer'
            }} className="hero-feature">
              <div style={{
                width: '3rem',
                height: '3rem',
                borderRadius: '0.5rem',
                background: 'linear-gradient(to bottom right, #16a34a, #15803d)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                boxShadow: '0 10px 15px -3px rgba(22, 163, 74, 0.2)'
              }}>
                <Battery style={{ width: '1.5rem', height: '1.5rem', color: 'white' }} />
              </div>
              <div>
                <p style={{
                  fontWeight: '600',
                  color: 'white',
                  marginBottom: '0.25rem',
                  transition: 'color 0.3s'
                }}>Pin chất lượng</p>
                <p style={{
                  color: '#bfdbfe',
                  fontSize: '0.875rem',
                  marginTop: '0.25rem',
                  marginBottom: 0
                }}>Kiểm định kỹ lưỡng, đảm bảo an toàn</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p style={{
          color: '#93c5fd',
          fontSize: '0.75rem',
          marginBottom: 0
        }}>© 2025 GREENLOOP. Tất cả quyền được bảo lưu.</p>
      </div>

      {/* Add CSS for responsive and hover effects */}
      <style>{`
        @media (min-width: 1024px) {
          .login-hero {
            display: flex !important;
          }
        }
        
        .hero-brand:hover .hero-brand > div:first-child {
          transform: scale(1.05);
          transition: transform 0.3s;
        }
        
        .hero-feature:hover p:first-of-type {
          color: #86efac !important;
        }
        
        @keyframes pulse {
          0%, 100% {
            opacity: 0.15;
          }
          50% {
            opacity: 0.25;
          }
        }
      `}</style>
    </div>
  );
}

