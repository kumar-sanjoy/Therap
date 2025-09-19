package com.sanjoy.exam_service.controllers;

import com.sanjoy.exam_service.models.*;
import com.sanjoy.exam_service.repo.*;
import com.sanjoy.exam_service.service.PracticeStreakService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import io.netty.channel.ChannelOption;
import io.netty.handler.timeout.ReadTimeoutHandler;
import io.netty.handler.timeout.WriteTimeoutHandler;
import org.springframework.http.client.reactive.ReactorClientHttpConnector;

import org.springframework.http.HttpHeaders;
import org.springframework.web.reactive.function.client.WebClientResponseException;
import reactor.netty.http.client.HttpClient;

import java.io.IOException;
import java.time.Duration;
import java.util.*;
import java.util.stream.Collectors;

/**
 * @author kumar
 * @since 6/17/2025
 */
@RestController
@RequestMapping("/exam")
public class ExamController {
    private static final String USERNAME = "username";
    private static final String CLASS = "className";
    private static final String SUBJECT = "subject";
    private static final String CHAPTER = "chapter";
    private static final String COUNT = "count";
    private static final String PERFORMANCE = "performance";
    private static final String ERROR = "error";
    private static final Logger logger = LoggerFactory.getLogger(ExamController.class);
    private final WebClient webClient;
    private final MCQRepository mcqRepository;
    private final StudentRepository studentRepository;
    private final SubRepository subRepository;
    private final PerformanceDiffLevelRepo pdlr;
    private final PracticeStreakService practiceStreakService;
    private final ChallengeExamRepository challengeExamRepository;
    private final ChallengeAttemptRepository challengeAttemptRepository;


    public ExamController(WebClient.Builder webClientBuilder,
                          @Value("${ai.backend.url}") String aiBackendUrl,
                          MCQRepository mcqRepository,
                          StudentRepository studentRepository,
                          SubRepository subRepository,
                          PerformanceDiffLevelRepo pdlr,
                          PracticeStreakService practiceStreakService,
                          ChallengeExamRepository challengeExamRepository,
                          ChallengeAttemptRepository challengeAttemptRepository) {
        HttpClient httpClient = HttpClient.create()
                .option(ChannelOption.CONNECT_TIMEOUT_MILLIS, 10000) // 10s connect timeout
                .responseTimeout(Duration.ofSeconds(120))            // 120s response timeout
                .doOnConnected(conn ->
                        conn.addHandlerLast(new ReadTimeoutHandler(120))   // 120s read timeout
                                .addHandlerLast(new WriteTimeoutHandler(120))  // 120s write timeout
                );

        this.webClient = webClientBuilder
                .baseUrl(aiBackendUrl)
                .clientConnector(new ReactorClientHttpConnector(httpClient))
                .build();
        this.mcqRepository = mcqRepository;
        this.studentRepository = studentRepository;
        this.subRepository = subRepository;
        this.pdlr = pdlr;
        this.practiceStreakService = practiceStreakService;
        this.challengeExamRepository = challengeExamRepository;
        this.challengeAttemptRepository = challengeAttemptRepository;
    }

    @PostMapping("/submit-challenge")
    @Transactional
    public ResponseEntity<?> submitChallengeMinimal(@RequestBody Map<String, Object> payload) {
        logger.debug("submit-challenge hit");
        try {
            String challengeId = (String) payload.get("challengeId");
            String username = (String) payload.get(USERNAME);
            Integer score = (Integer) payload.get("score");
            Integer total = (Integer) payload.get("total");

            if (challengeId == null || username == null || score == null || total == null) {
                return ResponseEntity.badRequest().body(Map.of(ERROR, "Missing required fields"));
            }

            // Fetch student
            Student student = studentRepository.findByUsername(username)
                    .orElseGet(() -> studentRepository.save(new Student(username)));

            // Fetch challenge exam
            ChallengeExam challengeExam = challengeExamRepository.findById(challengeId)
                    .orElseThrow(() -> new RuntimeException("Challenge exam not found"));

            // Check if student already has an attempt
            Optional<ChallengeAttempt> existingAttemptOpt =
                    challengeAttemptRepository.findByStudentAndChallengeExam(student, challengeExam);

            ChallengeAttempt attempt;

            if (existingAttemptOpt.isPresent()) {
                attempt = existingAttemptOpt.get();
                // Only update if new score is higher
                if (score > attempt.getScore()) {
                    attempt.setScore(score);
                    attempt.setTotalMarks(total);
                    attempt.setAttemptedAt(new Date());
                    challengeAttemptRepository.save(attempt);
                }
            } else {
                // No previous attempt, create new
                attempt = new ChallengeAttempt();
                attempt.setChallengeExam(challengeExam);
                attempt.setStudent(student);
                attempt.setScore(score);
                attempt.setTotalMarks(total);
                challengeAttemptRepository.save(attempt);
            }

            Map<String, Integer> leaderboard = challengeExam.getAttempts().stream()
                    .sorted((a, b) -> Integer.compare(b.getScore(), a.getScore())) // highest first
                    .limit(10)
                    .collect(LinkedHashMap::new, // preserve order
                            (map, newAttempt) -> map.put(newAttempt.getStudent().getUsername(), newAttempt.getScore()),
                            Map::putAll);

            Map<String, Object> result = new HashMap<>();
            result.put("score", attempt.getScore());
            result.put("total", attempt.getTotalMarks());
            result.put("leaderboard", leaderboard);

            return ResponseEntity.ok(result);


        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of(ERROR, e.getMessage()));
        }
    }

    @GetMapping("/attend-challenge")
    @Transactional // keep session open for LOBs
    public ResponseEntity<?> attendChallenge(@RequestParam String challengeId) {
        logger.debug("attend-challenge hit");
        ChallengeExam challengeExam = challengeExamRepository.findById(challengeId)
                .orElseThrow(() -> new RuntimeException("Challenge exam not found"));

        List<MCQDTO> mcqDTOs = new ArrayList<>();
        for (MCQQuestion mcq : challengeExam.getMcqs()) {
            MCQDTO dto = new MCQDTO();
            dto.setQuestion(mcq.getQuestion());
            dto.setHint(mcq.getHint());
            dto.setExplanation(mcq.getExplanation());
            dto.setOptions(mcq.getOptions());
            dto.setAnswer(mcq.getAnswer());
            mcqDTOs.add(dto);
        }

        return ResponseEntity.ok(Map.of("mcqs", mcqDTOs));
    }

    @GetMapping("/generate-challenge")
    public Mono<ResponseEntity<Map<String, Object>>> challenge(
            @RequestParam String username,
            @RequestParam String className,
            @RequestParam String subject,
            @RequestParam String chapter,
            @RequestParam int count) {

        logger.debug("generate-challenge hit");
        String pythonEndpoint = "/exam/generate-challenge";

        return webClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path(pythonEndpoint)
                        .queryParam(CLASS, className)
                        .queryParam(SUBJECT, subject)
                        .queryParam(CHAPTER, chapter)
                        .queryParam(COUNT, count)
                        .build())
                .retrieve()
                .bodyToMono(new ParameterizedTypeReference<Map<String, Object>>() {})
                .map(responseMap -> {
                    Object mcqsObj = responseMap.get("mcqs");
                    List<Map<String, Object>> mcqs = new ArrayList<>();
                    if (mcqsObj instanceof List<?> list) {
                        for (Object obj : list) {
                            if (obj instanceof Map<?, ?> map) {
                                mcqs.add((Map<String, Object>) map);
                            }
                        }
                    }

                    Student student = studentRepository.findByUsername(username)
                            .orElseGet(() -> studentRepository.save(new Student(username)));
                    Sub sub = subRepository.findByName(subject)
                            .orElseGet(() -> subRepository.save(new Sub(subject)));
                    // Create and save ChallengeExam
                    ChallengeExam challengeExam = new ChallengeExam(sub, student, mcqs);
                    challengeExam = challengeExamRepository.save(challengeExam);

                    // Prepare result to return, including challengeId
                    Map<String, Object> result = new HashMap<>();
                    result.put("mcqs", mcqs);
                    result.put("challengeId", challengeExam.getId());

                    return ResponseEntity.ok(result);
                });
    }

    @PostMapping("/mcq")
    public Mono<ResponseEntity<Map<String, Object>>> newExam(
            @RequestParam String username,
            @RequestParam String className,
            @RequestParam String subject,
            @RequestParam String chapter,
            @RequestParam int count) {
        String pythonEndpoint = "/exam/mcq";
        logger.debug("mcq exam hit");
        List<Object []> performanceRecord = pdlr.findPerformanceInfo(username, subject);

        Map<String, Object> requestBody = Map.of(
                CLASS, className,
                SUBJECT, subject,
                CHAPTER, chapter,
                COUNT, count,
                PERFORMANCE, performanceRecord
        );

        return webClient.post()
                .uri(pythonEndpoint)
                .bodyValue(requestBody)
                .retrieve()
                .bodyToMono(new ParameterizedTypeReference<Map<String, Object>>() {})
                .map(responseMap -> {
                    return new ResponseEntity<>(responseMap, HttpStatus.OK);
                });

    }

    @GetMapping("/previous-mcq")
    public Mono<ResponseEntity<Map<String, Object>>> oldExam(@RequestParam String username,
                                                            @RequestParam String className,
                                                            @RequestParam String subject,
                                                            @RequestParam String chapter,
                                                            @RequestParam Long count) {
        logger.debug("previous-mcq exam hit");

        Map<String, Object> errorResponse = new HashMap<>();
        Optional<Sub> subOpt = subRepository.findByName(subject);
        if (subOpt.isEmpty()) {
            Sub sub = new Sub();
            sub.setName(subject);
            subRepository.save(sub);
            errorResponse.put(ERROR, "Not enough questions practiced for the subject: " + subject);
            return Mono.just(ResponseEntity.badRequest().body(errorResponse));
        }
        Sub sub = subOpt.get();
        List<String> previousQuestions = mcqRepository.findStatementByStudentUsernameAndSubject(username, sub.getId());

        if(previousQuestions.isEmpty()) {
            errorResponse.put(ERROR, "Not enough questions practiced for the subject: " + subject);
            return Mono.just(ResponseEntity.badRequest().body(errorResponse));
        }

        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("previousQuestions", previousQuestions);
        requestBody.put(COUNT, count);

        return webClient.post()
                .uri("/exam/previous-mcq")
                .bodyValue(requestBody)
                .retrieve()
                .bodyToMono(new ParameterizedTypeReference<Map<String, Object>>() {})
                .map(responseMap -> new ResponseEntity<>(responseMap, HttpStatus.OK));
    }


    @PostMapping("/submit-mcq")
    @Transactional
    public ResponseEntity<String> submitMcq(@RequestBody MCQSubmitRequest request) {
        logger.debug("submit-mcq hit");

        String username = request.getUsername();
        String subjectName = request.getSubject();
        Map<String, Boolean> questions = request.getQuestions();
        int difficultyLevel = request.getDifficultyLevel();

        // 1️⃣ Fetch or create Sub & Student in one DB hit each
        Sub sub = subRepository.findByName(subjectName)
                .orElseGet(() -> subRepository.save(new Sub(subjectName)));

        Student student = studentRepository.findByUsername(username)
                .orElseGet(() -> {
                    Student s = new Student(username);
                    s.setLast10Performance(new ArrayList<>());
                    return studentRepository.save(s);
                });

        if (student.getLast10Performance() == null) {
            student.setLast10Performance(new ArrayList<>());
        }

        // 2️⃣ Log practice streak once
        practiceStreakService.logPractice(username);

        // 3️⃣ Prepare wrong questions set only once
        Set<String> wrongQuestions = questions.entrySet().stream()
                .filter(entry -> !entry.getValue())  // Only wrong answers
                .map(Map.Entry::getKey)
                .collect(Collectors.toSet());

        // Fetch existing wrong questions from DB in one query
        Set<String> existingQuestions = mcqRepository.findExistingQuestions(wrongQuestions);

        List<PerformanceDiffLevel> performanceRecords = new ArrayList<>();
        List<MCQ> newMcqs = new ArrayList<>();
        int totalWrong = 0;

        // 4️⃣ Process all questions in-memory without extra DB hits
        int totalAttempt = questions.size();
        int correctCount = 0;

        for (Map.Entry<String, Boolean> entry : questions.entrySet()) {
            String question = entry.getKey();
            boolean wasCorrect = entry.getValue();

            // update last10Performance in-memory only
            List<Boolean> last10 = student.getLast10Performance();
            last10.add(wasCorrect);
            if (last10.size() > 10) last10.remove(0);

            // Calculate performance level
            int performanceLevel = (int) last10.stream().filter(Boolean::booleanValue).count();
            performanceRecords.add(new PerformanceDiffLevel(
                    username, subjectName, performanceLevel, difficultyLevel, wasCorrect
            ));

            if (!wasCorrect) {
                totalWrong++;

                // Only add new MCQ if it doesn't exist in DB
                if (!existingQuestions.contains(question)) {
                    MCQ newMCQ = new MCQ();
                    newMCQ.setStatement(question);
                    newMCQ.setSub(sub);
                    newMCQ.setMistakenByStudent(student);
                    newMcqs.add(newMCQ);
                    existingQuestions.add(question); // prevent duplicates in batch
                }
            } else {
                correctCount++;
            }
        }

        // 5️⃣ Batch save all at once
        if (!performanceRecords.isEmpty()) pdlr.saveAll(performanceRecords);
        if (!newMcqs.isEmpty()) mcqRepository.saveAll(newMcqs);
        studentRepository.save(student);

        return ResponseEntity.ok(
                "Data received successfully. Total attempts: " + totalAttempt +
                        ", Correct: " + correctCount +
                        ", Wrong: " + totalWrong
        );
    }



    @GetMapping("/written")
    public Map<String, String> getQuestion(@RequestParam String className,
                                           @RequestParam String subject,
                                           @RequestParam String chapter) {
        String pythonEndpoint = "/exam/written";
        logger.debug("written exam hit");

        return webClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path(pythonEndpoint)
                        .queryParam(CLASS, className)
                        .queryParam(SUBJECT, subject)
                        .queryParam(CHAPTER, chapter)
                        .build())
                .accept(MediaType.APPLICATION_JSON)
                .retrieve()
                .bodyToMono(new ParameterizedTypeReference<Map<String, String>>() {})
                .block(); // Blocking to return synchronously as required by standard controller
    }


	@PostMapping("/submit-written")
    public Mono<ResponseEntity<String>> submitWrittenProxy(@RequestParam("image") MultipartFile imageFile,
                                                           @RequestParam("question") String questionText) {
        logger.debug("submit-written hit");
        if (imageFile.isEmpty()) {
            return Mono.just(new ResponseEntity<>("{\"message\": \"error: No image file provided.\"}",
                    HttpStatus.BAD_REQUEST));
        }

        try {
            MultiValueMap<String, HttpEntity<?>> body = new LinkedMultiValueMap<>();
            ByteArrayResource imageResource = new ByteArrayResource(imageFile.getBytes()) {
                @Override
                public String getFilename() {
                    return imageFile.getOriginalFilename();
                }
            };

            HttpHeaders fileHeaders = new HttpHeaders();
            HttpHeaders textHeaders = new HttpHeaders();
            fileHeaders.setContentType(MediaType.valueOf(imageFile.getContentType()));

            body.add("image", new HttpEntity<>(imageResource, fileHeaders));
            body.add("question", new HttpEntity<>(questionText, textHeaders));

            // Use WebClient to make the POST request to the Python server's OCR endpoint
            String pythonOcrEndpoint = "/exam/submit-written"; // Specific path for OCR

            return webClient.post()
                    .uri(pythonOcrEndpoint) // Append specific OCR path to base URL
                    .bodyValue(body)
                    .retrieve()
                    .toEntity(String.class)
                    .doOnNext(response -> {})
                    .onErrorResume(WebClientResponseException.class, e -> {
                        return Mono.just(new ResponseEntity<>(e.getResponseBodyAsString(), e.getStatusCode()));
                    })
                    .onErrorResume(Exception.class, e -> {
                        return Mono.just(new ResponseEntity<>("{\"message\": \"error: Failed to communicate with Python OCR server.\"}", HttpStatus.INTERNAL_SERVER_ERROR));
                    });


        } catch (IOException e) {
            return Mono.just(new ResponseEntity<>("{\"message\": \"error: Failed to process incoming image file.\"}", HttpStatus.INTERNAL_SERVER_ERROR));
        }
    }



}