"use client";

import { useDosens } from "../hooks/use-mahasiswa";
import { Text, Group, Stack, TextInput, rem } from "@mantine/core";
import { IconSearch } from "@tabler/icons-react";
import { useState, useMemo } from "react";
import { DataTable, DataTableColumn } from "@/components/ui/data-table";
import { StatusBadge } from "@/components/ui/status-badge";

export function DosenList() {
  const { data: dosensData, isLoading, isError } = useDosens();
  const [search, setSearch] = useState("");

  const filteredData = useMemo(() => {
    const list = Array.isArray(dosensData?.data) ? dosensData.data : [];
    return list.filter((item) => {
      const searchStr = (search || "").toLowerCase();
      const nama = item.nama || "";
      const nidn = item.nidn || "";
      const nip = item.nip || "";
      return (
        nama.toLowerCase().includes(searchStr) ||
        nidn.toLowerCase().includes(searchStr) ||
        nip.toLowerCase().includes(searchStr)
      );
    });
  }, [dosensData, search]);

  const columns: DataTableColumn<any>[] = [
    {
      header: "Nama & Identitas",
      render: (row) => (
        <Stack gap={0}>
          <Text size="sm" fw={700}>
            {row.nama || "-"}
          </Text>
          <Text size="xs" c="dimmed">
            NIDN: {row.nidn || "-"} | NIP: {row.nip || "-"}
          </Text>
        </Stack>
      ),
    },
    {
      header: "Program Studi",
      render: (row) => (
        <Text size="sm" c="dimmed">
          {row.prodi?.namaProdi || row.prodi?.nama_prodi || "-"}
        </Text>
      ),
    },
    {
      header: "Jabatan/Golongan",
      render: (row) => (
        <Text size="sm" c="dimmed">
          {row.jabatan || "-"} {row.golongan ? `(${row.golongan})` : ""}
        </Text>
      ),
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
      title="Daftar Dosen"
      description="Manajemen data biodata dan informasi akademik dosen"
      rightSection={
        <TextInput
          placeholder="Cari Nama / NIDN / NIP..."
          leftSection={<IconSearch size={16} />}
          value={search}
          onChange={(e) => setSearch(e.currentTarget.value)}
          style={{ width: 300 }}
          radius="md"
        />
      }
    />
  );
}
