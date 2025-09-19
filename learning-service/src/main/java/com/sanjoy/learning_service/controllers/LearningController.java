package com.sanjoy.learning_service.controllers;

import io.netty.channel.ChannelOption;
import io.netty.handler.timeout.ReadTimeoutHandler;
import io.netty.handler.timeout.WriteTimeoutHandler;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.http.client.MultipartBodyBuilder;
import org.springframework.http.client.reactive.ReactorClientHttpConnector;
import org.springframework.web.bind.annotation.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;
import reactor.netty.tcp.TcpClient;
import reactor.netty.http.client.HttpClient;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.Duration;
import java.util.Map;
import java.util.concurrent.TimeUnit;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * @author kumar
 * @since 6/27/2025
 */
@RestController
@RequestMapping("/learn")
public class LearningController {
    private static final String MESSAGE = "message";
    private static final Logger logger = LoggerFactory.getLogger(LearningController.class);

    private final WebClient webClient;

    public LearningController(@Value("${ai.backend.url}") String aiBackendUrl) {
        this.webClient = createWebClientWithTimeouts(aiBackendUrl);
    }

    private WebClient createWebClientWithTimeouts(String aiBackendUrl) {
        TcpClient tcpClient = TcpClient.create()
                .option(ChannelOption.CONNECT_TIMEOUT_MILLIS, 10_000) // 10s connect timeout
                .doOnConnected(conn -> conn.addHandlerLast(new ReadTimeoutHandler(1200, TimeUnit.SECONDS)) // 1200s read
                                                                                                           // timeout
                        .addHandlerLast(new WriteTimeoutHandler(1200, TimeUnit.SECONDS)) // 1200s write timeout
                );

        @SuppressWarnings("deprecation")
        HttpClient httpClient = HttpClient.from(tcpClient)
                .responseTimeout(Duration.ofSeconds(1200)); // 1200s max response wait

        return WebClient.builder()
                .clientConnector(new ReactorClientHttpConnector(httpClient))
                .baseUrl(aiBackendUrl)
                .build();
    }


    @GetMapping("/learn")
    public Mono<ResponseEntity<Map<String, Object>>> makeMeLearn(
            @RequestParam String className,
            @RequestParam String subject,
            @RequestParam String chapter) {
        logger.debug("DEBUG: learn/learn endpoint called");


        return webClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/learn/learn")
                        .queryParam("className", className)
                        .queryParam("subject", subject)
                        .queryParam("chapter", chapter)
                        .build())
                .retrieve()
                .bodyToMono(new ParameterizedTypeReference<Map<String, Object>>() {
                })
                .map(ResponseEntity::ok)
                .onErrorResume(e ->
                        Mono.just(
                                ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                                        .body(Map.of("error", e.getMessage())))
                );
    }

    @PostMapping("/doubts")
    public Map<String, String> sendDoubt(
            @RequestParam MultipartFile image,
            @RequestParam MultipartFile audio,
            @RequestParam String question) throws Exception {
        logger.debug("DEBUG: learn/doubts endpoint called");
        MultipartBodyBuilder builder = new MultipartBodyBuilder();

        if (image != null && !image.isEmpty()) {
            builder.part("image",
                    new ByteArrayResource(image.getBytes()) {
                        @Override
                        public String getFilename() {
                            return image.getOriginalFilename();
                        }
                    })
                    .contentType(MediaType.parseMediaType(image.getContentType()));
        }

        if (audio != null && !audio.isEmpty()) {
            builder.part("audio",
                    new ByteArrayResource(audio.getBytes()) {
                        @Override
                        public String getFilename() {
                            return audio.getOriginalFilename();
                        }
                    })
                    .contentType(MediaType.parseMediaType(audio.getContentType()));
        }

        if (question != null && !question.isEmpty()) {
            builder.part("question", question);
        }

        Mono<Map<String, String>> responseMono = webClient.post()
                .uri("/learn/doubts")
                .contentType(MediaType.MULTIPART_FORM_DATA)
                .body(org.springframework.web.reactive.function.BodyInserters.fromMultipartData(builder.build()))
                .retrieve()
                .bodyToMono(new ParameterizedTypeReference<Map<String, String>>() {
                });

        return responseMono
                // .doOnNext(map -> System.out.println(map))
                .block();
    }

    @GetMapping("/notes")
    public Mono<ResponseEntity<Map<String, Object>>> newExam(
            @RequestParam String className,
            @RequestParam String subject,
            @RequestParam String chapter) {
        logger.debug("DEBUG: learn/notes endpoint called");

        String pythonEndpoint = "/learn/notes";

        return webClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path(pythonEndpoint)
                        .queryParam("className", className)
                        .queryParam("subject", subject)
                        .queryParam("chapter", chapter)
                        .build())
                .retrieve()
                .bodyToMono(new ParameterizedTypeReference<Map<String, Object>>() {})
                .map(ResponseEntity::ok)
                .onErrorResume(e -> Mono.just(
                        ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                                .body(Map.of("error", e.getMessage()))));
    }

    private static final String UPLOAD_DIR = System.getProperty("user.dir") + "/uploads/";

    @PostMapping("/upload")
    public ResponseEntity<Map<String, String>> uploadImage(
            @RequestParam(value = "image", required = false) MultipartFile image,
            @RequestParam(value = "question", required = false) String question) {

        // Check if both are empty
        if ((image == null || image.isEmpty()) && (question == null || question.trim().isEmpty())) {
            return ResponseEntity.badRequest().body(Map.of(MESSAGE, "No image or question provided."));
        }

        try {
            String answer;

            if (image != null && !image.isEmpty()) {
                // Handle image upload
                File dir = new File(UPLOAD_DIR);
                if (!dir.exists())
                    dir.mkdirs();

                String filename = image.getOriginalFilename();
                Path filePath = Paths.get(UPLOAD_DIR, filename);
                image.transferTo(filePath.toFile());

                answer = "Received question: " + question + " and saved image: " + filename;
            } else {
                answer = "Received question: " + question;
            }

            return ResponseEntity.ok(Map.of("answer", answer));

        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of(MESSAGE, "Upload failed: " + e.getMessage()));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of(MESSAGE, "Unexpected error: " + e.getMessage()));
        }
    }

    @GetMapping("/view/{filename:.+}")
    public ResponseEntity<Resource> serveImage(@PathVariable String filename) {

        try {
            Path filePath = Paths.get(UPLOAD_DIR).resolve(filename).normalize();
            Resource resource = new UrlResource(filePath.toUri());

            if (!resource.exists()) {
                return ResponseEntity.notFound().build();
            }

            String contentType = Files.probeContentType(filePath);
            if (contentType == null) {
                contentType = "application/octet-stream";
            }

            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .body(resource);

        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

}
