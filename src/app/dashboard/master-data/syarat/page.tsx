"use client";

import { Container, Stack, Badge, Tabs } from "@mantine/core";
import { IconClipboardList } from "@tabler/icons-react";
import { PageHeader } from "@/components/PageHeader/PageHeader";
import { MasterDataList } from "@/features/master-data/components/MasterDataList";
import { useMasterData } from "@/features/master-data/hooks/use-master-data";
import { useState, useMemo } from "react";

export default function SyaratPage() {
  const { data: jenisUjian } = useMasterData("jenis-ujian");
  const { data: allSyarat } = useMasterData("syarat");
  const [activeTab, setActiveTab] = useState<string | null>("all");

  const filteredData = useMemo(() => {
    if (!activeTab || activeTab === "all") return allSyarat;
    return allSyarat.filter((s: any) => String(s.jenisUjianId) === activeTab);
  }, [allSyarat, activeTab]);

  const fields: any[] = [
    {
      name: "jenis_ujian_id",
      label: "Jenis Ujian",
      type: "select",
      options: (Array.isArray(jenisUjian) ? jenisUjian : [])?.map((j: any) => ({
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
        const j = (Array.isArray(jenisUjian) ? jenisUjian : [])?.find(
          (item: any) => item.id === val,
        );
        return j ? j.namaJenis : val;
      },
    },
    { key: "namaSyarat", label: "Nama Syarat" },
    { 
      key: "wajib", 
      label: "Sifat",
      render: (val: any) => (
        <Badge variant="light" color={val ? "red" : "gray"} size="xs" radius="sm">
          {val ? "WAJIB" : "OPSIONAL"}
        </Badge>
      )
    },
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

        <Tabs value={activeTab} onChange={setActiveTab} variant="outline" radius="md">
          <Tabs.List mb="md">
            <Tabs.Tab value="all">Semua Jenis</Tabs.Tab>
            {(Array.isArray(jenisUjian) ? jenisUjian : []).map((j: any) => (
              <Tabs.Tab key={j.id} value={String(j.id)}>
                {j.namaJenis}
              </Tabs.Tab>
            ))}
          </Tabs.List>

          <MasterDataList
            entity="syarat"
            title={`Syarat ${
              activeTab === "all"
                ? ""
                : (Array.isArray(jenisUjian) ? jenisUjian : []).find(
                    (j: any) => String(j.id) === activeTab,
                  )?.namaJenis || ""
            }`}
            fields={fields}
            columns={columns}
            data={filteredData}
          />
        </Tabs>
      </Stack>
    </Container>
  );
}
