"use client";

import { useMahasiswa, useDosens } from "../hooks/use-mahasiswa";
import {
  Text,
  Badge,
  Group,
  Stack,
  TextInput,
  Center,
  Tooltip,
  Accordion,
  Avatar,
  Paper,
  Box,
  useMantineColorScheme,
} from "@mantine/core";
import { IconSearch, IconUser, IconUsers } from "@tabler/icons-react";
import { useDisclosure } from "@mantine/hooks";
import { Mahasiswa, Dosen } from "@/types/user.type";
import { useState, useMemo } from "react";
import { StudentProfileModal } from "./student-profile-modal";
import { DataTable, DataTableColumn } from "@/components/ui/data-table";

export function RekapBimbinganList() {
  const {
    mahasiswaList,
    isLoading: mhsLoading,
    isError: mhsError,
  } = useMahasiswa();
  const {
    data: dosensData,
    isLoading: dosenLoading,
    isError: dosenError,
  } = useDosens();

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

  const { colorScheme } = useMantineColorScheme();
  const isDark = colorScheme === "dark";

  const dosensWithMahasiswa = useMemo(() => {
    const listMhs = (mahasiswaList as Mahasiswa[]) || [];
    const listDosen = (dosensData?.data as Dosen[]) || [];
    const searchStr = (search || "").toLowerCase();

    return listDosen
      .map((dosen) => {
        // First, check if the lecturer matches the search
        const lecturerMatches = dosen.nama.toLowerCase().includes(searchStr);

        // Then filter students
        const bimbingan = listMhs
          .filter((item) => {
            const p1Val = item.pembimbing_1;
            const p2Val = item.pembimbing_2;
            const p1Id = typeof p1Val === "object" ? p1Val?.id : p1Val;
            const p2Id = typeof p2Val === "object" ? p2Val?.id : p2Val;

            const isP1 = p1Id?.toString() === dosen.id.toString();
            const isP2 = p2Id?.toString() === dosen.id.toString();

            if (!(isP1 || isP2)) return false;

            // If the search string is empty, include all students for this lecturer
            if (!searchStr) return true;

            // If the lecturer themselves matches, include all their students
            if (lecturerMatches) return true;

            // Otherwise, check if the student matches
            const mhsNama = item.nama || (item.user?.nama || "");
            const nim = item.nim || "";

            return (
              mhsNama.toLowerCase().includes(searchStr) ||
              nim.toLowerCase().includes(searchStr)
            );
          })
          .map((item) => {
            const p1Val = item.pembimbing_1;
            const p1Id = typeof p1Val === "object" ? p1Val?.id : p1Val;
            const isP1 = p1Id?.toString() === dosen.id.toString();

            return {
              ...item,
              peran: isP1 ? "Pembimbing 1" : "Pembimbing 2",
            };
          });

        return {
          ...dosen,
          bimbingan,
          p1Count: bimbingan.filter((b) => b.peran === "Pembimbing 1").length,
          p2Count: bimbingan.filter((b) => b.peran === "Pembimbing 2").length,
          totalCount: bimbingan.length,
          lecturerMatches, // helpful for filtering
        };
      })
      .filter((dosen) => {
        if (!searchStr) return true;
        // Show if lecturer matches OR they have matching students
        return dosen.lecturerMatches || dosen.totalCount > 0;
      })
      .sort((a, b) => b.totalCount - a.totalCount);
  }, [mahasiswaList, dosensData, search]);

  const columns: DataTableColumn<Mahasiswa & { peran: string }>[] = [
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
              {row.nama}
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
      header: "Peran Pembimbing",
      render: (row) => (
        <Badge
          variant="light"
          color={row.peran === "Pembimbing 1" ? "blue" : "cyan"}
          radius="sm"
          tt="uppercase"
          fz={10}
          fw={800}
        >
          {row.peran}
        </Badge>
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

  if (mhsLoading || dosenLoading) {
    return (
      <Center py={100}>
        <Text c="dimmed">Memuat data rekapitulasi bimbingan...</Text>
      </Center>
    );
  }

  if (mhsError || dosenError) {
    return (
      <Center py={100}>
        <Text c="red.5">Terjadi kesalahan saat memuat data.</Text>
      </Center>
    );
  }

  return (
    <Stack gap="md">
      <Paper withBorder p="xs" radius="xl" shadow="sm">
        <Group justify="space-between" px="xs" wrap="wrap">
          <Group gap="xs">
            <IconUsers size={20} color="var(--mantine-color-indigo-6)" stroke={1.5} />
            <Text fw={800} size="sm" tt="uppercase" lts={1}>Rekapitulasi Pembimbing</Text>
          </Group>
          <TextInput
            placeholder="Cari mahasiswa / NIM / Nama Dosen..."
            leftSection={<IconSearch size={16} />}
            value={search}
            onChange={(e) => setSearch(e.currentTarget.value)}
            w={{ base: "100%", sm: 350 }}
            radius="xl"
            size="xs"
            variant="filled"
            styles={{
              input: { fontWeight: 600 }
            }}
          />
        </Group>
      </Paper>

      <Accordion chevronPosition="right" variant="separated" radius="md">
        {dosensWithMahasiswa.map((dosen) => (
          <Accordion.Item
            value={dosen.id.toString()}
            key={dosen.id}
          >
            <Accordion.Control p="xs">
              <Group wrap="wrap" gap="sm">
                <Group wrap="nowrap" gap="sm" style={{ flex: 1 }}>
                  <Avatar size="sm" color="indigo" radius="xl" variant="light">
                    <IconUser size={16} />
                  </Avatar>
                  <Box style={{ flex: 1 }}>
                    <Text fw={700} size="sm" lineClamp={1}>
                      {dosen.nama}
                    </Text>
                    <Text size="10px" c="dimmed" fw={500}>
                      NIP: {dosen.nip || dosen.nidn || "-"}
                    </Text>
                  </Box>
                </Group>
                <Group gap={6}>
                  <Badge color="blue" variant="light" size="xs" radius="sm" fw={800}>
                    P1: {dosen.p1Count}
                  </Badge>
                  <Badge color="teal" variant="light" size="xs" radius="sm" fw={800}>
                    P2: {dosen.p2Count}
                  </Badge>
                  <Badge color="indigo" variant="filled" size="xs" radius="sm" fw={800}>
                    TOTAL: {dosen.totalCount}
                  </Badge>
                </Group>
              </Group>
            </Accordion.Control>
            <Accordion.Panel pb="xs">
              <DataTable
                data={dosen.bimbingan}
                columns={columns}
                loading={false}
                error={null}
                emptyState={
                  <Center py={30}>
                    <Stack align="center" gap={4}>
                      <IconUsers size={24} color="var(--mantine-color-gray-3)" />
                      <Text c="dimmed" size="xs" fw={500}>
                        Tidak ada mahasiswa bimbingan yang sesuai.
                      </Text>
                    </Stack>
                  </Center>
                }
              />
            </Accordion.Panel>
          </Accordion.Item>
        ))}
        {dosensWithMahasiswa.length === 0 && (
          <Center py={60}>
            <Text c="dimmed" size="sm">Tidak ada dosen ditemukan.</Text>
          </Center>
        )}
      </Accordion>

      <StudentProfileModal
        opened={profileOpened}
        onClose={closeProfile}
        student={selectedStudent}
      />
    </Stack>
  );
}
