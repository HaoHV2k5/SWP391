import React from 'react';
import { Link } from 'react-router-dom';

const PostAdButton = ({ onItemClick }) => {
  return (
    <Link 
      to="/post-ad" 
      style={{
        display: "block",
        padding: "10px 15px",
        color: "#00A86B",
        textDecoration: "none",
        fontSize: "14px",
        fontWeight: "600",
        transition: "background-color 0.2s"
      }}
      onMouseEnter={(e) => e.target.style.backgroundColor = "#f0f9f0"}
      onMouseLeave={(e) => e.target.style.backgroundColor = "transparent"}
      onClick={onItemClick}
    >
      Đăng tin ngay
    </Link>
  );
};

export default PostAdButton;
