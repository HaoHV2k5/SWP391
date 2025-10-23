import { Link } from "react-router-dom";
import { ArrowUp } from "lucide-react";
const appConstants = {
  APP_NAME: 'ElectricStore',
  EMAIL: 'support@electricstore.com',
  PHONE: '1900-xxxx'
};
import { paymentData, supportLinks, aboutLinks, socialData } from '../../../data/footerData';
import FooterColumn from '../layout/FooterColumn';
import '../styles/Footer.css';

const Footer = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Combine paymentData with appConstants
  const paymentDataWithApp = {
    ...paymentData,
    appTitle: `Mua sắm dễ dàng - Ưu đãi ngập tràn cùng ${appConstants.APP_NAME}`
  };

  // Combine socialData with appConstants
  const socialDataWithContact = {
    contactInfo: [
      `Email: ${appConstants.EMAIL}`,
      `CSKH: ${appConstants.PHONE}(1.000đ/phút)`,
      ...socialData.contactInfo
    ]
  };

  return (
    <footer className="footer-container">
      <div className="footer-content">
        {/* Main Footer Content */}
        <div className="footer-main">
          {/* Column 1: Payment Methods & App Download */}
          <FooterColumn
            title="Phương thức thanh toán"
            type="payment"
            data={paymentDataWithApp}
          />

          {/* Column 2: Customer Support */}
          <FooterColumn
            title="Hỗ trợ khách hàng"
            type="links"
            data={supportLinks}
          />

          {/* Column 3: About ElectricStore */}
          <FooterColumn
            title="Về ElectricStore"
            type="large-links"
            data={aboutLinks}
          />

          {/* Column 4: Social Media & Contact Info */}
          <FooterColumn
            title="Liên kết"
            type="social"
            data={socialDataWithContact}
          />
        </div>

        {/* Copyright Section */}
        <div className="footer-copyright">
          {/* Company Information & Legal Text */}
          <p className="footer-copyright-text">
            CÔNG TY TNHH ElectricStore - Người đại diện theo pháp luật: Nguyễn Văn A; GPDKKD: 0312120xxx do Sở KH & ĐT TP.HCM cấp ngày 11/01/20xx;
            GPMXH: 185/GP-BTTTT do Bộ Thông tin và Truyền thông cấp ngày 09/07/20xx - Chịu trách nhiệm nội dung: Trần Hoàng B. <Link to="#">Chính sách sử dụng</Link>
          </p>

          {/* Company Logo */}
          <img src="/img17-removebg-preview.png" className="footer-logo" />

          {/* Back to Top Button */}
          <button
            onClick={scrollToTop}
            className="footer-back-to-top"
          >
            Lên đầu
            <ArrowUp size={12} />
          </button>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
