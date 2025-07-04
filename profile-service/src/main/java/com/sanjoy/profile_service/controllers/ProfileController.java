package com.sanjoy.profile_service.controllers;

import com.sanjoy.profile_service.models.Student;
import com.sanjoy.profile_service.repo.StudentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.*;

/**
 * @author kumar
 * @since 7/1/2025
 */
@RestController
@RequestMapping("/profile")
public class ProfileController {

    @Autowired
    StudentRepository studentRepository;

    @GetMapping("/teacher")
    public ResponseEntity<Map<String, Object>> getTeacherProfile(@RequestParam("teacherId") Long teacherId) {

        // Fetch all students
        List<Student> students = studentRepository.findAll();

        // Prepare response
        Map<String, Object> response = new HashMap<>();
        List<Map<String, Object>> studentList = new ArrayList<>();

        for (Student student : students) {
            Map<String, Object> studentData = new HashMap<>();
            studentData.put("id", student.getId());
            studentData.put("attemptCount", student.getAttemptCount());
            studentData.put("correctCount", student.getCorrectCount());
            studentData.put("last10Performance", student.getLast10Performance());
            studentList.add(studentData);
        }

        response.put("teacherId", teacherId);
        response.put("students", studentList);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/student")
    public ResponseEntity<Map<String, Object>> getStudentProfile(@RequestParam("studentId") Long studentId) {

        Optional<Student> studentOpt = studentRepository.findById(studentId);
        if (studentOpt.isEmpty()) {
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Student not found");
            return ResponseEntity.status(HttpStatus.CONFLICT).body(response);
        }

        Student student = studentOpt.get();

        Map<String, Object> stdResponse = new HashMap<>();
        stdResponse.put("id", student.getId());
        stdResponse.put("attemptCount", student.getAttemptCount());
        stdResponse.put("correctCount", student.getCorrectCount());
        stdResponse.put("last10Performance", student.getLast10Performance());

        return ResponseEntity.ok(stdResponse);
    }
}
