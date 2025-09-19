package com.sanjoy.profile_service.models;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

/**
 * @author kumar
 * @since 6/27/2025
 */

@Data
@Entity
@NoArgsConstructor
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

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "teacher_id", nullable = true)
    private Teacher teacher;

    public void recordAttempt(boolean isCorrect) {
        if (last10Performance.size() >= 10) {
            last10Performance.removeFirst();
        }
        last10Performance.add(isCorrect);

        attemptCount++;
        if (isCorrect) correctCount++;
    }

    public Student(String username) {
        this.username = username;
        this.attemptCount = 0;
        this.correctCount = 0;
        this.last10Performance = new ArrayList<>();
    }
}
