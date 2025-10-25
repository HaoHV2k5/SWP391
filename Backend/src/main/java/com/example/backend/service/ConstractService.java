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
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

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
                .status(EscrowStatus.HELD)
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
}
