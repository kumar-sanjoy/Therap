package com.sanjoy.profile_service.repo;

import com.sanjoy.profile_service.models.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

/*
 * @author kumar
 * @since 6/27/2025
 */
public interface StudentRepository extends JpaRepository<Student, Long> {
    Optional<Student> findByUsername(@Param("username") String username);
}