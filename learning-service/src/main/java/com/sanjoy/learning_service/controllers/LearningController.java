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
// import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;
import reactor.netty.tcp.TcpClient;
import reactor.netty.http.client.HttpClient;

import java.io.File;
import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.Duration;
import java.util.Map;
import java.util.concurrent.TimeUnit;

/**
 * @author kumar
 * @since 6/27/2025
 */
@RestController
@RequestMapping("/learn")
public class LearningController {

    private final WebClient webClient;

    public LearningController(WebClient.Builder webClientBuilder,
            @Value("${ai.backend.url}") String aiBackendUrl) {
        this.webClient = createWebClientWithTimeouts(aiBackendUrl);
    }

    private WebClient createWebClientWithTimeouts(String aiBackendUrl) {
        TcpClient tcpClient = TcpClient.create()
                .option(ChannelOption.CONNECT_TIMEOUT_MILLIS, 10_000) // 10s connect timeout
                .doOnConnected(conn -> conn.addHandlerLast(new ReadTimeoutHandler(1200, TimeUnit.SECONDS)) // 120s read
                                                                                                           // timeout
                        .addHandlerLast(new WriteTimeoutHandler(1200, TimeUnit.SECONDS)) // 120s write timeout
                );

        @SuppressWarnings("deprecation")
        HttpClient httpClient = HttpClient.from(tcpClient)
                .responseTimeout(Duration.ofSeconds(120)); // 120s max response wait

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

        // System.out.println("Learn request started at: " + System.currentTimeMillis());

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
                .map(responseMap -> {
                    // System.out.println("Learn request completed at: " + System.currentTimeMillis());
                    return ResponseEntity.ok(responseMap);
                })
                .onErrorResume(e -> {
                    // System.out.println("Learn request failed at: " + System.currentTimeMillis() + " with error: " + e.getMessage());
                    return Mono.just(
                            ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                                    .body(Map.of("error", e.getMessage())));
                });
    }

    @SuppressWarnings("null")
    @PostMapping("/doubts")
    public Map<String, String> sendDoubt(
            @RequestParam(required = false) MultipartFile image,
            @RequestParam(required = false) MultipartFile audio,
            @RequestParam(required = false) String question) throws Exception {

        // System.out.println("doubts hit");
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
            // System.out.println("Audio received...");
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

        Map<String, String> result = responseMono
                // .doOnNext(map -> System.out.println(map))
                .block();

        return result;
    }

    @GetMapping("/notes")
    public Mono<ResponseEntity<Map<String, Object>>> newExam(
            @RequestParam String className,
            @RequestParam String subject,
            @RequestParam String chapter) {
        // System.out.println("note hit");

        String pythonEndpoint = "/learn/notes";

        return webClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path(pythonEndpoint)
                        .queryParam("className", className)
                        .queryParam("subject", subject)
                        .queryParam("chapter", chapter)
                        .build())
                .retrieve()
                .bodyToMono(new ParameterizedTypeReference<Map<String, Object>>() {
                })
                .map(responseMap -> ResponseEntity.ok(responseMap))
                .onErrorResume(e -> Mono.just(
                        ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                                .body(Map.of("error", e.getMessage()))));
    }

    private static final String UPLOAD_DIR = System.getProperty("user.dir") + "/uploads/";

    @PostMapping("/upload")
    public ResponseEntity<Map<String, String>> uploadImage(
            @RequestParam(value = "image", required = false) MultipartFile image,
            @RequestParam(value = "question", required = false) String question) {

        // System.out.println("🔄 Received upload request.");
        // System.out.println("📝 Question: " + question);
        // System.out.println("🖼️ Image present: " + (image != null && !image.isEmpty()));
        // System.out.println("📋 Request received at: " + System.currentTimeMillis());

        // Check if both are empty
        if ((image == null || image.isEmpty()) && (question == null || question.trim().isEmpty())) {
            // System.out.println("❌ Both image and question are empty");
            return ResponseEntity.badRequest().body(Map.of("message", "No image or question provided."));
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

                // System.out.println("✅ Saved image to: " + filePath.toAbsolutePath());
                answer = "Received question: " + question + " and saved image: " + filename;
            } else {
                // Handle text-only question
                // System.out.println("📝 Processing text-only question");
                answer = "Received question: " + question;
            }

            return ResponseEntity.ok(Map.of("answer", answer));

        } catch (IOException e) {
            // System.out.println("💥 Error saving file: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Upload failed: " + e.getMessage()));
        } catch (Exception e) {
            // System.out.println("💥 Unexpected error: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Unexpected error: " + e.getMessage()));
        }
    }

    @GetMapping("/view/{filename:.+}")
    public ResponseEntity<Resource> serveImage(@PathVariable String filename) {
        // System.out.println("👁️ Requested to view image: " + filename);

        try {
            Path filePath = Paths.get(UPLOAD_DIR).resolve(filename).normalize();
            Resource resource = new UrlResource(filePath.toUri());

            if (!resource.exists()) {
                // System.out.println("❌ Image not found: " + filePath);
                return ResponseEntity.notFound().build();
            }

            // System.out.println("✅ Serving image from: " + filePath.toAbsolutePath());

            String contentType = Files.probeContentType(filePath);
            if (contentType == null) {
                contentType = "application/octet-stream";
            }

            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .body(resource);

        } catch (MalformedURLException e) {
            // System.out.println("💥 Invalid URL for image: " + filename);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        } catch (IOException e) {
            // System.out.println("💥 Error reading image file: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

}
