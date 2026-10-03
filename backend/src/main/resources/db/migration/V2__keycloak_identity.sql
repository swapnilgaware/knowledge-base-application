-- Preserve local profile IDs; credentials now belong exclusively to Keycloak.
ALTER TABLE app_user DROP COLUMN password_hash;
ALTER TABLE app_user ADD COLUMN oidc_issuer VARCHAR(512);
ALTER TABLE app_user ADD COLUMN oidc_subject VARCHAR(255);
ALTER TABLE app_user ADD CONSTRAINT unique_oidc_identity UNIQUE (oidc_issuer, oidc_subject);
ALTER TABLE app_user ADD CONSTRAINT complete_oidc_identity CHECK (
    (oidc_issuer IS NULL AND oidc_subject IS NULL) OR
    (oidc_issuer IS NOT NULL AND oidc_subject IS NOT NULL)
);
