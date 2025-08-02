package com.sanjoy.profile_service.models;

import jakarta.persistence.*;
import lombok.Data;

/**
 * @author kumar
 * @since 6/27/2025
 */
@Data
@Entity
public class MCQ {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String statement;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "mistaken_by_student_id")
    private Student mistakenByStudent;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "subject_id")
    private Sub sub;
}
