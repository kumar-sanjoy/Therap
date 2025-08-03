//package com.sanjoy.exam_service.config;
//import org.springframework.context.annotation.Bean;
//import org.springframework.context.annotation.Configuration;
//import org.springframework.web.reactive.function.client.WebClient;
//
///**
// * @author kumar
// * @since 8/2/2025
// */
//
//
//@Configuration
//public class WebClientConfig {
//
//    @Bean
//    public WebClient.Builder webClientBuilder() {
//        return WebClient.builder()
//                .defaultHeader("Access-Control-Allow-Origin", "*")
//                .defaultHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
//                .defaultHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
//    }
//}