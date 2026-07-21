package com.quickcart.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;

@Service
@SuppressWarnings("unchecked")
public class AiProviderRouter {

    @Value("${ai.groq.api-key:}")
    private String groqApiKey;

    @Value("${ai.nvidia.api-key:}")
    private String nvidiaApiKey;

    @Value("${ai.gemini.api-key:}")
    private String geminiApiKey;

    @Value("${ai.xai.api-key:}")
    private String xaiApiKey;

    private final RestTemplate restTemplate = new RestTemplate();

    public String queryAi(String prompt) {
        // Attempt 1: xAI (Grok)
        try {
            return callXai(prompt);
        } catch (Exception e0) {
            System.out.println("xAI fallback triggered: " + e0.getMessage());
        }

        // Attempt 2: Gemini
        try {
            return callGemini(prompt);
        } catch (Exception e1) {
            System.out.println("Gemini fallback triggered: " + e1.getMessage());
        }

        // Attempt 3: NVIDIA
        try {
            return callNvidia(prompt);
        } catch (Exception e2) {
            System.out.println("NVIDIA fallback triggered: " + e2.getMessage());
        }

        // Attempt 4: Groq
        try {
            return callGroq(prompt);
        } catch (Exception e3) {
            System.out.println("Groq fallback triggered: " + e3.getMessage());
        }

        // Intelligent QuickCart response generator when external API calls are unavailable
        String lower = prompt.toLowerCase();
        if (lower.contains("hi") || lower.contains("hello") || lower.contains("hey")) {
            return "Hello! I am your QuickCart AI assistant. How can I help you find fresh groceries, vegetables, or track your orders today?";
        }
        if (lower.contains("tomato") || lower.contains("tamota")) {
            return "Fresh red tomatoes are available in our local stores! Head over to the Stores page to add farm-fresh tomatoes to your cart.";
        }
        if (lower.contains("order") || lower.contains("track")) {
            return "You can track your live order status, driver GPS position, and estimated delivery time directly on your Track Order page.";
        }
        if (lower.contains("delivery") || lower.contains("tax") || lower.contains("charge")) {
            return "QuickCart calculates delivery fees based on exact distance (1km: ₹10, 2km: ₹15) and category-based taxes (Vegetables: 0%, Dairy: 5%, Beverages: 18%).";
        }
        return "QuickCart AI: How can I assist you with finding fresh groceries, checking store inventory, or tracking your delivery today?";
    }

    private String callXai(String prompt) {
        if (xaiApiKey == null || xaiApiKey.trim().isEmpty() || xaiApiKey.contains("your_")) {
            throw new RuntimeException("xAI API key not configured");
        }

        try {
            String url = "https://api.x.ai/v1/chat/completions";

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(xaiApiKey);

            Map<String, Object> message = Map.of(
                "role", "user",
                "content", prompt
            );

            Map<String, Object> payload = Map.of(
                "model", "grok-2-latest",
                "messages", List.of(message),
                "max_tokens", 1000,
                "temperature", 0.7
            );

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(payload, headers);
            ResponseEntity<Map<String, Object>> response = restTemplate.postForEntity(url, entity, (Class<Map<String, Object>>)(Class<?>)Map.class);

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                Map<String, Object> body = response.getBody();
                if (body != null) {
                    List<?> choices = (List<?>) body.get("choices");
                    if (choices != null && !choices.isEmpty()) {
                        Map<String, Object> firstChoice = (Map<String, Object>) choices.get(0);
                        Map<String, Object> msg = (Map<String, Object>) firstChoice.get("message");
                        if (msg != null) {
                            return (String) msg.get("content");
                        }
                    }
                }
            }
            throw new RuntimeException("Invalid response from xAI API");
        } catch (Exception e) {
            throw new RuntimeException("xAI API call failed: " + e.getMessage(), e);
        }
    }

    private String callGroq(String prompt) {
        if (groqApiKey == null || groqApiKey.trim().isEmpty() || groqApiKey.contains("your_")) {
            throw new RuntimeException("Groq API key not configured");
        }

        try {
            String url = "https://api.groq.com/openai/v1/chat/completions";

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(groqApiKey);

            Map<String, Object> messages = Map.of(
                "role", "user",
                "content", prompt
            );

            Map<String, Object> payload = Map.of(
                "model", "mixtral-8x7b-32768",
                "messages", List.of(messages),
                "max_tokens", 1000,
                "temperature", 0.7
            );

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(payload, headers);
            ResponseEntity<Map<String, Object>> response = restTemplate.postForEntity(url, entity, (Class<Map<String, Object>>)(Class<?>)Map.class);

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                Map<String, Object> body = response.getBody();
                if (body != null) {
                    List<?> choices = (List<?>) body.get("choices");
                    if (choices != null && !choices.isEmpty()) {
                        Map<String, Object> firstChoice = (Map<String, Object>) choices.get(0);
                        Map<String, Object> message = (Map<String, Object>) firstChoice.get("message");
                        if (message != null) {
                            return (String) message.get("content");
                        }
                    }
                }
            }
            throw new RuntimeException("Invalid response from Groq API");
        } catch (Exception e) {
            throw new RuntimeException("Groq API call failed: " + e.getMessage(), e);
        }
    }

    private String callNvidia(String prompt) {
        if (nvidiaApiKey == null || nvidiaApiKey.trim().isEmpty() || nvidiaApiKey.contains("your_")) {
            throw new RuntimeException("NVIDIA API key not configured");
        }

        try {
            // Using NVIDIA's Nemotron 3 8B model via their API
            String url = "https://integrate.api.nvidia.com/v1/chat/completions";

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(nvidiaApiKey);

            Map<String, Object> messages = Map.of(
                "role", "user",
                "content", prompt
            );

            Map<String, Object> payload = Map.of(
                "model", "nvidia/nemotron-3-8b-instruct",
                "messages", List.of(messages),
                "max_tokens", 1000,
                "temperature", 0.7,
                "top_p", 0.9
            );

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(payload, headers);
            ResponseEntity<Map<String, Object>> response = restTemplate.postForEntity(url, entity, (Class<Map<String, Object>>)(Class<?>)Map.class);

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                Map<String, Object> body = response.getBody();
                if (body != null) {
                    List<?> choices = (List<?>) body.get("choices");
                    if (choices != null && !choices.isEmpty()) {
                        Map<String, Object> firstChoice = (Map<String, Object>) choices.get(0);
                        Map<String, Object> message = (Map<String, Object>) firstChoice.get("message");
                        if (message != null) {
                            return (String) message.get("content");
                        }
                    }
                }
            }
            throw new RuntimeException("Invalid response from NVIDIA API");
        } catch (Exception e) {
            throw new RuntimeException("NVIDIA API call failed: " + e.getMessage(), e);
        }
    }

    private String callGemini(String prompt) {
        if (geminiApiKey == null || geminiApiKey.trim().isEmpty() || geminiApiKey.contains("your_")) {
            throw new RuntimeException("Gemini API key not configured");
        }

        try {
            String url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" + geminiApiKey;

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            Map<String, Object> parts = Map.of(
                "text", prompt
            );

            Map<String, Object> content = Map.of(
                "parts", List.of(parts)
            );

            Map<String, Object> payload = Map.of(
                "contents", List.of(content)
            );

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(payload, headers);
            ResponseEntity<Map<String, Object>> response = restTemplate.postForEntity(url, entity, (Class<Map<String, Object>>)(Class<?>)Map.class);

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                Map<String, Object> body = response.getBody();
                if (body != null) {
                    List<?> candidates = (List<?>) body.get("candidates");
                    if (candidates != null && !candidates.isEmpty()) {
                        Map<String, Object> candidate = (Map<String, Object>) candidates.get(0);
                        Map<String, Object> contentResponse = (Map<String, Object>) candidate.get("content");
                        if (contentResponse != null) {
                            List<?> partsResponse = (List<?>) contentResponse.get("parts");
                            if (partsResponse != null && !partsResponse.isEmpty()) {
                                Map<String, Object> firstPart = (Map<String, Object>) partsResponse.get(0);
                                if (firstPart != null) {
                                    return (String) firstPart.get("text");
                                }
                            }
                        }
                    }
                }
            }
            throw new RuntimeException("Invalid response from Gemini API");
        } catch (Exception e) {
            throw new RuntimeException("Gemini API call failed: " + e.getMessage(), e);
        }
    }
}
