package com.sanjoy.api_gateway.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.reactive.CorsWebFilter;
import org.springframework.web.cors.reactive.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
public class CorsConfig {

    @Value("${frontend.url}")
    private String frontendUrl;


    @Bean
    public CorsWebFilter corsWebFilter() {
        CorsConfiguration corsConfig = getCorsConfig();
        corsConfig.setAllowCredentials(true); // Allow sending of cookies, authorization headers, etc.
        corsConfig.setMaxAge(3600L); // How long the preflight request can be cached (in seconds)

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", corsConfig); // Apply this CORS configuration to all paths
        return new CorsWebFilter(source);
    }

    private CorsConfiguration getCorsConfig() {
        CorsConfiguration corsConfig = new CorsConfiguration();
        corsConfig.addAllowedOrigin(frontendUrl);

        corsConfig.addAllowedMethod("*"); // Allow all HTTP methods (GET, POST, PUT, DELETE, etc.)
        corsConfig.addAllowedHeader("*"); // Allow all headers
        return corsConfig;
    }
}