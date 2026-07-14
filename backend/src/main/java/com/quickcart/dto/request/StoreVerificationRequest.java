package com.quickcart.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class StoreVerificationRequest {
    @NotNull(message = "Status cannot be null")
    private StoreVerificationStatus status;
}
