package com.example.backend.service;

import com.example.backend.dto.response.ProductResponse;
import com.example.backend.entity.Product;
import com.example.backend.entity.Tags;
import com.example.backend.entity.Vehicle;
import com.example.backend.exception.AppException;
import com.example.backend.exception.ErrorCode;
import com.example.backend.mapper.ProductMapper;
import com.example.backend.repository.ProductRepository;
import com.example.backend.repository.TagsRepository;
import com.example.backend.repository.VehicleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SearchService {
    private  final TagsRepository tagsRepository;
   private final ProductRepository productRepository;
    private final ProductMapper productMapper;
    private final VehicleRepository vehicleRepository;
    private static  final Set<String> REMOVE_WORDS = Set.of("xe", "mua", "bán", "cũ", "mới");

    public List<ProductResponse>  getProductByTagSlug(String slug){
        Tags tag = tagsRepository.findBySlugs(slug).orElseThrow(() -> new AppException(ErrorCode.TAG_NOT_EXIST));
        List<Product> list = new ArrayList<>();

        list = productRepository.findByBrandAndModel(tag.getModel(),tag.getBrand());


        return  productMapper.toResponseList(list);

    }


    public List<ProductResponse> searchVehicles(String request){
        List<String> keyword = extractWords(request);
//        String brand = null;
//        String model = null;
//        for(String word : keyword){
//            if(isBrand(word)){
//                brand = word;
//            }
//            else{
//                model = model == null? word: model+" "+word;
//            }
//        }
//
//
        String fullTextKeyWord = String.join(" ", keyword);
//
//        List<Product> list = productRepository.searchFullText(fullTextKeyWord);
//        final String finalBrand = brand;
//        if(brand != null){
//            list = list.stream().filter(v ->
//                            v.getVehicle() != null && v.getVehicle().getBrand() != null &&
//                            v.getVehicle().getBrand().equalsIgnoreCase(finalBrand))
//                    .toList();
//        }
//        final String finalModel = model;
//        if(model != null){
//            list = list.stream().filter(v -> v.getVehicle().getModel().toLowerCase().contains(finalModel.toLowerCase()))
//                    .toList();
//        }

        List<Product> listProduct = productRepository.searchFullText(fullTextKeyWord);
        List<Vehicle> listVehicle =vehicleRepository.searchFullText(fullTextKeyWord);
        List<Product> list = new ArrayList<>(listProduct);

        for (Vehicle vehicle : listVehicle) {
            Product p = productRepository.findProductByVehicle(vehicle).orElseThrow(() -> new AppException(ErrorCode.PRODUCT_NOT_FOUND));
            list.add(p);

        }

        return productMapper.toResponseList(list);


    }


// can xem lai code
    public static List<String> extractWords(String request){

        return Arrays.stream(request.toLowerCase().split("\\s+"))
                .filter(word -> !REMOVE_WORDS.contains(word))
                .collect(Collectors.toList());


    }

    public static boolean isBrand(String request){
     Set<String> brand = Set.of("VinFast","Osakar","Yadea","Pega","Dibao");
        return brand.contains(request.toLowerCase());
    }



}
