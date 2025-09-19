package com.sanjoy.auth_service.service;

import com.sanjoy.auth_service.models.PasswordResetToken;
import com.sanjoy.auth_service.models.User;
import com.sanjoy.auth_service.repo.PasswordResetTokenRepo;
import com.sanjoy.auth_service.repo.UserRepo;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * @author kumar
 * @since 9/12/2025
 */


@Service
public class PasswordResetService {

    private final UserRepo userRepo;
    private final PasswordResetTokenRepo passwordResetTokenRepo;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;


    public PasswordResetService(UserRepo userRepo,
                                PasswordResetTokenRepo passwordResetTokenRepo,
                                EmailService emailService,
                                PasswordEncoder passwordEncoder) {
        this.userRepo = userRepo;
        this.passwordResetTokenRepo = passwordResetTokenRepo;
        this.emailService = emailService;
        this.passwordEncoder = passwordEncoder;
    }

    public String createPasswordResetToken(String email) {
        User user = userRepo.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        PasswordResetToken passwordResetToken = new PasswordResetToken();
        passwordResetToken.setToken(UUID.randomUUID().toString());
        passwordResetToken.setUser(user);
        passwordResetToken.setExpiryDate(LocalDateTime.now().plusMinutes(15));
        passwordResetTokenRepo.save(passwordResetToken);
        emailService.sendPasswordResetEmail(email, passwordResetToken.getToken());

        return passwordResetToken.getToken();
    }

    public void resetPassword(String token, String newPassword) {
        PasswordResetToken resetToken = passwordResetTokenRepo.findByToken(token)
                .orElseThrow(() -> new IllegalArgumentException("Invalid token"));

        if (resetToken.isUsed() || resetToken.getExpiryDate().isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("Token is invalid or expired");
        }

        User user = resetToken.getUser();
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepo.save(user);

        resetToken.setUsed(true); // mark as used
        passwordResetTokenRepo.save(resetToken);
    }
}
