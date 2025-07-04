package com.sanjoy.auth_service.models;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

/*
 * @author kumar
 * @since 6/15/2025
 */
@Entity
@Table(name = "confirmation_token")
@Data
public class Token {
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE)
    @Column(name = "id")
    private Long id;

    @Column(name = "token", nullable = false)
    private String token;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "expires_at", nullable = false)
    private LocalDateTime expiresAt;

    @Column(name = "confirmed_at")
    private LocalDateTime confirmedAt;


    @ManyToOne
    @JoinColumn(
            nullable = false, name = "user_id"
    )
    private User user;

    public Token() {
    }

    public Token(String token, LocalDateTime createdAt, LocalDateTime expiresAt, User user) {
        this.user = user;
        this.expiresAt = expiresAt;
        this.createdAt = createdAt;
        this.token = token;
    }

}
