//package com.sanjoy.exam_service.config;
//
//import org.springframework.context.annotation.Bean;
//import org.springframework.context.annotation.Configuration;
//import org.springframework.web.cors.CorsConfiguration;
//import org.springframework.web.cors.CorsConfigurationSource;
//import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
//import org.springframework.web.filter.CorsFilter;
//
//@Configuration
//public class CorsConfig {
//
//    @Bean
//    public CorsFilter corsFilter() {
//        CorsConfiguration config = new CorsConfiguration();
//
//        // Allow all origins (you can restrict this in production)
//        config.addAllowedOrigin("*");
//
//        // Allow all headers
//        config.addAllowedHeader("*");
//
//        // Allow all HTTP methods
//        config.addAllowedMethod("*");
//
//        // Allow credentials (set to false if using wildcard origins)
//        config.setAllowCredentials(false);
//
//        // Expose headers that the client can access
//        config.addExposedHeader("*");
//
//        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
//        source.registerCorsConfiguration("/**", config);
//
//        return new CorsFilter(source);
//    }
//}