package com.sanjoy.auth_service.service;

import com.sanjoy.auth_service.models.Token;
import com.sanjoy.auth_service.repo.TokenRepo;
import org.springframework.stereotype.Service;

import java.util.Optional;

/**
 * @author kumar
 * @since 6/15/2025
 */
@Service
public class TokenService {
    private final TokenRepo tokenRepo;

    public TokenService(TokenRepo tokenRepo) {
        this.tokenRepo = tokenRepo;
    }

    public Optional<Token> findByToken(String token) {
        return tokenRepo.findByToken(token);
    }

    public Token save(Token token) {
        return tokenRepo.save(token);
    }
}
