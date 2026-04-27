-- CreateEnum
CREATE TYPE "daftar_kehadiran_status_kehadiran" AS ENUM ('hadir', 'tidak hadir', 'izin');

-- CreateEnum
CREATE TYPE "penguji_ujian_peran" AS ENUM ('ketua_penguji', 'sekretaris_penguji', 'penguji_1', 'penguji_2');

-- CreateEnum
CREATE TYPE "syarat_kategori" AS ENUM ('akademik', 'administratif', 'bimbingan');

-- CreateEnum
CREATE TYPE "ujian_hari_ujian" AS ENUM ('Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu');

-- CreateEnum
CREATE TYPE "bimbingan_status" AS ENUM ('diajukan', 'diterima', 'direvisi', 'selesai');

-- CreateEnum
CREATE TYPE "pengajuan_ranpel_status" AS ENUM ('menunggu', 'diverifikasi', 'diterima', 'ditolak');

-- CreateEnum
CREATE TYPE "perbaikan_judul_status" AS ENUM ('menunggu', 'diterima', 'ditolak');

-- CreateEnum
CREATE TYPE "skripsi_status" AS ENUM ('berjalan', 'selesai', 'dibatalkan');

-- CreateEnum
CREATE TYPE "pemenuhan_syarat_status" AS ENUM ('menunggu', 'valid', 'invalid');

-- CreateEnum
CREATE TYPE "pendaftaran_ujian_status" AS ENUM ('menunggu', 'belum dijadwalkan', 'dijadwalkan', 'selesai', 'ditolak');

-- CreateEnum
CREATE TYPE "ujian_hasil" AS ENUM ('lulus', 'tidak lulus');

-- CreateEnum
CREATE TYPE "dosen_status" AS ENUM ('aktif', 'tidak aktif');

-- CreateTable
CREATE TABLE "berkas" (
    "id" BIGSERIAL NOT NULL,
    "pendaftaran_ujian_id" BIGINT NOT NULL,
    "nama_berkas" TEXT NOT NULL,
    "file_path" TEXT NOT NULL,
    "created_at" TIMESTAMP(3),
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "berkas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bimbingan" (
    "id" BIGSERIAL NOT NULL,
    "skripsi_id" BIGINT NOT NULL,
    "dosen_id" BIGINT NOT NULL,
    "mahasiswa_id" BIGINT NOT NULL,
    "keterangan" TEXT NOT NULL,
    "file_path" TEXT,
    "status" "bimbingan_status" NOT NULL DEFAULT 'diajukan',
    "created_at" TIMESTAMP(3),
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "bimbingan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cache" (
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "expiration" INTEGER NOT NULL,

    CONSTRAINT "cache_pkey" PRIMARY KEY ("key")
);

-- CreateTable
CREATE TABLE "cache_locks" (
    "key" TEXT NOT NULL,
    "owner" TEXT NOT NULL,
    "expiration" INTEGER NOT NULL,

    CONSTRAINT "cache_locks_pkey" PRIMARY KEY ("key")
);

-- CreateTable
CREATE TABLE "comments" (
    "id" BIGSERIAL NOT NULL,
    "proposal_id" BIGINT NOT NULL,
    "section_id" TEXT NOT NULL,
    "user_id" BIGINT NOT NULL,
    "message" TEXT NOT NULL,
    "is_resolved" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3),
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "comments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "daftar_kehadiran" (
    "id" BIGSERIAL NOT NULL,
    "ujian_id" BIGINT NOT NULL,
    "dosen_id" BIGINT NOT NULL,
    "status_kehadiran" "daftar_kehadiran_status_kehadiran" NOT NULL DEFAULT 'tidak hadir',
    "keterangan" TEXT,
    "created_at" TIMESTAMP(3),
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "daftar_kehadiran_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dosen" (
    "id" BIGSERIAL NOT NULL,
    "nidn" TEXT,
    "nip" TEXT,
    "nama" TEXT NOT NULL,
    "no_hp" TEXT,
    "alamat" TEXT,
    "tempat_tanggal_lahir" TEXT,
    "pangkat" TEXT,
    "golongan" TEXT,
    "tmt_fst" TIMESTAMP(3),
    "jabatan" TEXT,
    "status" "dosen_status" NOT NULL DEFAULT 'aktif',
    "prodi_id" BIGINT NOT NULL,
    "foto" TEXT,
    "url_ttd" TEXT,
    "user_id" BIGINT,
    "created_at" TIMESTAMP(3),
    "updated_at" TIMESTAMP(3),
    "email" TEXT,

    CONSTRAINT "dosen_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "failed_jobs" (
    "id" BIGSERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "connection" TEXT NOT NULL,
    "queue" TEXT NOT NULL,
    "payload" TEXT NOT NULL,
    "exception" TEXT NOT NULL,
    "failed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "failed_jobs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fakultas" (
    "id" BIGSERIAL NOT NULL,
    "nama_fakultas" TEXT NOT NULL,
    "created_at" TIMESTAMP(3),
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "fakultas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "faqs" (
    "id" BIGSERIAL NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3),
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "faqs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "jenis_ujian" (
    "id" BIGSERIAL NOT NULL,
    "nama_jenis" TEXT NOT NULL,
    "deskripsi" TEXT,
    "aktif" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3),
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "jenis_ujian_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "job_batches" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "total_jobs" INTEGER NOT NULL,
    "pending_jobs" INTEGER NOT NULL,
    "failed_jobs" INTEGER NOT NULL,
    "failed_job_ids" TEXT NOT NULL,
    "options" TEXT,
    "cancelled_at" INTEGER,
    "created_at" INTEGER NOT NULL,
    "finished_at" INTEGER,

    CONSTRAINT "job_batches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "jobs" (
    "id" BIGSERIAL NOT NULL,
    "queue" TEXT NOT NULL,
    "payload" TEXT NOT NULL,
    "attempts" INTEGER NOT NULL,
    "reserved_at" INTEGER,
    "available_at" INTEGER NOT NULL,
    "created_at" INTEGER NOT NULL,

    CONSTRAINT "jobs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "keputusan" (
    "id" BIGSERIAL NOT NULL,
    "kode" TEXT NOT NULL,
    "nama_keputusan" TEXT NOT NULL,
    "created_at" TIMESTAMP(3),
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "keputusan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "komponen_penilaian" (
    "id" BIGSERIAL NOT NULL,
    "jenis_ujian_id" BIGINT NOT NULL,
    "nama_komponen" TEXT NOT NULL,
    "deskripsi" TEXT,
    "bobot" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3),
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "komponen_penilaian_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mahasiswa" (
    "id" BIGSERIAL NOT NULL,
    "nim" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "no_hp" TEXT,
    "alamat" TEXT,
    "url_ktm" TEXT,
    "url_transkrip_nilai" TEXT,
    "url_bukti_lulus_metopen" TEXT,
    "url_sertifikat_bta" TEXT,
    "prodi_id" BIGINT NOT NULL DEFAULT 1,
    "peminatan_id" BIGINT,
    "semester" INTEGER NOT NULL DEFAULT 1,
    "ipk" DECIMAL(65,30) DEFAULT 0.00,
    "dosen_pa" BIGINT,
    "pembimbing_1" BIGINT,
    "pembimbing_2" BIGINT,
    "status" TEXT NOT NULL DEFAULT 'aktif',
    "angkatan" TEXT NOT NULL,
    "user_id" BIGINT NOT NULL,
    "created_at" TIMESTAMP(3),
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "mahasiswa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "migrations" (
    "id" SERIAL NOT NULL,
    "migration" TEXT NOT NULL,
    "batch" INTEGER NOT NULL,

    CONSTRAINT "migrations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "model_has_permissions" (
    "permission_id" BIGINT NOT NULL,
    "model_type" TEXT NOT NULL,
    "model_id" BIGINT NOT NULL,

    CONSTRAINT "model_has_permissions_pkey" PRIMARY KEY ("permission_id","model_id","model_type")
);

-- CreateTable
CREATE TABLE "model_has_roles" (
    "role_id" BIGINT NOT NULL,
    "model_type" TEXT NOT NULL,
    "model_id" BIGINT NOT NULL,

    CONSTRAINT "model_has_roles_pkey" PRIMARY KEY ("role_id","model_id","model_type")
);

-- CreateTable
CREATE TABLE "password_reset_tokens" (
    "email" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "created_at" TIMESTAMP(3),

    CONSTRAINT "password_reset_tokens_pkey" PRIMARY KEY ("email")
);

-- CreateTable
CREATE TABLE "pejabat" (
    "id" BIGSERIAL NOT NULL,
    "nama_pejabat" TEXT NOT NULL,
    "jabatan" TEXT NOT NULL,
    "no_hp" TEXT NOT NULL,
    "created_at" TIMESTAMP(3),
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "pejabat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pemenuhan_syarat" (
    "id" BIGSERIAL NOT NULL,
    "pendaftaran_ujian_id" BIGINT NOT NULL,
    "syarat_id" BIGINT NOT NULL,
    "file_path" TEXT NOT NULL,
    "file_name" TEXT NOT NULL,
    "file_size" BIGINT,
    "mime_type" TEXT,
    "keterangan" TEXT,
    "status" "pemenuhan_syarat_status" NOT NULL DEFAULT 'menunggu',
    "verified_by" BIGINT,
    "verified_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3),
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "pemenuhan_syarat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "peminatan" (
    "id" BIGSERIAL NOT NULL,
    "nama_peminatan" TEXT NOT NULL,
    "prodi_id" BIGINT NOT NULL,
    "created_at" TIMESTAMP(3),
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "peminatan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pendaftaran_ujian" (
    "id" BIGSERIAL NOT NULL,
    "mahasiswa_id" BIGINT NOT NULL,
    "ranpel_id" BIGINT NOT NULL,
    "jenis_ujian_id" BIGINT NOT NULL,
    "judul_snapshot" TEXT,
    "perbaikan_judul_id" BIGINT,
    "tanggal_pengajuan" TIMESTAMP(3) NOT NULL DEFAULT '2026-02-10 01:15:45',
    "tanggal_disetujui" TIMESTAMP(3),
    "status" "pendaftaran_ujian_status" NOT NULL DEFAULT 'menunggu',
    "keterangan" TEXT,
    "created_at" TIMESTAMP(3),
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "pendaftaran_ujian_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pengajuan_ranpel" (
    "id" BIGSERIAL NOT NULL,
    "ranpel_id" BIGINT NOT NULL,
    "mahasiswa_id" BIGINT NOT NULL,
    "tanggal_pengajuan" TIMESTAMP(3),
    "tanggal_diverifikasi" TIMESTAMP(3),
    "tanggal_diterima" TIMESTAMP(3),
    "status" "pengajuan_ranpel_status" NOT NULL DEFAULT 'menunggu',
    "keterangan" TEXT,
    "catatan_kaprodi" TEXT,
    "created_at" TIMESTAMP(3),
    "updated_at" TIMESTAMP(3),
    "tanggal_ditolak" TIMESTAMP(3),

    CONSTRAINT "pengajuan_ranpel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "penguji_ujian" (
    "id" BIGSERIAL NOT NULL,
    "ujian_id" BIGINT NOT NULL,
    "dosen_id" BIGINT NOT NULL,
    "peran" "penguji_ujian_peran" NOT NULL,
    "created_at" TIMESTAMP(3),
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "penguji_ujian_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "penilaian" (
    "id" BIGSERIAL NOT NULL,
    "ujian_id" BIGINT NOT NULL,
    "dosen_id" BIGINT NOT NULL,
    "komponen_penilaian_id" BIGINT NOT NULL,
    "nilai" DECIMAL(65,30) NOT NULL,
    "komentar" TEXT,
    "created_at" TIMESTAMP(3),
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "penilaian_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "perbaikan_judul" (
    "id" BIGSERIAL NOT NULL,
    "ranpel_id" BIGINT NOT NULL,
    "mahasiswa_id" BIGINT NOT NULL,
    "judul_lama" TEXT NOT NULL,
    "judul_baru" TEXT NOT NULL,
    "berkas" TEXT NOT NULL,
    "status" "perbaikan_judul_status" NOT NULL DEFAULT 'menunggu',
    "tanggal_perbaikan" TIMESTAMP(3),
    "tanggal_diterima" TIMESTAMP(3),
    "created_at" TIMESTAMP(3),
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "perbaikan_judul_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "permissions" (
    "id" BIGSERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "guard_name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3),
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "personal_access_tokens" (
    "id" BIGSERIAL NOT NULL,
    "tokenable_type" TEXT NOT NULL,
    "tokenable_id" BIGINT NOT NULL,
    "name" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "abilities" TEXT,
    "last_used_at" TIMESTAMP(3),
    "expires_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3),
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "personal_access_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "prodi" (
    "id" BIGSERIAL NOT NULL,
    "nama_prodi" TEXT NOT NULL,
    "fakultas_id" BIGINT NOT NULL,
    "created_at" TIMESTAMP(3),
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "prodi_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ranpel" (
    "id" BIGSERIAL NOT NULL,
    "judul_penelitian" TEXT NOT NULL,
    "masalah_dan_penyebab" TEXT,
    "alternatif_solusi" TEXT,
    "metode_penelitian" TEXT,
    "hasil_yang_diharapkan" TEXT,
    "kebutuhan_data" TEXT,
    "jurnal_referensi" TEXT,
    "created_at" TIMESTAMP(3),
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "ranpel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "role_has_permissions" (
    "permission_id" BIGINT NOT NULL,
    "role_id" BIGINT NOT NULL,

    CONSTRAINT "role_has_permissions_pkey" PRIMARY KEY ("permission_id","role_id")
);

-- CreateTable
CREATE TABLE "roles" (
    "id" BIGSERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "guard_name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3),
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ruangan" (
    "id" BIGSERIAL NOT NULL,
    "nama_ruangan" TEXT NOT NULL,
    "deskripsi" TEXT,
    "prodi_id" BIGINT NOT NULL,
    "created_at" TIMESTAMP(3),
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "ruangan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL,
    "user_id" BIGINT,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "payload" TEXT NOT NULL,
    "last_activity" INTEGER NOT NULL,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "skripsi" (
    "id" BIGSERIAL NOT NULL,
    "mahasiswa_id" BIGINT NOT NULL,
    "ranpel_id" BIGINT NOT NULL,
    "judul" TEXT NOT NULL,
    "pembimbing_1" BIGINT NOT NULL,
    "pembimbing_2" BIGINT,
    "status" "skripsi_status" NOT NULL DEFAULT 'berjalan',
    "created_at" TIMESTAMP(3),
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "skripsi_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "syarat" (
    "id" BIGSERIAL NOT NULL,
    "jenis_ujian_id" BIGINT NOT NULL,
    "nama_syarat" TEXT NOT NULL,
    "kategori" "syarat_kategori" NOT NULL,
    "deskripsi" TEXT,
    "wajib" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3),
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "syarat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "template" (
    "id" BIGSERIAL NOT NULL,
    "jenis_ujian_id" BIGINT,
    "nama_template" TEXT NOT NULL,
    "deskripsi" TEXT,
    "file_path" TEXT NOT NULL,
    "created_at" TIMESTAMP(3),
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "template_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ujian" (
    "id" BIGSERIAL NOT NULL,
    "pendaftaran_ujian_id" BIGINT NOT NULL,
    "mahasiswa_id" BIGINT NOT NULL,
    "jenis_ujian_id" BIGINT NOT NULL,
    "hari_ujian" "ujian_hari_ujian",
    "jadwal_ujian" TIMESTAMP(3),
    "waktu_mulai" TIMESTAMP(3),
    "waktu_selesai" TIMESTAMP(3),
    "ruangan_id" BIGINT,
    "hasil" "ujian_hasil",
    "nilai_akhir" DECIMAL(65,30),
    "keputusan_id" BIGINT,
    "catatan" TEXT,
    "created_at" TIMESTAMP(3),
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "ujian_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" BIGSERIAL NOT NULL,
    "nip_nim" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "prodi_id" BIGINT,
    "email_verified_at" TIMESTAMP(3),
    "password" TEXT NOT NULL,
    "remember_token" TEXT,
    "created_at" TIMESTAMP(3),
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "berkas_pendaftaran_ujian_id_idx" ON "berkas"("pendaftaran_ujian_id");

-- CreateIndex
CREATE INDEX "bimbingan_dosen_id_idx" ON "bimbingan"("dosen_id");

-- CreateIndex
CREATE INDEX "bimbingan_mahasiswa_id_idx" ON "bimbingan"("mahasiswa_id");

-- CreateIndex
CREATE INDEX "bimbingan_skripsi_id_idx" ON "bimbingan"("skripsi_id");

-- CreateIndex
CREATE INDEX "comments_proposal_id_idx" ON "comments"("proposal_id");

-- CreateIndex
CREATE INDEX "comments_user_id_idx" ON "comments"("user_id");

-- CreateIndex
CREATE INDEX "daftar_kehadiran_dosen_id_idx" ON "daftar_kehadiran"("dosen_id");

-- CreateIndex
CREATE INDEX "daftar_kehadiran_ujian_id_idx" ON "daftar_kehadiran"("ujian_id");

-- CreateIndex
CREATE UNIQUE INDEX "dosen_nidn_key" ON "dosen"("nidn");

-- CreateIndex
CREATE UNIQUE INDEX "dosen_nip_key" ON "dosen"("nip");

-- CreateIndex
CREATE UNIQUE INDEX "dosen_email_key" ON "dosen"("email");

-- CreateIndex
CREATE INDEX "dosen_prodi_id_idx" ON "dosen"("prodi_id");

-- CreateIndex
CREATE INDEX "dosen_user_id_idx" ON "dosen"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "failed_jobs_uuid_key" ON "failed_jobs"("uuid");

-- CreateIndex
CREATE INDEX "jobs_queue_idx" ON "jobs"("queue");

-- CreateIndex
CREATE UNIQUE INDEX "keputusan_kode_key" ON "keputusan"("kode");

-- CreateIndex
CREATE INDEX "komponen_penilaian_jenis_ujian_id_idx" ON "komponen_penilaian"("jenis_ujian_id");

-- CreateIndex
CREATE UNIQUE INDEX "mahasiswa_nim_key" ON "mahasiswa"("nim");

-- CreateIndex
CREATE INDEX "mahasiswa_pembimbing_1_idx" ON "mahasiswa"("pembimbing_1");

-- CreateIndex
CREATE INDEX "mahasiswa_pembimbing_2_idx" ON "mahasiswa"("pembimbing_2");

-- CreateIndex
CREATE INDEX "mahasiswa_peminatan_id_idx" ON "mahasiswa"("peminatan_id");

-- CreateIndex
CREATE INDEX "mahasiswa_prodi_id_idx" ON "mahasiswa"("prodi_id");

-- CreateIndex
CREATE INDEX "mahasiswa_user_id_idx" ON "mahasiswa"("user_id");

-- CreateIndex
CREATE INDEX "model_has_permissions_model_id_model_type_idx" ON "model_has_permissions"("model_id", "model_type");

-- CreateIndex
CREATE INDEX "model_has_roles_model_id_model_type_idx" ON "model_has_roles"("model_id", "model_type");

-- CreateIndex
CREATE INDEX "pemenuhan_syarat_pendaftaran_ujian_id_idx" ON "pemenuhan_syarat"("pendaftaran_ujian_id");

-- CreateIndex
CREATE INDEX "pemenuhan_syarat_syarat_id_idx" ON "pemenuhan_syarat"("syarat_id");

-- CreateIndex
CREATE INDEX "pemenuhan_syarat_verified_by_idx" ON "pemenuhan_syarat"("verified_by");

-- CreateIndex
CREATE UNIQUE INDEX "peminatan_nama_peminatan_key" ON "peminatan"("nama_peminatan");

-- CreateIndex
CREATE INDEX "peminatan_prodi_id_idx" ON "peminatan"("prodi_id");

-- CreateIndex
CREATE INDEX "pendaftaran_ujian_jenis_ujian_id_idx" ON "pendaftaran_ujian"("jenis_ujian_id");

-- CreateIndex
CREATE INDEX "pendaftaran_ujian_mahasiswa_id_idx" ON "pendaftaran_ujian"("mahasiswa_id");

-- CreateIndex
CREATE INDEX "pendaftaran_ujian_perbaikan_judul_id_idx" ON "pendaftaran_ujian"("perbaikan_judul_id");

-- CreateIndex
CREATE INDEX "pendaftaran_ujian_ranpel_id_idx" ON "pendaftaran_ujian"("ranpel_id");

-- CreateIndex
CREATE INDEX "pengajuan_ranpel_mahasiswa_id_idx" ON "pengajuan_ranpel"("mahasiswa_id");

-- CreateIndex
CREATE INDEX "pengajuan_ranpel_ranpel_id_idx" ON "pengajuan_ranpel"("ranpel_id");

-- CreateIndex
CREATE INDEX "penguji_ujian_dosen_id_idx" ON "penguji_ujian"("dosen_id");

-- CreateIndex
CREATE UNIQUE INDEX "penguji_ujian_ujian_id_peran_key" ON "penguji_ujian"("ujian_id", "peran");

-- CreateIndex
CREATE INDEX "penilaian_dosen_id_idx" ON "penilaian"("dosen_id");

-- CreateIndex
CREATE INDEX "penilaian_komponen_penilaian_id_idx" ON "penilaian"("komponen_penilaian_id");

-- CreateIndex
CREATE INDEX "penilaian_ujian_id_idx" ON "penilaian"("ujian_id");

-- CreateIndex
CREATE INDEX "perbaikan_judul_mahasiswa_id_idx" ON "perbaikan_judul"("mahasiswa_id");

-- CreateIndex
CREATE INDEX "perbaikan_judul_ranpel_id_idx" ON "perbaikan_judul"("ranpel_id");

-- CreateIndex
CREATE UNIQUE INDEX "permissions_name_guard_name_key" ON "permissions"("name", "guard_name");

-- CreateIndex
CREATE UNIQUE INDEX "personal_access_tokens_token_key" ON "personal_access_tokens"("token");

-- CreateIndex
CREATE INDEX "personal_access_tokens_expires_at_idx" ON "personal_access_tokens"("expires_at");

-- CreateIndex
CREATE INDEX "personal_access_tokens_tokenable_type_tokenable_id_idx" ON "personal_access_tokens"("tokenable_type", "tokenable_id");

-- CreateIndex
CREATE UNIQUE INDEX "prodi_nama_prodi_key" ON "prodi"("nama_prodi");

-- CreateIndex
CREATE INDEX "prodi_fakultas_id_idx" ON "prodi"("fakultas_id");

-- CreateIndex
CREATE INDEX "role_has_permissions_role_id_idx" ON "role_has_permissions"("role_id");

-- CreateIndex
CREATE UNIQUE INDEX "roles_name_guard_name_key" ON "roles"("name", "guard_name");

-- CreateIndex
CREATE INDEX "ruangan_prodi_id_idx" ON "ruangan"("prodi_id");

-- CreateIndex
CREATE INDEX "sessions_last_activity_idx" ON "sessions"("last_activity");

-- CreateIndex
CREATE INDEX "sessions_user_id_idx" ON "sessions"("user_id");

-- CreateIndex
CREATE INDEX "skripsi_mahasiswa_id_idx" ON "skripsi"("mahasiswa_id");

-- CreateIndex
CREATE INDEX "skripsi_pembimbing_1_idx" ON "skripsi"("pembimbing_1");

-- CreateIndex
CREATE INDEX "skripsi_pembimbing_2_idx" ON "skripsi"("pembimbing_2");

-- CreateIndex
CREATE INDEX "skripsi_ranpel_id_idx" ON "skripsi"("ranpel_id");

-- CreateIndex
CREATE INDEX "syarat_jenis_ujian_id_idx" ON "syarat"("jenis_ujian_id");

-- CreateIndex
CREATE INDEX "template_jenis_ujian_id_idx" ON "template"("jenis_ujian_id");

-- CreateIndex
CREATE INDEX "ujian_jenis_ujian_id_idx" ON "ujian"("jenis_ujian_id");

-- CreateIndex
CREATE INDEX "ujian_keputusan_id_idx" ON "ujian"("keputusan_id");

-- CreateIndex
CREATE INDEX "ujian_mahasiswa_id_idx" ON "ujian"("mahasiswa_id");

-- CreateIndex
CREATE INDEX "ujian_pendaftaran_ujian_id_idx" ON "ujian"("pendaftaran_ujian_id");

-- CreateIndex
CREATE INDEX "ujian_ruangan_id_idx" ON "ujian"("ruangan_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_nip_nim_key" ON "users"("nip_nim");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_prodi_id_idx" ON "users"("prodi_id");

-- AddForeignKey
ALTER TABLE "berkas" ADD CONSTRAINT "berkas_pendaftaran_ujian_id_fkey" FOREIGN KEY ("pendaftaran_ujian_id") REFERENCES "pendaftaran_ujian"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "bimbingan" ADD CONSTRAINT "bimbingan_dosen_id_fkey" FOREIGN KEY ("dosen_id") REFERENCES "dosen"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "bimbingan" ADD CONSTRAINT "bimbingan_mahasiswa_id_fkey" FOREIGN KEY ("mahasiswa_id") REFERENCES "mahasiswa"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "bimbingan" ADD CONSTRAINT "bimbingan_skripsi_id_fkey" FOREIGN KEY ("skripsi_id") REFERENCES "skripsi"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_proposal_id_fkey" FOREIGN KEY ("proposal_id") REFERENCES "pengajuan_ranpel"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "daftar_kehadiran" ADD CONSTRAINT "daftar_kehadiran_dosen_id_fkey" FOREIGN KEY ("dosen_id") REFERENCES "dosen"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "daftar_kehadiran" ADD CONSTRAINT "daftar_kehadiran_ujian_id_fkey" FOREIGN KEY ("ujian_id") REFERENCES "ujian"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "dosen" ADD CONSTRAINT "dosen_prodi_id_fkey" FOREIGN KEY ("prodi_id") REFERENCES "prodi"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "dosen" ADD CONSTRAINT "dosen_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "komponen_penilaian" ADD CONSTRAINT "komponen_penilaian_jenis_ujian_id_fkey" FOREIGN KEY ("jenis_ujian_id") REFERENCES "jenis_ujian"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "mahasiswa" ADD CONSTRAINT "mahasiswa_pembimbing_1_fkey" FOREIGN KEY ("pembimbing_1") REFERENCES "dosen"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "mahasiswa" ADD CONSTRAINT "mahasiswa_pembimbing_2_fkey" FOREIGN KEY ("pembimbing_2") REFERENCES "dosen"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "mahasiswa" ADD CONSTRAINT "mahasiswa_peminatan_id_fkey" FOREIGN KEY ("peminatan_id") REFERENCES "peminatan"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "mahasiswa" ADD CONSTRAINT "mahasiswa_prodi_id_fkey" FOREIGN KEY ("prodi_id") REFERENCES "prodi"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "mahasiswa" ADD CONSTRAINT "mahasiswa_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "model_has_permissions" ADD CONSTRAINT "model_has_permissions_permission_id_fkey" FOREIGN KEY ("permission_id") REFERENCES "permissions"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "model_has_roles" ADD CONSTRAINT "model_has_roles_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "pemenuhan_syarat" ADD CONSTRAINT "pemenuhan_syarat_pendaftaran_ujian_id_fkey" FOREIGN KEY ("pendaftaran_ujian_id") REFERENCES "pendaftaran_ujian"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "pemenuhan_syarat" ADD CONSTRAINT "pemenuhan_syarat_syarat_id_fkey" FOREIGN KEY ("syarat_id") REFERENCES "syarat"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "pemenuhan_syarat" ADD CONSTRAINT "pemenuhan_syarat_verified_by_fkey" FOREIGN KEY ("verified_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "peminatan" ADD CONSTRAINT "peminatan_prodi_id_fkey" FOREIGN KEY ("prodi_id") REFERENCES "prodi"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "pendaftaran_ujian" ADD CONSTRAINT "pendaftaran_ujian_jenis_ujian_id_fkey" FOREIGN KEY ("jenis_ujian_id") REFERENCES "jenis_ujian"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "pendaftaran_ujian" ADD CONSTRAINT "pendaftaran_ujian_mahasiswa_id_fkey" FOREIGN KEY ("mahasiswa_id") REFERENCES "mahasiswa"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "pendaftaran_ujian" ADD CONSTRAINT "pendaftaran_ujian_perbaikan_judul_id_fkey" FOREIGN KEY ("perbaikan_judul_id") REFERENCES "perbaikan_judul"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "pendaftaran_ujian" ADD CONSTRAINT "pendaftaran_ujian_ranpel_id_fkey" FOREIGN KEY ("ranpel_id") REFERENCES "ranpel"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "pengajuan_ranpel" ADD CONSTRAINT "pengajuan_ranpel_mahasiswa_id_fkey" FOREIGN KEY ("mahasiswa_id") REFERENCES "mahasiswa"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "pengajuan_ranpel" ADD CONSTRAINT "pengajuan_ranpel_ranpel_id_fkey" FOREIGN KEY ("ranpel_id") REFERENCES "ranpel"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "penguji_ujian" ADD CONSTRAINT "penguji_ujian_dosen_id_fkey" FOREIGN KEY ("dosen_id") REFERENCES "dosen"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "penguji_ujian" ADD CONSTRAINT "penguji_ujian_ujian_id_fkey" FOREIGN KEY ("ujian_id") REFERENCES "ujian"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "penilaian" ADD CONSTRAINT "penilaian_dosen_id_fkey" FOREIGN KEY ("dosen_id") REFERENCES "dosen"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "penilaian" ADD CONSTRAINT "penilaian_komponen_penilaian_id_fkey" FOREIGN KEY ("komponen_penilaian_id") REFERENCES "komponen_penilaian"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "penilaian" ADD CONSTRAINT "penilaian_ujian_id_fkey" FOREIGN KEY ("ujian_id") REFERENCES "ujian"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "perbaikan_judul" ADD CONSTRAINT "perbaikan_judul_mahasiswa_id_fkey" FOREIGN KEY ("mahasiswa_id") REFERENCES "mahasiswa"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "perbaikan_judul" ADD CONSTRAINT "perbaikan_judul_ranpel_id_fkey" FOREIGN KEY ("ranpel_id") REFERENCES "ranpel"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "prodi" ADD CONSTRAINT "prodi_fakultas_id_fkey" FOREIGN KEY ("fakultas_id") REFERENCES "fakultas"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "role_has_permissions" ADD CONSTRAINT "role_has_permissions_permission_id_fkey" FOREIGN KEY ("permission_id") REFERENCES "permissions"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "role_has_permissions" ADD CONSTRAINT "role_has_permissions_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "ruangan" ADD CONSTRAINT "ruangan_prodi_id_fkey" FOREIGN KEY ("prodi_id") REFERENCES "prodi"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "skripsi" ADD CONSTRAINT "skripsi_mahasiswa_id_fkey" FOREIGN KEY ("mahasiswa_id") REFERENCES "mahasiswa"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "skripsi" ADD CONSTRAINT "skripsi_pembimbing_1_fkey" FOREIGN KEY ("pembimbing_1") REFERENCES "dosen"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "skripsi" ADD CONSTRAINT "skripsi_pembimbing_2_fkey" FOREIGN KEY ("pembimbing_2") REFERENCES "dosen"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "skripsi" ADD CONSTRAINT "skripsi_ranpel_id_fkey" FOREIGN KEY ("ranpel_id") REFERENCES "ranpel"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "syarat" ADD CONSTRAINT "syarat_jenis_ujian_id_fkey" FOREIGN KEY ("jenis_ujian_id") REFERENCES "jenis_ujian"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "template" ADD CONSTRAINT "template_jenis_ujian_id_fkey" FOREIGN KEY ("jenis_ujian_id") REFERENCES "jenis_ujian"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "ujian" ADD CONSTRAINT "ujian_jenis_ujian_id_fkey" FOREIGN KEY ("jenis_ujian_id") REFERENCES "jenis_ujian"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "ujian" ADD CONSTRAINT "ujian_keputusan_id_fkey" FOREIGN KEY ("keputusan_id") REFERENCES "keputusan"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "ujian" ADD CONSTRAINT "ujian_mahasiswa_id_fkey" FOREIGN KEY ("mahasiswa_id") REFERENCES "mahasiswa"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "ujian" ADD CONSTRAINT "ujian_pendaftaran_ujian_id_fkey" FOREIGN KEY ("pendaftaran_ujian_id") REFERENCES "pendaftaran_ujian"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "ujian" ADD CONSTRAINT "ujian_ruangan_id_fkey" FOREIGN KEY ("ruangan_id") REFERENCES "ruangan"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_prodi_id_fkey" FOREIGN KEY ("prodi_id") REFERENCES "prodi"("id") ON DELETE SET NULL ON UPDATE NO ACTION;
