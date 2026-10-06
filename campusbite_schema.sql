-- =====================================================================
-- CampusBite : Campus Food Review, Community & Monitoring Platform
-- MySQL 8.0.16+ (CHECK constraints + generated columns)
-- Run:  mysql -u root -p < campusbite_schema.sql
-- =====================================================================

CREATE DATABASE IF NOT EXISTS campusbite
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
USE campusbite;

-- ---------------------------------------------------------------------
-- 1. USERS  (FR-01..05, FR-48..52, NFR-01..04)
--    role   : student | shop_owner | admin   (role-based access control)
--    status : active | restricted | deactivated (admin can restrict)
-- ---------------------------------------------------------------------
CREATE TABLE users (
  id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name          VARCHAR(100)  NOT NULL,
  email         VARCHAR(150)  NOT NULL UNIQUE,
  password_hash VARCHAR(255)  NOT NULL,              -- bcrypt hash, never plain text
  role          ENUM('student','shop_owner','admin') NOT NULL DEFAULT 'student',
  avatar_url    VARCHAR(500)  NULL,
  status        ENUM('active','restricted','deactivated') NOT NULL DEFAULT 'active',
  created_at    TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_users_role (role),
  INDEX idx_users_status (status)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 2. SHOPS  (FR-26..30, FR-34..36, FR-69)
--    One shop per owner account. Rating fields are system-calculated only.
-- ---------------------------------------------------------------------
CREATE TABLE shops (
  id             INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  owner_id       INT UNSIGNED  NOT NULL UNIQUE,
  name           VARCHAR(150)  NOT NULL,
  description    TEXT          NULL,
  logo_url       VARCHAR(500)  NULL,
  location       VARCHAR(255)  NULL,
  contact_phone  VARCHAR(30)   NULL,
  contact_email  VARCHAR(150)  NULL,
  opening_hours  VARCHAR(255)  NULL,                 -- e.g. 'Sat-Thu 8:00 AM - 8:00 PM'
  overall_rating DECIMAL(3,2)  NOT NULL DEFAULT 0.00,   -- auto-calculated (BR-06)
  rating_count   INT UNSIGNED  NOT NULL DEFAULT 0,      -- auto-calculated
  is_active      BOOLEAN       NOT NULL DEFAULT TRUE,
  created_at     TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at     TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_shops_owner FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE RESTRICT,
  FULLTEXT INDEX ft_shops_search (name, description)  -- FR-72 search
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 3. FOOD ITEMS / MENU  (FR-31..33, FR-37..42, FR-73)
--    final_price is auto-computed from price and discount_percent.
-- ---------------------------------------------------------------------
CREATE TABLE food_items (
  id               INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  shop_id          INT UNSIGNED  NOT NULL,
  name             VARCHAR(150)  NOT NULL,
  description      TEXT          NULL,
  image_url        VARCHAR(500)  NULL,
  price            DECIMAL(10,2) NOT NULL CHECK (price >= 0),
  discount_percent DECIMAL(5,2)  NOT NULL DEFAULT 0.00
                   CHECK (discount_percent >= 0 AND discount_percent <= 100),
  final_price      DECIMAL(10,2) AS (ROUND(price * (1 - discount_percent / 100), 2)) STORED,
  avg_rating       DECIMAL(3,2)  NOT NULL DEFAULT 0.00,   -- auto-calculated (FR-19, FR-68)
  rating_count     INT UNSIGNED  NOT NULL DEFAULT 0,      -- auto-calculated
  is_available     BOOLEAN       NOT NULL DEFAULT TRUE,
  created_at       TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at       TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_food_shop FOREIGN KEY (shop_id) REFERENCES shops(id) ON DELETE CASCADE,
  UNIQUE KEY uq_food_id_shop (id, shop_id),          -- lets other tables prove "item belongs to shop"
  INDEX idx_food_shop (shop_id),
  FULLTEXT INDEX ft_food_search (name, description)  -- FR-73 search
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 4. FOOD RATINGS  (FR-14, FR-18..21, FR-43, FR-70..71)
--    One rating per user per food item (updated if they rate again).
-- ---------------------------------------------------------------------
CREATE TABLE food_ratings (
  id           INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id      INT UNSIGNED NOT NULL,
  food_item_id INT UNSIGNED NOT NULL,
  rating       TINYINT UNSIGNED NOT NULL CHECK (rating BETWEEN 1 AND 5),
  created_at   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_fr_user FOREIGN KEY (user_id)      REFERENCES users(id)      ON DELETE CASCADE,
  CONSTRAINT fk_fr_food FOREIGN KEY (food_item_id) REFERENCES food_items(id) ON DELETE CASCADE,
  UNIQUE KEY uq_user_food (user_id, food_item_id)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 5. REVIEWS  (FR-06..08, FR-12..17, FR-79..81, FR-87..89, BR-07)
--    is_anonymous : hides name publicly; user_id is still stored so
--                   admin can identify the author (FR-88).
--    status       : 'removed' reviews are hidden from public (BR-07).
-- ---------------------------------------------------------------------
CREATE TABLE reviews (
  id             INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id        INT UNSIGNED NOT NULL,
  shop_id        INT UNSIGNED NOT NULL,
  food_item_id   INT UNSIGNED NOT NULL,
  rating         TINYINT UNSIGNED NOT NULL CHECK (rating BETWEEN 1 AND 5),
  body           TEXT NOT NULL,
  image_url      VARCHAR(500) NULL,
  is_anonymous   BOOLEAN NOT NULL DEFAULT FALSE,
  is_edited      BOOLEAN NOT NULL DEFAULT FALSE,
  status         ENUM('published','removed') NOT NULL DEFAULT 'published',
  removed_by     INT UNSIGNED NULL,
  removal_reason VARCHAR(255) NULL,
  created_at     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_rev_user    FOREIGN KEY (user_id)    REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_rev_remover FOREIGN KEY (removed_by) REFERENCES users(id) ON DELETE SET NULL,
  -- guarantees the chosen food item really belongs to the chosen shop (FR-13, FR-17)
  CONSTRAINT fk_rev_food_shop FOREIGN KEY (food_item_id, shop_id)
      REFERENCES food_items(id, shop_id) ON DELETE CASCADE,
  INDEX idx_rev_feed (status, created_at),
  INDEX idx_rev_shop (shop_id),
  INDEX idx_rev_food (food_item_id),
  INDEX idx_rev_user (user_id)
) ENGINE=InnoDB;

-- Likes / reactions on reviews (FR-11)
CREATE TABLE review_reactions (
  user_id    INT UNSIGNED NOT NULL,
  review_id  INT UNSIGNED NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, review_id),
  CONSTRAINT fk_rr_user   FOREIGN KEY (user_id)   REFERENCES users(id)   ON DELETE CASCADE,
  CONSTRAINT fk_rr_review FOREIGN KEY (review_id) REFERENCES reviews(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 6. COMMENTS + REPLIES  (FR-09, FR-10, FR-55, FR-82)
--    parent_comment_id NULL = top-level comment, otherwise a reply.
-- ---------------------------------------------------------------------
CREATE TABLE comments (
  id                INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  review_id         INT UNSIGNED NOT NULL,
  user_id           INT UNSIGNED NOT NULL,
  parent_comment_id INT UNSIGNED NULL,
  body              TEXT NOT NULL,
  is_edited         BOOLEAN NOT NULL DEFAULT FALSE,
  status            ENUM('published','removed') NOT NULL DEFAULT 'published',
  created_at        TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at        TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_com_review FOREIGN KEY (review_id) REFERENCES reviews(id)  ON DELETE CASCADE,
  CONSTRAINT fk_com_user   FOREIGN KEY (user_id)   REFERENCES users(id)    ON DELETE CASCADE,
  CONSTRAINT fk_com_parent FOREIGN KEY (parent_comment_id) REFERENCES comments(id) ON DELETE CASCADE,
  INDEX idx_com_review (review_id, created_at)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 7. COMPLAINTS  (FR-22..25, FR-58..61)
-- ---------------------------------------------------------------------
CREATE TABLE complaint_categories (
  id   INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(80) NOT NULL UNIQUE
) ENGINE=InnoDB;

CREATE TABLE complaints (
  id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id       INT UNSIGNED NOT NULL,
  shop_id       INT UNSIGNED NOT NULL,
  food_item_id  INT UNSIGNED NULL,
  category_id   INT UNSIGNED NOT NULL,
  description   TEXT NOT NULL,
  evidence_url  VARCHAR(500) NULL,
  status        ENUM('pending','under_review','verified','rejected','resolved')
                NOT NULL DEFAULT 'pending',
  is_public     BOOLEAN NOT NULL DEFAULT FALSE,     -- only approved complaints shown publicly (FR-25)
  admin_note    TEXT NULL,
  handled_by    INT UNSIGNED NULL,
  created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_cmp_user    FOREIGN KEY (user_id)      REFERENCES users(id)                ON DELETE CASCADE,
  CONSTRAINT fk_cmp_shop    FOREIGN KEY (shop_id)      REFERENCES shops(id)                ON DELETE CASCADE,
  CONSTRAINT fk_cmp_food    FOREIGN KEY (food_item_id) REFERENCES food_items(id)           ON DELETE SET NULL,
  CONSTRAINT fk_cmp_cat     FOREIGN KEY (category_id)  REFERENCES complaint_categories(id),
  CONSTRAINT fk_cmp_handler FOREIGN KEY (handled_by)   REFERENCES users(id)                ON DELETE SET NULL,
  INDEX idx_cmp_status (status, created_at),
  INDEX idx_cmp_shop (shop_id)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 8. ANNOUNCEMENTS  (FR-44..47)
-- ---------------------------------------------------------------------
CREATE TABLE announcements (
  id           INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  shop_id      INT UNSIGNED NOT NULL,
  title        VARCHAR(150) NOT NULL,
  body         TEXT NOT NULL,
  is_published BOOLEAN NOT NULL DEFAULT TRUE,
  created_at   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_ann_shop FOREIGN KEY (shop_id) REFERENCES shops(id) ON DELETE CASCADE,
  INDEX idx_ann_shop (shop_id, created_at)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 9. REPORTS of reviews/comments + ADMIN ACTION LOG  (FR-56, FR-57)
--    Exactly one of review_id / comment_id must be set.
-- ---------------------------------------------------------------------
CREATE TABLE reports (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  reporter_id INT UNSIGNED NOT NULL,
  review_id   INT UNSIGNED NULL,
  comment_id  INT UNSIGNED NULL,
  reason      VARCHAR(255) NOT NULL,
  status      ENUM('pending','dismissed','action_taken') NOT NULL DEFAULT 'pending',
  handled_by  INT UNSIGNED NULL,
  created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_rep_reporter FOREIGN KEY (reporter_id) REFERENCES users(id)    ON DELETE CASCADE,
  CONSTRAINT fk_rep_review   FOREIGN KEY (review_id)   REFERENCES reviews(id)  ON DELETE CASCADE,
  CONSTRAINT fk_rep_comment  FOREIGN KEY (comment_id)  REFERENCES comments(id) ON DELETE CASCADE,
  CONSTRAINT fk_rep_handler  FOREIGN KEY (handled_by)  REFERENCES users(id)    ON DELETE SET NULL,
  CONSTRAINT chk_rep_target CHECK ((review_id IS NOT NULL) + (comment_id IS NOT NULL) = 1),
  INDEX idx_rep_status (status, created_at)
) ENGINE=InnoDB;

CREATE TABLE admin_actions (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  admin_id    INT UNSIGNED NOT NULL,
  action      VARCHAR(60)  NOT NULL,                 -- e.g. 'remove_review', 'restrict_user'
  target_type VARCHAR(40)  NOT NULL,                 -- e.g. 'review', 'comment', 'user', 'complaint'
  target_id   INT UNSIGNED NOT NULL,
  note        VARCHAR(255) NULL,
  created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_aa_admin FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_aa_target (target_type, target_id)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 10. EVENTS  (FR-62..67, BR-05)
-- ---------------------------------------------------------------------
CREATE TABLE events (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  created_by  INT UNSIGNED NOT NULL,                 -- must be an admin (checked in app / BR-05)
  name        VARCHAR(150) NOT NULL,
  event_date  DATE NOT NULL,
  start_time  TIME NULL,
  end_time    TIME NULL,
  location    VARCHAR(255) NULL,
  description TEXT NULL,
  image_url   VARCHAR(500) NULL,
  created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_evt_creator FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE RESTRICT,
  INDEX idx_evt_date (event_date)
) ENGINE=InnoDB;

CREATE TABLE event_shops (
  event_id INT UNSIGNED NOT NULL,
  shop_id  INT UNSIGNED NOT NULL,
  PRIMARY KEY (event_id, shop_id),
  CONSTRAINT fk_es_event FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
  CONSTRAINT fk_es_shop  FOREIGN KEY (shop_id)  REFERENCES shops(id)  ON DELETE CASCADE
) ENGINE=InnoDB;

-- Food items a participating shop provides for an event (FR-65, FR-67)
CREATE TABLE event_food_items (
  event_id     INT UNSIGNED NOT NULL,
  shop_id      INT UNSIGNED NOT NULL,
  food_item_id INT UNSIGNED NOT NULL,
  PRIMARY KEY (event_id, food_item_id),
  CONSTRAINT fk_efi_event_shop FOREIGN KEY (event_id, shop_id)
      REFERENCES event_shops(event_id, shop_id) ON DELETE CASCADE,
  CONSTRAINT fk_efi_food_shop FOREIGN KEY (food_item_id, shop_id)
      REFERENCES food_items(id, shop_id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 11. FAVORITES  (FR-83..85)
-- ---------------------------------------------------------------------
CREATE TABLE favorite_shops (
  user_id    INT UNSIGNED NOT NULL,
  shop_id    INT UNSIGNED NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, shop_id),
  CONSTRAINT fk_fs_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_fs_shop FOREIGN KEY (shop_id) REFERENCES shops(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE favorite_food_items (
  user_id      INT UNSIGNED NOT NULL,
  food_item_id INT UNSIGNED NOT NULL,
  created_at   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, food_item_id),
  CONSTRAINT fk_ff_user FOREIGN KEY (user_id)      REFERENCES users(id)      ON DELETE CASCADE,
  CONSTRAINT fk_ff_food FOREIGN KEY (food_item_id) REFERENCES food_items(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 12. NOTIFICATIONS  (FR-76..78, FR-86)
-- ---------------------------------------------------------------------
CREATE TABLE notifications (
  id           INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id      INT UNSIGNED NOT NULL,
  type         ENUM('announcement','reply','complaint_update','new_event',
                    'new_review','new_complaint','reported_post','menu_change') NOT NULL,
  message      VARCHAR(255) NOT NULL,
  related_type VARCHAR(40)  NULL,                    -- e.g. 'review', 'complaint', 'event'
  related_id   INT UNSIGNED NULL,
  is_read      BOOLEAN NOT NULL DEFAULT FALSE,
  created_at   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_not_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_not_user (user_id, is_read, created_at)
) ENGINE=InnoDB;

-- =====================================================================
-- RATING AUTOMATION  (FR-19..21, FR-68..71, BR-02, BR-06)
-- Ratings are only ever produced by triggers from user ratings.
-- =====================================================================
DELIMITER $$

CREATE PROCEDURE recalc_ratings(IN p_food_item_id INT UNSIGNED)
BEGIN
  DECLARE v_shop_id INT UNSIGNED;

  SELECT shop_id INTO v_shop_id FROM food_items WHERE id = p_food_item_id;

  IF v_shop_id IS NOT NULL THEN
    UPDATE food_items
       SET avg_rating   = COALESCE((SELECT ROUND(AVG(rating), 2) FROM food_ratings
                                     WHERE food_item_id = p_food_item_id), 0),
           rating_count = (SELECT COUNT(*) FROM food_ratings WHERE food_item_id = p_food_item_id)
     WHERE id = p_food_item_id;

    UPDATE shops
       SET overall_rating = COALESCE((SELECT ROUND(AVG(fr.rating), 2)
                                        FROM food_ratings fr
                                        JOIN food_items fi ON fi.id = fr.food_item_id
                                       WHERE fi.shop_id = v_shop_id), 0),
           rating_count   = (SELECT COUNT(*)
                               FROM food_ratings fr
                               JOIN food_items fi ON fi.id = fr.food_item_id
                              WHERE fi.shop_id = v_shop_id)
     WHERE id = v_shop_id;
  END IF;
END$$

-- BR-02 / FR-43: shop owners cannot rate their own shop's items
CREATE TRIGGER trg_ratings_block_owner
BEFORE INSERT ON food_ratings
FOR EACH ROW
BEGIN
  IF EXISTS (SELECT 1
               FROM food_items fi
               JOIN shops s ON s.id = fi.shop_id
              WHERE fi.id = NEW.food_item_id AND s.owner_id = NEW.user_id) THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'Shop owners cannot rate their own food items';
  END IF;
END$$

CREATE TRIGGER trg_ratings_after_insert
AFTER INSERT ON food_ratings
FOR EACH ROW
BEGIN
  CALL recalc_ratings(NEW.food_item_id);
END$$

CREATE TRIGGER trg_ratings_after_update
AFTER UPDATE ON food_ratings
FOR EACH ROW
BEGIN
  CALL recalc_ratings(NEW.food_item_id);
END$$

CREATE TRIGGER trg_ratings_after_delete
AFTER DELETE ON food_ratings
FOR EACH ROW
BEGIN
  CALL recalc_ratings(OLD.food_item_id);
END$$

-- A review's star rating also counts as the user's rating for that food item
CREATE TRIGGER trg_reviews_after_insert
AFTER INSERT ON reviews
FOR EACH ROW
BEGIN
  INSERT INTO food_ratings (user_id, food_item_id, rating)
  VALUES (NEW.user_id, NEW.food_item_id, NEW.rating)
  ON DUPLICATE KEY UPDATE rating = NEW.rating;
END$$

CREATE TRIGGER trg_reviews_after_update
AFTER UPDATE ON reviews
FOR EACH ROW
BEGIN
  IF NEW.rating <> OLD.rating THEN
    UPDATE food_ratings
       SET rating = NEW.rating
     WHERE user_id = NEW.user_id AND food_item_id = NEW.food_item_id;
  END IF;
END$$

DELIMITER ;

-- =====================================================================
-- VIEW: public review feed  (FR-06, FR-07, FR-87, BR-07)
-- Hides the reviewer's identity for anonymous reviews and
-- excludes removed reviews. Admin queries should use the base tables.
-- =====================================================================
CREATE VIEW v_public_reviews AS
SELECT r.id,
       IF(r.is_anonymous, 'Anonymous', u.name)       AS reviewer_name,
       IF(r.is_anonymous, NULL, u.avatar_url)        AS reviewer_avatar,
       s.id   AS shop_id,   s.name AS shop_name,
       f.id   AS food_item_id, f.name AS food_name,
       r.rating, r.body, r.image_url, r.is_edited, r.created_at,
       (SELECT COUNT(*) FROM review_reactions rr WHERE rr.review_id = r.id) AS like_count,
       (SELECT COUNT(*) FROM comments c
         WHERE c.review_id = r.id AND c.status = 'published')               AS comment_count
  FROM reviews r
  JOIN users u      ON u.id = r.user_id
  JOIN shops s      ON s.id = r.shop_id
  JOIN food_items f ON f.id = r.food_item_id
 WHERE r.status = 'published';

-- =====================================================================
-- SEED DATA
-- =====================================================================
INSERT INTO complaint_categories (name) VALUES
  ('Food Quality'),
  ('Hygiene / Cleanliness'),
  ('Overpricing'),
  ('Expired / Spoiled Food'),
  ('Staff Behavior'),
  ('Other');

-- Default admin. Replace the hash with a real bcrypt hash before use, e.g.
--   node -e "console.log(require('bcryptjs').hashSync('YourPassword',10))"
INSERT INTO users (name, email, password_hash, role)
VALUES ('Admin', 'admin@campusbite.com', '$2b$10$eTPvkAfQ8sftc9LOO/SIg.YzXTJUh4EVSpuDiCysvUL0Y/2ZK6Miq', 'admin');
