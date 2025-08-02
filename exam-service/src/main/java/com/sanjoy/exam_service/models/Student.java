package com.sanjoy.exam_service.models;

import jakarta.persistence.*;
import lombok.Data;

import java.util.List;

/**
 * @author kumar
 * @since 6/27/2025
 */

@Data
@Entity
public class Student {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String username;

    // Stores up to 10 recent MCQ outcomes (true = correct, false = wrong)
    @ElementCollection
    @CollectionTable(name = "student_performance", joinColumns = @JoinColumn(name = "student_id"))
    @Column(name = "result")
    private List<Boolean> last10Performance;

    private int attemptCount;
    private int correctCount;

    public void recordAttempt(boolean isCorrect) {
        if (last10Performance.size() >= 10) {
            last10Performance.removeFirst();
        }
        last10Performance.add(isCorrect);

        attemptCount++;
        if (isCorrect) correctCount++;
    }
}
