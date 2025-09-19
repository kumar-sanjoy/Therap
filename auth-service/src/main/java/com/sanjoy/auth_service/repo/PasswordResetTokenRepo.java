package com.sanjoy.auth_service.repo;

import com.sanjoy.auth_service.models.PasswordResetToken;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.UUID;

/*
 * @author kumar
 * @since 9/12/2025
 */

public interface PasswordResetTokenRepo extends JpaRepository<PasswordResetToken, UUID> {
    Optional<PasswordResetToken> findByToken(String token);
}
