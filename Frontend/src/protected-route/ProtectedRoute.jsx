import { Button, Result } from "antd";
import React from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

function ProtectedRoute({ role, children }) {
  const account = useSelector((store) => store.account);
  const navigate = useNavigate();

  if (account?.role === role) {
    return children;
  } else {
    <Result
      status="403"
      title="403"
      subTitle="Sorry, you are not authorized to access this page."
      extra={
        <Button
          onClick={() => {
            navigate("/login");
          }}
          type="primary"
        >
          Back Home
        </Button>
      }
    />;
  }
}

export default ProtectedRoute;
