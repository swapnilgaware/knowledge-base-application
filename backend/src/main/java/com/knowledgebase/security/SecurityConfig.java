package com.knowledgebase.security;

import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpStatus;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;
import org.springframework.security.oauth2.client.oidc.web.logout.OidcClientInitiatedLogoutSuccessHandler;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.HttpStatusEntryPoint;

@Configuration
public class SecurityConfig {
    @Bean
    SecurityFilterChain securityFilterChain(HttpSecurity http, ClientRegistrationRepository clients,
            @Value("${app.frontend-url}") String frontend) throws Exception {
        var handler = new OidcClientInitiatedLogoutSuccessHandler(clients);
        handler.setPostLogoutRedirectUri(frontend + "/");
        handler.setDefaultTargetUrl(frontend + "/#/login");
        return http
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/api/health", "/api/auth/csrf", "/oauth2/**", "/login/oauth2/**").permitAll()
                        .anyRequest().authenticated())
                .csrf(Customizer.withDefaults())
                .requestCache(cache -> cache.disable())
                .exceptionHandling(errors -> errors
                        .authenticationEntryPoint(new HttpStatusEntryPoint(HttpStatus.UNAUTHORIZED))
                        .accessDeniedHandler((request, response, exception) -> {
                            response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                            response.setContentType("application/json");
                            response.getWriter().write("{\"message\":\"Request is not permitted.\"}");
                        }))
                .oauth2Login(login -> login.defaultSuccessUrl(frontend + "/#/workspace", true)
                        .failureHandler((request, response, exception) -> {
                            var cause = exception.getCause();
                            org.slf4j.LoggerFactory.getLogger(SecurityConfig.class).warn(
                                    "Sign-in failed: {} (cause: {})", exception.getClass().getSimpleName(),
                                    cause == null ? "none" : cause.getClass().getSimpleName());
                            response.sendRedirect(frontend + "/?authError=1#/login");
                        }))
                .logout(logout -> logout.logoutUrl("/api/auth/logout").deleteCookies("JSESSIONID")
                        .logoutSuccessHandler(handler))
                .build();
    }
}
