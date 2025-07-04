package com.sanjoy.auth_service;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class AuthServiceApplication {

// ./gradlew bootJar
// docker run -p 8090:8090 auth-service
// docker tag c87c30a7c2a56392b26f7150348a5064dfdcb1130817349607442585b643fcd5 auth-service
// docker run -p 8090:8090 auth-service

	public static void main(String[] args) {
		SpringApplication.run(AuthServiceApplication.class, args);
	}

}