-- migrate:up
CREATE TABLE form_submissions (
    id          SERIAL PRIMARY KEY,
    name        TEXT        NOT NULL,
    email       TEXT        NOT NULL,
    company     TEXT        NOT NULL,
    project     TEXT        NOT NULL,
    description TEXT        NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- migrate:down
DROP TABLE form_submissions;
