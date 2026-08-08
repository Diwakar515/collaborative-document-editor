package com.docs.config;

import io.github.bucket4j.*;
import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.IOException;
import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class RateLimitingFilter implements Filter {

    private static final Logger logger =
            LoggerFactory.getLogger(RateLimitingFilter.class);
    private final Map<String, Bucket> cache = new ConcurrentHashMap<>();

    private Bucket createNewBucket() {
        Bandwidth limit = Bandwidth.builder()
                .capacity(200) // max 200 requests
                .refillIntervally(200, Duration.ofMinutes(1)) // perminute
                .build();

        return Bucket.builder()
                .addLimit(limit)
                .build();
    }

    private Bucket resolveBucket(String key) {
        return cache.computeIfAbsent(key, k -> createNewBucket());
    }

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {

        HttpServletRequest httpRequest = (HttpServletRequest) request;
        HttpServletResponse httpResponse = (HttpServletResponse) response;

        String path = httpRequest.getRequestURI();

        logger.debug("Incoming request path: {}", path);
        // Skip rate limiting for public endpoints
        if (path.startsWith("/api/v1/users") ||
                path.startsWith("/swagger-ui") ||
                path.startsWith("/v3/api-docs") ||
                path.startsWith("/ws")) {

            chain.doFilter(request, response);
            return;
        }

        String ip = httpRequest.getRemoteAddr(); // identify user

        Bucket bucket = resolveBucket(ip);

        if (bucket.tryConsume(1)) {
            chain.doFilter(request, response); // allow request
        } else {
            httpResponse.setStatus(429);
            httpResponse.setContentType("application/json");

            httpResponse.getWriter().write("""
            {
              "success": false,
              "message": "Too many requests. Please try again later.",
              "data": null
            }
            """);
        }
    }
}