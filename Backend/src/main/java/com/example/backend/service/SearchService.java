package com.example.backend.service;

import com.example.backend.dto.response.ProductResponse;
import com.example.backend.entity.Battery;
import com.example.backend.entity.Product;
import com.example.backend.entity.Tags;
import com.example.backend.entity.Vehicle;
import com.example.backend.exception.AppException;
import com.example.backend.exception.ErrorCode;
import com.example.backend.mapper.ProductMapper;
import com.example.backend.repository.BatteryRepository;
import com.example.backend.repository.ProductRepository;
import com.example.backend.repository.TagsRepository;
import com.example.backend.repository.VehicleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SearchService {
    private  final TagsRepository tagsRepository;
   private final ProductRepository productRepository;
    private final ProductMapper productMapper;
    private final VehicleRepository vehicleRepository;
    private final BatteryRepository batteryRepository;
    private static  final Set<String> REMOVE_WORDS = Set.of( "mua", "bán", "cũ", "mới");

    public List<ProductResponse>  getProductByTagSlug(String slug){
        Tags tag = tagsRepository.findBySlugs(slug).orElseThrow(() -> new AppException(ErrorCode.TAG_NOT_EXIST));
        List<Product> list = new ArrayList<>();
        if("VEHICLE".equals(tag.getType().name())){
            list = productRepository.findByBrandAndModelAndProductTypeVEHICLE(tag.getModel(),tag.getBrand());

        }
        else{
            list = productRepository.findByBrandAndModelAndProductTypeBATTERY(tag.getModel(),tag.getBrand());

        }


        return  productMapper.toResponseList(list);

    }


    public List<ProductResponse> searchProductByParam(String request){
        List<String> keyword = extractWords(request);

        String fullTextKeyWord = String.join(" ", keyword);

        boolean searchBattery = keyword.stream()
                .anyMatch(k -> k.equalsIgnoreCase("pin")
                                || k.equalsIgnoreCase("battery")
                                || k.equalsIgnoreCase("sạc"));

        boolean searchVehicle = keyword.stream()
                .anyMatch(k -> k.equalsIgnoreCase("xe")
                        || k.equalsIgnoreCase("vehicle")
                        || k.equalsIgnoreCase("scooter"));




        Set<Product> resultSet = new LinkedHashSet<>();




        if(searchBattery){

            List<Battery> listBattery =batteryRepository.searchFullText(fullTextKeyWord);

            if (listBattery.isEmpty()) {
                listBattery = batteryRepository.searchByModel("%" + fullTextKeyWord + "%");
                listBattery.addAll(batteryRepository.searchByBrand(("%" + fullTextKeyWord + "%")));
            }

//            for (Battery battery : listBattery) {
//                productRepository.findProductByBattery(battery).ifPresent(resultSet::add);
//            }
            for (Battery battery : listBattery) {
                Product p = productRepository.findProductByBattery(battery).orElseThrow(() -> new AppException(ErrorCode.PRODUCT_NOT_FOUND));
                resultSet.add(p);

            }
        }
        if(searchVehicle){
            List<Vehicle> listVehicle =vehicleRepository.searchFullText(fullTextKeyWord);

            if (listVehicle.isEmpty()) {
                listVehicle = vehicleRepository.searchByModel("%" + fullTextKeyWord + "%");
                listVehicle.addAll(vehicleRepository.searchByBrand(("%" + fullTextKeyWord + "%")));
            }
            for (Vehicle vehicle : listVehicle) {
                Product p = productRepository.findProductByVehicle(vehicle).orElseThrow(() -> new AppException(ErrorCode.PRODUCT_NOT_FOUND));
                resultSet.add(p);

            }
        }
        if (resultSet.isEmpty()) {
            List<Product> list = productRepository.searchFullText(fullTextKeyWord);
            if (list.isEmpty()) {
                list = productRepository.searchByTitle("%" + fullTextKeyWord + "%");
                list.addAll(productRepository.searchByDescription(("%" + fullTextKeyWord + "%")));
            }

            resultSet.addAll(list);
        }



        return productMapper.toResponseList(new ArrayList<>(resultSet));


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
