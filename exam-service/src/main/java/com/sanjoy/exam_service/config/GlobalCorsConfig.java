//package com.sanjoy.exam_service.config;
//
//import org.springframework.context.annotation.Bean;
//import org.springframework.context.annotation.Configuration;
//import org.springframework.web.cors.CorsConfiguration;
//import org.springframework.web.cors.reactive.CorsWebFilter;
//import org.springframework.web.cors.reactive.UrlBasedCorsConfigurationSource;
//
//import java.util.List;
///**
// * @author kumar
// * @since 8/2/2025
// */
//
//@Configuration
//public class GlobalCorsConfig {
//
//    @Bean
//    public CorsWebFilter corsWebFilter() {
//        CorsConfiguration config = new CorsConfiguration();
//        config.setAllowedOriginPatterns(List.of("*"));
//        config.addAllowedMethod("*");
//        config.addAllowedHeader("*");
//        config.setAllowCredentials(false);
//
//        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
//        source.registerCorsConfiguration("/**", config);
//
//        return new CorsWebFilter(source);
//    }
//}
