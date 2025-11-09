import { useState, useEffect } from "react";
import { DollarSign, TrendingUp, Wallet, CreditCard, Package, Users, RefreshCw, ChevronLeft, ChevronRight } from "lucide-react";
import adminService from "../../services/adminService";

const RevenueTab = () => {
  const [activeView, setActiveView] = useState("overview");
  const [loading, setLoading] = useState(false);
  
  // Data states
  const [adminBalance, setAdminBalance] = useState(0);
  const [allWalletTransactions, setAllWalletTransactions] = useState([]);
  const [rechargeTransactions, setRechargeTransactions] = useState([]);
  const [transactionHistory, setTransactionHistory] = useState([]);
  
  // User-specific data
  const [selectedUserId, setSelectedUserId] = useState("");
  const [userWalletTransactions, setUserWalletTransactions] = useState([]);
  const [userTransactions, setUserTransactions] = useState([]);
  const [userPackages, setUserPackages] = useState([]);

  // Stats
  const [stats, setStats] = useState({
    totalRecharge: 0,
    totalTransactions: 0,
    totalRevenue: 0,
  });

  // Pagination states
  const [overviewPage, setOverviewPage] = useState(1);
  const [allWalletPage, setAllWalletPage] = useState(1);
  const [rechargePage, setRechargePage] = useState(1);
  const [transactionPage, setTransactionPage] = useState(1);
  const [userWalletPage, setUserWalletPage] = useState(1);
  const [userTransactionPage, setUserTransactionPage] = useState(1);
  const [userPackagePage, setUserPackagePage] = useState(1);
  
  const itemsPerPage = 10;

  useEffect(() => {
    loadData();
    // Reset pagination khi chuyển view
    setOverviewPage(1);
    setAllWalletPage(1);
    setRechargePage(1);
    setTransactionPage(1);
    setUserWalletPage(1);
    setUserTransactionPage(1);
    setUserPackagePage(1);
  }, [activeView]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Load admin balance và overview data
      if (activeView === "overview" || activeView === "all-wallet" || activeView === "recharge") {
        const [balanceRes, allWalletRes, rechargeRes] = await Promise.all([
          adminService.getAdminBalance().catch(() => ({ data: 0 })),
          adminService.getAllWalletTransactions().catch(() => ({ data: [] })),
          adminService.getRechargeTransactions().catch(() => ({ data: [] })),
        ]);
        
        setAdminBalance(balanceRes?.data || 0);
        setAllWalletTransactions(allWalletRes?.data || []);
        setRechargeTransactions(rechargeRes?.data || []);
        
        // Calculate stats
        const totalRecharge = (rechargeRes?.data || []).reduce((sum, tx) => {
          if (tx.status === "COMPLETED") return sum + (Number(tx.amount) || 0);
          return sum;
        }, 0);
        
        setStats({
          totalRecharge,
          totalTransactions: allWalletRes?.data?.length || 0,
          totalRevenue: balanceRes?.data || 0,
        });
      }
      
      // Load transaction history
      if (activeView === "transactions") {
        const historyRes = await adminService.getTransactionHistory().catch(() => ({ data: [] }));
        setTransactionHistory(historyRes?.data || []);
      }
      
      // Load user-specific data
      if (activeView === "user-detail" && selectedUserId) {
        const [walletRes, transRes, packagesRes] = await Promise.all([
          adminService.getUserWalletTransactions(selectedUserId).catch(() => ({ data: [] })),
          adminService.getUserTransactions(selectedUserId).catch(() => ({ data: [] })),
          adminService.getUserPackages(selectedUserId).catch(() => ({ data: [] })),
        ]);
        
        setUserWalletTransactions(walletRes?.data || []);
        setUserTransactions(transRes?.data || []);
        setUserPackages(packagesRes?.data || []);
      }
    } catch (error) {
      console.error("Error loading revenue data:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString("vi-VN");
  };

  const getStatusColor = (status) => {
    switch (status?.toUpperCase()) {
      case "COMPLETED":
        return "#43e97b";
      case "PENDING":
        return "#ffc107";
      case "FAILED":
        return "#dc3545";
      default:
        return "rgba(255, 255, 255, 0.7)";
    }
  };

  // Pagination Component
  const Pagination = ({ currentPage, totalPages, onPageChange }) => {
    if (totalPages <= 1) return null;

    const handlePageChange = (page) => {
      if (page >= 1 && page <= totalPages) {
        onPageChange(page);
      }
    };

    // Calculate page numbers to display
    const getPageNumbers = () => {
      const pages = [];
      const maxVisible = 5;
      
      if (totalPages <= maxVisible) {
        for (let i = 1; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        if (currentPage <= 3) {
          for (let i = 1; i <= 4; i++) {
            pages.push(i);
          }
          pages.push("...");
          pages.push(totalPages);
        } else if (currentPage >= totalPages - 2) {
          pages.push(1);
          pages.push("...");
          for (let i = totalPages - 3; i <= totalPages; i++) {
            pages.push(i);
          }
        } else {
          pages.push(1);
          pages.push("...");
          for (let i = currentPage - 1; i <= currentPage + 1; i++) {
            pages.push(i);
          }
          pages.push("...");
          pages.push(totalPages);
        }
      }
      return pages;
    };

    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: "0.5rem",
          marginTop: "1.5rem",
          paddingTop: "1.5rem",
          borderTop: "1px solid rgba(255, 255, 255, 0.1)",
        }}
      >
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          style={{
            padding: "0.5rem 0.75rem",
            border: "1px solid rgba(255, 255, 255, 0.2)",
            borderRadius: "8px",
            background: currentPage === 1 
              ? "rgba(255, 255, 255, 0.05)" 
              : "rgba(255, 255, 255, 0.1)",
            color: currentPage === 1 
              ? "rgba(255, 255, 255, 0.3)" 
              : "white",
            cursor: currentPage === 1 ? "not-allowed" : "pointer",
            display: "flex",
            alignItems: "center",
            gap: "0.25rem",
            transition: "all 0.3s ease",
          }}
          onMouseEnter={(e) => {
            if (currentPage !== 1) {
              e.target.style.background = "rgba(255, 255, 255, 0.15)";
            }
          }}
          onMouseLeave={(e) => {
            if (currentPage !== 1) {
              e.target.style.background = "rgba(255, 255, 255, 0.1)";
            }
          }}
        >
          <ChevronLeft size={16} />
          Trước
        </button>

        {getPageNumbers().map((page, index) => {
          if (page === "...") {
            return (
              <span
                key={`ellipsis-${index}`}
                style={{
                  padding: "0.5rem",
                  color: "rgba(255, 255, 255, 0.5)",
                }}
              >
                ...
              </span>
            );
          }

          return (
            <button
              key={page}
              onClick={() => handlePageChange(page)}
              style={{
                padding: "0.5rem 0.75rem",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                borderRadius: "8px",
                background: currentPage === page
                  ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                  : "rgba(255, 255, 255, 0.1)",
                color: "white",
                cursor: "pointer",
                fontWeight: currentPage === page ? "600" : "400",
                transition: "all 0.3s ease",
                minWidth: "40px",
              }}
              onMouseEnter={(e) => {
                if (currentPage !== page) {
                  e.target.style.background = "rgba(255, 255, 255, 0.15)";
                }
              }}
              onMouseLeave={(e) => {
                if (currentPage !== page) {
                  e.target.style.background = "rgba(255, 255, 255, 0.1)";
                }
              }}
            >
              {page}
            </button>
          );
        })}

        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          style={{
            padding: "0.5rem 0.75rem",
            border: "1px solid rgba(255, 255, 255, 0.2)",
            borderRadius: "8px",
            background: currentPage === totalPages
              ? "rgba(255, 255, 255, 0.05)"
              : "rgba(255, 255, 255, 0.1)",
            color: currentPage === totalPages
              ? "rgba(255, 255, 255, 0.3)"
              : "white",
            cursor: currentPage === totalPages ? "not-allowed" : "pointer",
            display: "flex",
            alignItems: "center",
            gap: "0.25rem",
            transition: "all 0.3s ease",
          }}
          onMouseEnter={(e) => {
            if (currentPage !== totalPages) {
              e.target.style.background = "rgba(255, 255, 255, 0.15)";
            }
          }}
          onMouseLeave={(e) => {
            if (currentPage !== totalPages) {
              e.target.style.background = "rgba(255, 255, 255, 0.1)";
            }
          }}
        >
          Sau
          <ChevronRight size={16} />
        </button>
      </div>
    );
  };

  const renderOverview = () => (
    <div>
      {/* Stats Cards */}
      <div style={{ 
        display: "grid", 
        gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", 
        gap: "1.5rem",
        marginBottom: "2rem"
      }}>
        <div style={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          padding: "1.5rem",
          borderRadius: "15px",
          color: "white",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1rem" }}>
            <Wallet size={32} />
            <h3 style={{ margin: 0, fontSize: "0.9rem", opacity: 0.9 }}>Số dư ví Admin</h3>
          </div>
          <p style={{ margin: 0, fontSize: "2rem", fontWeight: "700" }}>
            {formatCurrency(adminBalance)}
          </p>
        </div>

        <div style={{
          background: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
          padding: "1.5rem",
          borderRadius: "15px",
          color: "white",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1rem" }}>
            <TrendingUp size={32} />
            <h3 style={{ margin: 0, fontSize: "0.9rem", opacity: 0.9 }}>Tổng nạp tiền</h3>
          </div>
          <p style={{ margin: 0, fontSize: "2rem", fontWeight: "700" }}>
            {formatCurrency(stats.totalRecharge)}
          </p>
        </div>

        <div style={{
          background: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
          padding: "1.5rem",
          borderRadius: "15px",
          color: "white",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1rem" }}>
            <CreditCard size={32} />
            <h3 style={{ margin: 0, fontSize: "0.9rem", opacity: 0.9 }}>Tổng giao dịch</h3>
          </div>
          <p style={{ margin: 0, fontSize: "2rem", fontWeight: "700" }}>
            {stats.totalTransactions}
          </p>
        </div>
      </div>

      {/* Recent Recharges */}
      <div style={{
        background: "rgba(255, 255, 255, 0.05)",
        padding: "1.5rem",
        borderRadius: "15px",
        border: "1px solid rgba(255, 255, 255, 0.1)",
      }}>
        <h3 style={{ marginBottom: "1rem", color: "white" }}>Giao dịch nạp tiền gần đây</h3>
        {rechargeTransactions.length === 0 ? (
          <p style={{ color: "rgba(255, 255, 255, 0.7)", textAlign: "center", padding: "2rem" }}>
            Chưa có giao dịch nạp tiền
          </p>
        ) : (
          <>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", color: "white" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.1)" }}>
                    <th style={{ padding: "1rem", textAlign: "left" }}>Mã GD</th>
                    <th style={{ padding: "1rem", textAlign: "left" }}>Số tiền</th>
                    <th style={{ padding: "1rem", textAlign: "left" }}>Trạng thái</th>
                    <th style={{ padding: "1rem", textAlign: "left" }}>Ngày tạo</th>
                  </tr>
                </thead>
                <tbody>
                  {(() => {
                    const totalPages = Math.ceil(rechargeTransactions.length / itemsPerPage);
                    const startIndex = (overviewPage - 1) * itemsPerPage;
                    const endIndex = startIndex + itemsPerPage;
                    const currentData = rechargeTransactions.slice(startIndex, endIndex);
                    
                    return currentData.map((tx) => (
                      <tr key={tx.id} style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.05)" }}>
                        <td style={{ padding: "1rem" }}>#{tx.transactionCode}</td>
                        <td style={{ padding: "1rem", fontWeight: "600", color: "#43e97b" }}>
                          {formatCurrency(tx.amount)}
                        </td>
                        <td style={{ padding: "1rem" }}>
                          <span style={{
                            padding: "0.25rem 0.75rem",
                            borderRadius: "15px",
                            fontSize: "0.8rem",
                            backgroundColor: `${getStatusColor(tx.status)}20`,
                            color: getStatusColor(tx.status),
                          }}>
                            {tx.status || "N/A"}
                          </span>
                        </td>
                        <td style={{ padding: "1rem", fontSize: "0.9rem", color: "rgba(255, 255, 255, 0.7)" }}>
                          {formatDate(tx.createdAt)}
                        </td>
                      </tr>
                    ));
                  })()}
                </tbody>
              </table>
            </div>
            <Pagination
              currentPage={overviewPage}
              totalPages={Math.ceil(rechargeTransactions.length / itemsPerPage)}
              onPageChange={setOverviewPage}
            />
          </>
        )}
      </div>
    </div>
  );

  const renderWalletTransactions = () => {
    const totalPages = Math.ceil(allWalletTransactions.length / itemsPerPage);
    const startIndex = (allWalletPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentData = allWalletTransactions.slice(startIndex, endIndex);

    return (
      <div>
        <div style={{
          background: "rgba(255, 255, 255, 0.05)",
          padding: "1.5rem",
          borderRadius: "15px",
          border: "1px solid rgba(255, 255, 255, 0.1)",
        }}>
          <h3 style={{ marginBottom: "1rem", color: "white" }}>
            Tất cả giao dịch ví ({allWalletTransactions.length} giao dịch)
          </h3>
          {allWalletTransactions.length === 0 ? (
            <p style={{ color: "rgba(255, 255, 255, 0.7)", textAlign: "center", padding: "2rem" }}>
              Chưa có giao dịch
            </p>
          ) : (
            <>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", color: "white" }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.1)" }}>
                      <th style={{ padding: "1rem", textAlign: "left" }}>Mã GD</th>
                      <th style={{ padding: "1rem", textAlign: "left" }}>Loại</th>
                      <th style={{ padding: "1rem", textAlign: "left" }}>Số tiền</th>
                      <th style={{ padding: "1rem", textAlign: "left" }}>Số dư trước</th>
                      <th style={{ padding: "1rem", textAlign: "left" }}>Số dư sau</th>
                      <th style={{ padding: "1rem", textAlign: "left" }}>Trạng thái</th>
                      <th style={{ padding: "1rem", textAlign: "left" }}>Ngày tạo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentData.map((tx) => (
                      <tr key={tx.id} style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.05)" }}>
                        <td style={{ padding: "1rem" }}>#{tx.transactionCode}</td>
                        <td style={{ padding: "1rem" }}>{tx.typeWalletTraction || "N/A"}</td>
                        <td style={{ padding: "1rem", fontWeight: "600", color: "#43e97b" }}>
                          {formatCurrency(tx.amount)}
                        </td>
                        <td style={{ padding: "1rem", color: "rgba(255, 255, 255, 0.7)" }}>
                          {formatCurrency(tx.balanceBefore)}
                        </td>
                        <td style={{ padding: "1rem", color: "rgba(255, 255, 255, 0.7)" }}>
                          {formatCurrency(tx.balanceAfter)}
                        </td>
                        <td style={{ padding: "1rem" }}>
                          <span style={{
                            padding: "0.25rem 0.75rem",
                            borderRadius: "15px",
                            fontSize: "0.8rem",
                            backgroundColor: `${getStatusColor(tx.status)}20`,
                            color: getStatusColor(tx.status),
                          }}>
                            {tx.status || "N/A"}
                          </span>
                        </td>
                        <td style={{ padding: "1rem", fontSize: "0.9rem", color: "rgba(255, 255, 255, 0.7)" }}>
                          {formatDate(tx.createdAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Pagination
                currentPage={allWalletPage}
                totalPages={totalPages}
                onPageChange={setAllWalletPage}
              />
            </>
          )}
        </div>
      </div>
    );
  };

  const renderRechargeTransactions = () => {
    const totalPages = Math.ceil(rechargeTransactions.length / itemsPerPage);
    const startIndex = (rechargePage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentData = rechargeTransactions.slice(startIndex, endIndex);

    return (
      <div>
        <div style={{
          background: "rgba(255, 255, 255, 0.05)",
          padding: "1.5rem",
          borderRadius: "15px",
          border: "1px solid rgba(255, 255, 255, 0.1)",
        }}>
          <h3 style={{ marginBottom: "1rem", color: "white" }}>
            Giao dịch nạp tiền ({rechargeTransactions.length} giao dịch)
          </h3>
          {rechargeTransactions.length === 0 ? (
            <p style={{ color: "rgba(255, 255, 255, 0.7)", textAlign: "center", padding: "2rem" }}>
              Chưa có giao dịch nạp tiền
            </p>
          ) : (
            <>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", color: "white" }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.1)" }}>
                      <th style={{ padding: "1rem", textAlign: "left" }}>Mã GD</th>
                      <th style={{ padding: "1rem", textAlign: "left" }}>Số tiền</th>
                      <th style={{ padding: "1rem", textAlign: "left" }}>Số dư trước</th>
                      <th style={{ padding: "1rem", textAlign: "left" }}>Số dư sau</th>
                      <th style={{ padding: "1rem", textAlign: "left" }}>Trạng thái</th>
                      <th style={{ padding: "1rem", textAlign: "left" }}>Ngày hoàn thành</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentData.map((tx) => (
                      <tr key={tx.id} style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.05)" }}>
                        <td style={{ padding: "1rem" }}>#{tx.transactionCode}</td>
                        <td style={{ padding: "1rem", fontWeight: "600", color: "#43e97b" }}>
                          +{formatCurrency(tx.amount)}
                        </td>
                        <td style={{ padding: "1rem", color: "rgba(255, 255, 255, 0.7)" }}>
                          {formatCurrency(tx.balanceBefore)}
                        </td>
                        <td style={{ padding: "1rem", color: "rgba(255, 255, 255, 0.7)" }}>
                          {formatCurrency(tx.balanceAfter)}
                        </td>
                        <td style={{ padding: "1rem" }}>
                          <span style={{
                            padding: "0.25rem 0.75rem",
                            borderRadius: "15px",
                            fontSize: "0.8rem",
                            backgroundColor: `${getStatusColor(tx.status)}20`,
                            color: getStatusColor(tx.status),
                          }}>
                            {tx.status || "N/A"}
                          </span>
                        </td>
                        <td style={{ padding: "1rem", fontSize: "0.9rem", color: "rgba(255, 255, 255, 0.7)" }}>
                          {formatDate(tx.completedAt || tx.createdAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Pagination
                currentPage={rechargePage}
                totalPages={totalPages}
                onPageChange={setRechargePage}
              />
            </>
          )}
        </div>
      </div>
    );
  };

  const renderTransactionHistory = () => {
    const totalPages = Math.ceil(transactionHistory.length / itemsPerPage);
    const startIndex = (transactionPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentData = transactionHistory.slice(startIndex, endIndex);

    return (
      <div>
        <div style={{
          background: "rgba(255, 255, 255, 0.05)",
          padding: "1.5rem",
          borderRadius: "15px",
          border: "1px solid rgba(255, 255, 255, 0.1)",
        }}>
          <h3 style={{ marginBottom: "1rem", color: "white" }}>
            Lịch sử giao dịch mua gói ({transactionHistory.length} giao dịch)
          </h3>
          {transactionHistory.length === 0 ? (
            <p style={{ color: "rgba(255, 255, 255, 0.7)", textAlign: "center", padding: "2rem" }}>
              Chưa có giao dịch mua gói
            </p>
          ) : (
            <>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", color: "white" }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.1)" }}>
                      <th style={{ padding: "1rem", textAlign: "left" }}>Mã GD</th>
                      <th style={{ padding: "1rem", textAlign: "left" }}>Số tiền</th>
                      <th style={{ padding: "1rem", textAlign: "left" }}>Phương thức</th>
                      <th style={{ padding: "1rem", textAlign: "left" }}>Trạng thái</th>
                      <th style={{ padding: "1rem", textAlign: "left" }}>Ngày thanh toán</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentData.map((tx) => (
                      <tr key={tx.id} style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.05)" }}>
                        <td style={{ padding: "1rem" }}>#{tx.transactionCode}</td>
                        <td style={{ padding: "1rem", fontWeight: "600", color: "#43e97b" }}>
                          {formatCurrency(tx.amount)}
                        </td>
                        <td style={{ padding: "1rem" }}>{tx.paymentMethod || "N/A"}</td>
                        <td style={{ padding: "1rem" }}>
                          <span style={{
                            padding: "0.25rem 0.75rem",
                            borderRadius: "15px",
                            fontSize: "0.8rem",
                            backgroundColor: `${getStatusColor(tx.status)}20`,
                            color: getStatusColor(tx.status),
                          }}>
                            {tx.status || "N/A"}
                          </span>
                        </td>
                        <td style={{ padding: "1rem", fontSize: "0.9rem", color: "rgba(255, 255, 255, 0.7)" }}>
                          {formatDate(tx.paymentDate || tx.createdAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Pagination
                currentPage={transactionPage}
                totalPages={totalPages}
                onPageChange={setTransactionPage}
              />
            </>
          )}
        </div>
      </div>
    );
  };

  const renderUserDetail = () => (
    <div>
      <div style={{
        background: "rgba(255, 255, 255, 0.05)",
        padding: "1.5rem",
        borderRadius: "15px",
        border: "1px solid rgba(255, 255, 255, 0.1)",
        marginBottom: "1.5rem",
      }}>
        <h3 style={{ marginBottom: "1rem", color: "white" }}>Xem chi tiết user</h3>
        <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
          <input
            type="number"
            placeholder="Nhập User ID"
            value={selectedUserId}
            onChange={(e) => setSelectedUserId(e.target.value)}
            style={{
              padding: "0.75rem 1rem",
              border: "2px solid rgba(255, 255, 255, 0.2)",
              borderRadius: "10px",
              fontSize: "1rem",
              width: "300px",
              background: "rgba(255, 255, 255, 0.1)",
              color: "white",
              backdropFilter: "blur(10px)",
            }}
          />
          <button
            onClick={() => {
              if (selectedUserId) {
                setActiveView("user-detail");
                loadData();
              } else {
                alert("Vui lòng nhập User ID");
              }
            }}
            style={{
              padding: "0.75rem 1.5rem",
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              border: "none",
              borderRadius: "10px",
              color: "white",
              cursor: "pointer",
              fontWeight: "600",
            }}
          >
            Xem
          </button>
        </div>
      </div>

      {selectedUserId && (
        <>
          {/* User Wallet Transactions */}
          <div style={{
            background: "rgba(255, 255, 255, 0.05)",
            padding: "1.5rem",
            borderRadius: "15px",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            marginBottom: "1.5rem",
          }}>
            <h3 style={{ marginBottom: "1rem", color: "white" }}>
              Giao dịch ví của user #{selectedUserId} ({userWalletTransactions.length} giao dịch)
            </h3>
            {userWalletTransactions.length === 0 ? (
              <p style={{ color: "rgba(255, 255, 255, 0.7)", textAlign: "center", padding: "2rem" }}>
                Chưa có giao dịch ví
              </p>
            ) : (
              <>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", color: "white" }}>
                    <thead>
                      <tr style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.1)" }}>
                        <th style={{ padding: "1rem", textAlign: "left" }}>Mã GD</th>
                        <th style={{ padding: "1rem", textAlign: "left" }}>Loại</th>
                        <th style={{ padding: "1rem", textAlign: "left" }}>Số tiền</th>
                        <th style={{ padding: "1rem", textAlign: "left" }}>Trạng thái</th>
                        <th style={{ padding: "1rem", textAlign: "left" }}>Ngày tạo</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(() => {
                        const totalPages = Math.ceil(userWalletTransactions.length / itemsPerPage);
                        const startIndex = (userWalletPage - 1) * itemsPerPage;
                        const endIndex = startIndex + itemsPerPage;
                        const currentData = userWalletTransactions.slice(startIndex, endIndex);
                        
                        return currentData.map((tx) => (
                          <tr key={tx.id} style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.05)" }}>
                            <td style={{ padding: "1rem" }}>#{tx.transactionCode}</td>
                            <td style={{ padding: "1rem" }}>{tx.typeWalletTraction || "N/A"}</td>
                            <td style={{ padding: "1rem", fontWeight: "600", color: "#43e97b" }}>
                              {formatCurrency(tx.amount)}
                            </td>
                            <td style={{ padding: "1rem" }}>
                              <span style={{
                                padding: "0.25rem 0.75rem",
                                borderRadius: "15px",
                                fontSize: "0.8rem",
                                backgroundColor: `${getStatusColor(tx.status)}20`,
                                color: getStatusColor(tx.status),
                              }}>
                                {tx.status || "N/A"}
                              </span>
                            </td>
                            <td style={{ padding: "1rem", fontSize: "0.9rem", color: "rgba(255, 255, 255, 0.7)" }}>
                              {formatDate(tx.createdAt)}
                            </td>
                          </tr>
                        ));
                      })()}
                    </tbody>
                  </table>
                </div>
                <Pagination
                  currentPage={userWalletPage}
                  totalPages={Math.ceil(userWalletTransactions.length / itemsPerPage)}
                  onPageChange={setUserWalletPage}
                />
              </>
            )}
          </div>

          {/* User Transactions */}
          <div style={{
            background: "rgba(255, 255, 255, 0.05)",
            padding: "1.5rem",
            borderRadius: "15px",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            marginBottom: "1.5rem",
          }}>
            <h3 style={{ marginBottom: "1rem", color: "white" }}>
              Giao dịch mua gói của user #{selectedUserId} ({userTransactions.length} giao dịch)
            </h3>
            {userTransactions.length === 0 ? (
              <p style={{ color: "rgba(255, 255, 255, 0.7)", textAlign: "center", padding: "2rem" }}>
                Chưa có giao dịch mua gói
              </p>
            ) : (
              <>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", color: "white" }}>
                    <thead>
                      <tr style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.1)" }}>
                        <th style={{ padding: "1rem", textAlign: "left" }}>Mã GD</th>
                        <th style={{ padding: "1rem", textAlign: "left" }}>Số tiền</th>
                        <th style={{ padding: "1rem", textAlign: "left" }}>Trạng thái</th>
                        <th style={{ padding: "1rem", textAlign: "left" }}>Ngày thanh toán</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(() => {
                        const totalPages = Math.ceil(userTransactions.length / itemsPerPage);
                        const startIndex = (userTransactionPage - 1) * itemsPerPage;
                        const endIndex = startIndex + itemsPerPage;
                        const currentData = userTransactions.slice(startIndex, endIndex);
                        
                        return currentData.map((tx) => (
                          <tr key={tx.id} style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.05)" }}>
                            <td style={{ padding: "1rem" }}>#{tx.transactionCode}</td>
                            <td style={{ padding: "1rem", fontWeight: "600", color: "#43e97b" }}>
                              {formatCurrency(tx.amount)}
                            </td>
                            <td style={{ padding: "1rem" }}>
                              <span style={{
                                padding: "0.25rem 0.75rem",
                                borderRadius: "15px",
                                fontSize: "0.8rem",
                                backgroundColor: `${getStatusColor(tx.status)}20`,
                                color: getStatusColor(tx.status),
                              }}>
                                {tx.status || "N/A"}
                              </span>
                            </td>
                            <td style={{ padding: "1rem", fontSize: "0.9rem", color: "rgba(255, 255, 255, 0.7)" }}>
                              {formatDate(tx.paymentDate || tx.createdAt)}
                            </td>
                          </tr>
                        ));
                      })()}
                    </tbody>
                  </table>
                </div>
                <Pagination
                  currentPage={userTransactionPage}
                  totalPages={Math.ceil(userTransactions.length / itemsPerPage)}
                  onPageChange={setUserTransactionPage}
                />
              </>
            )}
          </div>

          {/* User Packages */}
          <div style={{
            background: "rgba(255, 255, 255, 0.05)",
            padding: "1.5rem",
            borderRadius: "15px",
            border: "1px solid rgba(255, 255, 255, 0.1)",
          }}>
            <h3 style={{ marginBottom: "1rem", color: "white" }}>
              Gói đã mua của user #{selectedUserId} ({userPackages.length} gói)
            </h3>
            {userPackages.length === 0 ? (
              <p style={{ color: "rgba(255, 255, 255, 0.7)", textAlign: "center", padding: "2rem" }}>
                Chưa có gói nào
              </p>
            ) : (
              <>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", color: "white" }}>
                    <thead>
                      <tr style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.1)" }}>
                        <th style={{ padding: "1rem", textAlign: "left" }}>Tên gói</th>
                        <th style={{ padding: "1rem", textAlign: "left" }}>Bắt đầu</th>
                        <th style={{ padding: "1rem", textAlign: "left" }}>Kết thúc</th>
                        <th style={{ padding: "1rem", textAlign: "left" }}>Lượt đăng còn lại</th>
                        <th style={{ padding: "1rem", textAlign: "left" }}>Trạng thái</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(() => {
                        const totalPages = Math.ceil(userPackages.length / itemsPerPage);
                        const startIndex = (userPackagePage - 1) * itemsPerPage;
                        const endIndex = startIndex + itemsPerPage;
                        const currentData = userPackages.slice(startIndex, endIndex);
                        
                        return currentData.map((pkg) => (
                          <tr key={pkg.id} style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.05)" }}>
                            <td style={{ padding: "1rem" }}>{pkg.postingPackage?.name || "N/A"}</td>
                            <td style={{ padding: "1rem", fontSize: "0.9rem", color: "rgba(255, 255, 255, 0.7)" }}>
                              {formatDate(pkg.startTime)}
                            </td>
                            <td style={{ padding: "1rem", fontSize: "0.9rem", color: "rgba(255, 255, 255, 0.7)" }}>
                              {formatDate(pkg.endTime)}
                            </td>
                            <td style={{ padding: "1rem", fontWeight: "600" }}>
                              {pkg.postPossible || 0}
                            </td>
                            <td style={{ padding: "1rem" }}>
                              <span style={{
                                padding: "0.25rem 0.75rem",
                                borderRadius: "15px",
                                fontSize: "0.8rem",
                                backgroundColor: pkg.active ? "#43e97b20" : "#dc354520",
                                color: pkg.active ? "#43e97b" : "#dc3545",
                              }}>
                                {pkg.active ? "Hoạt động" : "Hết hạn"}
                              </span>
                            </td>
                          </tr>
                        ));
                      })()}
                    </tbody>
                  </table>
                </div>
                <Pagination
                  currentPage={userPackagePage}
                  totalPages={Math.ceil(userPackages.length / itemsPerPage)}
                  onPageChange={setUserPackagePage}
                />
              </>
            )}
          </div>
        </>
      )}
    </div>
  );

  return (
    <div>
      {/* Tabs Navigation */}
      <div style={{
        display: "flex",
        gap: "0.5rem",
        marginBottom: "2rem",
        flexWrap: "wrap",
      }}>
        {[
          { id: "overview", label: "Tổng quan", icon: <TrendingUp size={18} /> },
          { id: "all-wallet", label: "Tất cả giao dịch ví", icon: <Wallet size={18} /> },
          { id: "recharge", label: "Nạp tiền", icon: <CreditCard size={18} /> },
          { id: "transactions", label: "Giao dịch mua gói", icon: <Package size={18} /> },
          { id: "user-detail", label: "Chi tiết user", icon: <Users size={18} /> },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveView(tab.id)}
            style={{
              padding: "0.75rem 1.5rem",
              border: "none",
              borderRadius: "10px",
              background: activeView === tab.id
                ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                : "rgba(255, 255, 255, 0.1)",
              color: "white",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              fontWeight: activeView === tab.id ? "600" : "400",
              transition: "all 0.3s ease",
            }}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
        
        <button
          onClick={loadData}
          disabled={loading}
          style={{
            padding: "0.75rem 1.5rem",
            border: "1px solid rgba(255, 255, 255, 0.2)",
            borderRadius: "10px",
            background: "rgba(255, 255, 255, 0.1)",
            color: "white",
            cursor: loading ? "not-allowed" : "pointer",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            marginLeft: "auto",
            opacity: loading ? 0.6 : 1,
          }}
        >
          <RefreshCw size={18} style={{ animation: loading ? "spin 1s linear infinite" : "none" }} />
          Làm mới
        </button>
      </div>

      {/* Loading State */}
      {loading && (
        <div style={{ textAlign: "center", padding: "3rem", color: "rgba(255, 255, 255, 0.7)" }}>
          <RefreshCw size={32} style={{ animation: "spin 1s linear infinite", marginBottom: "1rem" }} />
          <p>Đang tải dữ liệu...</p>
        </div>
      )}

      {/* Content */}
      {!loading && (
        <>
          {activeView === "overview" && renderOverview()}
          {activeView === "all-wallet" && renderWalletTransactions()}
          {activeView === "recharge" && renderRechargeTransactions()}
          {activeView === "transactions" && renderTransactionHistory()}
          {activeView === "user-detail" && renderUserDetail()}
        </>
      )}

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default RevenueTab;

