"use client";

import { Container, Stack, Badge } from "@mantine/core";
import { IconGavel } from "@tabler/icons-react";
import { PageHeader } from "@/components/PageHeader/PageHeader";
import { MasterDataList } from "@/features/master-data/components/MasterDataList";
import { useMasterData } from "@/features/master-data/hooks/use-master-data";

export default function KeputusanPage() {
  const { data: jenisUjian } = useMasterData("jenis-ujian");

  const fields: any[] = [
    { name: "kode", label: "Kode", type: "text" },
    { name: "nama_keputusan", label: "Nama Keputusan", type: "text" },
    {
      name: "jenis_ujian_id",
      label: "Jenis Ujian",
      type: "select",
      options: [
        { value: "", label: "Berlaku Semua" },
        ...jenisUjian.map((j: any) => ({
          value: String(j.id),
          label: j.namaJenis,
        })),
      ],
    },
    { name: "aktif", label: "Aktif", type: "checkbox" },
  ];

  const columns = [
    { key: "kode", label: "Kode" },
    { key: "namaKeputusan", label: "Nama Keputusan" },
    {
      key: "jenisUjianId",
      label: "Jenis Ujian",
      render: (val: any) => {
        if (!val) return <Badge color="gray">Semua</Badge>;
        const j = jenisUjian.find((item: any) => item.id === val);
        return j ? j.namaJenis : val;
      },
    },
    { key: "aktif", label: "Status" },
  ];

  return (
    <Container size="xl" pt="md">
      <Stack gap="lg">
        <PageHeader
          title="Manajemen Keputusan Ujian"
          items={[
            { label: "Dashboard", href: "/dashboard" },
            { label: "Data Master" },
            { label: "Keputusan" },
          ]}
          description="Kelola kriteria keputusan hasil ujian"
          icon={IconGavel}
        />

        <MasterDataList
          entity="keputusan"
          title="Keputusan"
          fields={fields}
          columns={columns}
        />
      </Stack>
    </Container>
  );
}
