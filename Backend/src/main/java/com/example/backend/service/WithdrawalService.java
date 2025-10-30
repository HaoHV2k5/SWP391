package com.example.backend.service;

import com.example.backend.config.Config;
import com.example.backend.dto.request.WithdrawalRequest;
import com.example.backend.dto.response.WithdrawalResponse;
import com.example.backend.entity.Wallet;
import com.example.backend.entity.WalletTransaction;
import com.example.backend.enums.WalletTransactionStatus;
import com.example.backend.enums.WalletTransactionType;
import com.example.backend.exception.AppException;
import com.example.backend.exception.ErrorCode;
import com.example.backend.repository.UserRepository;
import com.example.backend.repository.WalletRepository;
import com.example.backend.repository.WalletTransactionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class WithdrawalService {

    private final WalletRepository walletRepository;
    private final WalletTransactionRepository walletTransactionRepository;
    private final UserRepository userRepository;

    /**
     * Tạo yêu cầu rút tiền cho người dùng
     */
    @Transactional
    public WithdrawalResponse createWithdrawalRequest(Long userId, WithdrawalRequest request) {
        // Kiểm tra người dùng tồn tại
        userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        // Kiểm tra ví tồn tại
        Wallet wallet = walletRepository.findByUserId(userId)
                .orElseThrow(() -> new AppException(ErrorCode.WALLET_NOT_EXIST));

        // Kiểm tra ví có đủ số dư không
        if (wallet.getBalance().compareTo(request.getAmount()) < 0) {
            throw new AppException(ErrorCode.INSUFFICIENT_BALANCE);
        }

        // Kiểm tra ví có đang hoạt động không
        if (!wallet.getIsActive()) {
            throw new AppException(ErrorCode.WALLET_INACTIVE);
        }

        // Tạo mã giao dịch
        String transactionCode = generateTransactionCode();

        // Tạo giao dịch rút tiền
        WalletTransaction withdrawalTransaction = WalletTransaction.builder()
                .transactionCode(transactionCode)
                .wallet(wallet)
                .typeWalletTraction(WalletTransactionType.WITHDRAWAL)
                .amount(request.getAmount())
                .balanceBefore(wallet.getBalance())
                .balanceAfter(wallet.getBalance().subtract(request.getAmount()))
                .description("Yêu cầu rút tiền")
                .status(WalletTransactionStatus.PENDING.name())
                .bankInfo(request.getBankInfo())
                .accountNumber(request.getAccountNumber())
                .accountHolderName(request.getAccountHolderName())
                .build();

        // Lưu giao dịch
        WalletTransaction savedTransaction = walletTransactionRepository.save(withdrawalTransaction);

        log.info("Tạo yêu cầu rút tiền thành công cho user {} với số tiền {}", userId, request.getAmount());

        return mapToWithdrawalResponse(savedTransaction);
    }

    /**
     * Xác nhận yêu cầu rút tiền (chỉ admin)
     */
    @Transactional
    public WithdrawalResponse confirmWithdrawal(Long withdrawalId, Long adminId) {

        // Kiểm tra admin
        userRepository.findById(adminId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        // Kiểm tra quyền admin (có thể thêm logic kiểm tra role)
        // if (!admin.getRoles().contains("ADMIN")) {
        //     throw new AppException(ErrorCode.ACCESS_DENIED);
        // }

        // Tìm giao dịch rút tiền
        WalletTransaction withdrawalTransaction = walletTransactionRepository.findById(withdrawalId)
                .orElseThrow(() -> new AppException(ErrorCode.TRANSACTION_NOT_FOUND));

        // Kiểm tra loại giao dịch
        if (withdrawalTransaction.getTypeWalletTraction() != WalletTransactionType.WITHDRAWAL) {
            throw new AppException(ErrorCode.INVALID_TRANSACTION_TYPE);
        }

        // Kiểm tra trạng thái
        if (!WalletTransactionStatus.PENDING.name().equals(withdrawalTransaction.getStatus())) {
            throw new AppException(ErrorCode.TRANSACTION_ALREADY_PROCESSED);
        }

        // Cập nhật số dư ví
        Wallet wallet = withdrawalTransaction.getWallet();
        wallet.setBalance(wallet.getBalance().subtract(withdrawalTransaction.getAmount()));
        wallet.setLastTransactionAt(LocalDateTime.now());
        walletRepository.save(wallet);
        // Cập nhật trạng thái giao dịch
        withdrawalTransaction.setStatus(WalletTransactionStatus.COMPLETED.name());
        withdrawalTransaction.setCompletedAt(LocalDateTime.now());
        withdrawalTransaction.setBalanceAfter(wallet.getBalance());
        walletTransactionRepository.save(withdrawalTransaction);



        // cập nhật ví admin sau khi xác nhận rút tiền
        Wallet walletAdmin = walletRepository.findById(1L).orElseThrow(() -> new AppException(ErrorCode.WALLET_NOT_EXIST));
        BigDecimal adminBalanceBefore = walletAdmin.getBalance();
        walletAdmin.setBalance(walletAdmin.getBalance().subtract(withdrawalTransaction.getAmount()));
        walletRepository.save(walletAdmin);

        // tạo wallet transaction admin

        WalletTransaction walletAdminTransaction = WalletTransaction.builder()
                .transactionCode(Config.getRandomNumber(8))
                .wallet(walletAdmin)
                .typeWalletTraction(WalletTransactionType.WITHDRAWAL)
                .amount(withdrawalTransaction.getAmount())
                .balanceBefore(adminBalanceBefore)
                .balanceAfter(walletAdmin.getBalance())
                .description("Yêu cầu rút tiền")
                .status(WalletTransactionStatus.COMPLETED.name())
                .completedAt(LocalDateTime.now())
                .build();
        walletTransactionRepository.save(walletAdminTransaction);



        log.info("Xác nhận rút tiền thành công cho transaction {}", withdrawalId);

        return mapToWithdrawalResponse(withdrawalTransaction);
    }

    /**
     * Từ chối yêu cầu rút tiền (chỉ admin)
     */
    @Transactional
    public WithdrawalResponse rejectWithdrawal(Long withdrawalId, Long adminId, String reason) {
        // Kiểm tra admin
        userRepository.findById(adminId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        // Tìm giao dịch rút tiền
        WalletTransaction withdrawalTransaction = walletTransactionRepository.findById(withdrawalId)
                .orElseThrow(() -> new AppException(ErrorCode.TRANSACTION_NOT_FOUND));

        // Kiểm tra loại giao dịch
        if (withdrawalTransaction.getTypeWalletTraction() != WalletTransactionType.WITHDRAWAL) {
            throw new AppException(ErrorCode.INVALID_TRANSACTION_TYPE);
        }

        // Kiểm tra trạng thái
        if (!WalletTransactionStatus.PENDING.name().equals(withdrawalTransaction.getStatus())) {
            throw new AppException(ErrorCode.TRANSACTION_ALREADY_PROCESSED);
        }

        // Cập nhật trạng thái giao dịch
        withdrawalTransaction.setStatus(WalletTransactionStatus.CANCELLED.name());
        withdrawalTransaction.setDescription(withdrawalTransaction.getDescription() + " - Từ chối: " + reason);
        walletTransactionRepository.save(withdrawalTransaction);

        log.info("Từ chối rút tiền cho transaction {} với lý do: {}", withdrawalId, reason);

        return mapToWithdrawalResponse(withdrawalTransaction);
    }

    /**
     * Lấy danh sách yêu cầu rút tiền của người dùng
     */
    public List<WithdrawalResponse> getUserWithdrawals(Long userId) {
        Wallet wallet = walletRepository.findByUserId(userId)
                .orElseThrow(() -> new AppException(ErrorCode.WALLET_NOT_EXIST));

        List<WalletTransaction> withdrawals = walletTransactionRepository
                .findbyWalletid(wallet.getId())
                .stream()
                .filter(tx -> tx.getTypeWalletTraction() == WalletTransactionType.WITHDRAWAL)
                .collect(Collectors.toList());

        return withdrawals.stream()
                .map(this::mapToWithdrawalResponse)
                .collect(Collectors.toList());
    }

    /**
     * Lấy danh sách tất cả yêu cầu rút tiền (chỉ admin)
     */
    public List<WithdrawalResponse> getAllWithdrawals() {
        List<WalletTransaction> withdrawals = walletTransactionRepository
                .findByTypeWalletTraction(WalletTransactionType.WITHDRAWAL);

        return withdrawals.stream()
                .map(this::mapToWithdrawalResponse)
                .collect(Collectors.toList());
    }

    /**
     * Lấy chi tiết yêu cầu rút tiền
     */
    public WithdrawalResponse getWithdrawalDetail(Long withdrawalId) {
        WalletTransaction withdrawalTransaction = walletTransactionRepository.findById(withdrawalId)
                .orElseThrow(() -> new AppException(ErrorCode.TRANSACTION_NOT_FOUND));

        if (withdrawalTransaction.getTypeWalletTraction() != WalletTransactionType.WITHDRAWAL) {
            throw new AppException(ErrorCode.INVALID_TRANSACTION_TYPE);
        }

        return mapToWithdrawalResponse(withdrawalTransaction);
    }

    /**
     * Hủy yêu cầu rút tiền (chỉ khi đang pending)
     */
    @Transactional
    public WithdrawalResponse cancelWithdrawal(Long withdrawalId, Long userId) {
        WalletTransaction withdrawalTransaction = walletTransactionRepository.findById(withdrawalId)
                .orElseThrow(() -> new AppException(ErrorCode.TRANSACTION_NOT_FOUND));

        // Kiểm tra quyền sở hữu
        if (withdrawalTransaction.getWallet().getUser().getId() != userId) {
            throw new AppException(ErrorCode.ACCESS_DENIED);
        }

        // Kiểm tra trạng thái
        if (!WalletTransactionStatus.PENDING.name().equals(withdrawalTransaction.getStatus())) {
            throw new AppException(ErrorCode.TRANSACTION_ALREADY_PROCESSED);
        }

        // Cập nhật trạng thái
        withdrawalTransaction.setStatus(WalletTransactionStatus.CANCELLED.name());
        withdrawalTransaction.setDescription(withdrawalTransaction.getDescription() + " - Đã hủy bởi người dùng");
        walletTransactionRepository.save(withdrawalTransaction);

        log.info("Hủy yêu cầu rút tiền {} bởi user {}", withdrawalId, userId);

        return mapToWithdrawalResponse(withdrawalTransaction);
    }

    /**
     * Tạo mã giao dịch ngẫu nhiên
     */
    private String generateTransactionCode() {
        return "WD" + System.currentTimeMillis() + (int)(Math.random() * 1000);
    }

    /**
     * Map entity sang response DTO
     */
    private WithdrawalResponse mapToWithdrawalResponse(WalletTransaction transaction) {
        return WithdrawalResponse.builder()
                .id(transaction.getId())
                .transactionCode(transaction.getTransactionCode())
                .amount(transaction.getAmount())
                .balanceBefore(transaction.getBalanceBefore())
                .balanceAfter(transaction.getBalanceAfter())
                .bankInfo(transaction.getBankInfo())
                .accountNumber(transaction.getAccountNumber())
                .accountHolderName(transaction.getAccountHolderName())
                .status(transaction.getStatus())
                .note(transaction.getDescription())
                .createdAt(transaction.getCreatedAt())
                .completedAt(transaction.getCompletedAt())
                .build();
    }
}
