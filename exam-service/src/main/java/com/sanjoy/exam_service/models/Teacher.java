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
 * @since 9/3/2025
 */
@Data
@Entity
@AllArgsConstructor
@NoArgsConstructor
public class Teacher {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String username;

    public Teacher(String username) {
        this.username = username;
    }

}
