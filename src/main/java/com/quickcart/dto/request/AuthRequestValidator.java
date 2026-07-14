package com.quickcart.dto.request;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

public class AuthRequestValidator implements ConstraintValidator<ValidAuthRequest, AuthRequest> {

    @Override
    public boolean isValid(AuthRequest request, ConstraintValidatorContext context) {
        if (request == null) {
            return false;
        }

        // Phone is always required.
        if (request.getPhone() == null || request.getPhone().trim().isEmpty()) {
            context.disableDefaultConstraintViolation();
            context.buildConstraintViolationWithTemplate("Phone number is required")
                    .addPropertyNode("phone")
                    .addConstraintViolation();
            return false;
        }

        boolean hasOtp = request.getOtp() != null && !request.getOtp().trim().isEmpty();
        boolean hasPassword = request.getPassword() != null && !request.getPassword().trim().isEmpty();
        boolean hasEmail = request.getEmail() != null && !request.getEmail().trim().isEmpty();

        // Check if neither OTP nor password is provided
        if (!hasOtp && !hasPassword) {
            context.disableDefaultConstraintViolation();
            context.buildConstraintViolationWithTemplate("Either OTP (for OTP login) or Password (for password login) must be provided")
                    .addConstraintViolation();
            return false;
        }

        // If OTP is provided, it is OTP login
        if (hasOtp) {
            return true;
        }

        // If Password is provided, it is Password login
        if (hasPassword) {
            if (!hasEmail) {
                context.disableDefaultConstraintViolation();
                context.buildConstraintViolationWithTemplate("Email is required for password login")
                        .addPropertyNode("email")
                        .addConstraintViolation();
                return false;
            }
            return true;
        }

        return true;
    }
}
