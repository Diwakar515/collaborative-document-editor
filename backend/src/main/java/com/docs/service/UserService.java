package com.docs.service;

import com.docs.dto.LoginRequestDTO;
import com.docs.dto.LoginResponseDTO;
import com.docs.dto.UserRequestDTO;
import com.docs.dto.UserResponseDTO;
import com.docs.exception.InvalidCredentialsException;
import com.docs.exception.ResourceNotFoundException;
import com.docs.exception.DuplicateResourceException;
import com.docs.security.JwtUtil;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import com.docs.repository.UserRepository;
import com.docs.model.User;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class UserService {

    private static final Logger logger = LoggerFactory.getLogger(UserService.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public UserService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    public UserResponseDTO saveUser(UserRequestDTO userDTO) {

        if (userRepository.findByEmail(userDTO.getEmail()).isPresent()) {
            throw new DuplicateResourceException("Email already registered");
        }

        logger.info("Creating new user with email: {}", userDTO.getEmail());

        User user = new User();
        user.setName(userDTO.getName());
        user.setEmail(userDTO.getEmail());
        user.setPassword(passwordEncoder.encode(userDTO.getPassword()));
        user.setRole("USER");
        //user.setCreatedAt(LocalDateTime.now());

        User savedUser = userRepository.save(user);

        logger.info("User created successfully with ID: {}", savedUser.getId());

        UserResponseDTO response = new UserResponseDTO();
        response.setId(savedUser.getId());
        response.setName(savedUser.getName());
        response.setEmail(savedUser.getEmail());
        response.setCreatedAt(savedUser.getCreatedAt());

        return response;
    }

    public List<UserResponseDTO> getAllUsers() {

        logger.info("Fetching all users");

        List<User> users = userRepository.findAll();

        logger.info("Total users fetched: {}", users.size());

        return users.stream().map(user -> {
            UserResponseDTO dto = new UserResponseDTO();
            dto.setId(user.getId());
            dto.setName(user.getName());
            dto.setEmail(user.getEmail());
            dto.setCreatedAt(user.getCreatedAt());
            return dto;
        }).toList();
    }

    public UserResponseDTO getUserById(Long id) {

        logger.info("Fetching user with ID: {}", id);

        User user = userRepository.findById(id)
                .orElseThrow(() -> {
                    logger.error("User not found with ID: {}", id);
                    return new ResourceNotFoundException("User not found");
                });

        return mapToUserResponseDTO(user);
    }

    public void deleteUser(Long id) {

        logger.info("Attempting to delete user with ID: {}", id);

        User user = userRepository.findById(id)
                .orElseThrow(() -> {
                    logger.warn("Delete failed. User not found with ID: {}", id);
                    return new ResourceNotFoundException("User not found with id: " + id);
                });

        userRepository.delete(user);

        logger.info("User deleted successfully with ID: {}", id);
    }

    public UserResponseDTO updateUser(Long id, UserRequestDTO userDTO) {

        logger.info("Updating user with ID: {}", id);

        User user = userRepository.findById(id)
                .orElseThrow(() -> {
                    logger.error("User not found with ID: {}", id);
                    return new ResourceNotFoundException("User not found");
                });

        logger.debug("User details before update: ID={}, Name={}, Email={}",
                user.getId(),
                user.getName(),
                user.getEmail());

        user.setName(userDTO.getName());
        user.setEmail(userDTO.getEmail());
        user.setPassword(passwordEncoder.encode(userDTO.getPassword()));

        User updatedUser = userRepository.save(user);

        logger.info("User updated successfully with ID: {}", id);

        UserResponseDTO responseDTO = new UserResponseDTO();
        responseDTO.setId(updatedUser.getId());
        responseDTO.setName(updatedUser.getName());
        responseDTO.setEmail(updatedUser.getEmail());

        return responseDTO;
    }

    public LoginResponseDTO loginUser(LoginRequestDTO loginDTO) {

        logger.info("Login attempt for email: {}", loginDTO.getEmail());

        User user = userRepository.findByEmail(loginDTO.getEmail())
                .orElseThrow(() -> {
                    logger.error("User not found with email: {}", loginDTO.getEmail());
                    return new ResourceNotFoundException("User not found");
                });

        if (passwordEncoder.matches(loginDTO.getPassword(), user.getPassword())) {

            logger.info("Login successful for email: {}", user.getEmail());

            LoginResponseDTO response = new LoginResponseDTO();
            response.setMessage("Login successful");
            response.setUserId(user.getId());
            response.setEmail(user.getEmail());

            String token = jwtUtil.generateToken(user.getEmail());
            response.setToken(token);

            return response;

        } else {
            logger.warn("Invalid password attempt for email: {}", user.getEmail());
            throw new InvalidCredentialsException("Invalid credentials");
        }
    }

    public void resetPassword(
            String email,
            String newPassword
    ) {

        User user = userRepository
                        .findByEmail(email)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "User not found"
                                )
                        );

        user.setPassword(
                passwordEncoder.encode(newPassword)
        );

        userRepository.save(user);
    }

    public UserResponseDTO getProfile(
            String email
    ) {

        User user =

                userRepository
                        .findByEmail(email)
                        .orElseThrow(() ->

                                new RuntimeException(
                                        "User not found"
                                )
                        );

        UserResponseDTO dto =
                new UserResponseDTO();

        dto.setId(user.getId());

        dto.setName(user.getName());

        dto.setEmail(user.getEmail());

        dto.setCreatedAt(
                user.getCreatedAt()
        );

        return dto;
    }

    private UserResponseDTO mapToUserResponseDTO(User user) {

        UserResponseDTO dto = new UserResponseDTO();

        dto.setId(user.getId());
        dto.setName(user.getName());
        dto.setEmail(user.getEmail());
        dto.setCreatedAt(user.getCreatedAt());

        return dto;
    }
}