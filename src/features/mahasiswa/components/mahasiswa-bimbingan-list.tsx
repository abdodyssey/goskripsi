"use client";

import { useMahasiswa } from "../hooks/use-mahasiswa";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { Text, Badge, Stack, TextInput, Center, Tooltip } from "@mantine/core";
import { IconSearch, IconUsers } from "@tabler/icons-react";
import { useDisclosure } from "@mantine/hooks";
import { Mahasiswa } from "@/types/user.type";
import { useState, useMemo } from "react";
import { StudentProfileModal } from "./student-profile-modal";
import { DataTable, DataTableColumn } from "@/components/ui/data-table";

export function MahasiswaBimbinganList() {
  const { mahasiswaList, isLoading, isError } = useMahasiswa();
  const { userResponse } = useAuth();
  const lecturerId = userResponse?.user?.id;

  const [search, setSearch] = useState("");
  const [profileOpened, { open: openProfile, close: closeProfile }] =
    useDisclosure(false);
  const [selectedStudent, setSelectedStudent] = useState<Mahasiswa | null>(
    null,
  );

  const handleShowStudentProfile = (student: Mahasiswa) => {
    setSelectedStudent(student);
    openProfile();
  };

  const filteredData = useMemo(() => {
    if (!lecturerId) return [];

    const list = Array.isArray(mahasiswaList)
      ? (mahasiswaList as Mahasiswa[])
      : [];

    const currentLecturerId = lecturerId.toString();

    // Filter by advisor 1, 2, or PA
    return list.filter((item) => {
      // Safely extracting IDs
      const p1Id =
        typeof item.pembimbing_1 === "object"
          ? item.pembimbing_1?.id
          : item.pembimbing_1;
      const p2Id =
        typeof item.pembimbing_2 === "object"
          ? item.pembimbing_2?.id
          : item.pembimbing_2;
      const paId =
        typeof item.dosen_pa === "object" ? item.dosen_pa?.id : item.dosen_pa;

      const isP1 = p1Id?.toString() === currentLecturerId;
      const isP2 = p2Id?.toString() === currentLecturerId;
      const isPA = paId?.toString() === currentLecturerId;

      if (!(isP1 || isP2 || isPA)) return false;

      const searchStr = (search || "").toLowerCase();
      const nama = item.nama || "";
      const nim = item.nim || "";

      return (
        nama.toLowerCase().includes(searchStr) ||
        nim.toLowerCase().includes(searchStr)
      );
    });
  }, [mahasiswaList, search, lecturerId]);

  const columns: DataTableColumn<Mahasiswa>[] = [
    {
      header: "Nama & NIM",
      render: (row) => (
        <Stack
          gap={0}
          style={{ cursor: "pointer" }}
          onClick={() => handleShowStudentProfile(row)}
        >
          <Tooltip label="Klik untuk lihat profil">
            <Text size="sm" fw={700} c="indigo.7">
              {row.nama || row.user?.nama || "-"}
            </Text>
          </Tooltip>
          <Text size="xs" c="dimmed">
            {row.nim}
          </Text>
        </Stack>
      ),
    },
    {
      header: "Program Studi",
      render: (row) => (
        <Text size="sm" c="dimmed">
          {row.prodi?.nama_prodi || "-"}
        </Text>
      ),
    },
    {
      header: "Peran",
      render: (row) => {
        const p1Id =
          typeof row.pembimbing_1 === "object"
            ? row.pembimbing_1?.id
            : row.pembimbing_1;
        const p2Id =
          typeof row.pembimbing_2 === "object"
            ? row.pembimbing_2?.id
            : row.pembimbing_2;

        const currentLecturerId = lecturerId?.toString();
        const isP1 = p1Id?.toString() === currentLecturerId;
        const isP2 = p2Id?.toString() === currentLecturerId;

        let label = "Dosen PA";
        let color = "teal";

        if (isP1) {
          label = "Pembimbing 1";
          color = "blue";
        } else if (isP2) {
          label = "Pembimbing 2";
          color = "cyan";
        }

        return (
          <Badge
            variant="light"
            color={color}
            radius="sm"
            tt="uppercase"
            fz={10}
            fw={800}
          >
            {label}
          </Badge>
        );
      },
    },
    {
      header: "Angkatan",
      render: (row) => (
        <Text size="sm" c="dimmed">
          {row.angkatan || "-"}
        </Text>
      ),
    },
    {
      header: "Status",
      render: (row) => {
        const status = row.status;
        return (
          <Badge
            variant="dot"
            color={status === "aktif" ? "teal" : "gray"}
            radius="xl"
            tt="uppercase"
            fz={10}
            fw={800}
          >
            {status}
          </Badge>
        );
      },
    },
  ];

  return (
    <>
      <DataTable
        data={filteredData}
        columns={columns}
        loading={isLoading}
        error={isError ? "Gagal memuat data mahasiswa bimbingan." : null}
        title="Mahasiswa Bimbingan & PA"
        description="Daftar mahasiswa yang Anda bimbing sebagai Pembimbing 1, Pembimbing 2, atau Dosen PA"
        rightSection={
          <TextInput
            placeholder="Cari Nama / NIM..."
            leftSection={<IconSearch size={16} />}
            value={search}
            onChange={(e) => setSearch(e.currentTarget.value)}
            style={{ width: 250 }}
            radius="md"
          />
        }
        emptyState={
          <Center py={60}>
            <Stack align="center" gap="sm">
              <IconUsers
                size={40}
                color="var(--mantine-color-slate-3)"
                stroke={1.5}
              />
              <Text c="dimmed" size="sm" fw={500}>
                Anda belum memiliki mahasiswa bimbingan atau PA yang terdaftar.
              </Text>
            </Stack>
          </Center>
        }
      />

      <StudentProfileModal
        opened={profileOpened}
        onClose={closeProfile}
        student={selectedStudent}
      />
    </>
  );
}
