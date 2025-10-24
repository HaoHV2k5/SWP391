import React from "react";
import { Link } from "react-router-dom";
import { QrCode, Youtube, Facebook, MessageCircle } from "lucide-react";

const FooterColumn = ({ title, type, data, className = "" }) => {
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
                // Map specific links to external HTML pages
                let linkTo = "#";
                if (item === "Giới thiệu") {
                  linkTo = "/about.html";
                } else if (item === "Trung tâm trợ giúp") {
                  linkTo = "/help.html";
                } else if (item === "Liên hệ hỗ trợ") {
                  linkTo = "/help.html";
                } else if (item === "Chính sách bảo mật") {
                  linkTo = "/privacy.html";
                } else if (item === "Quy chế hoạt động sàn") {
                  linkTo = "/terms.html";
                } else if (item === "Giải quyết tranh chấp") {
                  linkTo = "/dispute.html";
                } else if (item === "Tuyển dụng") {
                  linkTo = "/careers.html";
                } else if (item === "Truyền thông") {
                  linkTo = "/media.html";
                } else if (item === "Blog") {
                  linkTo = "/blog.html";
                }
                
                return (
                  <a key={index} href={linkTo} className="footer-link">
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
              {data.map((item, index) => (
                <Link key={index} to="#" className="footer-link">
                  {item}
                </Link>
              ))}
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
