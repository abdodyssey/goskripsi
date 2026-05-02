-- Migration script: add prodi_id column to user table and sync data

BEGIN;

ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "prodi_id" INTEGER;

ALTER TABLE "user" ADD CONSTRAINT IF NOT EXISTS "user_prodi_id_fkey" FOREIGN KEY ("prodi_id") REFERENCES "prodi"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Try to populate prodi_id from dosen table where user.id = dosen.id
UPDATE "user" u
SET prodi_id = d.prodi_id
FROM dosen d
WHERE u.id = d.id AND d.prodi_id IS NOT NULL;

-- Try to populate prodi_id from mahasiswa table where user.id = mahasiswa.id
UPDATE "user" u
SET prodi_id = m.prodi_id
FROM mahasiswa m
WHERE u.id = m.id AND m.prodi_id IS NOT NULL;

COMMIT;
