package com.sanjoy.exam_service.models;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * @author kumar
 * @since 7/24/2025
 */

@Data
@Entity
@AllArgsConstructor
@NoArgsConstructor
public class PerformanceDiffLevel {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String username;
    private String subject;
    private int performance;
    private int difficultyLevel;
    private boolean isCorrect;

    public PerformanceDiffLevel(String username, String subject, int performance, int difficultyLevel, Boolean isCorrect) {
        this.username = username;
        this.subject = subject;
        this.performance = performance;
        this.difficultyLevel = difficultyLevel;
        this.isCorrect = isCorrect;
    }
}
