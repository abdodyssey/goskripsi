"use client";

import { Container, Stack } from "@mantine/core";
import { IconBuilding } from "@tabler/icons-react";
import { PageHeader } from "@/components/PageHeader/PageHeader";
import { MasterDataList } from "@/features/master-data/components/MasterDataList";

export default function FakultasPage() {
  const fields: any[] = [
    { name: "nama_fakultas", label: "Nama Fakultas", type: "text" },
  ];

  const columns = [
    { key: "id", label: "ID" },
    { key: "namaFakultas", label: "Nama Fakultas" },
  ];

  return (
    <Container size="xl" pt="md">
      <Stack gap="lg">
        <PageHeader
          title="Manajemen Fakultas"
          items={[
            { label: "Dashboard", href: "/dashboard" },
            { label: "Data Master" },
            { label: "Fakultas" },
          ]}
          description="Kelola data fakultas dalam sistem"
          icon={IconBuilding}
        />

        <MasterDataList
          entity="fakultas"
          title="Fakultas"
          fields={fields}
          columns={columns}
        />
      </Stack>
    </Container>
  );
}
