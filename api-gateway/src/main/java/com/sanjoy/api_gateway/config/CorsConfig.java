package com.sanjoy.api_gateway.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.reactive.CorsWebFilter;
import org.springframework.web.cors.reactive.UrlBasedCorsConfigurationSource;

@Configuration
public class CorsConfig {

    @Value("${frontend.url:http://localhost:3000}")
    private String frontendUrl;

    @Bean
    public CorsWebFilter corsWebFilter() {
        CorsConfiguration corsConfig = createCorsConfiguration();

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", corsConfig);

        return new CorsWebFilter(source);
    }

    private CorsConfiguration createCorsConfiguration() {
        CorsConfiguration corsConfig = new CorsConfiguration();

        // Set specific origin - NO wildcards when using credentials
        corsConfig.addAllowedOrigin(frontendUrl);

        // Allow specific methods
        corsConfig.addAllowedMethod("GET");
        corsConfig.addAllowedMethod("POST");
        corsConfig.addAllowedMethod("PUT");
        corsConfig.addAllowedMethod("DELETE");
        corsConfig.addAllowedMethod("OPTIONS");

        // Allow specific headers
        corsConfig.addAllowedHeader("*");

        // Allow credentials
        corsConfig.setAllowCredentials(true);

        // Cache preflight for 1 hour
        corsConfig.setMaxAge(3600L);

        return corsConfig;
    }
}