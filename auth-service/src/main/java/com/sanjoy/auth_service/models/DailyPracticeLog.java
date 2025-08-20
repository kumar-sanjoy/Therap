package com.sanjoy.auth_service.models;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

/**
 * @author kumar
 * @since 8/3/2025
 */
@Entity
@Table(
        name = "daily_practice_logs",
        uniqueConstraints = @UniqueConstraint(columnNames = {"username", "practiced_on"})
)
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DailyPracticeLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String username;

    @Column(name = "practiced_on", nullable = false)
    private LocalDate practicedOn;
}