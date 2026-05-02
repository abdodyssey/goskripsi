"use client";

import { useDosens } from "../hooks/use-mahasiswa";
import { Text, Group, Stack, TextInput } from "@mantine/core";
import { IconSearch } from "@tabler/icons-react";
import { useState, useMemo } from "react";
import { DataTable, DataTableColumn } from "@/components/ui/data-table";
import { StatusBadge } from "@/components/ui/status-badge";
import { Progress, Tooltip } from "@mantine/core";

export function DosenList() {
  const { data: dosensData, isLoading, isError } = useDosens();
  const [search, setSearch] = useState("");

  const filteredData = useMemo(() => {
    const list = Array.isArray(dosensData) ? dosensData : [];
    return list
      .filter((item) => {
        const searchStr = (search || "").toLowerCase();
        const nama = item.nama || "";
        const nidn = item.nidn || "";
        const nip = item.nip || "";
        return (
          nama.toLowerCase().includes(searchStr) ||
          nidn.toLowerCase().includes(searchStr) ||
          nip.toLowerCase().includes(searchStr)
        );
      })
      .sort((a, b) => (b.bimbinganCount || 0) - (a.bimbinganCount || 0));
  }, [dosensData, search]);

  const columns: DataTableColumn<any>[] = [
    {
      header: "Nama & Identitas",
      render: (row) => (
        <Stack gap={0}>
          <Text size="sm" fw={700} className="text-gs-text-primary">
            {row.nama || "-"}
          </Text>
          <Text size="xs" className="text-gs-text-muted">
            NIDN: {row.nidn || "-"} | NIP: {row.nip || "-"}
          </Text>
        </Stack>
      ),
    },
    {
      header: "Program Studi",
      render: (row) => (
        <Text size="sm" className="text-gs-text-secondary" fw={500}>
          {row.prodi?.namaProdi || row.prodi?.nama_prodi || "-"}
        </Text>
      ),
    },
    {
      header: "Jabatan/Golongan",
      render: (row) => (
        <Text size="sm" className="text-gs-text-secondary">
          {row.jabatan || "-"} {row.golongan ? `(${row.golongan})` : ""}
        </Text>
      ),
    },
    {
      header: "Beban Bimbingan",
      width: 180,
      render: (row) => {
        const count = row.bimbinganCount || 0;
        const max = 15; // Assume 15 is max load
        const percentage = Math.min((count / max) * 100, 100);
        
        // Use desaturated monochrome status mapping
        let color = "var(--gs-success)";
        let textColor = "var(--gs-success-text)";
        let label = "Rendah";
        
        if (count >= 12) {
          color = "var(--gs-danger)";
          textColor = "var(--gs-danger-text)";
          label = "Sangat Tinggi";
        } else if (count >= 8) {
          color = "var(--gs-warning)";
          textColor = "var(--gs-warning-text)";
          label = "Tinggi";
        } else if (count >= 4) {
          color = "var(--gs-info)";
          textColor = "var(--gs-info-text)";
          label = "Sedang";
        }

        return (
          <Tooltip label={`${label}: ${count} Mahasiswa`} withArrow radius="md">
            <Stack gap={4} w={150}>
              <Group justify="space-between" wrap="nowrap">
                <Text size="xs" fw={700} style={{ color: textColor }}>{count} Mhs</Text>
                <Text size="10px" className="text-gs-text-muted" fw={600}>{percentage.toFixed(0)}%</Text>
              </Group>
              <Progress 
                value={percentage} 
                color={color} 
                size="sm" 
                radius="xl" 
                striped={count >= 12}
                animated={count >= 12}
                styles={{
                  root: { backgroundColor: 'var(--gs-bg-overlay)' },
                  section: { transition: 'width 1s ease' }
                }}
              />
            </Stack>
          </Tooltip>
        );
      },
    },
    {
      header: "Status",
      render: (row) => {
        const status = row.status || "aktif";
        return <StatusBadge status={status} />;
      },
    },
  ];

  return (
    <DataTable
      data={filteredData}
      columns={columns}
      loading={isLoading}
      error={isError ? "Gagal memuat data dosen." : null}
      title="Daftar Dosen & Beban Bimbingan"
      description="Data biodata akademik serta monitoring beban bimbingan dosen"
      rightSection={
        <TextInput
          placeholder="Cari Nama / NIDN / NIP..."
          leftSection={<IconSearch size={18} stroke={1.5} className="text-gs-text-muted" />}
          value={search}
          onChange={(e) => setSearch(e.currentTarget.value)}
          style={{ width: 320 }}
          radius="md"
          variant="filled"
          styles={{
            input: { backgroundColor: 'var(--gs-bg-overlay)', border: '1px solid var(--gs-border)' }
          }}
        />
      }
    />
  );
}
