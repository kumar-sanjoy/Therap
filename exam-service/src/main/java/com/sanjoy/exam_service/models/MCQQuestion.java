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
public class MCQQuestion {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Lob
    @Column(columnDefinition = "TEXT")
    private String question;

    @Lob
    @Column(columnDefinition = "TEXT")
    private String explanation;

    @Lob
    @Column(columnDefinition = "TEXT")
    private String hint;

    @ElementCollection
    @CollectionTable(name = "mcq_options", joinColumns = @JoinColumn(name = "mcq_id"))
    @MapKeyColumn(name = "option_key")
    @Column(name = "option_value")
    private Map<String, String> options = new HashMap<>(); // a,b,c,d → text

    private String answer; // correct option key ("a","b","c","d")

    @ManyToOne
    @JoinColumn(name = "challenge_exam_id")
    private ChallengeExam challengeExam;

}
