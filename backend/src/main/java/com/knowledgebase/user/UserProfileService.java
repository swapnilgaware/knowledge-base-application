package com.knowledgebase.user;

import org.springframework.http.HttpStatus;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class UserProfileService {
    private final UserRepository users;
    public UserProfileService(UserRepository users) { this.users = users; }

    @Transactional
    public AppUser.UserProfile profile(OidcUser identity) {
        String issuer = identity.getIssuer().toString();
        return users.findByOidcIssuerAndOidcSubject(issuer, identity.getSubject())
                .orElseGet(() -> {
                    String email = identity.getEmail();
                    if (!Boolean.TRUE.equals(identity.getEmailVerified()) || email == null) {
                        throw new ResponseStatusException(HttpStatus.FORBIDDEN, "A verified email is required");
                    }
                    // Never link identities by email: the issuer and subject establish ownership.
                    if (users.existsByEmailIgnoreCase(email)) {
                        throw new ResponseStatusException(HttpStatus.CONFLICT, "Email belongs to another profile");
                    }
                    String name = identity.getFullName();
                    return users.save(new AppUser(email, name == null ? email : name, issuer, identity.getSubject()));
                }).profile();
    }
}
