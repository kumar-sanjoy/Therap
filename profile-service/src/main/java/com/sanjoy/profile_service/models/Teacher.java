package com.sanjoy.profile_service.models;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * @author kumar
 * @since 9/3/2025
 */
@Entity
@NoArgsConstructor
@Data
public class Teacher {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String username;

    @OneToMany(mappedBy = "teacher", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Student> students;

    public Teacher(String username) {
        this.username = username;
    }
}
