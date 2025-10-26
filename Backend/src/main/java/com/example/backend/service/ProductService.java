package com.example.backend.service;

import com.example.backend.dto.request.CreateProductRequest;
import com.example.backend.dto.request.UpdateProductRequest;
import com.example.backend.dto.response.ProductResponse;
import com.example.backend.entity.*;
import com.example.backend.enums.ContractStatus;
import com.example.backend.enums.ProductStatus;
import com.example.backend.exception.AppException;
import com.example.backend.exception.ErrorCode;
import com.example.backend.mapper.ProductMapper;
import com.example.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductService {
    
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final ProductMapper productMapper;
    private final CloudinaryService cloudinaryService;
    private final UserPackageTransactionService userPackageTransactionService;
    private final PostingPackageRepository postingPackageRepository;
    private final UserPackageTransactionRepository userPackageTransactionRepository;
    private final TagsRepository tagsRepository;
    private final OrderRespository orderRespository;
    private final ContractRepository contractRepository;


    @Transactional
    public ProductResponse createProduct(CreateProductRequest request, String username) {
        Tags tags = null;
        String productType = request.getProductType().name();
        if("VEHICLE".equalsIgnoreCase(productType)){
            tags = tagsRepository.findByBrandAndModelAndYearModel(
                    request.getVehicle().getBrand(),
                    request.getVehicle().getModel(),
                    request.getVehicle().getYearManufactured()
            );
        }
        else if ("BATTERY".equalsIgnoreCase(productType)){
            tags = tagsRepository.findByBrandAndModelAndYearModel(
                    request.getBattery().getBrand(),
                    request.getBattery().getModel(),
                    request.getBattery().getYearManufactured()

            );
        }


        // Tìm user theo username
        User seller = userRepository.findByUsername(username)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        UserPostingPackage userPackage = userPackageTransactionService.getUserPostingPackageByUserId(seller.getId());
        if(userPackage.getPostPossible() <= 0){
            throw  new AppException(ErrorCode.POSTING_OVER_LIMIT);
        }


        LocalDateTime now =LocalDateTime.now();
        LocalDateTime endAt =userPackage.getEndTime();

        if (now.isAfter(endAt)) {
            throw new AppException(ErrorCode.PACKAGE_EXPIRED);
        }



        List<String> imgUrls = new ArrayList<>();
        if(request.getImages() != null && !request.getImages().isEmpty() ) {
                for (MultipartFile file : request.getImages()) {
                    String url  = cloudinaryService.upload(file);
                    imgUrls.add(url);
                }
        }

        // Tạo product entity
        Product product = productMapper.toProduct(request);
        product.setSeller(seller);
        product.setImageUrls(imgUrls);
        if(tags != null){
            product.setTag(tags);
        }
        userPackage.setPostPossible(userPackage.getPostPossible() - 1);
        userPackageTransactionRepository.save(userPackage);
        // Lưu product
        Product savedProduct = productRepository.save(product);
        
        return productMapper.toProductResponse(savedProduct);
    }
    // lay product da duoc seller dang tin
    public List<ProductResponse> getProductsBySellerPost(String username) {
        User seller = userRepository.findByUsername(username)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        List<Product> products = productRepository.findBySellerIdAndIsPostedTrue(seller.getId());
        return productMapper.toResponseList(products);
    }
    // lay cac san pham pending staff
    public List<ProductResponse> getPendingProducts() {
        List<Product> products = productRepository.findPendingProducts();
        return productMapper.toResponseList(products);
    }
    // tu choi post boi admin va staff
    public ProductResponse rejectProduct(Long id,  String reason) {
        Product product = productRepository.findById(id).orElseThrow(() -> new AppException(ErrorCode.PRODUCT_NOT_FOUND));
        product.setStatus(ProductStatus.REJECTED);
        product.setReason(reason);
        Product saved = productRepository.save(product);
        return productMapper.toProductResponse(saved);
    }
    // chap nhan post boi staff
    public ProductResponse approveProductByStaff(Long id){
        Product product = productRepository.findById(id).orElseThrow(() -> new AppException(ErrorCode.PRODUCT_NOT_FOUND));
        product.setStatus(ProductStatus.STAFF_APPROVED);
        product.setReason(null);
        productRepository.save(product);
        return productMapper.toProductResponse(product);
    }
// chap nhan post boi admin
    public ProductResponse approveProductByAdmin(Long id){
        Product product = productRepository.findById(id).orElseThrow(() -> new AppException(ErrorCode.PRODUCT_NOT_FOUND));
        product.setStatus(ProductStatus.ADMIN_APPROVED);
        product.setReason(null);
        productRepository.save(product);
        return productMapper.toProductResponse(product);


    }


// lay danh sach post duoc staff approve cho admin
    public List<ProductResponse> getPostApproveByStaff(){
        List<Product> list = productRepository.findStaffApproveProducts();
        return productMapper.toResponseList(list);
    }




    // xem chi tiet thong tin san pham
    public ProductResponse getProductById(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.PRODUCT_NOT_FOUND));
        return productMapper.toProductResponse(product);
    }


    // seller post bai dang public
    @Transactional
    public ProductResponse postProduct(Long producId){
        Product product = productRepository.findById(producId).orElseThrow(() -> new AppException(ErrorCode.PRODUCT_NOT_FOUND));
        if(!ProductStatus.ADMIN_APPROVED.equals(product.getStatus())){
            throw new AppException(ErrorCode.PRODUCT_NOT_ACCEPT_BY_ADMIN);
        }

        // Kiểm tra nếu sản phẩm đã từng có Order
        List<Order> orders = orderRespository.findAllByProductIdAndSellerAcceptedFalse(product.getId());
        if(orders != null && !orders.isEmpty()) {
            for(Order order : orders) {
                List<Contract> contracts = contractRepository.findAllByOrder(order);
                // Nếu có contract nào trạng thái khác CANCELLED thì không cho post
                if (contracts != null && !contracts.isEmpty()) {
                    for(Contract contract : contracts) {
                        if (!ContractStatus.CANCELLED.equals(contract.getStatus())) {
                            throw new AppException(ErrorCode.PRODUCT_ORDER_CONTRACT_NOT_CANCELLED);
                        }
                    }
                }
            }
        }
        product.setStatus(ProductStatus.ACTIVE);
        product.setPosted(true);
        productRepository.save(product);
        return productMapper.toProductResponse(product);
    }



    //seller lay cac bai dang  duoc admin approve cua minh
    public List<ProductResponse> getApprovePostOfSeller(Long id){
        List<Product> list =productRepository.findBySellerIdAndStatus(id, ProductStatus.ADMIN_APPROVED);
        return productMapper.toResponseList(list);
    }


    // seller lay cac bai bi reject cua minh
    public List<ProductResponse> getRejectPostOfSeller(Long id){
        List<Product> list =productRepository.findBySellerIdAndStatus(id, ProductStatus.REJECTED);
        return productMapper.toResponseList(list);
    }
    // seller lay cac bai pending cua minh
    public List<ProductResponse> getPedingPostOfSeller(Long id){
        List<Product> list =productRepository.findBySellerIdAndStatus(id, ProductStatus.PENDING);
        return productMapper.toResponseList(list);
    }

    //seller lay het tat ca bai dang cua minh
    public List<ProductResponse> getAllPostOfSeller(Long id){
        List<Product> list =productRepository.findAllBySellerId(id);
        return productMapper.toResponseList(list);
    }

    public List<ProductResponse> getAllProductPosted(){
        List<Product> list = productRepository.findAllPostedProducts();
        return productMapper.toResponseList(list);
    }
    @Transactional
    public ProductResponse updateProduct(Long productId, UpdateProductRequest request){
        Product product = productRepository.findById(productId)
            .orElseThrow(() -> new AppException(ErrorCode.PRODUCT_NOT_FOUND));

        boolean changeImportant = false;
        // So sánh price
        if (!product.getPrice().equals(request.getPrice())) {
            changeImportant = true;
        }
        // So sánh productType
        else if (!product.getProductType().equals(request.getProductType())) {
            changeImportant = true;
        }
        // So sánh vehicle
        else if ((request.getVehicle() != null && product.getVehicle() == null) ||
                (request.getVehicle() == null && product.getVehicle() != null) ||
                (request.getVehicle() != null && product.getVehicle() != null &&
                        (!java.util.Objects.equals(product.getVehicle().getBrand(), request.getVehicle().getBrand()) ||
                                !java.util.Objects.equals(product.getVehicle().getModel(), request.getVehicle().getModel()) ||
                                !java.util.Objects.equals(product.getVehicle().getYearManufactured(), request.getVehicle().getYearManufactured())))) {
            changeImportant = true;
        }
        // So sánh battery
        else if ((request.getBattery() != null && product.getBattery() == null) ||
                (request.getBattery() == null && product.getBattery() != null) ||
                (request.getBattery() != null && product.getBattery() != null &&
                        (!java.util.Objects.equals(product.getBattery().getBrand(), request.getBattery().getBrand()) ||
                                !java.util.Objects.equals(product.getBattery().getModel(), request.getBattery().getModel()) ||
                                !java.util.Objects.equals(product.getBattery().getYearManufactured(), request.getBattery().getYearManufactured()) ||
                                !java.util.Objects.equals(product.getBattery().getBatteryLevel(), request.getBattery().getBatteryLevel())))) {
            changeImportant = true;
        }
        // So sánh ảnh sản phẩm (imageUrls)
        else if (request.getImages() != null && !request.getImages().isEmpty()) {
            changeImportant = true;
        }


        if (changeImportant) {
            product.setStatus(ProductStatus.PENDING);
        }

        productMapper.updateProduct(product, request);
        productRepository.save(product);
        return productMapper.toProductResponse(product);
    }


    public void deleteProduct(Long id){
        Product product = productRepository.findById(id).orElseThrow(() -> new AppException(ErrorCode.PRODUCT_NOT_FOUND));
        productRepository.deleteById(id);
    }

    public Product getProduct(Long productId){
        return  productRepository.findById(productId).orElseThrow(() -> new AppException(ErrorCode.PRODUCT_NOT_FOUND));
    }
















}
