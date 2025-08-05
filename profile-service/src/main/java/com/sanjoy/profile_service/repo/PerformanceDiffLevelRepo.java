package com.sanjoy.profile_service.repo;

import com.sanjoy.profile_service.models.PerformanceDiffLevel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

/*
 * @author kumar
 * @since 7/24/2025
 */
public interface PerformanceDiffLevelRepo extends JpaRepository<PerformanceDiffLevel, Long> {
    @Query("SELECT p.performance, p.difficultyLevel, p.isCorrect FROM PerformanceDiffLevel p WHERE p.username = :username AND p.subject = :subject")
    List<Object[]> findPerformanceInfo(@Param("username") String username, @Param("subject") String subject);


    @Query("SELECT p.subject, SUM(CASE WHEN p.isCorrect = true THEN 1L ELSE 0L END), COUNT(p) " +
            "FROM PerformanceDiffLevel p " +
            "WHERE p.username = :username " +
            "GROUP BY p.subject")
    List<Object[]> findCorrectVsTotalPerSubjectAndUser(@Param("username") String username);

    default void insertPerformance(String username, String subject, int performance, int difficulty, boolean isCorrect) {
        PerformanceDiffLevel p = new PerformanceDiffLevel();
        p.setUsername(username);
        p.setSubject(subject);
        p.setPerformance(performance);
        p.setDifficultyLevel(difficulty);
        p.setCorrect(isCorrect);

        save(p); // save() comes from JpaRepository
    }

}
