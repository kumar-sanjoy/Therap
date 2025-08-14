package com.sanjoy.profile_service.repo;

import com.sanjoy.profile_service.models.DailyPracticeLog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

/**
 * @author kumar
 * @since 8/3/2025
 */
public interface DailyPracticeLogRepository extends JpaRepository<DailyPracticeLog, Long> {
    List<DailyPracticeLog> findByUsernameOrderByPracticedOnDesc(String username);
    boolean existsByUsernameAndPracticedOn(String username, LocalDate practicedOn);
    void deleteByUsername(String username);
}