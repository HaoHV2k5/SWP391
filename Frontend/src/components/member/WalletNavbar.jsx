import React, { useState, useEffect } from "react";
import { WalletOutlined, PlusOutlined } from "@ant-design/icons";
import { Button, Modal, Input, message, Card, Statistic } from "antd";

const WalletNavbar = ({ user }) => {
  const [walletBalance, setWalletBalance] = useState(0);
  const [isRechargeModalOpen, setIsRechargeModalOpen] = useState(false);
  const [rechargeAmount, setRechargeAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Load wallet balance from localStorage
  useEffect(() => {
    const savedBalance = localStorage.getItem(
      `wallet_balance_${user?.id || "default"}`
    );
    if (savedBalance) {
      setWalletBalance(parseFloat(savedBalance));
    }
  }, [user?.id]);

  // Save wallet balance to localStorage
  const saveBalance = (newBalance) => {
    setWalletBalance(newBalance);
    localStorage.setItem(
      `wallet_balance_${user?.id || "default"}`,
      newBalance.toString()
    );
  };

  const handleRecharge = async () => {
    if (!rechargeAmount || parseFloat(rechargeAmount) <= 0) {
      message.error("Vui lòng nhập số tiền hợp lệ");
      return;
    }

    setIsLoading(true);

    // Mock recharge - hoạt động ngay lập tức
    setTimeout(() => {
      const amount = parseFloat(rechargeAmount);
      const newBalance = walletBalance + amount;
      saveBalance(newBalance);

      message.success(`Nạp thành công ${amount.toLocaleString("vi-VN")}đ!`);
      setIsRechargeModalOpen(false);
      setRechargeAmount("");
      setIsLoading(false);
    }, 1000);
  };

  const formatCurrency = (amount) => {
    return amount.toLocaleString("vi-VN") + "đ";
  };

  return (
    <>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          padding: "6px 12px",
          backgroundColor: "#f8f9fa",
          borderRadius: "20px",
          border: "1px solid #e0e0e0",
          cursor: "pointer",
          transition: "all 0.3s ease",
        }}
        onClick={() => setIsRechargeModalOpen(true)}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = "#e8f5e8";
          e.currentTarget.style.borderColor = "#00A86B";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = "#f8f9fa";
          e.currentTarget.style.borderColor = "#e0e0e0";
        }}
      >
        <WalletOutlined style={{ color: "#00A86B", fontSize: "16px" }} />
        <span
          style={{
            fontSize: "14px",
            fontWeight: "600",
            color: "#333",
          }}
        >
          {formatCurrency(walletBalance)}
        </span>
        <PlusOutlined
          style={{
            color: "#00A86B",
            fontSize: "12px",
            marginLeft: "4px",
          }}
        />
      </div>

      {/* Recharge Modal */}
      <Modal
        title={
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <WalletOutlined style={{ color: "#00A86B" }} />
            <span>Nạp tiền vào ví</span>
          </div>
        }
        open={isRechargeModalOpen}
        onCancel={() => {
          setIsRechargeModalOpen(false);
          setRechargeAmount("");
        }}
        footer={[
          <Button key="cancel" onClick={() => setIsRechargeModalOpen(false)}>
            Hủy
          </Button>,
          <Button
            key="recharge"
            type="primary"
            loading={isLoading}
            onClick={handleRecharge}
            style={{ backgroundColor: "#00A86B", borderColor: "#00A86B" }}
          >
            Nạp tiền
          </Button>,
        ]}
        width={400}
      >
        <div style={{ padding: "20px 0" }}>
          <Card
            size="small"
            style={{ marginBottom: "20px", textAlign: "center" }}
          >
            <Statistic
              title="Số dư hiện tại"
              value={walletBalance}
              formatter={(value) => formatCurrency(value)}
              valueStyle={{ color: "#00A86B", fontSize: "20px" }}
            />
          </Card>

          <div style={{ marginBottom: "16px" }}>
            <label
              style={{
                display: "block",
                marginBottom: "8px",
                fontWeight: "500",
              }}
            >
              Số tiền nạp
            </label>
            <Input
              type="number"
              placeholder="Nhập số tiền (VND)"
              value={rechargeAmount}
              onChange={(e) => setRechargeAmount(e.target.value)}
              addonAfter="VND"
              size="large"
              style={{ fontSize: "16px" }}
            />
          </div>

          <div
            style={{
              backgroundColor: "#f0f9f0",
              padding: "12px",
              borderRadius: "8px",
              border: "1px solid #d4edda",
            }}
          >
            <div
              style={{
                fontSize: "14px",
                color: "#155724",
                marginBottom: "4px",
              }}
            >
              <strong>Số dư sau khi nạp:</strong>
            </div>
            <div
              style={{ fontSize: "18px", color: "#00A86B", fontWeight: "600" }}
            >
              {rechargeAmount
                ? formatCurrency(walletBalance + parseFloat(rechargeAmount))
                : formatCurrency(walletBalance)}
            </div>
          </div>

          <div
            style={{
              marginTop: "16px",
              fontSize: "12px",
              color: "#666",
              textAlign: "center",
            }}
          >
            💡 Demo Mode - Hoạt động ngay lập tức
          </div>
        </div>
      </Modal>
    </>
  );
};

export default WalletNavbar;
