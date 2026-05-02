"use client";

import { useAuth } from "@/features/auth/hooks/use-auth";
import { Container, Text, Stack } from "@mantine/core";
import { IconClipboardList } from "@tabler/icons-react";
import { PageHeader } from "@/components/PageHeader/PageHeader";
import { PengajuanRanpelMasterList } from "@/features/ranpel/components/pengajuan-ranpel-master-list";

export default function PengajuanRanpelMasterPage() {
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
          title="Master Data Pengajuan Ranpel"
          items={[
            { label: "Dashboard", href: "/dashboard" },
            { label: "Data Master" },
            { label: "Pengajuan Ranpel" },
          ]}
          description="Kelola seluruh riwayat dan status persetujuan usulan skripsi mahasiswa"
          icon={IconClipboardList}
        />

        <PengajuanRanpelMasterList />
      </Stack>
    </Container>
  );
}
