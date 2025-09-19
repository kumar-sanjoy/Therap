package com.sanjoy.profile_service.service;

import com.sanjoy.profile_service.models.Student;
import com.sanjoy.profile_service.models.Teacher;
import com.sanjoy.profile_service.repo.StudentRepository;
import com.sanjoy.profile_service.repo.TeacherRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * @author kumar
 * @since 9/3/2025
 */
@Service
public class TeacherService {
    private final TeacherRepository teacherRepository;
    private final StudentRepository studentRepository;

    public TeacherService(TeacherRepository teacherRepository,
                          StudentRepository studentRepository) {
        this.teacherRepository = teacherRepository;
        this.studentRepository = studentRepository;
    }

    @Transactional
    public Teacher findOrCreate(String username) {
        return teacherRepository.findByUsername(username)
                .orElseGet(() -> teacherRepository.save(new Teacher(username)));
    }

    public List<Teacher> findAll() {
        return teacherRepository.findAll();
    }

    @Transactional
    public String upsertTeacher(String studentUsername, String teacherUsername) {
        Student student = studentRepository.findByUsername(studentUsername)
                .orElseThrow(() -> new RuntimeException("Student not found: " + studentUsername));

        Teacher teacher = findOrCreate(teacherUsername);

        // Case 1: Already assigned to same teacher → no action
        if (student.getTeacher() != null && student.getTeacher().getId().equals(teacher.getId())) {
            return "No change. Student already assigned to this teacher.";
        }

        // Case 2 & 3: Assign new teacher (either null or different one)
        student.setTeacher(teacher);
        studentRepository.save(student);

        if (student.getTeacher() == null) {
            return "Teacher \"" + teacherUsername + "\" assigned to student \"" + studentUsername + "\"";
        } else {
            return "Teacher for student \"" + studentUsername + "\" updated to \"" + teacherUsername + "\"";
        }
    }

    @Transactional(readOnly = true)
    public Teacher findByStudentUsername(String username) {
        Student student = studentRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Student not found: " + username));

        return student.getTeacher();
    }

}
