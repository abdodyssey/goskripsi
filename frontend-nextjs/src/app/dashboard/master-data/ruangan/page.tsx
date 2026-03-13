"use client";

import { Container, Stack } from "@mantine/core";
import { IconDoor } from "@tabler/icons-react";
import { PageHeader } from "@/components/PageHeader/PageHeader";
import { MasterDataList } from "@/features/master-data/components/MasterDataList";
import { useMasterData } from "@/features/master-data/hooks/use-master-data";

export default function RuanganPage() {
  const { data: prodis } = useMasterData("prodi");

  const fields: any[] = [
    { name: "nama_ruangan", label: "Nama Ruangan", type: "text" },
    { name: "deskripsi", label: "Deskripsi", type: "text" },
    {
      name: "prodi_id",
      label: "Program Studi",
      type: "select",
      options:
        prodis?.map((p: any) => ({
          value: String(p.id),
          label: p.namaProdi,
        })) || [],
    },
  ];

  const columns = [
    { key: "id", label: "ID" },
    { key: "namaRuangan", label: "Nama Ruangan" },
    { key: "deskripsi", label: "Deskripsi" },
    {
      key: "prodiId",
      label: "Prodi",
      render: (val: any) => {
        const p = prodis?.find((item: any) => item.id === val);
        return p ? p.namaProdi : val;
      },
    },
  ];

  return (
    <Container size="xl" pt="md">
      <Stack gap="lg">
        <PageHeader
          title="Manajemen Ruangan"
          items={[
            { label: "Dashboard", href: "/dashboard" },
            { label: "Data Master" },
            { label: "Ruangan" },
          ]}
          description="Kelola data ruangan ujian"
          icon={IconDoor}
        />

        <MasterDataList
          entity="ruangan"
          title="Ruangan"
          fields={fields}
          columns={columns}
        />
      </Stack>
    </Container>
  );
}
