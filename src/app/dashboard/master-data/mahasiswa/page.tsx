"use client";

import { useAuth } from "@/features/auth/hooks/use-auth";
import { Container, Text, Stack } from "@mantine/core";
import { IconUsers } from "@tabler/icons-react";
import { PageHeader } from "@/components/PageHeader/PageHeader";
import { MahasiswaList } from "@/features/mahasiswa/components/mahasiswa-list";

export default function MahasiswaMasterPage() {
  const { userResponse, isLoadingProfile, isAuthenticated } = useAuth();

  if (isLoadingProfile || !isAuthenticated) {
    return null;
  }

  const user = userResponse?.user;
  const roles = user?.roles || userResponse?.roles || [];

  const isAuthorized = roles.some((r: any) =>
    ["admin", "superadmin"].includes(r),
  );

  if (!isAuthorized) {
    return (
      <Container size="xl" pt="md">
        <Text className="text-gs-danger" fw={700}>
          Hanya Admin atau Superadmin yang memiliki akses ke halaman ini.
        </Text>
      </Container>
    );
  }

  return (
    <Container size="xl" pt="md">
      <Stack gap="lg">
        <PageHeader
          title="Manajemen Data Mahasiswa"
          items={[
            { label: "Dashboard", href: "/dashboard" },
            { label: "Data Master" },
            { label: "Mahasiswa" },
          ]}
          description="Kelola seluruh data mahasiswa, status registrasi, dan informasi akademik"
          icon={IconUsers}
        />

        <MahasiswaList />
      </Stack>
    </Container>
  );
}
