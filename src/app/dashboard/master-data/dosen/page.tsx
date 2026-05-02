"use client";

import { useAuth } from "@/features/auth/hooks/use-auth";
import { Container, Text, Stack } from "@mantine/core";
import { IconSchool } from "@tabler/icons-react";
import { PageHeader } from "@/components/PageHeader/PageHeader";
import { DosenList } from "@/features/mahasiswa/components/dosen-list";

export default function DosenMasterPage() {
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
          title="Manajemen Data Dosen"
          items={[
            { label: "Dashboard", href: "/dashboard" },
            { label: "Data Master" },
            { label: "Dosen" },
          ]}
          description="Kelola data dosen, jabatan, dan informasi akademik lainnya"
          icon={IconSchool}
        />

        <DosenList />
      </Stack>
    </Container>
  );
}
