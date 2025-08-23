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
 * @since 6/27/2025
 */

@Data
@Entity
@NoArgsConstructor
@AllArgsConstructor
public class Sub {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String name;

    public Sub(String name) {
        this.name = name;
    }
}
