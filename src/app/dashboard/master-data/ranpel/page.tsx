"use client";

import { useAuth } from "@/features/auth/hooks/use-auth";
import { Container, Text, Stack } from "@mantine/core";
import { IconSettings } from "@tabler/icons-react";
import { PageHeader } from "@/components/PageHeader/PageHeader";
import { RanpelMasterList } from "@/features/ranpel/components/ranpel-master-list";

export default function RanpelMasterPage() {
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
          title="Master Data Rancangan Penelitian"
          items={[
            { label: "Dashboard", href: "/dashboard" },
            { label: "Data Master" },
            { label: "Rancangan Penelitian" },
          ]}
          description="Kelola seluruh konten detail usulan skripsi mahasiswa secara terpusat"
          icon={IconSettings}
        />

        <RanpelMasterList />
      </Stack>
    </Container>
  );
}
