package com.knowledgebase.user;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.util.Locale;
import java.util.UUID;

@Entity
@Table(name = "app_user")
public class AppUser {
    @Id
    private UUID id;
    @Column(nullable = false, unique = true, length = 254)
    private String email;
    @Column(name = "display_name", nullable = false, length = 100)
    private String displayName;
    @Column(name = "oidc_issuer", length = 512)
    private String oidcIssuer;
    @Column(name = "oidc_subject", length = 255)
    private String oidcSubject;
    @Column(nullable = false, length = 20)
    private String role;

    protected AppUser() {}

    public AppUser(String email, String displayName, String issuer, String subject) {
        this.id = UUID.randomUUID();
        this.email = email.strip().toLowerCase(Locale.ROOT);
        this.displayName = displayName;
        this.oidcIssuer = issuer;
        this.oidcSubject = subject;
        this.role = "USER";
    }

    public UUID id() { return id; }
    public String email() { return email; }
    public String displayName() { return displayName; }
    public String oidcIssuer() { return oidcIssuer; }
    public String oidcSubject() { return oidcSubject; }
    public void attachIdentity(String issuer, String subject) {
        if (oidcSubject != null && (!oidcSubject.equals(subject) || !oidcIssuer.equals(issuer))) {
            throw new IllegalStateException("Profile already belongs to another identity");
        }
        oidcIssuer = issuer;
        oidcSubject = subject;
    }
    public String role() { return role; }

    /** Explicit development-host migration; never merge or relink accounts by email. */
    public void migrateIssuer(String expectedIssuer, String expectedSubject, String newIssuer) {
        if (!expectedIssuer.equals(oidcIssuer) || !expectedSubject.equals(oidcSubject)) {
            throw new IllegalStateException("Unexpected identity during issuer migration");
        }
        oidcIssuer = newIssuer;
    }

    public UserProfile profile() {
        return new UserProfile(id, email, displayName, role);
    }

    public record UserProfile(UUID id, String email, String displayName, String role) {}
}
