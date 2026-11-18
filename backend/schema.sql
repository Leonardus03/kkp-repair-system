-- =========================================================
-- SCHEMA: Sistem Repair Part Berkarat (KKP)
-- Database: PostgreSQL (server terpisah)
-- Jalankan: psql -U postgres -d kkp_repair_db -f schema.sql
-- =========================================================

CREATE TYPE user_role AS ENUM ('pic_area', 'mp_repair', 'qc', 'admin');

CREATE TYPE part_status AS ENUM (
  'waiting_repair',
  'on_progress_repair',
  'ready_to_return',
  'rejected_qc',
  'closed'
);

-- Tabel User (semua role login lewat sini)
CREATE TABLE users (
  id            SERIAL PRIMARY KEY,
  full_name     VARCHAR(100) NOT NULL,
  username      VARCHAR(50) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role          user_role NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tabel Part / Batch yang masuk proses repair
CREATE TABLE parts (
  id               SERIAL PRIMARY KEY,
  part_code        VARCHAR(50) UNIQUE NOT NULL,   -- hasil scan barcode
  part_name        VARCHAR(150) NOT NULL,
  origin_location  VARCHAR(150) NOT NULL,         -- lokasi asal
  status           part_status NOT NULL DEFAULT 'waiting_repair',
  input_by         INTEGER REFERENCES users(id),  -- PIC Area
  input_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  returned_at      TIMESTAMPTZ,                   -- diisi saat Closed
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Digital log pengerjaan oleh MP Repair
CREATE TABLE repair_logs (
  id             SERIAL PRIMARY KEY,
  part_id        INTEGER NOT NULL REFERENCES parts(id) ON DELETE CASCADE,
  mp_id          INTEGER NOT NULL REFERENCES users(id),
  severity       VARCHAR(20) NOT NULL,   -- ringan / sedang / berat
  action_taken   VARCHAR(50) NOT NULL,   -- brushing / coating / lainnya
  notes          TEXT,
  started_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  finished_at    TIMESTAMPTZ
);

-- Verifikasi QC / PIC Area
CREATE TABLE qc_verifications (
  id           SERIAL PRIMARY KEY,
  part_id      INTEGER NOT NULL REFERENCES parts(id) ON DELETE CASCADE,
  qc_id        INTEGER NOT NULL REFERENCES users(id),
  approved     BOOLEAN NOT NULL,
  notes        TEXT,
  verified_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Riwayat perubahan status -> dipakai untuk Lead Time Tracking
CREATE TABLE status_history (
  id           SERIAL PRIMARY KEY,
  part_id      INTEGER NOT NULL REFERENCES parts(id) ON DELETE CASCADE,
  status       part_status NOT NULL,
  changed_by   INTEGER REFERENCES users(id),
  changed_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_parts_status ON parts(status);
CREATE INDEX idx_status_history_part ON status_history(part_id);
CREATE INDEX idx_repair_logs_part ON repair_logs(part_id);

-- Trigger kecil: otomatis catat ke status_history tiap kali status parts berubah
CREATE OR REPLACE FUNCTION log_status_change() RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'INSERT') OR (NEW.status IS DISTINCT FROM OLD.status) THEN
    INSERT INTO status_history (part_id, status, changed_by)
    VALUES (NEW.id, NEW.status, NEW.input_by);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_log_status_change
AFTER INSERT OR UPDATE ON parts
FOR EACH ROW EXECUTE FUNCTION log_status_change();
