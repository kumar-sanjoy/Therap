package com.sanjoy.profile_service.controllers;

import com.sanjoy.profile_service.models.Student;
import com.sanjoy.profile_service.models.Teacher;
import com.sanjoy.profile_service.repo.MCQRepository;
import com.sanjoy.profile_service.repo.PerformanceDiffLevelRepo;
import com.sanjoy.profile_service.repo.StudentRepository;
import com.sanjoy.profile_service.repo.TeacherRepository;
import com.sanjoy.profile_service.service.PracticeStreakService;
import com.sanjoy.profile_service.service.TeacherService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.reactive.function.client.WebClient;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import java.util.*;

/**
 * @author kumar
 * @since 7/1/2025
 */
@RestController
@RequestMapping("/profile")
public class ProfileController {
    private static final Logger logger = LoggerFactory.getLogger(ProfileController.class);
    private final WebClient webClient;

    @Autowired
    PracticeStreakService streakService;

    @Autowired
    StudentRepository studentRepository;

    @Autowired
    MCQRepository mcqRepository;

    @Autowired
    TeacherService teacherService;

    @Autowired
    PerformanceDiffLevelRepo performanceDiffLevelRepo;

    public ProfileController(WebClient.Builder webClientBuilder, @Value("${ai.backend.url}") String aiBackendUrl) {
        this.webClient = webClientBuilder.baseUrl(aiBackendUrl).build();
    }

    @GetMapping("teacher/generate-report")
    public String getTeacherReport(@RequestParam("username") String username) {
        logger.debug("DEBUG: profile/generate-report endpoint called");
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

            // System.out.println("Received weakness report from Python AI backend: " + response);
            return response;
        } catch (Exception e) {
            // System.err.println("Error calling Python AI backend: " + e.getMessage());
            return "Failed to generate weakness report from AI: " + e.getMessage();
        }
    }

    @GetMapping("/teacher")
    public ResponseEntity<Map<String, Object>> getTeacherProfile(@RequestParam("username") String username) {
        logger.debug("DEBUG: profile/teacher endpoint called");
        // Fetch all students
        List<Student> students = studentRepository.findAll();
        students.removeIf(student -> student.getUsername().equals(username));

        Teacher teacher = teacherService.findOrCreate(username);

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
        logger.debug("DEBUG: profile/student endpoint called");

        int currentStreak = 0;
        Student student = studentRepository.findByUsername(username)
            .orElseGet(() -> {
                return new Student(username);
            });

        if (student.getId() != null) {
            currentStreak = streakService.getCurrentStreak(username);
        }

        Teacher teacher = teacherService.findByStudentUsername(username);

        List<Object[]> subjectData = performanceDiffLevelRepo.findCorrectVsTotalPerSubjectAndUser(username);
        Map<String, Object> stdResponse = new HashMap<>();
        stdResponse.put("id", student.getId());
        stdResponse.put("attemptCount", student.getAttemptCount());
        stdResponse.put("correctCount", student.getCorrectCount());
        stdResponse.put("last10Performance", student.getLast10Performance());
        stdResponse.put("currentStreak", currentStreak);
        stdResponse.put("subjectProgress", subjectData);
        stdResponse.put("teacher", teacher.getUsername());

        return ResponseEntity.ok(stdResponse);
    }

    @GetMapping("/student/upsert-teacher")
    public ResponseEntity<Map<String, String>> upsertTeacher(@RequestParam("username") String studentUsername,
                                                             @RequestParam("teacher") String teacherUsername) {
        Map<String, String> res = new HashMap<>();
        String message = teacherService.upsertTeacher(studentUsername, teacherUsername);
        res.put("message", message);
        return ResponseEntity.ok(res);
    }

    @GetMapping("/student/get-teachers")
    public ResponseEntity<Object> getTeachers() {
        List<String> teacherUsernames = teacherService.findAll()
                .stream()
                .map(Teacher::getUsername)
                .toList(); // Java 16+, or use collect(Collectors.toList()) for older versions

        Map<String, List<String>> res = new HashMap<>();
        res.put("teachers", teacherUsernames);

        return ResponseEntity.ok(res);
    }

}
