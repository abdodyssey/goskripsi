"use client";

import { useAuth } from "@/features/auth/hooks/use-auth";
import { Container, Text } from "@mantine/core";
import { IconClipboardList } from "@tabler/icons-react";
import { PageHeader } from "@/components/PageHeader/PageHeader";
import { ManajemenRanpelList } from "@/features/ranpel/components/manajemen-ranpel-list";

export default function ManajemenRanpelPage() {
  const { userResponse, isLoadingProfile, isAuthenticated } = useAuth();

  if (isLoadingProfile || !isAuthenticated) {
    return null;
  }

  const user = userResponse?.user || userResponse?.data?.user;
  const roles =
    user?.roles || userResponse?.roles || userResponse?.data?.roles || [];

  const isManagement = roles.some((r) =>
    ["admin", "superadmin", "kaprodi", "sekprodi"].includes(r),
  );

  if (!isManagement) {
    return (
      <Container size="xl" pt="md">
        <Text c="red">
          Hanya Kaprodi / Struktural yang memiliki akses ke halaman ini.
        </Text>
      </Container>
    );
  }

  return (
    <Container size="xl" pt="md">
      <PageHeader
        title="Manajemen Rancangan Penelitian"
        items={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Manajemen Ranpel" },
        ]}
        description="Kelola dan tinjau seluruh pengajuan rancangan penelitian mahasiswa"
        icon={IconClipboardList}
      />

      <ManajemenRanpelList />
    </Container>
  );
}
