package com.sanjoy.auth_service.security;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

/**
 * @author kumar
 * @since 7/2/2025
 */
@Component
public class JwtUtil {

    @Value("${jwt.secret}")
    private String secretKey;

    @Value("${jwt.expiration}")
    private long expirationTime;

    public String generateToken(UserDetails userDetails) {
        Map<String, Object> claims = new HashMap<>();
        return createToken(claims, userDetails.getUsername());
    }

    private String createToken(Map<String, Object> claims, String subject) {
        var builder = Jwts.builder() // 'var' for cleaner syntax
                .subject(subject) // Non-deprecated in 0.12.x
                .issuedAt(new Date(System.currentTimeMillis())) // Non-deprecated in 0.12.x
                .expiration(new Date(System.currentTimeMillis() + expirationTime)); // Non-deprecated in 0.12.x

        claims.forEach(builder::claim);

        return builder
                .signWith(getSigningKey())
                .compact();
    }

    private Key getSigningKey() {
        byte[] keyBytes = Decoders.BASE64.decode(secretKey);
        return Keys.hmacShaKeyFor(keyBytes);
    }
}