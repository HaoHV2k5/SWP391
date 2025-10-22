const messages = [
  { text: 'Mua bán xe điện uy tín - Giá tốt mỗi ngày', icon: 'bi-1-circle' },
  { text: 'Đổi mới tiết kiệm cho khách hàng', icon: 'bi-cash-coin' },
  { text: 'Giao dịch nhanh, hỗ trợ tận tâm', icon: 'bi-truck' }
];

const TopBar = () => {
  return (
    <div className="announcement-bar">
      <div className="announcement-track">
        {/* Track lần 1 */}
        {messages.map((msg, i) => (
          <div key={i} className="announcement-text">
            <i className={`bi ${msg.icon} me-2`}></i>
            {msg.text}
          </div>
        ))}
        {/* Track lần 2 để lặp liên tục */}
        {messages.map((msg, i) => (
          <div key={`copy-${i}`} className="announcement-text">
            <i className={`bi ${msg.icon} me-2`}></i>
            {msg.text}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TopBar;
