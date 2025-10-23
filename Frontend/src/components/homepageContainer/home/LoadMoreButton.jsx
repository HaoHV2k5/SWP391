const LoadMoreButton = ({ onClick }) => {
  const buttonStyle = {
    padding: "10px 30px",
    fontSize: "15px",
    fontWeight: "500",
    color: "#00A86B",
    backgroundColor: "transparent",
    border: "1px solid #00A86B",
    borderRadius: "6px",
    cursor: "pointer",
    transition: "all 0.3s ease",
  };

  const handleMouseEnter = (e) => {
    e.target.style.backgroundColor = "#e6f7ed";
  };

  const handleMouseLeave = (e) => {
    e.target.style.backgroundColor = "transparent";
  };

  return (
    <div style={{ textAlign: "center", marginTop: "20px" }}>
      <button
        onClick={onClick}
        style={buttonStyle}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        Xem thêm
      </button>
    </div>
  );
};

export default LoadMoreButton;

