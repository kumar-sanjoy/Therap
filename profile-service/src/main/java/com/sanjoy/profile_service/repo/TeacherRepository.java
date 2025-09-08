package com.sanjoy.profile_service.repo;

import com.sanjoy.profile_service.models.Teacher;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

/*
 * @author kumar
 * @since 9/3/2025
 */
public interface TeacherRepository extends JpaRepository<Teacher, Long> {
    Optional<Teacher> findByUsername(String username);
}
