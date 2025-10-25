package com.example.backend.service;

import com.example.backend.entity.Role;
import com.example.backend.entity.User;
import com.example.backend.entity.Wallet;
import com.example.backend.exception.AppException;
import com.example.backend.exception.ErrorCode;
import com.example.backend.repository.RoleRepository;
import com.example.backend.repository.UserRepository;
import com.example.backend.repository.WalletRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;



@Service
@RequiredArgsConstructor
public class WalletService {

        private final WalletRepository walletRepository;
        private final RoleRepository roleRepository;
        private final UserRepository userRepository;
        public BigDecimal getBalanceAdmin(){
            Role role = roleRepository.findById("ADMIN").orElseThrow(() -> new AppException(ErrorCode.ROLE_NOT_EXISTED));

          var user = userRepository.findByRoles(role);


           Wallet wallet = walletRepository.findByUserId(user.get().getId()).orElseThrow(() -> new AppException(ErrorCode.WALLET_NOT_EXIST));
           return wallet.getBalance();


        }

}
