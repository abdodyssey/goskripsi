"use client";

import { RekapBimbinganList } from "@/features/mahasiswa/components/rekap-bimbingan-list";
import { Container, Stack } from "@mantine/core";
import { IconClipboardList } from "@tabler/icons-react";
import { PageHeader } from "@/components/PageHeader/PageHeader";

export default function RekapBimbinganPage() {
  return (
    <Container size="xl" py="xl">
      <PageHeader
        title="Rekap Mahasiswa Bimbingan"
        items={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Rekap Mahasiswa Bimbingan" },
        ]}
        description="Pantau distribusi dan beban bimbingan skripsi untuk seluruh dosen"
        icon={IconClipboardList}
      />
      <Stack gap="xl">
        <RekapBimbinganList />
      </Stack>
    </Container>
  );
}
