"use client";

import { Container, Stack } from "@mantine/core";
import { IconClipboardList } from "@tabler/icons-react";
import { PageHeader } from "@/components/PageHeader/PageHeader";
import { MasterDataList } from "@/features/master-data/components/MasterDataList";
import { useMasterData } from "@/features/master-data/hooks/use-master-data";

export default function SyaratPage() {
  const { data: jenisUjian } = useMasterData("jenis-ujian");

  const fields: any[] = [
    {
      name: "jenis_ujian_id",
      label: "Jenis Ujian",
      type: "select",
      options: jenisUjian.map((j: any) => ({
        value: String(j.id),
        label: j.namaJenis,
      })),
    },
    { name: "nama_syarat", label: "Nama Syarat", type: "text" },
    { name: "deskripsi", label: "Deskripsi", type: "text" },
    { name: "wajib", label: "Wajib", type: "checkbox" },
  ];

  const columns = [
    {
      key: "jenisUjianId",
      label: "Jenis Ujian",
      render: (val: any) => {
        const j = jenisUjian.find((item: any) => item.id === val);
        return j ? j.namaJenis : val;
      },
    },
    { key: "namaSyarat", label: "Nama Syarat" },
    { key: "wajib", label: "Wajib" },
  ];

  return (
    <Container size="xl" pt="md">
      <Stack gap="lg">
        <PageHeader
          title="Manajemen Syarat Ujian"
          items={[
            { label: "Dashboard", href: "/dashboard" },
            { label: "Data Master" },
            { label: "Syarat" },
          ]}
          description="Kelola syarat kelengkapan berkas untuk setiap jenis ujian"
          icon={IconClipboardList}
        />

        <MasterDataList
          entity="syarat"
          title="Syarat"
          fields={fields}
          columns={columns}
        />
      </Stack>
    </Container>
  );
}
