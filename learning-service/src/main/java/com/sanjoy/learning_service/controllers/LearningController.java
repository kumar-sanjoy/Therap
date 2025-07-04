package com.sanjoy.learning_service.controllers;

import io.netty.channel.ChannelOption;
import io.netty.handler.timeout.ReadTimeoutHandler;
import io.netty.handler.timeout.WriteTimeoutHandler;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.core.io.ByteArrayResource;
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

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import reactor.netty.http.client.HttpClient;

import java.time.Duration;
import java.util.Map;
import java.util.concurrent.TimeUnit;

/**
 * @author kumar
 * @since 6/27/2025
 */
@RestController
@RequestMapping("/learn")
@CrossOrigin(origins = "*")
public class LearningController {

    private final WebClient webClient;

    public LearningController(WebClient.Builder webClientBuilder,
                              @Value("${ai.backend.url}") String aiBackendUrl) {
        this.webClient = createWebClientWithTimeouts(aiBackendUrl);
    }

    private WebClient createWebClientWithTimeouts(String aiBackendUrl) {
        TcpClient tcpClient = TcpClient.create()
                .option(ChannelOption.CONNECT_TIMEOUT_MILLIS, 10_000) // 10s connect timeout
                .doOnConnected(conn ->
                        conn.addHandlerLast(new ReadTimeoutHandler(1200, TimeUnit.SECONDS))  // 120s read timeout
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

        System.out.println("Learn request started at: " + System.currentTimeMillis());

        return webClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/learn/learn")
                        .queryParam("className", className)
                        .queryParam("subject", subject)
                        .queryParam("chapter", chapter)
                        .build())
                .retrieve()
                .bodyToMono(new ParameterizedTypeReference<Map<String, Object>>() {})
                .map(responseMap -> {
                    System.out.println("Learn request completed at: " + System.currentTimeMillis());
                    return ResponseEntity.ok(responseMap);
                })
                .onErrorResume(e -> {
                    System.out.println("Learn request failed at: " + System.currentTimeMillis() +
                            " with error: " + e.getMessage());
                    return Mono.just(
                            ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                                    .body(Map.of("error", e.getMessage()))
                    );
                });
    }


@SuppressWarnings("null")
@PostMapping("/doubts")
    public Map<String, String> sendDoubt(
            @RequestParam(required = false) MultipartFile image,
            @RequestParam(required = false) String question) throws Exception {

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

        if (question != null && !question.isEmpty()) {
            builder.part("question", question);
        }

        Mono<Map<String, String>> responseMono = webClient.post()
                .uri("/learn/doubts")
                .contentType(MediaType.MULTIPART_FORM_DATA)
                .bodyValue(builder.build())
                .retrieve()
                .bodyToMono(new ParameterizedTypeReference<Map<String, String>>() {});

        return responseMono.block(); // blocking to return synchronously for simplicity
    }


    @GetMapping("/notes")
    public Mono<ResponseEntity<Map<String, Object>>> newExam(
            @RequestParam String className,
            @RequestParam String subject,
            @RequestParam String chapter) {

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
                .map(responseMap -> ResponseEntity.ok(responseMap))
                .onErrorResume(e -> Mono.just(
                        ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                                .body(Map.of("error", e.getMessage()))
                ));
    }
}
