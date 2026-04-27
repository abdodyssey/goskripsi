"use client";

import { MahasiswaBimbinganList } from "@/features/mahasiswa/components/mahasiswa-bimbingan-list";
import { Container, Stack } from "@mantine/core";
import { IconUsers } from "@tabler/icons-react";
import { PageHeader } from "@/components/PageHeader/PageHeader";

export default function MahasiswaBimbinganPage() {
  return (
    <Container size="xl" py="xl">
      <PageHeader
        title="Mahasiswa Bimbingan"
        items={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Mahasiswa Bimbingan" },
        ]}
        description="Kelola dan pantau progress mahasiswa bimbingan skripsi Anda"
        icon={IconUsers}
      />
      <Stack gap="xl">
        <MahasiswaBimbinganList />
      </Stack>
    </Container>
  );
}
