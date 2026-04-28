"use client";

import { MahasiswaBimbinganList } from "@/features/mahasiswa/components/mahasiswa-bimbingan-list";
import { Container, Stack } from "@mantine/core";
import { IconSchool } from "@tabler/icons-react";
import { PageHeader } from "@/components/PageHeader/PageHeader";

export default function MahasiswaPAPage() {
  return (
    <Container size="xl" py="xl">
      <PageHeader
        title="Mahasiswa PA"
        items={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Mahasiswa PA" },
        ]}
        description="Kelola dan pantau progress mahasiswa yang Anda bimbing sebagai Pembimbing Akademik"
        icon={IconSchool}
      />
      <Stack gap="xl">
        <MahasiswaBimbinganList onlyPA={true} />
      </Stack>
    </Container>
  );
}
