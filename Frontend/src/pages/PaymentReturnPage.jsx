// src/pages/PaymentReturnPage.jsx
import { useEffect, useState } from "react";
import { Result, Button, Spin } from "antd";
import { useNavigate } from "react-router-dom";
import { paymentService } from "../services/paymentService";

export default function PaymentReturnPage() {
  const [status, setStatus] = useState({
    loading: true,
    success: false,
    message: "",
  });
  const navigate = useNavigate();

  useEffect(() => {
    const run = async () => {
      try {
        const qs = window.location.search || "";
        const res = await paymentService.paymentReturn(qs);

        const ok = res?.code === 1000 || res?.success === true;
        setStatus({ loading: false, success: ok, message: res?.message || "" });

        // Đánh dấu để trang ví refresh khi quay lại
        if (ok) sessionStorage.setItem("wallet.reload", "1");
      } catch (e) {
        setStatus({
          loading: false,
          success: false,
          message: "Thanh toán thất bại hoặc bị hủy.",
        });
      }
    };
    run();
  }, []);

  if (status.loading) {
    return (
      <div style={{ padding: 40, textAlign: "center" }}>
        <Spin size="large" />
        <div style={{ marginTop: 16 }}>Đang xác nhận thanh toán…</div>
      </div>
    );
  }

  return (
    <div style={{ padding: 24 }}>
      {status.success ? (
        <Result
          status="success"
          title="Thanh toán thành công"
          subTitle={status.message || "Số dư ví của bạn sẽ được cập nhật."}
          extra={[
            <Button
              type="primary"
              key="wallet"
              onClick={() => navigate("/payment", { replace: true })}
            >
              Về trang Ví
            </Button>,
          ]}
        />
      ) : (
        <Result
          status="error"
          title="Thanh toán thất bại"
          subTitle={
            status.message || "Vui lòng thử lại hoặc chọn phương thức khác."
          }
          extra={[
            <Button
              key="retry"
              onClick={() => navigate("/payment", { replace: true })}
            >
              Quay lại trang Ví
            </Button>,
          ]}
        />
      )}
    </div>
  );
}

