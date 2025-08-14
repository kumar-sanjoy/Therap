# Backend CORS Fix for Written Exam API

## Problem
You're getting this error:
```
Access-Control-Allow-Origin cannot contain more than one origin.
Fetch API cannot load http://192.168.0.104:8091/exam/submit-written due to access control checks.
```

## Root Cause
The backend is trying to set multiple specific origins in the `Access-Control-Allow-Origin` header, which browsers don't allow. You can only set one specific origin or use a wildcard.

## Solution

### 1. Update WebConfig.java

Replace your current `WebConfig.java` with this version:

```java
package com.sanjoy.auth_service.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig {

    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/**")
                        .allowedOriginPatterns("*")  // Use this instead of allowedOrigins()
                        .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                        .allowedHeaders("*")
                        .allowCredentials(true)
                        .maxAge(3600);
            }
        };
    }
}
```

### 2. Alternative: Use application.properties

Add this to your `application.properties`:

```properties
# CORS Configuration
spring.web.cors.allowed-origin-patterns=*
spring.web.cors.allowed-methods=GET,POST,PUT,DELETE,OPTIONS
spring.web.cors.allowed-headers=*
spring.web.cors.allow-credentials=true
spring.web.cors.max-age=3600

# File upload configuration (for 413 errors)
spring.servlet.multipart.max-file-size=10MB
spring.servlet.multipart.max-request-size=10MB
```

### 3. SecurityConfig.java (if you have one)

Update your `SecurityConfig.java`:

```java
@Bean
public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
    http
            .csrf(AbstractHttpConfigurer::disable)
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .authorizeHttpRequests(req -> req
                    .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                    .requestMatchers("/auth/register/**", "/auth/login").permitAll()
                    .anyRequest().authenticated())
            .userDetailsService(userDetailsService);
    return http.build();
}

@Bean
public CorsConfigurationSource corsConfigurationSource() {
    CorsConfiguration configuration = new CorsConfiguration();
    configuration.setAllowedOriginPatterns(Arrays.asList("*"));  // Use patterns, not origins
    configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
    configuration.setAllowedHeaders(Arrays.asList("*"));
    configuration.setAllowCredentials(true);
    configuration.setMaxAge(3600L);
    
    UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
    source.registerCorsConfiguration("/**", configuration);
    return source;
}
```

## Key Changes Explained

1. **`allowedOriginPatterns("*")`** instead of `allowedOrigins()`:
   - Allows all origins with a wildcard pattern
   - Fixes the "cannot contain more than one origin" error
   - More flexible than listing specific origins

2. **File upload limits**:
   - Prevents 413 "Payload Too Large" errors
   - Sets 10MB limit for file uploads

3. **Proper CORS headers**:
   - Allows all necessary HTTP methods
   - Includes OPTIONS for preflight requests
   - Sets proper cache duration

## Testing Steps

1. **Update the backend configuration** as shown above
2. **Restart your Spring Boot application**
3. **Test the written question submission** with a small image file
4. **Check browser Network tab** to verify:
   - OPTIONS preflight request succeeds (200 status)
   - POST request succeeds (200 status)
   - No CORS errors in console

## Frontend Status

The frontend has been updated with:
- ✅ Enhanced loading animation
- ✅ File size validation (5MB limit)
- ✅ Image compression
- ✅ Better error handling
- ✅ File type validation

## Expected Result

After applying these changes:
- ✅ No more CORS errors
- ✅ Written question submission works
- ✅ Beautiful loading animation during submission
- ✅ Proper error handling for large files 