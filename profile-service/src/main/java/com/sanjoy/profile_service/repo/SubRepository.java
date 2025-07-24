package com.sanjoy.profile_service.repo;

import com.sanjoy.profile_service.models.Sub;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

/*
 * @author kumar
 * @since 6/27/2025
 */
public interface SubRepository extends JpaRepository<Sub, Long> {
    public Optional<Sub> findByName(String name);
}
