package com.sanjoy.auth_service.controllers;

import com.sanjoy.auth_service.service.CustomUserDetailsService;
import com.sanjoy.auth_service.security.JwtUtil;
import com.sanjoy.auth_service.models.User;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

/**
 * @author kumar
 * @since 6/15/2025
 */

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final CustomUserDetailsService userDetailsService;
    private final AuthenticationManager authenticationManager; // Added for login
    private final JwtUtil jwtUtil;


    public AuthController(CustomUserDetailsService userDetailsService,
                          AuthenticationManager authenticationManager,
                          JwtUtil jwtUtil) {
        this.userDetailsService = userDetailsService;
        this.authenticationManager = authenticationManager;
        this.jwtUtil = jwtUtil;
    }

    @PostMapping("register")
    public ResponseEntity<?> registerUser(@RequestBody User user) {
        System.out.println("register hit");
        System.out.println(user.getUsername());
        try {
            userDetailsService.register(user);
            User registerResponse = new User();
            registerResponse.setUsername(user.getUsername());
            registerResponse.setEmail(user.getEmail());
            return ResponseEntity.ok(registerResponse);
        } catch (IllegalStateException e) {
            // Catch the specific IllegalStateException thrown by your service
            // This will include messages like "Username already exists", "Email already exists"
            // Return 409 Conflict for resource conflicts
            return ResponseEntity.status(HttpStatus.CONFLICT).body(e.getMessage());
        } catch (Exception e) {
            // Catch any other unexpected exceptions
            // Log the exception for internal debugging
            System.err.println("Error during user registration: " + e.getMessage());
            // Return 500 Internal Server Error for unhandled exceptions
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("An unexpected error occurred during registration.");
        }
    }

    @GetMapping("/register/confirmToken")
    public ResponseEntity<String> confirmToken(@RequestParam("token") String token) {
        userDetailsService.confirmToken(token);
        return ResponseEntity.ok("Token confirmed");
    }


    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody User user) {
        System.out.println("login hit");
        System.out.println(user.getUsername());
//        System.out.println(user.getPassword());
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(user.getUsername(), user.getPassword())
            );
            UserDetails userDetails = (UserDetails) authentication.getPrincipal();
            String jwt = jwtUtil.generateToken(userDetails);
//            System.out.println(jwt);

            Map<String, Object> response = new HashMap<>();
            response.put("jwt", jwt);
            response.put("username", userDetails.getUsername());
            System.out.println(response);

            return ResponseEntity.ok(response);

        } catch (AuthenticationException e) {
            // Log the authentication exception details
            System.err.println("Authentication failed for user: " + user.getUsername());
            System.err.println("Authentication error: " + e.getMessage());
            e.printStackTrace();

            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Invalid username or password.");

        } catch (Exception e) {
            // Log the unexpected exception with full stack trace
            System.err.println("Unexpected error during login for user: " + user.getUsername());
            System.err.println("Error type: " + e.getClass().getSimpleName());
            System.err.println("Error message: " + e.getMessage());
            e.printStackTrace();

            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("An unexpected error occurred during login.");
        }
    }

}
