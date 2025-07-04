package com.sanjoy.api_gateway.config;

import org.springframework.cloud.gateway.route.RouteLocator;
import org.springframework.cloud.gateway.route.builder.RouteLocatorBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Route Configuration for API Gateway
 * @author kumar
 * @since 7/2/2025
 */
@Configuration
public class RouteConfig {

    @Bean
    public RouteLocator customRouteLocator(RouteLocatorBuilder builder) {
        return builder.routes()
                // Auth Service Routes
                .route("auth-service", r -> r
                        .path("/auth/**")
                        .uri("http://localhost:8090")) // Auth service URL

                // User Service Routes
                .route("exam-service", r -> r
                        .path("/exam/**")
                        .uri("http://localhost:8091")) // User service URL

                // Product Service Routes
                .route("learning-service", r -> r
                        .path("/learn/**")
                        .uri("http://localhost:8092")) // Product service URL

                // Order Service Routes
                .route("profile-service", r -> r
                        .path("/profile/**")
                        .uri("http://localhost:8093")) // Order service URL

                // Add more routes as needed
                .build();
    }
}