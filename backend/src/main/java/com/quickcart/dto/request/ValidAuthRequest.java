package com.quickcart.dto.request;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;
import java.lang.annotation.*;

@Target({ElementType.TYPE})
@Retention(RetentionPolicy.RUNTIME)
@Constraint(validatedBy = AuthRequestValidator.class)
@Documented
public @interface ValidAuthRequest {
    String message() default "Invalid login/auth request credentials";
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};
}
