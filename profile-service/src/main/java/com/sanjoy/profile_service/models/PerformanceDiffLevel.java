package com.sanjoy.profile_service.models;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.Data;

/**
 * @author kumar
 * @since 7/24/2025
 */

@Data
@Entity
public class PerformanceDiffLevel {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String username;
    private String subject;
    private int performance;
    private int difficultyLevel;
    private boolean isCorrect;
}
