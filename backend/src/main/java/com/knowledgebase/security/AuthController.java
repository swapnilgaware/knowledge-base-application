package com.knowledgebase.security;

import com.knowledgebase.user.AppUser.UserProfile;
import com.knowledgebase.user.UserProfileService;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class AuthController {
    private final UserProfileService users;
    public AuthController(UserProfileService users) { this.users = users; }

    @GetMapping("/api/auth/csrf")
    public CsrfResponse csrf(CsrfToken token) {
        return new CsrfResponse(token.getHeaderName(), token.getParameterName(), token.getToken());
    }

    @GetMapping("/api/auth/me")
    public UserProfile currentUser(@AuthenticationPrincipal OidcUser identity) { return users.profile(identity); }

    @GetMapping("/api/health")
    public HealthResponse health() { return new HealthResponse("up"); }

    public record CsrfResponse(String headerName, String parameterName, String token) {}
    public record HealthResponse(String status) {}
}
