"use client";

import { useAuth } from "@/features/auth/hooks/use-auth";
import { Container, Text, Alert } from "@mantine/core";
import { IconFileDescription, IconMail } from "@tabler/icons-react";
import { PageHeader } from "@/components/PageHeader/PageHeader";
import { PengajuanRanpelList } from "@/features/ranpel/components/pengajuan-ranpel-list";

export default function PengajuanRanpelPage() {
  const { userResponse, isLoadingProfile, isAuthenticated } = useAuth();

  if (isLoadingProfile || !isAuthenticated) {
    return null; // The root layout or higher order might handle auth redirects
  }

  const user = userResponse?.user;
  const mahasiswa = user && ("angkatan" in user) ? user : null;

  if (!mahasiswa) {
    return (
      <Container size="xl" pt="md">
        <Text className="text-gs-danger" fw={700}>Hanya Mahasiswa yang memiliki akses ke halaman ini.</Text>
      </Container>
    );
  }

  return (
    <Container size="xl" pt="md">
      <PageHeader
        title="Pengajuan Rancangan Penelitian"
        items={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Pengajuan Ranpel" },
        ]}
        description="Ajukan rancangan penelitian (judul skripsi) Anda ke program studi"
        icon={IconFileDescription}
      />

      <PengajuanRanpelList
        mahasiswaId={(user as unknown as Record<string, unknown>).id as string}
        studentName={user?.nama}
        studentNim={
          user?.nim || (user as unknown as Record<string, string>)?.username
        }
      />
    </Container>
  );
}
