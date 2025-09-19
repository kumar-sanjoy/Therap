//package com.sanjoy.exam_service.config;
//
//import io.netty.channel.ChannelOption;
//import io.netty.handler.timeout.ReadTimeoutHandler;
//import io.netty.handler.timeout.WriteTimeoutHandler;
//import org.springframework.beans.factory.annotation.Value;
//import org.springframework.context.annotation.Bean;
//import org.springframework.context.annotation.Configuration;
//import org.springframework.http.client.reactive.ReactorClientHttpConnector;
//import org.springframework.web.reactive.function.client.WebClient;
//import reactor.netty.http.client.HttpClient;
//
//import java.time.Duration;
//
///**
// * @author kumar
// * @since 9/14/2025
// */
//@Configuration
//public class WebClientConfig {
//    @Bean
//    public WebClient aiWebClient(WebClient.Builder builder,
//                                 @Value("${ai.backend.url}") String aiBackendUrl) {
//        HttpClient httpClient = HttpClient.create()
//                .option(ChannelOption.CONNECT_TIMEOUT_MILLIS, 10000)
//                .responseTimeout(Duration.ofSeconds(120))
//                .doOnConnected(conn ->
//                        conn.addHandlerLast(new ReadTimeoutHandler(120))
//                                .addHandlerLast(new WriteTimeoutHandler(120)));
//
//        return builder
//                .baseUrl(aiBackendUrl)
//                .clientConnector(new ReactorClientHttpConnector(httpClient))
//                .build();
//    }
//}
