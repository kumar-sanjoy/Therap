package com.sanjoy.api_gateway.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.gateway.route.RouteLocator;
import org.springframework.cloud.gateway.route.builder.RouteLocatorBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Route Configuration for API Gateway
 * 
 * @author kumar
 * @since 7/2/2025
 */
@Configuration
public class RouteConfig {

    @Value("${auth.service.url}")
    private String authServiceUrl;

    @Value("${exam.service.url}")
    private String examServiceUrl;

    @Value("${learning.service.url}")
    private String learningServiceUrl;

    @Value("${profile.service.url}")
    private String profileServiceUrl;

    @Bean
    public RouteLocator customRouteLocator(RouteLocatorBuilder builder) {
        String authUrl = System.getenv().getOrDefault("AUTH_SERVICE_URL", "http://localhost:8090");

        return builder.routes()
                .route("auth-service", r -> r.path("/auth/**").uri(authUrl))
                .route("exam-service", r -> r.path("/exam/**").uri(System.getenv("EXAM_SERVICE_URL")))
                .route("learning-service",
                        r -> r.path("/learn/**").uri(System.getenv("LEARNING_SERVICE_URL")))
                .route("profile-service",
                        r -> r.path("/profile/**").uri(System.getenv("PROFILE_SERVICE_URL")))
                .build();
    }
}
