package com.sanjoy.exam_service.models;

import lombok.Data;
import jakarta.persistence.*;
import java.util.*;


/**
 * @author kumar
 * @since 9/7/2025
 */
@Entity
@Data
public class ChallengeExam {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;  // challengeId

    @ManyToOne
    @JoinColumn(name = "subject_id")
    private Sub subject;

    @ManyToOne
    @JoinColumn(name = "creator_id")
    private Student creator; // who generated the exam first

    @OneToMany(mappedBy = "challengeExam", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<MCQQuestion> mcqs = new ArrayList<>();

    @OneToMany(mappedBy = "challengeExam", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ChallengeAttempt> attempts = new ArrayList<>();

    private Date createdAt = new Date();

    public ChallengeExam() {
        // Default constructor required by JPA
    }

    public ChallengeExam(Sub subject, Student creator, List<Map<String, Object>> challengeQuestions) {
        this.subject = subject;
        this.creator = creator;

        if (challengeQuestions != null) {
            for (Map<String, Object> mcqMap : challengeQuestions) {
                MCQQuestion mcqQuestion = new MCQQuestion();

                mcqQuestion.setQuestion((String) mcqMap.get("question"));
                mcqQuestion.setAnswer((String) mcqMap.get("answer"));
                mcqQuestion.setHint((String) mcqMap.get("hint"));
                mcqQuestion.setExplanation((String) mcqMap.get("explanation"));

                // Convert options map
                Map<String, String> options = new HashMap<>();
                Map<String, Object> opts = (Map<String, Object>) mcqMap.get("options");
                if (opts != null) {
                    for (Map.Entry<String, Object> entry : opts.entrySet()) {
                        options.put(entry.getKey(), (String) entry.getValue());
                    }
                }
                mcqQuestion.setOptions(options);

                // Link back to this ChallengeExam
                mcqQuestion.setChallengeExam(this);

                // Add to mcqs list
                this.mcqs.add(mcqQuestion);
            }
        }
    }
}