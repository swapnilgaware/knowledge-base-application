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

    @Autowired tools.jackson.databind.ObjectMapper json;

    private org.springframework.test.web.servlet.request.RequestPostProcessor identity(int user) {
        return oidcLogin().idToken(token -> token.issuer(ISSUER)
                .subject("10000000-0000-4000-8000-00000000000" + user));
    }

    @Test
    void libraryAndWorkspaceRoutesRequireLogin() throws Exception {
        for (String path : new String[]{"/api/books", "/api/books/alice/chapters/0", "/api/mindmaps", "/api/saved-posts"}) {
            mvc.perform(get(path)).andExpect(status().isUnauthorized());
        }
        mvc.perform(get("/api/books").with(identity(1)))
                .andExpect(status().isOk()).andExpect(jsonPath("$.length()").value(3));
        mvc.perform(get("/api/books/alice/contents").with(identity(1)))
                .andExpect(status().isOk()).andExpect(jsonPath("$.length()").value(13));
        mvc.perform(get("/api/books/alice/chapters/0").with(identity(1)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("CHAPTER I. Down the Rabbit-Hole"))
                .andExpect(jsonPath("$.content").value(org.hamcrest.Matchers.containsString("Alice was beginning")))
                .andExpect(header().doesNotExist("Content-Disposition"));
        for (String id : new String[]{"alice", "looking-glass", "sherlock"}) {
            mvc.perform(get("/api/books/" + id + "/chapters/11").with(identity(1)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.content").value(org.hamcrest.Matchers.not(org.hamcrest.Matchers.emptyString())));
            mvc.perform(get("/api/books/" + id + "/chapters/12").with(identity(1)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.content").value(org.hamcrest.Matchers.containsString("Project Gutenberg")));
        }
    }

    @Test
    @org.springframework.transaction.annotation.Transactional
    void readingPositionsAndBookmarksArePrivateAndPersisted() throws Exception {
        var samBooks = mvc.perform(get("/api/books").with(identity(2))).andReturn().getResponse().getContentAsString();
        var samSaved = mvc.perform(get("/api/saved-posts").with(identity(2))).andReturn().getResponse().getContentAsString();
        mvc.perform(put("/api/books/alice/progress").with(identity(1))
                        .contentType("application/json").content("{\"chapterNumber\":1,\"completed\":false}"))
                .andExpect(status().isForbidden());
        mvc.perform(put("/api/books/alice/progress").with(identity(1)).with(csrf())
                        .contentType("application/json").content("{\"chapterNumber\":1,\"completed\":false}"))
                .andExpect(status().isOk());
        mvc.perform(get("/api/books").with(identity(1)))
                .andExpect(jsonPath("$[?(@.id == 'alice')].currentChapter", org.hamcrest.Matchers.hasItem(1)));
        assertEquals(samBooks, mvc.perform(get("/api/books").with(identity(2))).andReturn().getResponse().getContentAsString());
        mvc.perform(put("/api/books/alice/progress").with(identity(1)).with(csrf())
                        .contentType("application/json").content("{\"chapterNumber\":99,\"completed\":false}"))
                .andExpect(status().isBadRequest());
        mvc.perform(put("/api/books/alice/progress").with(identity(1)).with(csrf())
                        .contentType("application/json").content("{\"chapterNumber\":1,\"completed\":true}"))
                .andExpect(status().isBadRequest());
        mvc.perform(put("/api/saved-posts/graph-rag").with(identity(1)).with(csrf())).andExpect(status().isOk());
        mvc.perform(put("/api/saved-posts/graph-rag").with(identity(1)).with(csrf())).andExpect(status().isOk());
        var alexSaved = json.readTree(mvc.perform(get("/api/saved-posts").with(identity(1))).andReturn().getResponse().getContentAsString());
        int found = 0;
        for (var item : alexSaved) if (item.asText().equals("graph-rag")) found++;
        assertEquals(1, found);
        assertEquals(samSaved, mvc.perform(get("/api/saved-posts").with(identity(2))).andReturn().getResponse().getContentAsString());
        mvc.perform(delete("/api/saved-posts/graph-rag").with(identity(1)).with(csrf())).andExpect(status().isOk());
        mvc.perform(get("/api/saved-posts").with(identity(1)))
                .andExpect(jsonPath("$", org.hamcrest.Matchers.not(org.hamcrest.Matchers.hasItem("graph-rag"))));
    }

    @Test
    @org.springframework.transaction.annotation.Transactional
    void mindmapsEnforceOwnershipValidTreesAndVersionChecks() throws Exception {
        String body = """
            {"title":"Integration map","nodes":[
              {"id":"root","parentId":null,"label":"Integration map"},
              {"id":"one","parentId":"root","label":"Evidence"}
            ],"version":0}
            """;
        mvc.perform(post("/api/mindmaps").with(identity(1)).contentType("application/json").content(body))
                .andExpect(status().isForbidden());
        var created = mvc.perform(post("/api/mindmaps").with(identity(1)).with(csrf())
                        .contentType("application/json").content(body))
                .andExpect(status().isCreated()).andReturn();
        String id = json.readTree(created.getResponse().getContentAsString()).get("id").asText();
        mvc.perform(get("/api/mindmaps/" + id).with(identity(1))).andExpect(status().isOk());
        mvc.perform(get("/api/mindmaps/" + id).with(identity(2))).andExpect(status().isNotFound());
        mvc.perform(put("/api/mindmaps/" + id).with(identity(2)).with(csrf())
                        .contentType("application/json").content(body)).andExpect(status().isNotFound());
        mvc.perform(put("/api/mindmaps/" + id).with(identity(1)).with(csrf())
                        .contentType("application/json").content(body.replace("Evidence", "Updated evidence")))
                .andExpect(status().isOk()).andExpect(jsonPath("$.version").value(1));
        mvc.perform(put("/api/mindmaps/" + id).with(identity(1)).with(csrf())
                        .contentType("application/json").content(body)).andExpect(status().isConflict());
        String cycle = """
            {"title":"Invalid cycle","nodes":[
              {"id":"root","parentId":null,"label":"Root"},
              {"id":"a","parentId":"b","label":"A"},
              {"id":"b","parentId":"a","label":"B"}
            ],"version":0}
            """;
        mvc.perform(post("/api/mindmaps").with(identity(1)).with(csrf())
                        .contentType("application/json").content(cycle)).andExpect(status().isBadRequest());
        mvc.perform(get("/api/mindmaps/" + id).with(identity(1)))
                .andExpect(jsonPath("$.nodes[1].label").value("Updated evidence"));
    }

}
