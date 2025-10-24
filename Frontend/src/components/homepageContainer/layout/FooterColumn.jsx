import React from "react";
import { Link } from "react-router-dom";
import { QrCode, Youtube, Facebook, MessageCircle } from "lucide-react";

const FooterColumn = ({ title, type, data, className = "" }) => {
  // Helper function to map footer items to HTML pages
  const getLinkPath = (item) => {
    const linkMap = {
      "Giới thiệu": "/supportpage/about.html",
      "Quy chế hoạt động sàn": "/supportpage/terms.html",
      "Giải quyết tranh chấp": "/supportpage/dispute.html",
      "Tuyển dụng": "/supportpage/careers.html",
      "Truyền thông": "/supportpage/media.html",
      "Blog": "/supportpage/blog.html",
      "Trung tâm trợ giúp": "/supportpage/help.html",
      "An toàn mua bán": "/supportpage/safety.html",
      "Liên hệ hỗ trợ": "/supportpage/contact.html",
      "Chính sách bảo mật": "/supportpage/privacy.html"
    };
    return linkMap[item] || "#";
  };

  const renderContent = () => {
    switch (type) {
      case "payment":
        return (
          <div>
            <h4 className="footer-subtitle">{title}</h4>
            <div className="footer-payment-grid">
              {data.paymentMethods.map((method, index) => (
                <div key={index} className="footer-payment-item">
                  {method}
                </div>
              ))}
            </div>
            <h5 className="footer-app-title">{data.appTitle}</h5>
            <div className="footer-app-container">
              <div className="footer-qr-code">
                <QrCode size={40} color="#333" />
              </div>
              <div className="footer-app-buttons">
                {data.appButtons.map((button, index) => (
                  <button key={index} className="footer-app-button">
                    {button}
                  </button>
                ))}
              </div>
            </div>
          </div>
        );

      case "links":
        return (
          <div>
            <h4 className="footer-column-title">{title}</h4>
            <div className="footer-links">
              {data.map((item, index) => {
                const linkTo = getLinkPath(item);
                
                return (
                  <a 
                    key={index} 
                    href={linkTo} 
                    className="footer-link"
                    onClick={(e) => {
                      if (linkTo !== "#") {
                        e.preventDefault();
                        window.location.href = linkTo;
                      }
                    }}
                  >
                    {item}
                  </a>
                );
              })}
            </div>
          </div>
        );

      case "large-links":
        return (
          <div>
            <h4 className="footer-column-title-large">{title}</h4>
            <div className="footer-links-large">
              {data.map((item, index) => {
                const linkTo = getLinkPath(item);
                
                return (
                  <a 
                    key={index} 
                    href={linkTo} 
                    className="footer-link"
                    onClick={(e) => {
                      if (linkTo !== "#") {
                        e.preventDefault();
                        window.location.href = linkTo;
                      }
                    }}
                  >
                    {item}
                  </a>
                );
              })}
            </div>
          </div>
        );

      case "social":
        return (
          <div>
            <h4 className="footer-column-title-large">{title}</h4>
            <div className="footer-social">
              <a href="https://www.youtube.com/" className="footer-social-link">
                <Youtube size={24} />
              </a>
              <a
                href="https://www.facebook.com/"
                className="footer-social-link"
              >
                <Facebook size={24} />
              </a>
              <a href="#" className="footer-social-link">
                <MessageCircle size={24} />
              </a>
            </div>
            <div className="footer-contact">
              {data.contactInfo.map((info, index) => (
                <Link key={index} to="#" className="footer-contact-link">
                  {info}
                </Link>
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return <div className={className}>{renderContent()}</div>;
};

export default FooterColumn;
