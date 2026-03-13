"use client";

import { Container, Stack } from "@mantine/core";
import { IconSchool } from "@tabler/icons-react";
import { PageHeader } from "@/components/PageHeader/PageHeader";
import { MasterDataList } from "@/features/master-data/components/MasterDataList";
import { useMasterData } from "@/features/master-data/hooks/use-master-data";

export default function ProdiPage() {
  const { data: fakultas } = useMasterData("fakultas");

  const fields: any[] = [
    { name: "nama_prodi", label: "Nama Program Studi", type: "text" },
    {
      name: "fakultas_id",
      label: "Fakultas",
      type: "select",
      options:
        fakultas?.map((f: any) => ({
          value: String(f.id),
          label: f.namaFakultas,
        })) || [],
    },
  ];

  const columns = [
    { key: "id", label: "ID" },
    { key: "namaProdi", label: "Nama Program Studi" },
    {
      key: "fakultasId",
      label: "Fakultas",
      render: (val: any) => {
        const f = fakultas.find((item: any) => item.id === val);
        return f ? f.namaFakultas : val;
      },
    },
  ];

  return (
    <Container size="xl" pt="md">
      <Stack gap="lg">
        <PageHeader
          title="Manajemen Program Studi"
          items={[
            { label: "Dashboard", href: "/dashboard" },
            { label: "Data Master" },
            { label: "Program Studi" },
          ]}
          description="Kelola data program studi dalam sistem"
          icon={IconSchool}
        />

        <MasterDataList
          entity="prodi"
          title="Program Studi"
          fields={fields}
          columns={columns}
        />
      </Stack>
    </Container>
  );
}
