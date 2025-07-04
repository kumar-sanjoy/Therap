package com.sanjoy.auth_service.repo;

import com.sanjoy.auth_service.models.User;
import org.springframework.data.repository.CrudRepository;

import java.util.Optional;
/*
 * @author kumar
 * @since 6/15/2025
 */
public interface UserRepo extends CrudRepository<User, Long> {
    Optional<User> findByUsername(String username);
    Optional<User> findByEmail(String email);
}
