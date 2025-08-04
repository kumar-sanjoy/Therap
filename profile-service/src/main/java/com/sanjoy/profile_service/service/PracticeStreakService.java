package com.sanjoy.exam_service.service;

import com.sanjoy.exam_service.models.DailyPracticeLog;
import com.sanjoy.exam_service.repo.DailyPracticeLogRepository;

import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

/**
 * @author kumar
 * @since 8/3/2025
 */
@Service
public class PracticeStreakService {

    private final DailyPracticeLogRepository logRepository;

    public PracticeStreakService(DailyPracticeLogRepository logRepository) {
        this.logRepository = logRepository;
    }

    public void logPractice(String username) {
        LocalDate today = LocalDate.now();

        // If today's log already exists, do nothing
        if (logRepository.existsByUsernameAndPracticedOn(username, today)) {
            return;
        }

        // Get all practice logs (most recent first)
        List<DailyPracticeLog> logs = logRepository.findByUsernameOrderByPracticedOnDesc(username);

        // Check if the streak is broken (missing any day between today and earliest log)
        boolean broken = false;
        LocalDate expected = today.minusDays(1);
        for (DailyPracticeLog log : logs) {
            if (log.getPracticedOn().equals(expected)) {
                expected = expected.minusDays(1);
            } else {
                broken = true;
                break;
            }
        }

        if (broken) {
            logRepository.deleteByUsername(username);
        }

        // Insert today’s log
        DailyPracticeLog newLog = DailyPracticeLog.builder()
                .username(username)
                .practicedOn(today)
                .build();
        logRepository.save(newLog);
    }

    public int getCurrentStreak(String username) {
        List<DailyPracticeLog> logs = logRepository.findByUsernameOrderByPracticedOnDesc(username);
        LocalDate today = LocalDate.now();
        int streak = 0;

        for (DailyPracticeLog log : logs) {
            LocalDate expected = today.minusDays(streak);
            if (log.getPracticedOn().equals(expected)) {
                streak++;
            } else {
                break;
            }
        }

        return streak;
    }
}
