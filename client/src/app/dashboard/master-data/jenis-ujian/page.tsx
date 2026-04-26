"use client";

import { Container, Stack } from "@mantine/core";
import { IconCertificate } from "@tabler/icons-react";
import { PageHeader } from "@/components/PageHeader/PageHeader";
import { MasterDataList } from "@/features/master-data/components/MasterDataList";

export default function JenisUjianPage() {
  const fields: any[] = [
    { name: "nama_jenis", label: "Nama Jenis Ujian", type: "text" },
    { name: "deskripsi", label: "Deskripsi", type: "text" },
    { name: "aktif", label: "Aktif", type: "checkbox" },
  ];

  const columns = [
    { key: "id", label: "ID" },
    { key: "namaJenis", label: "Nama Jenis Ujian" },
    { key: "deskripsi", label: "Deskripsi" },
    { key: "aktif", label: "Status" },
  ];

  return (
    <Container size="xl" pt="md">
      <Stack gap="lg">
        <PageHeader
          title="Manajemen Jenis Ujian"
          items={[
            { label: "Dashboard", href: "/dashboard" },
            { label: "Data Master" },
            { label: "Jenis Ujian" },
          ]}
          description="Kelola jenis-jenis ujian skripsi"
          icon={IconCertificate}
        />

        <MasterDataList
          entity="jenis-ujian"
          title="Jenis Ujian"
          fields={fields}
          columns={columns}
        />
      </Stack>
    </Container>
  );
}
