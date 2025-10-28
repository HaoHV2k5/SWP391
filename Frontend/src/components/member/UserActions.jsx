import React from 'react';
import { Button, Dropdown } from 'react-bootstrap';
import { User, LogIn, UserPlus, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';

const UserActions = () => {
  // Mock user state - trong thực tế sẽ lấy từ context hoặc state management
  const isLoggedIn = false; // Thay đổi thành true để test
  const user = isLoggedIn ? { name: 'Nguyễn Văn A', email: 'user@example.com' } : null;

  if (!isLoggedIn) {
    return (
      <div className="d-flex gap-2">
        <Button 
          variant="outline-primary" 
          size="sm"
          as={Link}
          to="/login"
        >
          <LogIn size={16} className="me-1" />
          Đăng nhập
        </Button>
        <Button 
          variant="primary" 
          size="sm"
          as={Link}
          to="/register"
        >
          <UserPlus size={16} className="me-1" />
          Đăng ký
        </Button>
      </div>
    );
  }

  return (
    <Dropdown>
      <Dropdown.Toggle 
        variant="link" 
        className="text-decoration-none text-dark d-flex align-items-center"
      >
        <User size={18} className="me-1" />
        {user.name}
      </Dropdown.Toggle>

      <Dropdown.Menu>
        <Dropdown.Item as={Link} to="/profile">
          <User size={16} className="me-2" />
          Thông tin cá nhân
        </Dropdown.Item>
        <Dropdown.Divider />
        <Dropdown.Item as={Link} to="/admin">
          <Settings size={16} className="me-2" />
          Quản trị
        </Dropdown.Item>
        <Dropdown.Divider />
        <Dropdown.Item>
          Đăng xuất
        </Dropdown.Item>
      </Dropdown.Menu>
    </Dropdown>
  );
};

export default UserActions;
