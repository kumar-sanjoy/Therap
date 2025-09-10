package com.sanjoy.exam_service.repo;

import com.sanjoy.exam_service.models.MCQ;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.Set;

/*
 * @author kumar
 * @since 6/27/2025
 */
public interface MCQRepository extends JpaRepository<MCQ, Long> {
    Optional<MCQ> findIdByStatement(String question);

    @Query("SELECT m.statement FROM MCQ m WHERE m.statement IN :statements")
    Set<String> findExistingQuestions(@Param("statements") Set<String> statements);

    @Query("SELECT m FROM MCQ m WHERE m.statement = :statement AND m.mistakenByStudent.username = :username")
    Optional<MCQ> findByStatementAndUsername(@Param("statement") String statement, @Param("username") String username);

    @Query("SELECT m.statement from MCQ m WHERE m.mistakenByStudent.username = :username AND m.sub.id =:subjectId")
    List<String> findStatementByStudentUsernameAndSubject(@Param("username") String username, @Param("subjectId") Long subjectId);

}