package com.example.backend.service;

import com.example.backend.config.Config;
import com.example.backend.dto.response.ContractResponse;
import com.example.backend.entity.Contract;
import com.example.backend.enums.ContractStatus;
import com.example.backend.enums.EscrowStatus;
import com.example.backend.enums.PaymentMethod;
import com.example.backend.enums.TransactionStatus;
import com.example.backend.enums.WalletTransactionType;
import com.example.backend.entity.OrderEscrow;
import com.example.backend.entity.Transaction;
import com.example.backend.entity.WalletTransaction;
import com.example.backend.exception.AppException;
import com.example.backend.exception.ErrorCode;
import com.example.backend.repository.WalletRepository;
import com.example.backend.repository.WalletTransactionRepository;
import com.example.backend.repository.TransactionRepository;
import com.example.backend.repository.OrderRespository;
import com.example.backend.repository.OrderEscrowRepository;
import com.example.backend.mapper.ContractMapper;
import com.example.backend.repository.ContractRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import com.example.backend.repository.ComplaintRepository;
import com.example.backend.entity.Complaint;
import com.example.backend.enums.ComplaintStatus;
import java.util.Optional;
import com.example.backend.service.MailService;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import com.example.backend.entity.User;
import com.example.backend.entity.Product;
import com.example.backend.entity.Wallet;

@Slf4j
@Service
@RequiredArgsConstructor
public class ConstractService {
    private final ContractRepository contractRepository;
    private final ContractMapper contractMapper;
    private final WalletRepository walletRepository;
    private final TransactionRepository transactionRepository;
    private final WalletTransactionRepository walletTransactionRepository;
    private final OrderRespository orderRespository;
    private final OrderEscrowRepository orderEscrowRepository;
    private final MailService mailService;
    private final ComplaintRepository complaintRepository;

    public List<ContractResponse> getContractUserInvolved(Long userId) {
        List<Contract> list = contractRepository.findAllByUserInvolved(userId);
        return contractMapper.toContractResponseList(list);
    }

    public List<ContractResponse> getContractUserCancelled(Long userId) {
        List<Contract> list = contractRepository.findAllConstractByStatus(userId, ContractStatus.CANCELLED);
        return contractMapper.toContractResponseList(list);
    }

    public List<ContractResponse> getContractUserPending(Long userId) {
        List<Contract> list = contractRepository.findAllConstractByStatus(userId, ContractStatus.PENDING);
        return contractMapper.toContractResponseList(list);
    }

    public List<ContractResponse> getContractUserSign(Long userId) {
        List<Contract> list = contractRepository.findAllConstractByStatus(userId, ContractStatus.SIGNED);
        return contractMapper.toContractResponseList(list);
    }

    public boolean payContractAfterSigned(Long contractId) {
        // FIND contract và validate trạng thái
        Contract contract = contractRepository.findById(contractId).orElseThrow(() -> new AppException(ErrorCode.CONTRACT_BUID_FALID));

        // Chỉ cho phép khi đã signed và chưa thanh toán
        if (contract.getStatus() != ContractStatus.SIGNED || Boolean.TRUE.equals(contract.getPaymentCompleted())) return false;

        // Lấy order và số tiền cần thanh toán
        var order = contract.getOrder();
        var amount = contract.getAgreedPrice();
        var buyer = contract.getBuyer();
        // Tìm ví buyer
        var walletOpt = walletRepository.findByUserId(buyer.getId());
        if (walletOpt.isEmpty()) return false;
        var wallet = walletOpt.get();
        if (wallet.getBalance().compareTo(amount) < 0) {
            Transaction transactionInvalid = Transaction.builder()
                    .user(buyer)
                    .wallet(wallet)
                    .amount(amount)
                    .paymentMethod(PaymentMethod.WALLET)
                    .status(TransactionStatus.FAILED)
                    .description("Thanh toán đơn hàng escrow cho hợp đồng thất bại")
                    .paymentDate(LocalDateTime.now())
                    .isWalletPayment(true)
                    .transactionCode(Config.getRandomNumber(8))
                    .build();
            transactionRepository.save(transactionInvalid);
             // không đủ tiền
            throw new AppException(ErrorCode.BUY_ORDER_FALID);
        }

        // Trừ tiền ví
        var balanceBefore = wallet.getBalance();
        wallet.setBalance(balanceBefore.subtract(amount));
        walletRepository.save(wallet);

        // Tạo transaction
        Transaction transaction = Transaction.builder()
                .user(buyer)
                .wallet(wallet)
                .amount(amount)
                .paymentMethod(PaymentMethod.WALLET)
                .transactionCode(Config.getRandomNumber(8))
                .status(TransactionStatus.COMPLETED)
                .description("Thanh toán đơn hàng escrow cho hợp đồng đã ký")
                .paymentDate(LocalDateTime.now())

                .isWalletPayment(true)
                .build();
        transactionRepository.save(transaction);
        
        // Tạo walletTransaction
        WalletTransaction walletTransaction = WalletTransaction.builder()
                .wallet(wallet)

                .typeWalletTraction(WalletTransactionType.PAYMENT_PRODUCT)
                .amount(amount)
                .balanceBefore(balanceBefore)
                .transactionCode(Config.getRandomNumber(8))
                .balanceAfter(wallet.getBalance())
                .description("Trừ ví, thanh toán escrow cho đơn hàng")
                .status("COMPLETED")
                .referenceTransaction(transaction)
                .completedAt(java.time.LocalDateTime.now())
                .build();
        walletTransactionRepository.save(walletTransaction);

        // Tạo OrderEscrow
        OrderEscrow orderEscrow = OrderEscrow.builder()
                .order(order)
                .status(EscrowStatus.AWAIT_CONFIRM)
                .holdStartTime(LocalDateTime.now())
                .build();
        order.setOrderEscrow(orderEscrow);
        orderEscrowRepository.save(orderEscrow);

        // Cập nhật contract
        contract.setPaymentCompleted(true);
        contract.setTransaction(transaction);
        contractRepository.save(contract);
        return true;
    }

    public List<ContractResponse> getAllContracts() {
        List<Contract> contracts = contractRepository.findAll();
        return contractMapper.toContractResponseList(contracts);
    }

    /**
     * Buyer confirms receipt of order - release escrow and mark deliveryCompleted
     */
    @Transactional
    public boolean handleBuyerConfirmReceived(Long orderId) {
        var order = orderRespository.findById(orderId).orElseThrow(() -> new AppException(ErrorCode.ORDER_NOT_FOUND));
        User buyer = order.getBuyer();
       if(buyer == null){
           throw new AppException(ErrorCode.USER_NOT_FOUND);
       }
        var escrow = order.getOrderEscrow();
        if (escrow == null || !escrow.getStatus().equals(EscrowStatus.AWAIT_CONFIRM)) {
            throw new AppException(ErrorCode.INVALID_ORDER_ESCROW_STATUS);
        }
        // Update escrow status
        escrow.setStatus(EscrowStatus.HELD);
        escrow.setUserConfirmedTime(LocalDateTime.now());

        escrow.setExpectedReleaseTime(LocalDateTime.now().plusDays(3));
        orderEscrowRepository.save(escrow);
        // Update contract (deliveryCompleted)
        var contracts = order.getContracts();
        for(var contract : contracts) {
            if(contract.getStatus() == ContractStatus.COMPLETED) {
                contract.setDeliveryCompleted(true);
                contract.setCompletedAt(LocalDateTime.now());
                contractRepository.save(contract);
            }
        }
        return true;
    }

    /**
     * Seller cancel signed contract if not paid after 3 days
     */
    @Transactional
    public void cancelContractBySeller(Long contractId, Long sellerId) {
        Contract contract = contractRepository.findById(contractId)
            .orElseThrow(() -> new AppException(ErrorCode.CONTRACT_NOT_FOUND));
        if (!java.util.Objects.equals(contract.getSeller().getId(), sellerId)) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }
        if (contract.getStatus() != ContractStatus.SIGNED) {
            throw new AppException(ErrorCode.CONTRACT_NOT_VALID);
        }
        if (Boolean.TRUE.equals(contract.getPaymentCompleted())) {
            throw new AppException(ErrorCode.CONTRACT_NOT_VALID);
        }
        if (contract.getSignedAt() == null || contract.getSignedAt().plusDays(3).isAfter(java.time.LocalDateTime.now())) {
            throw new AppException(ErrorCode.CONTRACT_NOT_VALID);
        }
        contract.setStatus(ContractStatus.CANCELLED);
        contractRepository.save(contract);
        // Gửi template mới cho buyer (seller-cancel)
        try {
            mailService.sendContractCancelDueToPaymentOverdue(contract.getBuyer().getEmail(), contract);
            mailService.sendContractCancelNotification(contract.getSeller().getEmail(), contract); // Có thể vẫn giữ thông báo này cho seller
        } catch (Exception e) {
            // do nothing if mail fail
        }
    }

    @Transactional
    public void cancelPendingContractBySeller(Long contractId, Long sellerId) {
        Contract contract = contractRepository.findById(contractId)
            .orElseThrow(() -> new AppException(ErrorCode.CONTRACT_NOT_FOUND));
        if (!java.util.Objects.equals(contract.getSeller().getId(), sellerId)) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }
        if (!Boolean.TRUE.equals(contract.getSellerSigned())
            || Boolean.TRUE.equals(contract.getBuyerSigned())
            || contract.getStatus() != ContractStatus.PENDING
            || contract.getUpdatedAt() == null
            || contract.getUpdatedAt().plusDays(3).isAfter(java.time.LocalDateTime.now())
        ) {
            throw new AppException(ErrorCode.CONTRACT_NOT_VALID);
        }
        contract.setStatus(ContractStatus.CANCELLED);
        contractRepository.save(contract);
        // Gửi template email seller huỷ hợp đồng (dùng lại cancel contract logic)
        try {
            mailService.sendContractCancelDueToPaymentOverdue(contract.getBuyer().getEmail(), contract);
            mailService.sendContractCancelNotification(contract.getSeller().getEmail(), contract);
        } catch (Exception e) {
            // ignore email failure
        }
    }

    // Gửi email nhắc nhở các hợp đồng đã ký quá 3 ngày chưa thanh toán
    public void notifySignedContractUnpaid() {
        List<Contract> unpaidContracts = contractRepository.findAll();
        LocalDateTime now = LocalDateTime.now();
        for (Contract contract : unpaidContracts) {
            if (contract.getStatus().name().equalsIgnoreCase(ContractStatus.SIGNED.name())
                && !Boolean.TRUE.equals(contract.getPaymentCompleted())
                && contract.getSignedAt() != null
                && contract.getSignedAt().plusDays(3).isBefore(now)
                &&  !contract.isPostEmail()
                ) {
                // Gửi email cho buyer và seller
                User buyer = contract.getBuyer();
                User seller = contract.getSeller();
                Product product = contract.getProduct();
                String subject = "[Thông báo] Hợp đồng đã ký #" + contract.getId() + " chưa được thanh toán";
                try {
                    log.warn("đã gửi email");
                    contract.setPostEmail(true);
                    contractRepository.save(contract);
                    mailService.sendContractUnpaidNotification(buyer.getEmail(), subject, contract, product);
                    mailService.sendContractUnpaidNotification(seller.getEmail(), subject, contract, product);
                } catch (Exception e) {
                    // Log lỗi gửi email, không interrupt job
                }
            }
        }
    }
    // Gửi email nhắc nhở các hợp đồng đã seller ký quá 3 ngày mà buyer chưa ký
    public void notifySellerSignedButBuyerNoSign() {
        List<Contract> contracts = contractRepository.findAll();
        LocalDateTime now = LocalDateTime.now();
        for (Contract contract : contracts) {
            // Điều kiện: chỉ seller đã ký, buyer chưa ký, chưa bị huỷ, quá 3 ngày, chưa gửi email
            if (Boolean.TRUE.equals(contract.getSellerSigned())
                    && !Boolean.TRUE.equals(contract.getBuyerSigned())
                    && contract.getStatus() == ContractStatus.PENDING
                    && contract.getUpdatedAt() != null
                    && contract.getUpdatedAt().plusDays(3).isBefore(now)
                    && !contract.isBuyerSignRemindSent()
            ) {
                User buyer = contract.getBuyer();
                Product product = contract.getProduct();
                String subject = "[Thông báo] Hợp đồng #" + contract.getId() + " chưa được ký bởi bạn";
                try {
                    contract.setBuyerSignRemindSent(true);
                    contractRepository.save(contract);
                    mailService.sendContractNeedBuyerSignNotification(buyer.getEmail(), subject, contract, product);
                } catch (Exception e) {
                    // log lỗi gửi email
                }
            }
        }
    }
    @Transactional
    @Scheduled(cron = "0 0 13 * * *")
    public void scheduledNotifySignedContractUnpaid() {
        log.warn("da schdule");

        notifySignedContractUnpaid();
    }
    @Transactional
    @Scheduled(cron = "0 10 13 * * *") // chạy sau notifySignedContractUnpaid 10 phút
    public void scheduledNotifySellerSignedButBuyerNoSign(){
        log.warn("Đang kiểm tra các hợp đồng seller đã ký mà buyer chưa ký");
        notifySellerSignedButBuyerNoSign();
    }

    /**
     * Tự động release tiền cho seller dựa trên các điều kiện:
     * 1. Nếu buyer xác nhận -> sau 3 ngày release
     * 2. Nếu buyer quên xác nhận -> dựa vào admin accept + 3 ngày  
     * 3. Nếu có complaint -> chỉ release khi giải quyết xong
     * 4. Complaint seller có lợi -> release cho seller, buyer có lợi -> release cho buyer
     * 5. Sau release -> cập nhật complaint status = CLOSED
     */
    @Transactional
    public void autoReleaseEscrowMoney() {
        List<OrderEscrow> escrows = orderEscrowRepository.findAll();
        LocalDateTime now = LocalDateTime.now();
        
        log.info("Starting auto release escrow money process. Found {} escrows to check", escrows.size());
        
        for (OrderEscrow escrow : escrows) {
            try {
                // Chỉ xử lý escrow đang HELD hoặc ADMIN_APPROVED
                if (escrow.getStatus() != EscrowStatus.HELD && escrow.getStatus() != EscrowStatus.ADMIN_APPROVED) {
                    continue;
                }
                
                log.debug("Processing escrow ID: {}, Status: {}", escrow.getId(), escrow.getStatus());
                
                // Kiểm tra có complaint chưa giải quyết không
                Contract contract = escrow.getOrder().getContracts().get(0); // Giả sử 1 order có 1 contract
                Optional<Complaint> complaintOpt = complaintRepository.findByContract(contract);
                
                if (complaintOpt.isPresent()) {
                    Complaint complaint = complaintOpt.get();
                    log.debug("Found complaint for escrow {}: Status {}", escrow.getId(), complaint.getStatus());
                    
                    // Nếu có complaint chưa giải quyết -> skip
                    if (complaint.getStatus() == ComplaintStatus.PENDING || 
                        complaint.getStatus() == ComplaintStatus.UNDER_REVIEW) {
                        log.debug("Skipping escrow {} due to unresolved complaint", escrow.getId());
                        continue;
                    }
                    
                    // Nếu complaint đã giải quyết -> release theo kết quả
                    if (complaint.getStatus() == ComplaintStatus.RESOLVED_SELLER_FAVOR) {
                        log.info("Releasing money to seller for escrow {} due to complaint resolution in seller's favor", escrow.getId());
                        releaseMoneyToSeller(escrow, contract);
                        complaint.setStatus(ComplaintStatus.CLOSED);
                        complaint.setResolvedAt(now);
                        complaintRepository.save(complaint);
                    } else if (complaint.getStatus() == ComplaintStatus.RESOLVED_BUYER_FAVOR) {
                        log.info("Refunding money to buyer for escrow {} due to complaint resolution in buyer's favor", escrow.getId());
                        refundMoneyToBuyer(escrow, contract);
                        complaint.setStatus(ComplaintStatus.CLOSED);
                        complaint.setResolvedAt(now);
                        complaintRepository.save(complaint);
                    }
                    continue;
                }
                
                // Không có complaint -> kiểm tra điều kiện release thông thường
                boolean shouldRelease = false;
                String releaseReason = "";
                
                // Trường hợp 1: Buyer đã xác nhận -> sau 3 ngày release
                if (escrow.getStatus() == EscrowStatus.HELD && 
                    escrow.getUserConfirmedTime() != null &&
                    escrow.getUserConfirmedTime().plusDays(3).isBefore(now)) {
                    shouldRelease = true;
                    releaseReason = "Buyer confirmed receipt 3 days ago";
                }
                
                // Trường hợp 2: Buyer quên xác nhận -> admin đã accept + 3 ngày
                if (escrow.getStatus() == EscrowStatus.ADMIN_APPROVED && 
                    escrow.getAdminReviewTime() != null &&
                    escrow.getAdminReviewTime().plusDays(3).isBefore(now)) {
                    shouldRelease = true;
                    releaseReason = "Admin approved seller delivery confirmation 3 days ago";
                }
                
                if (shouldRelease) {
                    log.info("Releasing money to seller for escrow {} - Reason: {}", escrow.getId(), releaseReason);
                    releaseMoneyToSeller(escrow, contract);
                } else {
                    log.debug("Escrow {} not ready for release yet", escrow.getId());
                }
                
            } catch (Exception e) {
                log.error("Error processing escrow {}: {}", escrow.getId(), e.getMessage(), e);
            }
        }
        
        log.info("Completed auto release escrow money process");
    }
    
    /**
     * Release tiền cho seller
     */
    private void releaseMoneyToSeller(OrderEscrow escrow, Contract contract) {
        User seller = contract.getSeller();
        BigDecimal amount = contract.getAgreedPrice();
        
        log.info("Starting money release to seller {} for contract {} - Amount: {}", 
                seller.getId(), contract.getId(), amount);
        
        // Cập nhật escrow status
        escrow.setStatus(EscrowStatus.RELEASED);
        escrow.setActualReleaseTime(LocalDateTime.now());
        orderEscrowRepository.save(escrow);
        
        // Cập nhật wallet seller
        Wallet sellerWallet = walletRepository.findByUserId(seller.getId())
            .orElseThrow(() -> new AppException(ErrorCode.WALLET_NOT_EXIST));
        
        BigDecimal balanceBefore = sellerWallet.getBalance();
        sellerWallet.setBalance(balanceBefore.add(amount));
        walletRepository.save(sellerWallet);
        
        log.info("Updated seller wallet balance: {} -> {}", balanceBefore, sellerWallet.getBalance());
        
        // Tạo transaction cho seller
        Transaction transaction = Transaction.builder()
            .user(seller)
            .wallet(sellerWallet)
            .amount(amount)
            .paymentMethod(PaymentMethod.WALLET)
            .transactionCode(Config.getRandomNumber(8))
            .status(TransactionStatus.COMPLETED)
            .description("Nhận tiền từ escrow sau khi giao hàng thành công")
            .paymentDate(LocalDateTime.now())
            .isWalletPayment(true)
            .build();
        transactionRepository.save(transaction);
        
        // Tạo walletTransaction cho seller
        WalletTransaction walletTransaction = WalletTransaction.builder()
            .wallet(sellerWallet)
            .typeWalletTraction(WalletTransactionType.RECEIVE_PAYMENT)
            .amount(amount)
            .balanceBefore(balanceBefore)
            .transactionCode(Config.getRandomNumber(8))
            .balanceAfter(sellerWallet.getBalance())
            .description("Nhận tiền từ escrow")
            .status("COMPLETED")
            .referenceTransaction(transaction)
            .completedAt(LocalDateTime.now())
            .build();
        walletTransactionRepository.save(walletTransaction);
        
        // Gửi email thông báo cho seller
        try {
            mailService.sendEscrowReleaseNotification(seller.getEmail(), contract, amount);
            log.info("Successfully sent escrow release notification email to seller {}", seller.getEmail());
        } catch (Exception e) {
            log.error("Failed to send escrow release notification email to seller {}: {}", 
                     seller.getEmail(), e.getMessage());
        }
        
        log.info("Successfully released {} to seller {} for contract {}", amount, seller.getId(), contract.getId());
    }
    
    /**
     * Refund tiền cho buyer (khi complaint có lợi cho buyer)
     */
    private void refundMoneyToBuyer(OrderEscrow escrow, Contract contract) {
        User buyer = contract.getBuyer();
        BigDecimal amount = contract.getAgreedPrice();
        
        log.info("Starting money refund to buyer {} for contract {} - Amount: {}", 
                buyer.getId(), contract.getId(), amount);
        
        // Cập nhật escrow status
        escrow.setStatus(EscrowStatus.REFUNDED);
        escrow.setActualReleaseTime(LocalDateTime.now());
        orderEscrowRepository.save(escrow);
        
        // Cập nhật wallet buyer
        Wallet buyerWallet = walletRepository.findByUserId(buyer.getId())
            .orElseThrow(() -> new AppException(ErrorCode.WALLET_NOT_EXIST));
        
        BigDecimal balanceBefore = buyerWallet.getBalance();
        buyerWallet.setBalance(balanceBefore.add(amount));
        walletRepository.save(buyerWallet);
        
        log.info("Updated buyer wallet balance: {} -> {}", balanceBefore, buyerWallet.getBalance());
        
        // Tạo transaction cho buyer
        Transaction transaction = Transaction.builder()
            .user(buyer)
            .wallet(buyerWallet)
            .amount(amount)
            .paymentMethod(PaymentMethod.WALLET)
            .transactionCode(Config.getRandomNumber(8))
            .status(TransactionStatus.COMPLETED)
            .description("Hoàn tiền từ escrow do complaint được giải quyết có lợi")
            .paymentDate(LocalDateTime.now())
            .isWalletPayment(true)
            .build();
        transactionRepository.save(transaction);
        
        // Tạo walletTransaction cho buyer
        WalletTransaction walletTransaction = WalletTransaction.builder()
            .wallet(buyerWallet)
            .typeWalletTraction(WalletTransactionType.REFUND)
            .amount(amount)
            .balanceBefore(balanceBefore)
            .transactionCode(Config.getRandomNumber(8))
            .balanceAfter(buyerWallet.getBalance())
            .description("Hoàn tiền từ escrow")
            .status("COMPLETED")
            .referenceTransaction(transaction)
            .completedAt(LocalDateTime.now())
            .build();
        walletTransactionRepository.save(walletTransaction);
        
        // Gửi email thông báo cho buyer
        try {
            mailService.sendEscrowRefundNotification(buyer.getEmail(), contract, amount);
            log.info("Successfully sent escrow refund notification email to buyer {}", buyer.getEmail());
        } catch (Exception e) {
            log.error("Failed to send escrow refund notification email to buyer {}: {}", 
                     buyer.getEmail(), e.getMessage());
        }
        
        log.info("Successfully refunded {} to buyer {} for contract {}", amount, buyer.getId(), contract.getId());
    }
    
    @Scheduled(cron = "0 0 2 * * *") // Chạy lúc 2h sáng hàng ngày
    public void scheduledAutoReleaseEscrowMoney() {
        log.info("Starting scheduled auto release escrow money");
        autoReleaseEscrowMoney();
        log.info("Completed scheduled auto release escrow money");
    }
    
    /**
     * API endpoint để admin có thể gọi thủ công để release escrow money
     * @return số lượng escrow đã được xử lý
     */
    @Transactional
    public int manualReleaseEscrowMoney() {
        log.info("Manual escrow money release triggered by admin");
        List<OrderEscrow> escrows = orderEscrowRepository.findAll();
        int processedCount = 0;
        LocalDateTime now = LocalDateTime.now();
        
        for (OrderEscrow escrow : escrows) {
            try {
                // Chỉ xử lý escrow đang HELD hoặc ADMIN_APPROVED
                if (escrow.getStatus() != EscrowStatus.HELD && escrow.getStatus() != EscrowStatus.ADMIN_APPROVED) {
                    continue;
                }
                
                // Kiểm tra có complaint chưa giải quyết không
                Contract contract = escrow.getOrder().getContracts().get(0);
                Optional<Complaint> complaintOpt = complaintRepository.findByContract(contract);
                
                if (complaintOpt.isPresent()) {
                    Complaint complaint = complaintOpt.get();
                    
                    // Nếu có complaint chưa giải quyết -> skip
                    if (complaint.getStatus() == ComplaintStatus.PENDING || 
                        complaint.getStatus() == ComplaintStatus.UNDER_REVIEW) {
                        continue;
                    }
                    
                    // Nếu complaint đã giải quyết -> release theo kết quả
                    if (complaint.getStatus() == ComplaintStatus.RESOLVED_SELLER_FAVOR) {
                        releaseMoneyToSeller(escrow, contract);
                        complaint.setStatus(ComplaintStatus.CLOSED);
                        complaint.setResolvedAt(now);
                        complaintRepository.save(complaint);
                        processedCount++;
                    } else if (complaint.getStatus() == ComplaintStatus.RESOLVED_BUYER_FAVOR) {
                        refundMoneyToBuyer(escrow, contract);
                        complaint.setStatus(ComplaintStatus.CLOSED);
                        complaint.setResolvedAt(now);
                        complaintRepository.save(complaint);
                        processedCount++;
                    }
                    continue;
                }
                
                // Không có complaint -> kiểm tra điều kiện release thông thường
                boolean shouldRelease = false;
                
                // Trường hợp 1: Buyer đã xác nhận -> sau 3 ngày release
                if (escrow.getStatus() == EscrowStatus.HELD && 
                    escrow.getUserConfirmedTime() != null &&
                    escrow.getUserConfirmedTime().plusDays(3).isBefore(now)) {
                    shouldRelease = true;
                }
                
                // Trường hợp 2: Buyer quên xác nhận -> admin đã accept + 3 ngày
                if (escrow.getStatus() == EscrowStatus.ADMIN_APPROVED && 
                    escrow.getAdminReviewTime() != null &&
                    escrow.getAdminReviewTime().plusDays(3).isBefore(now)) {
                    shouldRelease = true;
                }
                
                if (shouldRelease) {
                    releaseMoneyToSeller(escrow, contract);
                    processedCount++;
                }
                
            } catch (Exception e) {
                log.error("Error processing escrow {}: {}", escrow.getId(), e.getMessage(), e);
            }
        }
        
        log.info("Manual escrow money release completed. Processed {} escrows", processedCount);
        return processedCount;
    }
}
