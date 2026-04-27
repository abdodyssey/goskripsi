"use client";

import { useAuth } from "@/features/auth/hooks/use-auth";
import { Container, Text, Alert } from "@mantine/core";
import { IconFileCheck, IconMail } from "@tabler/icons-react";
import { PageHeader } from "@/components/PageHeader/PageHeader";
import { VerifikasiRanpelList } from "@/features/ranpel/components/verifikasi-ranpel-list";

export default function VerifikasiRanpelPage() {
  const { userResponse, isLoadingProfile, isAuthenticated } = useAuth();

  if (isLoadingProfile || !isAuthenticated) {
    return null;
  }

  const user = userResponse?.user;
  const roles = user?.roles || userResponse?.roles || [];

  const isManagement = roles.some((r) =>
    ["admin", "superadmin", "kaprodi", "sekprodi", "dosen"].includes(r),
  );

  if (!isManagement) {
    return (
      <Container size="xl" pt="md">
        <Text c="red">
          Hanya Dosen / Struktural yang memiliki akses ke halaman ini.
        </Text>
      </Container>
    );
  }

  return (
    <Container size="xl" pt="md">
      <PageHeader
        title="Verifikasi Rancangan Penelitian"
        items={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Verifikasi Ranpel" },
        ]}
        description="Verifikasi dan berikan masukan pada rancangan penelitian mahasiswa bimbingan Anda"
        icon={IconFileCheck}
      />

      <Alert
        variant="light"
        color="indigo"
        title="Penting: Notifikasi Email"
        icon={<IconMail size={18} />}
        mb="md"
        radius="md"
      >
        <Text size="sm">
          Setiap tindakan verifikasi (Setujui/Tolak) akan mengirimkan notifikasi otomatis ke <b>email Mahasiswa</b> yang bersangkutan. Pastikan Anda juga memeriksa email Anda secara berkala untuk pengajuan baru.
        </Text>
      </Alert>

      <VerifikasiRanpelList />
    </Container>
  );
}
