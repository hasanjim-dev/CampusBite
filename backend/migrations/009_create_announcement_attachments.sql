CREATE TABLE announcement_attachments (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT,
    announcement_id INT UNSIGNED NOT NULL,
    original_filename VARCHAR(255) NOT NULL,
    stored_filename VARCHAR(255) NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    file_size INT UNSIGNED NOT NULL,
    uploaded_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    UNIQUE KEY uq_announcement_attachment_stored_filename (stored_filename),
    KEY idx_announcement_attachment (announcement_id),

    CONSTRAINT fk_announcement_attachment
        FOREIGN KEY (announcement_id)
        REFERENCES announcements(id)
        ON DELETE CASCADE,

    CONSTRAINT chk_announcement_attachment_size
        CHECK (file_size > 0 AND file_size <= 5242880),

    CONSTRAINT chk_announcement_attachment_type
        CHECK (
            mime_type IN (
                'image/jpeg',
                'image/png',
                'image/webp',
                'application/pdf'
            )
        )
) ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_unicode_ci;
