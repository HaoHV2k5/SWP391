// src/pages/PaymentReturnPage.jsx
import { useEffect, useState } from "react";
import { Result, Button, Spin, message } from "antd";
import { useNavigate, useSearchParams } from "react-router-dom";
import { paymentService } from "../services/paymentService";

export default function PaymentReturnPage() {
  const [status, setStatus] = useState({
    loading: true,
    success: false,
    message: "",
  });
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const run = async () => {
      try {
        // Lấy query string từ URL (VNPay redirect về với các params)
        const qs = window.location.search || "";
        
        // Kiểm tra response code từ VNPay trong URL params
        const vnpResponseCode = searchParams.get("vnp_ResponseCode");
        const isSuccess = vnpResponseCode === "00";

        if (isSuccess) {
          // Thanh toán thành công - fetch lại số dư từ backend
          try {
            // Backend đã xử lý callback và cập nhật wallet
            // Frontend chỉ cần fetch lại wallet transactions để lấy số dư mới
            await paymentService.getWalletTransactions();
            
            // Đánh dấu để tất cả components liên quan reload balance
            sessionStorage.setItem("wallet.reload", "1");
            
            setStatus({
              loading: false,
              success: true,
              message: "Thanh toán thành công! Số dư ví đã được cập nhật.",
            });
            
            message.success("Nạp tiền thành công! Số dư ví đã được cập nhật.");
          } catch (fetchError) {
            console.error("Error fetching wallet balance:", fetchError);
            setStatus({
              loading: false,
              success: true,
              message: "Thanh toán thành công. Vui lòng kiểm tra lại số dư.",
            });
            sessionStorage.setItem("wallet.reload", "1");
          }
        } else {
          // Thanh toán thất bại hoặc bị hủy
          setStatus({
            loading: false,
            success: false,
            message: vnpResponseCode 
              ? `Thanh toán thất bại. Mã lỗi: ${vnpResponseCode}`
              : "Thanh toán thất bại hoặc bị hủy.",
          });
        }
      } catch (e) {
        console.error("Error processing payment return:", e);
        setStatus({
          loading: false,
          success: false,
          message: "Có lỗi xảy ra khi xử lý kết quả thanh toán.",
        });
      }
    };
    run();
  }, [searchParams]);

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

