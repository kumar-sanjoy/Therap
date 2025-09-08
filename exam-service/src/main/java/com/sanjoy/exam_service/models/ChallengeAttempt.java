package com.sanjoy.exam_service.models;

import jakarta.persistence.*;
import lombok.Data;

import java.util.*;

/**
 * @author kumar
 * @since 9/7/2025
 */
@Entity
@Data
public class ChallengeAttempt {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "challenge_exam_id")
    private ChallengeExam challengeExam;

    @ManyToOne
    @JoinColumn(name = "student_id")
    private Student student;

    private int score; // number of correct answers
    private Integer totalMarks;

    private Date attemptedAt = new Date();

}
