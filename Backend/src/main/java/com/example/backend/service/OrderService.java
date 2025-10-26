package com.example.backend.service;

import com.example.backend.dto.request.BuyProductRequest;
import com.example.backend.dto.request.OrderReviewRequest;
import com.example.backend.dto.response.OrderResponse;
import com.example.backend.entity.Order;
import com.example.backend.entity.OrderEscrow;
import com.example.backend.entity.Product;
import com.example.backend.entity.User;
import com.example.backend.enums.EscrowStatus;
import com.example.backend.exception.AppException;
import com.example.backend.exception.ErrorCode;
import com.example.backend.mapper.OrderMapper;
import com.example.backend.repository.OrderRespository;
import com.example.backend.repository.OrderEscrowRepository;
import com.example.backend.repository.ProductRepository;
import com.example.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class OrderService {
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final OrderRespository orderRespository;
    private final OrderMapper orderMapper;
    private  final MailService mailService;
    private final OrderEscrowRepository orderEscrowRepository;
    private final CloudinaryService cloudinaryService;

    public OrderResponse buyOrder(BuyProductRequest request){
        Product product = productRepository.findById(request.getProductId()).get();
        User user = userRepository.findById(request.getUserId()).get();
        Order order = orderRespository.findByProductAndBuyer(product,user);
        if(order!=null){
            throw new AppException(ErrorCode.ORDER_REQUEST_DUPLICATE);
        }
        order = Order.builder()
                .createdAt(LocalDateTime.now())
                .product(product)
                .buyer(user)
                .seller(product.getSeller())
                .offeredPrice(product.getPrice())
                .message("Order has been submitted")
                .build();
        product.setPosted(false);
        productRepository.save(product);
        orderRespository.save(order);
        return  orderMapper.toOrderResponse(order);
    }

    public Order findById(Long id){
        return orderRespository.findById(id).get();
    }

    public void rejectAll(Long orderId){
        Order order = orderRespository.findById(orderId).orElseThrow(() -> new AppException(ErrorCode.ORDER_REJECT_INVALID));


        List<Order> list = orderRespository.findAllByProductAndSellerAndIdNot(order.getProduct(), order.getSeller(),orderId);
        for(Order o : list){
//            mailService.sendRejectProduct(o);
            orderRespository.delete(o);
        }



    }

    public void rejectOrder(Long orderId){

        Order order = orderRespository.findById(orderId).orElseThrow(() -> new AppException(ErrorCode.ORDER_REJECT_INVALID));
        if(order.isSellerAccepted()){
            throw new AppException(ErrorCode.REJECT_ORDER_VALID);
        }
        mailService.sendRejectProduct(order);

        orderRespository.deleteById(orderId);
    }

    public List<OrderResponse> getOrdersByProductId(Long productId) {
        List<Order> orders = orderRespository.findAllByProductIdAndSellerAcceptedFalse(productId);
        return orders.stream().map(orderMapper::toOrderResponse).toList();
    }

    @Transactional
    public void sellerRequestAdminReview(OrderReviewRequest request) {
        Order order = findById(request.getOrderId());
        OrderEscrow escrow = order.getOrderEscrow();
        if (escrow == null) throw new AppException(ErrorCode.ORDER_NOT_FOUND);
        if (!escrow.getStatus().equals(EscrowStatus.AWAIT_CONFIRM) && !escrow.getStatus().equals(EscrowStatus.HELD)) {
            throw new AppException(ErrorCode.INVALID_ORDER_ESCROW_STATUS);
        }
        // Upload proof image
        String proofUrl = null;
        MultipartFile file = request.getProofImage();
        if (file != null && !file.isEmpty()) {
            proofUrl = cloudinaryService.upload(file);
        }
        escrow.setSellerProofImage(proofUrl);
        escrow.setSellerOrderCode(request.getShippingCode());
        escrow.setStatus(EscrowStatus.ADMIN_REVIEW);
        escrow.setUpdatedAt(LocalDateTime.now());
        orderEscrowRepository.save(escrow);
    }
}
