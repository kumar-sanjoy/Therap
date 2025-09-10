package com.sanjoy.exam_service.repo;

import com.sanjoy.exam_service.models.ChallengeAttempt;
import com.sanjoy.exam_service.models.ChallengeExam;
import com.sanjoy.exam_service.models.Student;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

/*
 * @author kumar
 * @since 9/7/2025
 */
public interface ChallengeAttemptRepository extends JpaRepository<ChallengeAttempt, Long> {
    Optional<ChallengeAttempt> findByStudentAndChallengeExam(Student student, ChallengeExam challengeExam);
}
