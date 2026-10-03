package com.knowledgebase;

import com.knowledgebase.user.DevUserSeeder;
import com.knowledgebase.user.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.DefaultApplicationArguments;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;
import org.springframework.security.oauth2.client.registration.ClientRegistration;
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;
import org.springframework.security.oauth2.client.registration.InMemoryClientRegistrationRepository;
import org.springframework.security.oauth2.core.AuthorizationGrantType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest(properties = {
        "spring.datasource.password=${DB_PASSWORD:ci_ephemeral_postgres}",
        "spring.security.oauth2.client.registration.keycloak.client-secret=test-only-unused"
})
@AutoConfigureMockMvc
@ActiveProfiles("dev")
@Import(AuthenticationIntegrationTest.OidcTestConfiguration.class)
class AuthenticationIntegrationTest {
    static final String ISSUER = "http://127.0.0.1:8180/realms/knowledge-base";
    @Autowired MockMvc mvc;
    @Autowired UserRepository users;
    @Autowired DevUserSeeder seeder;

    @TestConfiguration(proxyBeanMethods = false)
    static class OidcTestConfiguration {
        // Mocked identity provider metadata keeps CI independent of a running Keycloak.
        @Bean
        ClientRegistrationRepository clientRegistrationRepository() {
            return new InMemoryClientRegistrationRepository(ClientRegistration.withRegistrationId("keycloak")
                    .clientId("knowledge-base-web").clientSecret("test-secret")
                    .authorizationGrantType(AuthorizationGrantType.AUTHORIZATION_CODE)
                    .redirectUri("http://127.0.0.1:5173/login/oauth2/code/keycloak")
                    .scope("openid", "profile", "email")
                    .issuerUri(ISSUER).authorizationUri(ISSUER + "/protocol/openid-connect/auth")
                    .tokenUri(ISSUER + "/protocol/openid-connect/token")
                    .jwkSetUri(ISSUER + "/protocol/openid-connect/certs")
                    .userInfoUri(ISSUER + "/protocol/openid-connect/userinfo")
                    .userNameAttributeName("sub").build());
        }
    }

    @Test
    void anonymousProfileIsProtectedAndLoginRedirectsToKeycloak() throws Exception {
        mvc.perform(get("/api/auth/me")).andExpect(status().isUnauthorized());
        mvc.perform(get("/oauth2/authorization/keycloak")).andExpect(status().is3xxRedirection())
                .andExpect(header().string("Location", org.hamcrest.Matchers.startsWith(ISSUER + "/protocol/openid-connect/auth")));
    }

    @Test
    void allDemoIdentitiesResolveToTheirOwnJpaProfile() throws Exception {
        String[] emails = {"alex@example.com", "sam@example.com", "taylor@example.com"};
        for (int i = 0; i < emails.length; i++) {
            String subject = "10000000-0000-4000-8000-00000000000" + (i + 1);
            var profile = users.findByOidcIssuerAndOidcSubject(ISSUER, subject).orElseThrow();
            mvc.perform(get("/api/auth/me").with(oidcLogin().idToken(token -> token
                            .issuer(ISSUER).subject(subject).claim("email", profile.email()).claim("email_verified", true))))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.id").value(profile.id().toString()))
                    .andExpect(jsonPath("$.email").value(emails[i]))
                    .andExpect(jsonPath("$.role").value("USER"))
                    .andExpect(jsonPath("$.passwordHash").doesNotExist());
        }
    }

    @Test
    void logoutRequiresCsrfAndClearsTheLocalSession() throws Exception {
        mvc.perform(post("/api/auth/logout").with(oidcLogin())).andExpect(status().isForbidden());
        var result = mvc.perform(get("/api/auth/me").with(oidcLogin().idToken(token ->
                        token.issuer(ISSUER).subject("10000000-0000-4000-8000-000000000001"))))
                .andExpect(status().isOk()).andReturn();
        var session = (org.springframework.mock.web.MockHttpSession) result.getRequest().getSession(false);
        mvc.perform(post("/api/auth/logout").session(session).with(csrf()))
                .andExpect(status().is3xxRedirection());
        assertTrue(session.isInvalid());
        mvc.perform(get("/api/auth/me")).andExpect(status().isUnauthorized());
    }

    @Test
    void emailCollisionCannotTakeOverAnotherIdentity() throws Exception {
        mvc.perform(get("/api/auth/me").with(oidcLogin().idToken(token -> token
                        .issuer(ISSUER).subject("different-user").claim("email", "alex@example.com")
                        .claim("email_verified", true))))
                .andExpect(status().isConflict());
        mvc.perform(get("/api/auth/me").with(oidcLogin().idToken(token -> token
                        .issuer(ISSUER).subject("unverified-user").claim("email", "new@example.com")
                        .claim("email_verified", false))))
                .andExpect(status().isForbidden());
    }

    @Test
    void seedingPreservesProfileIdsAndIdentity() {
        var original = users.findByEmailIgnoreCase("alex@example.com").orElseThrow();
        seeder.run(new DefaultApplicationArguments(new String[0]));
        var reseeded = users.findByEmailIgnoreCase("alex@example.com").orElseThrow();
        assertEquals(original.id(), reseeded.id());
        assertEquals(original.oidcSubject(), reseeded.oidcSubject());
        assertEquals(3, users.findAll().stream().filter(user -> user.email().endsWith("@example.com")).count());
    }
}
