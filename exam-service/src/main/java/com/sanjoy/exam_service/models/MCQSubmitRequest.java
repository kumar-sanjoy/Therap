package com.sanjoy.exam_service.models;

import lombok.Data;

import java.util.Map;

/**
 * @author kumar
 * @since 6/27/2025
 */
@Data
public class MCQSubmitRequest {
    private String username;
    private String subject;
    private Map<String, Boolean> questions;
    private int difficultyLevel;
}
