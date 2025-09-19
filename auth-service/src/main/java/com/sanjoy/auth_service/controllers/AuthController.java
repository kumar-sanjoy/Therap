package com.sanjoy.auth_service.controllers;

import com.sanjoy.auth_service.service.CustomUserDetailsService;
import com.sanjoy.auth_service.security.JwtUtil;
import com.sanjoy.auth_service.models.User;
import com.sanjoy.auth_service.service.PasswordResetService;
import com.sanjoy.auth_service.service.PracticeStreakService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.HashMap;
import java.util.Map;

/**
 * @author kumar
 * @since 6/15/2025
 */

@RestController
@RequestMapping("/auth")
public class AuthController {

    private static final Logger logger = LoggerFactory.getLogger(AuthController.class);

    private final CustomUserDetailsService userDetailsService;
    private final AuthenticationManager authenticationManager; // Added for login
    private final JwtUtil jwtUtil;
    private final PasswordResetService passwordResetService;
    private final PracticeStreakService practiceStreakService;


    public AuthController(CustomUserDetailsService userDetailsService,
                          AuthenticationManager authenticationManager,
                          PasswordResetService passwordResetService,
                          PracticeStreakService practiceStreakService,
                          JwtUtil jwtUtil) {
        this.userDetailsService = userDetailsService;
        this.authenticationManager = authenticationManager;
        this.passwordResetService = passwordResetService;
        this.practiceStreakService = practiceStreakService;
        this.jwtUtil = jwtUtil;
    }


    @PostMapping("/forgot-password")
    public ResponseEntity<String> forgotPassword(@RequestParam String email) {
        passwordResetService.createPasswordResetToken(email);
        return ResponseEntity.ok("Password reset link sent to your email. Please check your email");
    }

    @PostMapping("/reset-password")
    public ResponseEntity<String> resetPassword(@RequestParam String token,
                                                @RequestParam String newPassword) {
        passwordResetService.resetPassword(token, newPassword);
        return ResponseEntity.ok("Password has been reset successfully.");
    }

    @PostMapping("register")
    public ResponseEntity<?> registerUser(@RequestBody User user) {
        logger.debug("DEBUG: /register endpoint called");

        try {
            userDetailsService.register(user);
            User registerResponse = new User();
            registerResponse.setUsername(user.getUsername());
            registerResponse.setEmail(user.getEmail());
            return ResponseEntity.ok(registerResponse);
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("An unexpected error occurred during registration.");
        }
    }

    @GetMapping("/register/confirmToken")
    public ResponseEntity<String> confirmToken(@RequestParam("token") String token) {
        logger.debug("DEBUG: /confirm-token endpoint called");
        try {
            userDetailsService.confirmToken(token);
            return ResponseEntity.ok("Token confirmed successfully");
        } catch (IllegalStateException e) {
            if (e.getMessage().contains("already confirmed")) {
                return ResponseEntity
                        .status(HttpStatus.CONFLICT) // 409 Conflict
                        .body("User already confirmed");
            }
            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Something went wrong");
        }
    }


    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody User user) {
        logger.debug("DEBUG: /login endpoint called");
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(user.getUsername(), user.getPassword())
            );
            UserDetails userDetails = (UserDetails) authentication.getPrincipal();
            String jwt = jwtUtil.generateToken(userDetails);

            User dbUser = (User) userDetailsService.loadUserByUsername(user.getUsername());
            if (dbUser.getRole() != user.getRole()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body("Invalid role for this user.");
            }

            Map<String, Object> response = new HashMap<>();
            response.put("jwt", jwt);
            response.put("username", userDetails.getUsername());
            response.put("role", user.getRole());
            int currentStreak = practiceStreakService.getCurrentStreak(user.getUsername());
            response.put("streak", currentStreak);

            return ResponseEntity.ok(response);

        } catch (AuthenticationException e) {
            e.printStackTrace();

            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Invalid username or password.");

        } catch (Exception e) {
            e.printStackTrace();

            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("An unexpected error occurred during login.");
        }
    }

}
