"use client";

import { useAuth } from "@/features/auth/hooks/use-auth";
import { Container, Stack, Text } from "@mantine/core";
import { IconSettings } from "@tabler/icons-react";
import { PageHeader } from "@/components/PageHeader/PageHeader";
import { ManajemenPerbaikanJudulList } from "@/features/ranpel/components/manajemen-perbaikan-judul-list";

export default function ManajemenPerbaikanJudulPage() {
  const { userResponse, isLoadingProfile, isAuthenticated } = useAuth();
  
  if (isLoadingProfile || !isAuthenticated) return null;

  const roles = userResponse?.user?.roles || userResponse?.roles || [];
  const isAdmin = roles.includes("sekprodi") || roles.includes("kaprodi") || roles.includes("admin");

  if (!isAdmin) {
    return (
      <Container size="xl" pt="md">
        <Text c="red" fw={700}>Akses Dibatasi. Halaman ini hanya untuk Sekretaris Prodi dan Kaprodi.</Text>
      </Container>
    );
  }

  return (
    <Container size="xl" pt="md">
      <PageHeader
        title="Manajemen Perbaikan Judul"
        items={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Manajemen Perbaikan Judul" },
        ]}
        description="Kelola dan review permohonan perubahan judul penelitian Mahasiswa"
        icon={IconSettings}
      />

      <Stack mt="xl">
        <ManajemenPerbaikanJudulList />
      </Stack>
    </Container>
  );
}
