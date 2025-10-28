import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Container, Spinner } from "react-bootstrap";
import MemberHeader from "../../components/member/MemberHeader";
import ContractList from "../../components/contract/ContractList";
import contractService from "../../services/contractService";
import { toast } from "react-toastify";
import "../../styles/member/index.css";

const MemberContracts = ({ user }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [contracts, setContracts] = useState([]);
  const [currentUserId, setCurrentUserId] = useState(null);

  // Load contracts
  const loadContracts = async () => {
    setLoading(true);
    try {
      // Get user ID from user object - Try multiple possible paths
      let userId = user?.userId || user?.user?.id || user?.id;
      
      // If still no userId, try to get from localStorage
      if (!userId) {
        const userDataStr = localStorage.getItem("userData");
        if (userDataStr) {
          try {
            const userData = JSON.parse(userDataStr);
            userId = userData?.id || userData?.user?.id || userData?.userId;
          } catch (e) {
            console.error("Error parsing userData from localStorage:", e);
          }
        }
      }
      
      console.log("🔍 Loading contracts for userId:", userId);
      setCurrentUserId(userId);
      
      if (!userId) {
        console.error("❌ Cannot determine user ID");
        toast.error("Không thể xác định user ID");
        return;
      }

      const result = await contractService.getContractsByUser(userId);
      console.log("📋 Raw API response:", result);
      
      if (result.success && result.data) {
        console.log("📄 First contract structure:", result.data[0]);
        console.log("🔑 All fields in first contract:", Object.keys(result.data[0]));
        
        setContracts(Array.isArray(result.data) ? result.data : []);
        console.log("✅ Total contracts:", result.data?.length || 0);
      } else {
        console.error("❌ Error loading contracts:", result.message);
        toast.error(result.message || "Lấy danh sách hợp đồng thất bại");
        setContracts([]);
      }
    } catch (error) {
      console.error("❌ Error loading contracts:", error);
      toast.error("Có lỗi xảy ra khi tải hợp đồng");
      setContracts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log("=== MemberContracts useEffect ===");
    console.log("MemberContracts - User object:", user);

    if (!user) {
      console.log("No user yet, waiting...");
      setIsCheckingAuth(true);
      const timer = setTimeout(() => {
        console.log("Timeout reached, checking again...");
        if (!user) {
          console.log("Still no user after timeout, redirecting to login");
          navigate("/login");
        }
      }, 1000);

      return () => clearTimeout(timer);
    }

    setIsCheckingAuth(false);

    // Check role
    let userRole = null;
    if (user.user && user.user.role) {
      userRole = user.user.role;
    } else if (user.role) {
      userRole = user.role;
    }

    console.log("Detected user role:", userRole);

    // Members, sellers, and admins can access contracts
    if (!userRole || (userRole !== "member" && userRole !== "ROLE_USER" && userRole !== "ROLE_SELLER" && userRole !== "ROLE_ADMIN")) {
      console.log("User role not allowed:", userRole);
      navigate("/");
      return;
    }

    console.log("Contract access granted");
    
    loadContracts();
  }, [user, navigate]);

  const handlePay = async (contractId) => {
    try {
      const result = await contractService.payContract(contractId);
      if (result.success) {
        toast.success(result.message || "Thanh toán thành công");
        // Reload contracts
        await loadContracts();
      } else {
        toast.error(result.message || "Thanh toán thất bại");
      }
    } catch (error) {
      toast.error("Có lỗi xảy ra khi thanh toán");
    }
  };

  const handleCancel = async (contractId, sellerId) => {
    try {
      console.log("🔍 Starting cancel process...");
      console.log("📋 contractId:", contractId, "Type:", typeof contractId);
      console.log("📋 sellerId:", sellerId, "Type:", typeof sellerId);
      console.log("📋 All contracts:", contracts);
      
      // Find contract - check both id and contractCode
      let contract = contracts.find(c => c.id === contractId);
      
      // If not found by id, try by contractCode
      if (!contract) {
        console.log("⚠️ Not found by id, trying by contractCode...");
        contract = contracts.find(c => c.contractCode === contractId);
      }
      
      if (!contract) {
        console.error("❌ Contract not found. Available contracts:", contracts.map(c => ({ 
          id: c.id, 
          code: c.contractCode,
          allKeys: Object.keys(c)
        })));
        toast.error("Không tìm thấy hợp đồng trong danh sách");
        return;
      }
      
      // Use the actual database ID from the contract object
      const actualContractId = contract.id;
      const actualSellerId = contract.sellerId;
      
      console.log("✅ Contract found:", {
        originalId: contractId,
        actualId: actualContractId,
        code: contract.contractCode,
        status: contract.status,
        sellerId: actualSellerId,
        sellerSigned: contract.sellerSigned,
        buyerSigned: contract.buyerSigned,
        paymentCompleted: contract.paymentCompleted,
        updatedAt: contract.updatedAt,
        createdAt: contract.createdAt
      });
      
      // Check if contract meets backend conditions
      console.log("🔍 Backend validation check:");
      console.log("- sellerSigned = true?", contract.sellerSigned === true);
      console.log("- buyerSigned = false?", contract.buyerSigned === false);
      console.log("- status = PENDING?", contract.status === 'PENDING');
      console.log("- updatedAt exists?", contract.updatedAt != null);
      
      // Calculate days since update
      if (contract.updatedAt) {
        const updatedDate = new Date(contract.updatedAt);
        const now = new Date();
        const daysDiff = Math.floor((now - updatedDate) / (1000 * 60 * 60 * 24));
        console.log("- Days since update:", daysDiff);
        console.log("- Can cancel (3+ days)?", daysDiff >= 3);
      }
      
      // Check if we have valid IDs
      if (!actualContractId) {
        toast.error("Không có ID hợp đồng hợp lệ");
        return;
      }
      
      if (!actualSellerId) {
        toast.error("Không có ID người bán");
        return;
      }
      
      let result;
      
      if (contract.status === 'SIGNED' && !contract.paymentCompleted) {
        console.log("📋 Using cancelContractBySeller");
        
        // Check if 3 days passed since signed
        if (contract.signedAt) {
          const signedDate = new Date(contract.signedAt);
          const now = new Date();
          const daysDiff = Math.floor((now - signedDate) / (1000 * 60 * 60 * 24));
          if (daysDiff < 3) {
            toast.warning(`Cần đợi thêm ${3 - daysDiff} ngày để hủy hợp đồng đã ký`);
            return;
          }
        }
        
        result = await contractService.cancelContractBySeller(actualContractId, actualSellerId);
      } else if (contract.status === 'PENDING' && contract.sellerSigned && !contract.buyerSigned) {
        console.log("📋 Using cancelPendingContractBySeller");
        
        // Check if 3 days passed since seller signed
        // Use updatedAt if available, otherwise use createdAt
        const dateToCheck = contract.updatedAt || contract.createdAt || contract.signedAt;
        
        if (dateToCheck) {
          const date = new Date(dateToCheck);
          const now = new Date();
          const daysDiff = Math.floor((now - date) / (1000 * 60 * 60 * 24));
          console.log("📊 Days since seller signed:", daysDiff);
          console.log("📅 Date used:", dateToCheck);
          
          if (daysDiff < 3) {
            toast.warning(`Cần đợi thêm ${3 - daysDiff} ngày (để người mua có thời gian ký hợp đồng)`);
            return;
          }
          
          // Proceed to cancel
          result = await contractService.cancelPendingContractBySeller(actualContractId, actualSellerId);
        } else {
          console.log("⚠️ No date available, trying to cancel anyway...");
          // Try anyway - backend will handle validation
          result = await contractService.cancelPendingContractBySeller(actualContractId, actualSellerId);
        }
      } else {
        console.log("❌ Cannot cancel this contract. Status:", contract.status, 
          "sellerSigned:", contract.sellerSigned, "buyerSigned:", contract.buyerSigned);
        
        let errorMsg = "Không thể hủy hợp đồng: ";
        if (contract.status !== 'PENDING' && contract.status !== 'SIGNED') {
          errorMsg += "Trạng thái không hợp lệ";
        } else if (!contract.sellerSigned) {
          errorMsg += "Bạn chưa ký hợp đồng";
        } else if (contract.buyerSigned) {
          errorMsg += "Người mua đã ký, không thể hủy";
        }
        
        toast.error(errorMsg);
        return;
      }
      
      console.log("📊 Result:", result);
      
      if (result && result.success) {
        toast.success(result.message || "Hủy hợp đồng thành công");
        await loadContracts();
      } else if (result) {
        toast.error(result.message || "Hủy hợp đồng thất bại");
      }
    } catch (error) {
      console.error("❌ Error cancelling contract:", error);
      toast.error("Có lỗi xảy ra khi hủy hợp đồng: " + (error.message || "Unknown error"));
    }
  };

  if (isCheckingAuth) {
    return (
      <Container fluid className="d-flex justify-content-center align-items-center" style={{ minHeight: "100vh" }}>
        <div className="text-center">
          <Spinner animation="border" variant="success" className="mb-3" />
          <p className="text-muted">Đang kiểm tra quyền truy cập...</p>
        </div>
      </Container>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <Container fluid className="p-0 bg-light" style={{ minHeight: "100vh" }}>
      <div className="p-4">
        <MemberHeader activeTab="contracts" />
        
        {loading ? (
          <div className="text-center py-5">
            <Spinner animation="border" variant="success" className="mb-3" />
            <p className="text-muted">Đang tải hợp đồng...</p>
          </div>
        ) : (
        <ContractList
          contracts={contracts}
          onPay={handlePay}
          currentUserId={currentUserId}
        />
        )}
      </div>
    </Container>
  );
};

export default MemberContracts;

