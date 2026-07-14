package com.quickcart.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class OrderStatusUpdateRequest {
    private Long orderId;

    @NotNull(message = "Status cannot be null")
    private OrderStatus status;
}
