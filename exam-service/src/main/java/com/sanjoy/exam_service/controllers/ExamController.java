package com.sanjoy.exam_service.controllers;

import com.sanjoy.exam_service.models.*;
import com.sanjoy.exam_service.repo.MCQRepository;
import com.sanjoy.exam_service.repo.PerformanceDiffLevelRepo;
import com.sanjoy.exam_service.repo.StudentRepository;
import com.sanjoy.exam_service.repo.SubRepository;
import com.sanjoy.exam_service.service.PracticeStreakService;
import org.springframework.beans.factory.annotation.Autowired;
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

import org.springframework.http.HttpHeaders;
import org.springframework.web.reactive.function.client.WebClientResponseException;

import java.io.IOException;
import java.util.*;
import java.util.stream.Collectors;

/**
 * @author kumar
 * @since 6/17/2025
 */
@RestController
@RequestMapping("/exam")
public class ExamController {
    private final WebClient webClient;

    @Autowired
    private MCQRepository mcqRepository;

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private SubRepository subRepository;

    @Autowired
    private PerformanceDiffLevelRepo pdlr;

    @Autowired
    private PracticeStreakService practiceStreakService;

    public ExamController(WebClient.Builder webClientBuilder,
        @Value("${ai.backend.url}") String aiBackendUrl) {
        this.webClient = webClientBuilder.baseUrl(aiBackendUrl).build();
    }

    @PostMapping("/mcq")
    public Mono<ResponseEntity<Map<String, Object>>> newExam(
            @RequestParam String username,
            @RequestParam String className,
            @RequestParam String subject,
            @RequestParam String chapter,
            @RequestParam int count) {
        String pythonEndpoint = "/exam/mcq";
        // System.out.println("mcq exam hit");
        List<Object []> performanceRecord = pdlr.findPerformanceInfo(username, subject);

        Map<String, Object> requestBody = Map.of(
                "className", className,
                "subject", subject,
                "chapter", chapter,
                "count", count,
                "performance", performanceRecord
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
    public Mono<ResponseEntity<Map<String, Object>>> oldExam(
            @RequestParam String username,
            @RequestParam String className,
            @RequestParam String subject,
            @RequestParam String chapter,
            @RequestParam Long count) {
        // System.out.println("Previous-mcq hit.");

        Map<String, Object> errorResponse = new HashMap<>();
        Optional<Sub> subOpt = subRepository.findByName(subject);
        if (subOpt.isEmpty()) {
            Sub sub = new Sub();
            sub.setName(subject);
            subRepository.save(sub);
            errorResponse.put("error", "Not enough questions practiced for the subject: " + subject);
            return Mono.just(ResponseEntity.badRequest().body(errorResponse));
        }
        Sub sub = subOpt.get();
        List<String> previousQuestions = mcqRepository.findStatementByStudentUsernameAndSubject(username, sub.getId());

        if(previousQuestions.isEmpty()) {
            errorResponse.put("error", "Not enough questions practiced for the subject: " + subject);
            return Mono.just(ResponseEntity.badRequest().body(errorResponse));
        }

        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("previousQuestions", previousQuestions);
        requestBody.put("count", count);

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
        String username = request.getUsername();
        String subject = request.getSubject();
        Map<String, Boolean> questions = request.getQuestions();
        int difficultyLevel = request.getDifficultyLevel();

        Sub sub = subRepository.findByName(subject).orElseGet(() -> subRepository.save(new Sub(subject)));
        Student student = studentRepository.findByUsername(username)
                .orElseGet(() -> studentRepository.save(new Student(username)));

        if (student.getLast10Performance() == null) {
            student.setLast10Performance(new ArrayList<>());
        }

        // save the current streak of a username:
        practiceStreakService.logPractice(username);

        List<PerformanceDiffLevel> performanceRecords = new ArrayList<>();
        List<MCQ> newMcqs = new ArrayList<>();
        Set<String> existingQuestions = mcqRepository.findExistingQuestions(
                questions.keySet().stream()
                        .filter(q -> !questions.get(q)) // Only check wrong answers
                        .collect(Collectors.toSet())
        );

        int totalAttempt = questions.size();
        int totalWrong = 0;
        for (Map.Entry<String, Boolean> entry : questions.entrySet()) {
            String question = entry.getKey();
            Boolean wasCorrect = entry.getValue();
            student.recordAttempt(wasCorrect); // insert into last 10 performance

            int performanceLevel = (int) student.getLast10Performance().stream().filter(Boolean::booleanValue).count();
            performanceRecords.add(new PerformanceDiffLevel(
                    username, subject, performanceLevel, difficultyLevel, wasCorrect
            ));

            if (!wasCorrect) {
                totalWrong++;

                // Only create MCQ if it doesn't exist and wasn't already processed
                if (!existingQuestions.contains(question)) {
                    MCQ newMCQ = new MCQ();
                    newMCQ.setStatement(question);
                    newMCQ.setSub(sub);
                    newMCQ.setMistakenByStudent(student);
                    newMcqs.add(newMCQ);
                    existingQuestions.add(question); // Prevent duplicates in same batch
                }
            }

        }

        if (!performanceRecords.isEmpty()) {
            pdlr.saveAll(performanceRecords);
        }

        if (!newMcqs.isEmpty()) {
            mcqRepository.saveAll(newMcqs);
        }
        studentRepository.save(student);

        // System.out.println(performanceRecords);
        // System.out.println(newMcqs);
        // System.out.println(student);
        return ResponseEntity.ok("Data received successfully. Total attempts: " + totalAttempt + ", Wrong answers: " + totalWrong);
    }



    @GetMapping("/written")
    public Map<String, String> getQuestion(@RequestParam String className,
                                           @RequestParam String subject,
                                           @RequestParam String chapter) {
        String pythonEndpoint = "/exam/written";
        // System.out.println("written hit");

        return webClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path(pythonEndpoint)
                        .queryParam("className", className)
                        .queryParam("subject", subject)
                        .queryParam("chapter", chapter)
                        .build())
                .accept(MediaType.APPLICATION_JSON)
                .retrieve()
                .bodyToMono(new ParameterizedTypeReference<Map<String, String>>() {})
                .block(); // Blocking to return synchronously as required by standard controller
    }


    @SuppressWarnings("null")
	@PostMapping("/submit-written")
    public Mono<ResponseEntity<String>> submitWrittenProxy(@RequestParam("image") MultipartFile imageFile,
                                                           @RequestParam("question") String questionText) {
        // System.out.println("submit written hit");
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
                    .doOnNext(response -> {
                        // System.out.println("Response from Python OCR server: " + response);
                        // System.out.println("Body: " + response.getBody());
                    })
                    .onErrorResume(WebClientResponseException.class, e -> {
                        // System.err.println("Error from Python OCR server (" + e.getStatusCode() + "): " + e.getResponseBodyAsString());
                        return Mono.just(new ResponseEntity<>(e.getResponseBodyAsString(), e.getStatusCode()));
                    })
                    .onErrorResume(Exception.class, e -> {
                        // System.err.println("An unexpected error occurred while communicating with Python OCR server: " + e.getMessage());
                        return Mono.just(new ResponseEntity<>("{\"message\": \"error: Failed to communicate with Python OCR server.\"}", HttpStatus.INTERNAL_SERVER_ERROR));
                    });


        } catch (IOException e) {
            // System.err.println("Error reading incoming image file: " + e.getMessage());
            return Mono.just(new ResponseEntity<>("{\"message\": \"error: Failed to process incoming image file.\"}", HttpStatus.INTERNAL_SERVER_ERROR));
        }
    }
}