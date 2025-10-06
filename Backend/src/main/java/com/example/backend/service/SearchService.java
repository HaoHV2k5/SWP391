package com.example.backend.service;

import com.example.backend.dto.response.ProductResponse;
import com.example.backend.entity.Product;
import com.example.backend.entity.Tags;
import com.example.backend.exception.AppException;
import com.example.backend.exception.ErrorCode;
import com.example.backend.mapper.ProductMapper;
import com.example.backend.repository.ProductRepository;
import com.example.backend.repository.TagsRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class SearchService {
    private  final TagsRepository tagsRepository;
   private final ProductRepository productRepository;
    private final ProductMapper productMapper;

    public List<ProductResponse>  getProductByTagSlug(String slug){
        Tags tag = tagsRepository.findBySlugs(slug).orElseThrow(() -> new AppException(ErrorCode.TAG_NOT_EXIST));
        List<Product> list = new ArrayList<>();

        list = productRepository.findByBrandAndModel(tag.getModel(),tag.getBrand());


        return  productMapper.toResponseList(list);

    }



}
