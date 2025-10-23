package com.example.backend.service;

import com.example.backend.dto.response.ContractResponse;
import com.example.backend.entity.Contract;
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

}
