package com.kolab.kanvas.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

@Component
public class RateLimitingFilter extends OncePerRequestFilter {

    private final Map<String, RequestBucket> buckets = new ConcurrentHashMap<>();

    private static final int AUTH_LIMIT_PER_MINUTE = 10;
    private static final int SUMMARY_LIMIT_PER_MINUTE = 5;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        String path = request.getRequestURI();
        String clientIp = request.getRemoteAddr();

        if (path.startsWith("/api/v1/auth/login") || path.startsWith("/api/v1/auth/register")) {
            if (isRateLimited(clientIp + ":auth", AUTH_LIMIT_PER_MINUTE)) {
                response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
                response.getWriter().write("Too many authentication requests. Please wait a minute.");
                return;
            }
        } else if (path.endsWith("/summary")) {
            if (isRateLimited(clientIp + ":summary", SUMMARY_LIMIT_PER_MINUTE)) {
                response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
                response.getWriter().write("Rate limit exceeded for AI summarization. Please wait a minute.");
                return;
            }
        }

        filterChain.doFilter(request, response);
    }

    private boolean isRateLimited(String key, int maxRequestsPerMinute) {
        long now = System.currentTimeMillis();
        RequestBucket bucket = buckets.computeIfAbsent(key, k -> new RequestBucket(now));

        synchronized (bucket) {
            if (now - bucket.resetTime > 60000) {
                bucket.resetTime = now;
                bucket.count.set(0);
            }
            return bucket.count.incrementAndGet() > maxRequestsPerMinute;
        }
    }

    private static class RequestBucket {
        long resetTime;
        AtomicInteger count = new AtomicInteger(0);

        RequestBucket(long resetTime) {
            this.resetTime = resetTime;
        }
    }
}
