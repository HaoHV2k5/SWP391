import React, { useState, useEffect } from "react";
import { WalletOutlined, PlusOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { paymentService } from "../../services/paymentService";

const WalletNavbar = ({ user }) => {
  const [walletBalance, setWalletBalance] = useState(0);
  const navigate = useNavigate();

  // Load wallet balance từ BE bằng lịch sử giao dịch
  const fetchBalance = async () => {
    try {
      const res = await paymentService.getWalletTransactions();
      const list = res?.data || [];
      
      // Debug: log để kiểm tra
      console.log("🔍 WalletNavbar - Transactions:", list);
      
      // Cách 1: Lấy balanceAfter của transaction COMPLETED cuối cùng (chính xác nhất)
      const completedTx = list
        .filter(tx => {
          const status = (tx?.status || "").toUpperCase();
          return status === "COMPLETED";
        })
        .sort((a, b) => {
          const dateA = new Date(a?.completedAt || a?.createdAt || 0);
          const dateB = new Date(b?.completedAt || b?.createdAt || 0);
          return dateB - dateA;
        });
      
      console.log("✅ COMPLETED transactions:", completedTx);
      
      if (completedTx.length > 0) {
        const latestTx = completedTx[0];
        console.log("💰 Latest COMPLETED tx:", {
          balanceAfter: latestTx?.balanceAfter,
          amount: latestTx?.amount,
          type: latestTx?.typeWalletTraction || latestTx?.type,
          status: latestTx?.status
        });
        
        // Nếu có balanceAfter, dùng nó (chính xác nhất)
        if (latestTx?.balanceAfter != null && latestTx.balanceAfter !== undefined) {
          const balance = Number(latestTx.balanceAfter);
          console.log("💰 Using balanceAfter:", balance);
          setWalletBalance(balance > 0 ? balance : 0);
          return;
        }
      }
      
      // Cách 2: Tính toán CHỈ từ các transaction COMPLETED
      // CHỈ tính COMPLETED - đảm bảo số dư chính xác (không tính PENDING để tránh hiển thị sai khi giao dịch thất bại)
      const balance = list.reduce((sum, tx) => {
        const status = (tx?.status || "").toUpperCase();
        
        // CHỈ tính COMPLETED transactions
        if (status === "COMPLETED") {
          const type = ((tx?.typeWalletTraction || tx?.type || "") + "").toUpperCase();
          const amount = Number(tx?.amount || 0);
          
          console.log(`📊 Processing COMPLETED tx: type=${type}, amount=${amount}`);
          
          // Nạp tiền, hoàn tiền, refund → cộng vào
          if (
            type === "RECHARGE" ||
            type.includes("RECHARGE") ||
            type.includes("REFUND") ||
            type.includes("DEPOSIT") ||
            type.includes("NẠP")
          ) {
            return sum + amount;
          }
          // Các loại chi (mua gói, mua sản phẩm, rút tiền) → trừ đi
          if (
            type === "PAYMENT_PACKAGE" ||
            type === "PAYMENT_PRODUCT" ||
            type === "WITHDRAWAL" ||
            type.includes("BUY") ||
            type.includes("PAYMENT") ||
            type.includes("WITHDRAWAL") ||
            type.includes("MUA") ||
            type.includes("RÚT")
          ) {
            return sum - amount;
          }
        }
        return sum;
      }, 0);
      
      console.log("💰 Calculated balance:", balance);
      setWalletBalance(balance > 0 ? balance : 0);
    } catch (error) {
      console.error("❌ Error fetching balance:", error);
      // fallback cũ từ localStorage nếu có
      const savedBalance = localStorage.getItem(
        `wallet_balance_${user?.id || "default"}`
      );
      if (savedBalance) setWalletBalance(parseFloat(savedBalance));
    }
  };

  useEffect(() => {
    fetchBalance();
  }, [user?.id]);

  // Listen for wallet.reload flag và event để update balance sau khi payment return
  useEffect(() => {
    // Check periodically for wallet.reload flag (khi payment return)
    const interval = setInterval(() => {
      if (sessionStorage.getItem("wallet.reload") === "1") {
        sessionStorage.removeItem("wallet.reload");
        // Delay một chút để đảm bảo backend đã cập nhật xong
        setTimeout(() => {
          fetchBalance();
        }, 1500);
      }
    }, 1000);
    
    // Listen for wallet.reload event từ PaymentReturnPage
    const handleWalletReload = () => {
      setTimeout(() => {
        fetchBalance();
      }, 1500);
    };
    
    window.addEventListener('wallet.reload', handleWalletReload);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('wallet.reload', handleWalletReload);
    };
  }, []);

  const formatCurrency = (amount) => {
    return amount.toLocaleString("vi-VN") + "đ";
  };

  return (
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
      onClick={() => navigate("/payment")}
      onMouseEnter={(ev) => {
        ev.currentTarget.style.backgroundColor = "#e8f5e8";
        ev.currentTarget.style.borderColor = "#00A86B";
      }}
      onMouseLeave={(ev) => {
        ev.currentTarget.style.backgroundColor = "#f8f9fa";
        ev.currentTarget.style.borderColor = "#e0e0e0";
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
  );
};

export default WalletNavbar;
