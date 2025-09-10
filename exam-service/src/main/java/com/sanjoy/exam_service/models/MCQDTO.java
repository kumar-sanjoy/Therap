package com.sanjoy.exam_service.models;

import lombok.Data;

import java.util.Map;

/**
 * @author kumar
 * @since 9/7/2025
 */
@Data
public class MCQDTO {
    private Long id;
    private String question;
    private String hint;
    private String explanation;
    private Map<String, String> options;
}
