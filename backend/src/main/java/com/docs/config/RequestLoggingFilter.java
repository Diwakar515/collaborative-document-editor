package com.docs.config;

import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.MDC;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.UUID;

@Component
public class RequestLoggingFilter implements Filter {

    private static final Logger logger = LoggerFactory.getLogger(RequestLoggingFilter.class);
    private static final String REQUEST_ID = "requestId";

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {

        long startTime = System.currentTimeMillis();

        try {
            String requestId = UUID.randomUUID().toString().substring(0, 8);
            MDC.put(REQUEST_ID, requestId);

            HttpServletRequest httpRequest = (HttpServletRequest) request;
            HttpServletResponse httpResponse = (HttpServletResponse) response;

            logger.info("Incoming request: {} {}", httpRequest.getMethod(), httpRequest.getRequestURI());

            chain.doFilter(request, response);

            long duration = System.currentTimeMillis() - startTime;

            logger.info("Completed {} {} with status {} in {} ms",
                    httpRequest.getMethod(),
                    httpRequest.getRequestURI(),
                    httpResponse.getStatus(),
                    duration);

        } finally {
            MDC.clear();
        }
    }
}