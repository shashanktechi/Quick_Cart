package com.quickcart.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class UploadUrlRequest {
    @NotBlank(message = "contentType is required")
    private String contentType;
}
