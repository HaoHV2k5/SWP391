// src/services/emailService.js
/**
 * Email Service using EmailJS API
 * Gửi email thông qua EmailJS service (sử dụng JSONP để tránh CORS)
 */
const emailService = {
  /**
   * Load EmailJS SDK dynamically
   */
  loadEmailJS() {
    return new Promise((resolve, reject) => {
      // Kiểm tra nếu đã load rồi
      if (window.emailjs) {
        resolve(window.emailjs);
        return;
      }

      // Load EmailJS SDK từ CDN
      const script = document.createElement("script");
      script.src =
        "https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js";
      script.async = true;
      script.onload = () => {
        if (window.emailjs) {
          resolve(window.emailjs);
        } else {
          reject(new Error("EmailJS SDK failed to load"));
        }
      };
      script.onerror = () => {
        reject(new Error("Failed to load EmailJS SDK"));
      };
      document.head.appendChild(script);
    });
  },

  /**
   * Gửi email xác nhận khiếu nại đã được tiếp nhận
   * @param {string} serviceId - Service ID của EmailJS
   * @param {string} templateId - Template ID của EmailJS
   * @param {string} publicKey - Public Key của EmailJS
   * @param {Object} templateParams - Các biến template: to_email, to_name, companyName, name, contractCode, complaintId, message, submittedAt, etaHours, portalUrl, supportEmail, companyAddress, hotline, subject
   * @returns {Promise<{success: boolean, message?: string}>}
   */
  async sendComplaintEmail(serviceId, templateId, publicKey, templateParams) {
    try {
      // Load EmailJS SDK
      const emailjs = await this.loadEmailJS();

      // Initialize EmailJS với public key
      emailjs.init(publicKey);

      // Gửi email
      const response = await emailjs.send(
        serviceId,
        templateId,
        templateParams
      );

      if (response.status === 200) {
        return {
          success: true,
          message: "Email đã được gửi thành công",
        };
      } else {
        return {
          success: false,
          message: "Gửi email thất bại",
        };
      }
    } catch (error) {
      console.error("Error sending email:", error);
      return {
        success: false,
        message: error.text || error.message || "Lỗi khi gửi email",
      };
    }
  },
};

export default emailService;
