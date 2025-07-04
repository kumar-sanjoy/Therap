package com.sanjoy.auth_service.repo;

import com.sanjoy.auth_service.models.Token;
import org.springframework.data.repository.CrudRepository;

import java.util.Optional;

/*
 *@author kumar
 * @since 6/15/2025
 */

public interface TokenRepo extends CrudRepository<Token, Long> {
    Optional<Token> findByToken(String token);
}
