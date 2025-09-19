package com.sanjoy.profile_service.controllers;

import com.sanjoy.profile_service.models.Student;
import com.sanjoy.profile_service.models.Teacher;
import com.sanjoy.profile_service.repo.MCQRepository;
import com.sanjoy.profile_service.repo.PerformanceDiffLevelRepo;
import com.sanjoy.profile_service.repo.StudentRepository;
import com.sanjoy.profile_service.service.PracticeStreakService;
import com.sanjoy.profile_service.service.TeacherService;
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

    public static final String STUDENT_ID = "studentId";
    public static final String ATTEMPT_COUNT = "attemptCount";
    public static final String CORRECT_COUNT = "correctCount";
    public static final String LAST10_PERFORMANCE = "last10Performance";
    public static final String MISTAKEN_QUESTIONS = "mistakenQuestions";

    private static final Logger logger = LoggerFactory.getLogger(ProfileController.class);
    private final WebClient webClient;

    private final PracticeStreakService streakService;
    private final StudentRepository studentRepository;
    private final MCQRepository mcqRepository;
    private final TeacherService teacherService;
    private final PerformanceDiffLevelRepo performanceDiffLevelRepo;

    public ProfileController(WebClient.Builder webClientBuilder,
                             @Value("${ai.backend.url}") String aiBackendUrl,
                             PracticeStreakService streakService,
                             StudentRepository studentRepository,
                             MCQRepository mcqRepository,
                             TeacherService teacherService,
                             PerformanceDiffLevelRepo performanceDiffLevelRepo) {
        this.webClient = webClientBuilder.baseUrl(aiBackendUrl).build();
        this.streakService = streakService;
        this.studentRepository = studentRepository;
        this.mcqRepository = mcqRepository;
        this.teacherService = teacherService;
        this.performanceDiffLevelRepo = performanceDiffLevelRepo;
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
        requestBody.put(STUDENT_ID, student.getId());
        requestBody.put(ATTEMPT_COUNT, student.getAttemptCount());
        requestBody.put(CORRECT_COUNT, student.getCorrectCount());
        requestBody.put(LAST10_PERFORMANCE, student.getLast10Performance());
        requestBody.put(MISTAKEN_QUESTIONS, mistakenMCQs);

        String pythonEndpoint = "/profile/teacher/generate-report";
        try {
            return webClient.post()
                    .uri(pythonEndpoint)
                    .bodyValue(requestBody)
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();
        } catch (Exception e) {
            return "Failed to generate weakness report from AI: " + e.getMessage();
        }
    }

    @GetMapping("/teacher")
    public ResponseEntity<Map<String, Object>> getTeacherProfile(@RequestParam("username") String username) {
        logger.debug("DEBUG: profile/teacher endpoint called");
        // Fetch all students
        List<Student> students = studentRepository.findAll();
        students.removeIf(student -> student.getUsername().equals(username));

        teacherService.findOrCreate(username);

        // Prepare response
        Map<String, Object> response = new HashMap<>();
        List<Map<String, Object>> studentList = new ArrayList<>();

        for (Student student : students) {
            Map<String, Object> studentData = new HashMap<>();
            studentData.put("name", student.getUsername());
            studentData.put(ATTEMPT_COUNT, student.getAttemptCount());
            studentData.put(CORRECT_COUNT, student.getCorrectCount());
            studentData.put(LAST10_PERFORMANCE, student.getLast10Performance());
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
            .orElseGet(() -> new Student(username));

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
