CREATE TABLE app_user (
    id UUID PRIMARY KEY,
    email VARCHAR(254) NOT NULL UNIQUE,
    display_name VARCHAR(100) NOT NULL,
    password_hash VARCHAR(200) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('USER')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT email_normalized CHECK (email = lower(email))
);
