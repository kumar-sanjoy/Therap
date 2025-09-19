package com.sanjoy.auth_service.service;

import com.sanjoy.auth_service.models.Token;
import com.sanjoy.auth_service.models.User;
import com.sanjoy.auth_service.repo.UserRepo;

import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

/**
 * @author kumar
 * @since 6/15/2025
 */
@Service
public class CustomUserDetailsService implements UserDetailsService {
    private final UserRepo userRepo;
    private final PasswordEncoder passwordEncoder;
    private final TokenService tokenService;
    private final EmailService emailService;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        Optional<User> userOptional = userRepo.findByUsername(username);
        if (userOptional.isEmpty()) {
            throw new UsernameNotFoundException("User not found with username: " + username);
        }
        return userOptional.get();
    }

    public CustomUserDetailsService(UserRepo userRepo, PasswordEncoder passwordEncoder,
                                    TokenService tokenService, EmailService emailService) {
        this.userRepo = userRepo;
        this.passwordEncoder = passwordEncoder;
        this.tokenService = tokenService;
        this.emailService = emailService;
    }

    public void register(User user) {

        // 1. Check if username already exists
        if (userRepo.findByUsername(user.getUsername()).isPresent()) {
            throw new IllegalStateException("Username already exists");
        }

        // 2. Check if email already exists
        if (userRepo.findByEmail(user.getEmail()).isPresent()) {
            throw new IllegalStateException("Email already exists");
        }

        // encrypt password, and store it into user
        String password = passwordEncoder.encode(user.getPassword());
        user.setPassword(password);
        userRepo.save(user);

        // email confirm account:
        // after email confirmation user account enable becomes true
        Token confirmationToken = new Token(
                UUID.randomUUID().toString(),
                LocalDateTime.now(),
                LocalDateTime.now().plusMinutes(15),
                user
        );

        tokenService.save(confirmationToken);
        emailService.sendConfirmationEmail(user.getEmail(), confirmationToken.getToken());
    }

    public void confirmToken(String token) {
        Token confirmedToken = tokenService.findByToken(token)
                .orElseThrow(() -> new IllegalStateException("Invalid Token"));

        if(confirmedToken.getConfirmedAt() != null) {
            throw new IllegalStateException("User already confirmed");
        }

        LocalDateTime expiresAt = confirmedToken.getExpiresAt();
        if(expiresAt.isBefore(LocalDateTime.now())) {
            throw new IllegalStateException("Token Expired");
        }

        confirmedToken.setConfirmedAt(LocalDateTime.now());
        tokenService.save(confirmedToken);

        enableUser(confirmedToken.getUser());
    }

    public void enableUser(User user) {
        user.setEnabled(true);
        userRepo.save(user);
    }
}
