package com.docs.config;

import com.docs.dto.ApiResponse;
import com.docs.exception.ForbiddenException;
import com.docs.exception.InvalidCredentialsException;
import com.docs.exception.ResourceNotFoundException;
import com.docs.exception.DuplicateResourceException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    // 400 - DB Constraint Errors
    @ExceptionHandler(org.springframework.dao.DataIntegrityViolationException.class)
    public ResponseEntity<ApiResponse<Object>> handleDataIntegrityViolation(
            org.springframework.dao.DataIntegrityViolationException ex) {

        String message = "Duplicate entry or invalid data";

        if (ex.getMessage() != null && ex.getMessage().toLowerCase().contains("email")) {
            message = "Email already exists";
        }

        ApiResponse<Object> response = new ApiResponse<>();
        response.setSuccess(false);
        response.setMessage(message);
        response.setData(null);

        return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
    }

    // 403 - Spring Security Access Denied
    @ExceptionHandler(org.springframework.security.access.AccessDeniedException.class)
    public ResponseEntity<ApiResponse<Object>> handleAccessDeniedException(
            org.springframework.security.access.AccessDeniedException ex) {

        ApiResponse<Object> response = new ApiResponse<>();
        response.setSuccess(false);
        response.setMessage("You do not have permission to access this resource");
        response.setData(null);

        return new ResponseEntity<>(response, HttpStatus.FORBIDDEN);
    }

    // 403 - Custom Forbidden
    @ExceptionHandler(ForbiddenException.class)
    public ResponseEntity<ApiResponse<Object>> handleForbiddenException(
            ForbiddenException ex) {

        ApiResponse<Object> response = new ApiResponse<>();
        response.setSuccess(false);
        response.setMessage(ex.getMessage());
        response.setData(null);

        return new ResponseEntity<>(response, HttpStatus.FORBIDDEN);
    }

    // 400 - Validation Errors
    @ExceptionHandler(org.springframework.web.bind.MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<Map<String, String>>> handleValidationExceptions(
            org.springframework.web.bind.MethodArgumentNotValidException ex) {

        Map<String, String> fieldErrors = new HashMap<>();

        ex.getBindingResult().getFieldErrors().forEach(error ->
                fieldErrors.put(error.getField(), error.getDefaultMessage())
        );

        ApiResponse<Map<String, String>> response = new ApiResponse<>();
        response.setSuccess(false);
        response.setMessage("Validation failed");
        response.setData(fieldErrors);

        return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
    }

    // 404 - Resource Not Found
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ApiResponse<Object>> handleResourceNotFoundException(
            ResourceNotFoundException ex) {

        ApiResponse<Object> response = new ApiResponse<>();
        response.setSuccess(false);
        response.setMessage(ex.getMessage());
        response.setData(null);

        return new ResponseEntity<>(response, HttpStatus.NOT_FOUND);
    }

    // 401 - Invalid Credentials
    @ExceptionHandler(InvalidCredentialsException.class)
    public ResponseEntity<ApiResponse<Object>> handleInvalidCredentialsException(
            InvalidCredentialsException ex) {

        ApiResponse<Object> response = new ApiResponse<>();
        response.setSuccess(false);
        response.setMessage(ex.getMessage());
        response.setData(null);

        return new ResponseEntity<>(response, HttpStatus.UNAUTHORIZED);
    }

    // 409 - Duplicate Resource
    @ExceptionHandler(DuplicateResourceException.class)
    public ResponseEntity<ApiResponse<Object>> handleDuplicateResourceException(
            DuplicateResourceException ex) {

        ApiResponse<Object> response = new ApiResponse<>();
        response.setSuccess(false);
        response.setMessage(ex.getMessage());
        response.setData(null);

        return new ResponseEntity<>(response, HttpStatus.CONFLICT);
    }

    // 400 - Generic Runtime
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Object>> handleException(
            Exception ex) {

        ApiResponse<Object> response = new ApiResponse<>();
        response.setSuccess(false);
        response.setMessage("An unexpected error occurred. Please try again later.");
        response.setData(null);

        return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
    }
}