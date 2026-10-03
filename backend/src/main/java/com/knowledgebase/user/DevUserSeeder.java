package com.knowledgebase.user;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/** Profile metadata only; the imported development realm owns the credentials. */
@Component
@Profile("dev")
public class DevUserSeeder implements ApplicationRunner {
    private final UserRepository users;
    private final String issuer;

    public DevUserSeeder(UserRepository users,
            @Value("${spring.security.oauth2.client.provider.keycloak.issuer-uri}") String issuer) {
        this.users = users;
        this.issuer = issuer;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        seed("alex@example.com", "Alex Morgan", "10000000-0000-4000-8000-000000000001");
        seed("sam@example.com", "Sam Rivera", "10000000-0000-4000-8000-000000000002");
        seed("taylor@example.com", "Taylor Chen", "10000000-0000-4000-8000-000000000003");
    }

    private void seed(String email, String name, String subject) {
        var profile = users.findByEmailIgnoreCase(email)
                .orElseGet(() -> new AppUser(email, name, issuer, subject));
        profile.attachIdentity(issuer, subject);
        users.save(profile);
    }
}
