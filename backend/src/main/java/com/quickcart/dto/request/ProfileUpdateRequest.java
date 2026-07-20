package com.quickcart.dto.request;

import lombok.Data;

@Data
public class ProfileUpdateRequest {
    private String fullName;
    private String address;
    private String phone;
    private String profilePhotoUrl;
    
    // For Delivery Agents
    private String vehicleName;
    private String vehicleModel;
    private String vehicleNumber;
    private String vehicleDocUrl;
    private String vehiclePhotoUrl;
}
