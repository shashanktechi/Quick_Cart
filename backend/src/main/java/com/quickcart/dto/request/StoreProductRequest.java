package com.quickcart.dto.request;

import com.quickcart.entity.Product;
import lombok.Data;

@Data
public class StoreProductRequest {
    private Product product;
    private Integer quantity;
    private String batchCode;
    private String expiryTime; // Accept as String to handle various ISO formats from frontend
}
