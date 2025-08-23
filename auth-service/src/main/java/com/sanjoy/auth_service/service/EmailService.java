package com.sanjoy.auth_service.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

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
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setTo(to);
            helper.setFrom(senderEmail);
            helper.setSubject("Confirm your email");

            String confirmationUrl = frontendUrl + "/auth/register/confirmToken?token=" + token;
            String htmlContent = createHtmlEmailTemplate(confirmationUrl);

            helper.setText(htmlContent, true); // true indicates HTML content

            mailSender.send(message);
            System.out.println("Confirmation email sent to: " + to);

        } catch (MessagingException e) {
            System.err.println("Failed to send email to " + to + ": " + e.getMessage());
        } catch (Exception e) {
            System.err.println("Unexpected error sending email to " + to + ": " + e.getMessage());
        }
    }

    private String createHtmlEmailTemplate(String confirmationUrl) {
        return """
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Email Confirmation</title>
            </head>
            <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f7fa;">
                <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
                    
                    <!-- Header -->
                    <div style="background: linear-gradient(135deg, #667eea 0%%, #764ba2 100%%); padding: 40px 20px; text-align: center;">
                        <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 300; letter-spacing: 1px;">
                            Welcome!
                        </h1>
                        <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">
                            Please confirm your email address
                        </p>
                    </div>
                    
                    <!-- Content -->
                    <div style="padding: 40px 30px;">
                        <h2 style="color: #333333; font-size: 24px; margin-bottom: 20px; text-align: center;">
                            Thank you for registering!
                        </h2>
                        
                        <p style="color: #666666; font-size: 16px; line-height: 1.6; margin-bottom: 30px; text-align: center;">
                            To complete your registration and secure your account, please confirm your email address by clicking the button below.
                        </p>
                        
                        <!-- Confirmation Button -->
                        <div style="text-align: center; margin: 40px 0;">
                            <a href="%s" 
                               style="display: inline-block; 
                                      background: linear-gradient(135deg, #667eea 0%%, #764ba2 100%%);
                                      color: #ffffff; 
                                      text-decoration: none; 
                                      padding: 16px 40px; 
                                      border-radius: 50px; 
                                      font-size: 18px; 
                                      font-weight: 600; 
                                      text-transform: uppercase; 
                                      letter-spacing: 1px;
                                      box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
                                      transition: all 0.3s ease;">
                                Confirm Email Address
                            </a>
                        </div>
                        
                        <p style="color: #999999; font-size: 14px; line-height: 1.5; text-align: center; margin-top: 30px;">
                            This link will expire in 24 hours for security reasons.
                        </p>
                        
                        <hr style="border: none; border-top: 1px solid #eeeeee; margin: 30px 0;">
                        
                        <p style="color: #999999; font-size: 13px; line-height: 1.5; text-align: center;">
                            If you didn't create an account, please ignore this email.<br>
                            If you're having trouble clicking the button, copy and paste this link into your browser:<br>
                            <span style="color: #667eea; word-break: break-all;">%s</span>
                        </p>
                    </div>
                    
                    <!-- Footer -->
                    <div style="background-color: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #eeeeee;">
                        <p style="color: #999999; font-size: 12px; margin: 0;">
                            © 2025 Your Company Name. All rights reserved.
                        </p>
                    </div>
                    
                </div>
            </body>
            </html>
            """.formatted(confirmationUrl, confirmationUrl);
    }
}