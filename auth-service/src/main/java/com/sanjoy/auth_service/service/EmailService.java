package com.sanjoy.auth_service.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

/**
 * @author kumar
 * @since 6/15/2025
 */

@Service
public class EmailService {

    @Value("${server.port}")
    private int serverPort;

    @Value("${spring.mail.username}")
    String senderEmail;

    private final JavaMailSender mailSender;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    @Value("${frontend.url}")
    private String frontendUrl;

    @Async
    public void send(String to, String token) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(to);
            message.setFrom(senderEmail); // Set your sender email here
            message.setSubject("Confirm your email");

            String messageBody = """
               Thank you for registration. Please confirm your email.

               http://%s/register/confirmToken?token=%s
                """.formatted(frontendUrl, token); // Using text blocks and formatted() for cleaner string concatenation

            message.setText(messageBody);

            mailSender.send(message); // Send the email
            System.out.println("Confirmation email sent to: " + to); // Log for debugging

        } catch (Exception e) {
            System.err.println("Failed to send email to " + to + ": " + e.getMessage());
        }
    }
}
