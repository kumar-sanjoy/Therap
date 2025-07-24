package com.sanjoy.profile_service.controllers;

import com.sanjoy.profile_service.models.Student;
import com.sanjoy.profile_service.repo.MCQRepository;
import com.sanjoy.profile_service.repo.StudentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.*;

/**
 * @author kumar
 * @since 7/1/2025
 */
@RestController
@RequestMapping("/profile")
public class ProfileController {

    private final WebClient webClient;

    @Autowired
    StudentRepository studentRepository;

    @Autowired
    MCQRepository mcqRepository;

    public ProfileController(WebClient.Builder webClientBuilder,
                          @Value("${ai.backend.url}") String aiBackendUrl) {
        this.webClient = webClientBuilder.baseUrl(aiBackendUrl).build();
    }

    @GetMapping("teacher/generate-report")
    public String getTeacherReport(@RequestParam("username") String username) {
        Optional<Student> studentOpt = studentRepository.findByUsername(username);
        if (studentOpt.isEmpty()) {
            return "Student not found";
        }

        Student student = studentOpt.get();
        List<String> mistakenMCQs = mcqRepository.findStatementByStudentUsername(username);

        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("studentId", student.getId());
        requestBody.put("attemptCount", student.getAttemptCount());
        requestBody.put("correctCount", student.getCorrectCount());
        requestBody.put("last10Performance", student.getLast10Performance());
        requestBody.put("mistakenQuestions", mistakenMCQs);

        String pythonEndpoint = "/profile/teacher/generate-report";
        try {
            String response = webClient.post()
                    .uri(pythonEndpoint)
                    .bodyValue(requestBody)
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();

            System.out.println("Received weakness report from Python AI backend: " + response);
            return response;
        } catch (Exception e) {
            System.err.println("Error calling Python AI backend: " + e.getMessage());
            return "Failed to generate weakness report from AI: " + e.getMessage();
        }
    }

    @GetMapping("/teacher")
    public ResponseEntity<Map<String, Object>> getTeacherProfile(@RequestParam("username") String username) {

        // Fetch all students
        List<Student> students = studentRepository.findAll();

        // Prepare response
        Map<String, Object> response = new HashMap<>();
        List<Map<String, Object>> studentList = new ArrayList<>();

        for (Student student : students) {
            Map<String, Object> studentData = new HashMap<>();
            studentData.put("name", student.getUsername());
            studentData.put("attemptCount", student.getAttemptCount());
            studentData.put("correctCount", student.getCorrectCount());
            studentData.put("last10Performance", student.getLast10Performance());
            studentList.add(studentData);
        }

        response.put("teacher_username", username);
        response.put("students", studentList);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/student")
    public ResponseEntity<Map<String, Object>> getStudentProfile(@RequestParam("username") String username) {

        Student student;
        Optional<Student> studentOpt = studentRepository.findByUsername(username);
        if (studentOpt.isEmpty()) {
            student = new Student();
            student.setAttemptCount(0);
            student.setCorrectCount(0);
            student.setLast10Performance(new ArrayList<>());
        } else {
            student = studentOpt.get();
        }

        Map<String, Object> stdResponse = new HashMap<>();
        stdResponse.put("id", student.getId());
        stdResponse.put("attemptCount", student.getAttemptCount());
        stdResponse.put("correctCount", student.getCorrectCount());
        stdResponse.put("last10Performance", student.getLast10Performance());

        return ResponseEntity.ok(stdResponse);
    }
}
