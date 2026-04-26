"use client";

import { Container, Stack } from "@mantine/core";
import { IconTarget } from "@tabler/icons-react";
import { PageHeader } from "@/components/PageHeader/PageHeader";
import { MasterDataList } from "@/features/master-data/components/MasterDataList";
import { useMasterData } from "@/features/master-data/hooks/use-master-data";

export default function PeminatanPage() {
  const { data: prodis } = useMasterData("prodi");

  const fields: any[] = [
    { name: "nama_peminatan", label: "Nama Peminatan", type: "text" },
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
    { key: "namaPeminatan", label: "Nama Peminatan" },
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
          title="Manajemen Peminatan"
          items={[
            { label: "Dashboard", href: "/dashboard" },
            { label: "Data Master" },
            { label: "Peminatan" },
          ]}
          description="Kelola data peminatan program studi"
          icon={IconTarget}
        />

        <MasterDataList
          entity="peminatan"
          title="Peminatan"
          fields={fields}
          columns={columns}
        />
      </Stack>
    </Container>
  );
}
