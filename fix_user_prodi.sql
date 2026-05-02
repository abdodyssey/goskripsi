-- Step 1: Add prodi_id column to user table
ALTER TABLE "user" ADD COLUMN "prodi_id" INTEGER;

-- Step 2: Add foreign key constraint
ALTER TABLE "user" ADD CONSTRAINT "user_prodi_id_fkey" FOREIGN KEY ("prodi_id") REFERENCES "prodi"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Step 3: Optional: Synchronize existing data from Dosen/Mahasiswa to User
UPDATE "user" u
SET prodi_id = d.prodi_id
FROM dosen d
WHERE u.id = d.id;

UPDATE "user" u
SET prodi_id = m.prodi_id
FROM mahasiswa m
WHERE u.id = m.id;
