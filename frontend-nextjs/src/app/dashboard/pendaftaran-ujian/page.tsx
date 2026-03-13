"use client";

import { useAuth } from "@/features/auth/hooks/use-auth";
import { Container, Text } from "@mantine/core";
import { IconClipboardCheck } from "@tabler/icons-react";
import { PageHeader } from "@/components/PageHeader/PageHeader";
import { PendaftaranUjianList } from "@/features/pendaftaran-ujian/components/pendaftaran-ujian-list";

export default function PendaftaranUjianPage() {
  const { userResponse, isLoadingProfile, isAuthenticated } = useAuth();

  if (isLoadingProfile || !isAuthenticated) {
    return null;
  }

  const user = userResponse?.user || userResponse?.data?.user;
  const roles =
    user?.roles || userResponse?.roles || userResponse?.data?.roles || [];
  const isMahasiswa = roles.includes("mahasiswa");

  if (!isMahasiswa) {
    return (
      <Container size="xl" pt="md">
        <Text c="red">Hanya Mahasiswa yang memiliki akses ke halaman ini.</Text>
      </Container>
    );
  }

  return (
    <Container size="xl" pt="md">
      <PageHeader
        title="Pendaftaran Ujian"
        items={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Pendaftaran Ujian" },
        ]}
        description="Daftarkan diri Anda untuk mengikuti ujian skripsi atau seminar hasil"
        icon={IconClipboardCheck}
      />

      <PendaftaranUjianList
        mahasiswaId={(user as unknown as Record<string, unknown>).id as string}
      />
    </Container>
  );
}
