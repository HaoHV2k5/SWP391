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

        // ⚠️ QUAN TRỌNG: Gọi BE endpoint để verify và xử lý payment return
        // BE sẽ verify chữ ký và redirect về payment-success/fail
        try {
          // Backend sẽ verify và xử lý, nhưng endpoint này chỉ redirect
          // Nên ta cần check responseCode từ URL để hiển thị UI
          const vnpResponseCode = searchParams.get("vnp_ResponseCode");
          const isSuccess = vnpResponseCode === "00";

          if (isSuccess) {
            // Lấy transactionCode từ URL để check transaction cụ thể
            const vnpTxnRef = searchParams.get("vnp_TxnRef");

            // Polling để đợi transaction chuyển sang COMPLETED (tối đa 30s, mỗi 2s check 1 lần)
            let attempts = 0;
            const maxAttempts = 15;
            let transactionCompleted = false;

            while (attempts < maxAttempts && !transactionCompleted) {
              await new Promise((resolve) => setTimeout(resolve, 2000));
              attempts++;

              try {
                const walletRes = await paymentService.getWalletTransactions();
                const transactions = walletRes?.data || [];

                // Tìm transaction theo transactionCode
                const currentTx = transactions.find(
                  (tx) =>
                    tx.transactionCode === vnpTxnRef ||
                    tx.transactionCode === searchParams.get("vnp_TxnRef")
                );

                if (currentTx) {
                  const status = (currentTx.status || "").toUpperCase();
                  console.log(
                    `Attempt ${attempts}: Transaction ${vnpTxnRef} status = ${status}`
                  );

                  if (status === "COMPLETED") {
                    transactionCompleted = true;

                    // Đánh dấu để tất cả components liên quan reload balance
                    sessionStorage.setItem("wallet.reload", "1");

                    // Trigger reload cho các components khác
                    window.dispatchEvent(new Event("wallet.reload"));

                    setStatus({
                      loading: false,
                      success: true,
                      message:
                        "Thanh toán thành công! Số dư ví đã được cập nhật.",
                    });

                    message.success(
                      "Nạp tiền thành công! Số dư ví đã được cập nhật."
                    );
                    return; // Thoát khỏi function
                  } else if (status === "FAILED") {
                    setStatus({
                      loading: false,
                      success: false,
                      message: "Giao dịch đã bị từ chối. Vui lòng thử lại.",
                    });
                    return;
                  }
                  // Nếu vẫn PENDING, tiếp tục polling
                } else {
                  console.log(
                    `Attempt ${attempts}: Transaction ${vnpTxnRef} not found yet`
                  );
                }
              } catch (pollError) {
                console.error(
                  `Attempt ${attempts}: Error polling transaction:`,
                  pollError
                );
              }
            }

            // Nếu sau 30s vẫn chưa COMPLETED
            if (!transactionCompleted) {
              console.warn(
                "Transaction still PENDING after 30s, showing success anyway"
              );
              // Vẫn hiển thị success vì VNPAY đã confirm, chỉ là BE callback chậm
              sessionStorage.setItem("wallet.reload", "1");
              window.dispatchEvent(new Event("wallet.reload"));

              setStatus({
                loading: false,
                success: true,
                message:
                  "Thanh toán thành công. Vui lòng đợi một chút và refresh trang để xem số dư cập nhật.",
              });

              message.warning(
                "Thanh toán thành công nhưng đang chờ xử lý. Vui lòng refresh trang sau vài giây."
              );
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
        } catch (backendError) {
          console.error("Error verifying payment with backend:", backendError);
          // Fallback: check responseCode từ URL
          const vnpResponseCode = searchParams.get("vnp_ResponseCode");
          const isSuccess = vnpResponseCode === "00";

          if (isSuccess) {
            setStatus({
              loading: false,
              success: true,
              message: "Thanh toán thành công. Vui lòng kiểm tra lại số dư.",
            });
            sessionStorage.setItem("wallet.reload", "1");
            window.dispatchEvent(new Event("wallet.reload"));
          } else {
            setStatus({
              loading: false,
              success: false,
              message: "Có lỗi xảy ra khi xác nhận thanh toán.",
            });
          }
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
