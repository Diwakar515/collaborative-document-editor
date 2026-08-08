package com.docs.controller.v1;

import com.docs.dto.*;
import com.docs.model.User;
import com.docs.service.UserService;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService){
        this.userService = userService;
    }

    // CREATE USER
    @PostMapping
    public ApiResponse<UserResponseDTO> createUser(@Valid @RequestBody UserRequestDTO userDTO) {

        UserResponseDTO user = userService.saveUser(userDTO);

        ApiResponse<UserResponseDTO> response = new ApiResponse<>();
        response.setSuccess(true);
        response.setMessage("User created successfully");
        response.setData(user);

        return response;
    }

    // GET ALL USERS (ADMIN)
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<List<UserResponseDTO>> getAllUsers(){

        List<UserResponseDTO> users = userService.getAllUsers();

        ApiResponse<List<UserResponseDTO>> response = new ApiResponse<>();
        response.setSuccess(true);
        response.setMessage("Users fetched successfully");
        response.setData(users);

        return response;
    }

    // GET USER BY ID
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/{id}")
    public ApiResponse<UserResponseDTO> getUserById(@PathVariable Long id) {

        UserResponseDTO user = userService.getUserById(id);

        ApiResponse<UserResponseDTO> response = new ApiResponse<>();
        response.setSuccess(true);
        response.setMessage("User fetched successfully");
        response.setData(user);

        return response;
    }

    // UPDATE USER
    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}")
    public ApiResponse<UserResponseDTO> updateUser(
            @PathVariable Long id,
            @Valid @RequestBody UserRequestDTO userDTO) {

        UserResponseDTO updatedUser = userService.updateUser(id, userDTO);

        ApiResponse<UserResponseDTO> response = new ApiResponse<>();
        response.setSuccess(true);
        response.setMessage("User updated successfully");
        response.setData(updatedUser);

        return response;
    }

    // DELETE USER
    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public ApiResponse<Object> deleteUser(@PathVariable Long id) {

        userService.deleteUser(id);

        ApiResponse<Object> response = new ApiResponse<>();
        response.setSuccess(true);
        response.setMessage("User deleted successfully");
        response.setData(null);

        return response;
    }

    // LOGIN
    @PostMapping("/login")
    public ApiResponse<LoginResponseDTO> loginUser(@Valid @RequestBody LoginRequestDTO loginDTO) {

        LoginResponseDTO loginResponse = userService.loginUser(loginDTO);

        ApiResponse<LoginResponseDTO> response = new ApiResponse<>();
        response.setSuccess(true);
        response.setMessage("Login successful");
        response.setData(loginResponse);

        return response;
    }

    @PostMapping(
            "/forgot-password"
    )
    public ApiResponse<Object> forgotPassword(
            @Valid @RequestBody ForgotPasswordRequestDTO dto
    ) {

        userService.resetPassword(

                dto.getEmail(),

                dto.getNewPassword()
        );

        ApiResponse<Object>
                response =

                new ApiResponse<>();

        response.setSuccess(
                true
        );

        response.setMessage(
                "Password updated successfully"
        );

        response.setData(
                null
        );

        return response;
    }

    @GetMapping("/profile")
    public ApiResponse<UserResponseDTO> getProfile() {

        String email =

                org.springframework.security
                        .core.context.SecurityContextHolder
                        .getContext()
                        .getAuthentication()
                        .getName();

        UserResponseDTO user =

                userService
                        .getProfile(email);

        ApiResponse<UserResponseDTO>
                response =

                new ApiResponse<>();

        response.setSuccess(true);

        response.setMessage(
                "Profile fetched successfully"
        );

        response.setData(user);

        return response;
    }
}