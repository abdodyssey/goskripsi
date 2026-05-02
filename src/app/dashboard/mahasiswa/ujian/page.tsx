"use client";

import { useAuth } from "@/features/auth/hooks/use-auth";
import { Container, Stack, Skeleton, Alert } from "@mantine/core";
import { PageHeader } from "@/components/PageHeader/PageHeader";
import { IconReportSearch, IconAlertCircle } from "@tabler/icons-react";
import { MahasiswaUjianCard } from "@/features/ujian/components/mahasiswa-ujian-card";
import { useUjian } from "@/features/ujian/hooks/use-ujian";

export default function MahasiswaHasilUjianPage() {
  const { userResponse, isLoadingProfile, isAuthenticated } = useAuth();
  const user = userResponse?.user || (userResponse as any)?.data?.user;
  const mahasiswaId = user?.id;

  const { useUjianByMahasiswa } = useUjian();
  const {
    data: ujianResponse,
    isLoading,
    error,
  } = useUjianByMahasiswa(mahasiswaId);

  const ujian = Array.isArray(ujianResponse?.data)
    ? ujianResponse.data[0]
    : ujianResponse?.data;

  if (isLoadingProfile || !isAuthenticated) return null;

  return (
    <Container size="xl" pt="md">
      <PageHeader
        title="Hasil Ujian"
        items={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Hasil Ujian" },
        ]}
        description="Pantau progres dan hasil kelulusan ujian skripsi Anda."
        icon={IconReportSearch}
      />

      <Stack gap="xl" mt="xl">
        {isLoading ? (
          <Stack>
            <Skeleton height={200} radius="lg" />
            <Skeleton height={300} radius="lg" />
          </Stack>
        ) : error ? (
          <Alert
            icon={<IconAlertCircle size={16} />}
            title="Kesalahan"
            color="var(--gs-danger)"
            variant="light"
            radius="lg"
            className="bg-gs-danger-bg border-gs-danger-border text-gs-danger-text"
          >
            {(error as any)?.response?.data?.message ||
              "Gagal memuat hasil ujian"}
          </Alert>
        ) : (
          <MahasiswaUjianCard ujian={ujian || null} />
        )}

        {!isLoading && !ujian && (
          <Alert
            icon={<IconAlertCircle size={16} />}
            title="Informasi"
            variant="light"
            radius="lg"
            styles={{
              root: { backgroundColor: 'var(--gs-bg-overlay)', border: '1px solid var(--gs-border)' },
              title: { color: 'var(--gs-text-primary)' },
              icon: { color: 'var(--gs-primary)' },
              message: { color: 'var(--gs-text-secondary)' }
            }}
          >
            Belum ada riwayat hasil ujian skripsi/seminar untuk Anda.
          </Alert>
        )}
      </Stack>
    </Container>
  );
}
