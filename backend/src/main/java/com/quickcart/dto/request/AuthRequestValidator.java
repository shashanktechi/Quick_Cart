package com.quickcart.dto.request;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;
import java.util.regex.Pattern;

public class AuthRequestValidator implements ConstraintValidator<ValidAuthRequest, AuthRequest> {

    private static final Pattern PHONE_PATTERN = Pattern.compile("^\\+?[0-9]{10,15}$");

    @Override
    public boolean isValid(AuthRequest request, ConstraintValidatorContext context) {
        if (request == null) {
            return false;
        }

        // Phone is always required and must be valid format
        if (request.getPhone() == null || request.getPhone().trim().isEmpty()) {
            context.disableDefaultConstraintViolation();
            context.buildConstraintViolationWithTemplate("Phone number is required")
                    .addPropertyNode("phone")
                    .addConstraintViolation();
            return false;
        }

        String phone = request.getPhone().trim().replaceAll("\\s+", ""); // Remove spaces
        if (!PHONE_PATTERN.matcher(phone).matches()) {
            context.disableDefaultConstraintViolation();
            context.buildConstraintViolationWithTemplate("Phone number must be 10-15 digits and can optionally start with +")
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
            // Validate OTP format (6 digits)
            String otp = request.getOtp().trim();
            if (!otp.matches("\\d{6}")) {
                context.disableDefaultConstraintViolation();
                context.buildConstraintViolationWithTemplate("OTP must be 6 digits")
                        .addPropertyNode("otp")
                        .addConstraintViolation();
                return false;
            }
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

            // Basic email format validation
            String email = request.getEmail().trim();
            if (!email.matches("^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$")) {
                context.disableDefaultConstraintViolation();
                context.buildConstraintViolationWithTemplate("Please provide a valid email address")
                        .addPropertyNode("email")
                        .addConstraintViolation();
                return false;
            }

            // Password length validation
            String password = request.getPassword().trim();
            if (password.length() < 8) {
                context.disableDefaultConstraintViolation();
                context.buildConstraintViolationWithTemplate("Password must be at least 8 characters long")
                        .addPropertyNode("password")
                        .addConstraintViolation();
                return false;
            }
            return true;
        }

        return true;
    }
}
