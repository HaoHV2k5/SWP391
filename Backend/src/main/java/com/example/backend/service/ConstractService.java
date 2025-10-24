package com.example.backend.service;

import com.example.backend.dto.response.ContractResponse;
import com.example.backend.entity.Contract;
import com.example.backend.enums.ContractStatus;
import com.example.backend.mapper.ContractMapper;
import com.example.backend.repository.ContractRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ConstractService {
    private final ContractRepository contractRepository;
    private final ContractMapper contractMapper;

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

}
