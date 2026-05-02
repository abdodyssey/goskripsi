"use client";

import { Container, Stack, Tabs } from "@mantine/core";
import { IconClipboardCheck } from "@tabler/icons-react";
import { PageHeader } from "@/components/PageHeader/PageHeader";
import { MasterDataList } from "@/features/master-data/components/MasterDataList";
import { useMasterData } from "@/features/master-data/hooks/use-master-data";
import { useState, useMemo } from "react";

export default function KomponenPenilaianPage() {
  const { data: jenisUjians } = useMasterData("jenis-ujian");
  const { data: allKomponen } = useMasterData("komponen-penilaian");
  const [activeTab, setActiveTab] = useState<string | null>("all");

  const filteredData = useMemo(() => {
    if (!activeTab || activeTab === "all") return allKomponen;
    return allKomponen.filter((k: any) => String(k.jenisUjianId) === activeTab);
  }, [allKomponen, activeTab]);

  const fields: any[] = [
    { name: "kriteria", label: "Nama Komponen (Kriteria)", type: "text" },
    {
      name: "jenis_ujian_id",
      label: "Jenis Ujian",
      type: "select",
      options:
        (Array.isArray(jenisUjians) ? jenisUjians : [])?.map((j: any) => ({
          value: String(j.id),
          label: j.namaJenis,
        })) || [],
    },
  ];

  const columns = [
    { key: "id", label: "ID" },
    { key: "kriteria", label: "Kriteria Penilaian" },
    {
      key: "jenisUjianId",
      label: "Jenis Ujian",
      render: (val: any) => {
        const j = (Array.isArray(jenisUjians) ? jenisUjians : [])?.find(
          (item: any) => item.id === val,
        );
        return j ? j.namaJenis : val;
      },
    },
  ];

  return (
    <Container size="xl" pt="md">
      <Stack gap="lg">
        <PageHeader
          title="Manajemen Komponen Penilaian"
          items={[
            { label: "Dashboard", href: "/dashboard" },
            { label: "Data Master" },
            { label: "Komponen Penilaian" },
          ]}
          description="Kelola kriteria dan indikator penilaian untuk setiap jenis ujian"
          icon={IconClipboardCheck}
        />

        <Tabs value={activeTab} onChange={setActiveTab} variant="outline" radius="md">
          <Tabs.List mb="md">
            <Tabs.Tab value="all">Semua Jenis</Tabs.Tab>
            {(Array.isArray(jenisUjians) ? jenisUjians : []).map((j: any) => (
              <Tabs.Tab key={j.id} value={String(j.id)}>
                {j.namaJenis}
              </Tabs.Tab>
            ))}
          </Tabs.List>

          <MasterDataList
            entity="komponen-penilaian"
            title={`Komponen ${
              activeTab === "all"
                ? ""
                : (Array.isArray(jenisUjians) ? jenisUjians : []).find(
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
