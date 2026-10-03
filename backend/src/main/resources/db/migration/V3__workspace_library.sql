CREATE TABLE book (
    id VARCHAR(80) PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    author VARCHAR(120) NOT NULL,
    category VARCHAR(60) NOT NULL,
    description VARCHAR(1000) NOT NULL,
    color VARCHAR(20) NOT NULL,
    source_url VARCHAR(500) NOT NULL,
    chapter_count INTEGER NOT NULL
);
CREATE TABLE book_chapter (
    id UUID PRIMARY KEY,
    book_id VARCHAR(80) NOT NULL REFERENCES book(id),
    chapter_number INTEGER NOT NULL,
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    CONSTRAINT unique_book_chapter UNIQUE (book_id, chapter_number)
);
CREATE TABLE reading_progress (
    user_id UUID NOT NULL REFERENCES app_user(id),
    book_id VARCHAR(80) NOT NULL REFERENCES book(id),
    chapter_number INTEGER NOT NULL,
    completed BOOLEAN NOT NULL,
    PRIMARY KEY (user_id, book_id)
);
CREATE TABLE saved_post (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES app_user(id),
    post_id VARCHAR(80) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL,
    CONSTRAINT unique_saved_post UNIQUE (user_id, post_id)
);
CREATE TABLE mind_map (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES app_user(id),
    title VARCHAR(120) NOT NULL,
    nodes TEXT NOT NULL,
    version BIGINT NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL
);
CREATE INDEX mind_map_owner ON mind_map(user_id, updated_at DESC);
