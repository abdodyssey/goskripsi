# User Login Credentials (Seeded Data)

Berikut adalah ringkasan akun hasil seeding data untuk sistem:

| Role        | Username                 | Password               | Keterangan                   |
| ----------- | ------------------------ | ---------------------- | ---------------------------- |
| Superadmin  | `superadmin`             | `password123`          | Administrator Utama          |
| Kaprodi SI  | `kaprodi_si`             | `kaprodi_si`           | Ketua Program Studi SI       |
| Sekprodi SI | `sekprodi_si`            | `sekprodi_si`          | Sekretaris Program Studi SI  |
| Dosen       | (Gunakan Username Dosen) | (Sama dengan Username) | Contoh: `ruliansyah19751122` |
| Mahasiswa   | (Gunakan NIM)            | `password123`          | Contoh NIM: `2110501001`     |

### Catatan:

- **Dosen**: Username dibuat dari `nama depan` + `8 digit pertama NIP`.
- **Mahasiswa**: Menggunakan `NIM` asli dari data JSON dan password default `password123`.
- Jika Anda baru saja menjalankan seeder, user lama dengan username lama mungkin telah dihapus atau disinkronkan ke username baru di atas.
