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

    // Filter students to matching search term
    const searchStr = (search || "").toLowerCase();

    return listDosen
      .map((dosen) => {
        const bimbingan = listMhs
          .filter((item) => {
            const p1Val = item.pembimbing_1;
            const p2Val = item.pembimbing_2;
            const p1Id = typeof p1Val === "object" ? p1Val?.id : p1Val;
            const p2Id = typeof p2Val === "object" ? p2Val?.id : p2Val;

            const isP1 = p1Id?.toString() === dosen.id.toString();
            const isP2 = p2Id?.toString() === dosen.id.toString();

            if (!(isP1 || isP2)) return false;

            const nama = item.nama || "";
            const nim = item.nim || "";

            if (!searchStr) return true;

            return (
              (nama || "").toLowerCase().includes(searchStr) ||
              (nim || "").toLowerCase().includes(searchStr)
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
          bimbingan: bimbingan,
          p1Count: bimbingan.filter((b) => b.peran === "Pembimbing 1").length,
          p2Count: bimbingan.filter((b) => b.peran === "Pembimbing 2").length,
          totalCount: bimbingan.length,
        };
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
    <Stack gap="lg">
      <Paper
        withBorder
        p="md"
        radius="md"
        bg={
          isDark
            ? "var(--mantine-color-slate-9)"
            : "var(--mantine-color-slate-0)"
        }
        style={{
          borderColor: isDark
            ? "var(--mantine-color-slate-8)"
            : "var(--mantine-color-slate-2)",
        }}
      >
        <Group justify="space-between" align="center">
          <Stack gap={4}>
            <Text fw={700} className="dark:text-white" size="lg">
              Rekapitulasi Dosen Pembimbing
            </Text>
            <Text size="sm" c="dimmed">
              Distribusi beban bimbingan skripsi untuk seluruh dosen
            </Text>
          </Stack>
          <TextInput
            placeholder="Cari mahasiswa / NIM..."
            leftSection={<IconSearch size={16} />}
            value={search}
            onChange={(e) => setSearch(e.currentTarget.value)}
            style={{ width: 300 }}
            radius="md"
            size="md"
          />
        </Group>
      </Paper>

      <Accordion chevronPosition="right" variant="separated">
        {dosensWithMahasiswa.map((dosen) => (
          <Accordion.Item
            value={dosen.id.toString()}
            key={dosen.id}
            bg={
              isDark
                ? "var(--mantine-color-slate-9)"
                : "var(--mantine-color-white)"
            }
            style={{
              borderColor: isDark
                ? "var(--mantine-color-slate-8)"
                : "var(--mantine-color-slate-2)",
            }}
          >
            <Accordion.Control>
              <Group wrap="nowrap" gap="md">
                <Avatar color="indigo" radius="md" variant="light">
                  <IconUser size={20} />
                </Avatar>
                <Box style={{ flex: 1 }}>
                  <Text fw={700} size="md" className="dark:text-white">
                    {dosen.nama}
                  </Text>
                  <Text size="xs" c="dimmed">
                    NIP / NIDN: {dosen.nip || dosen.nidn || "-"}
                  </Text>
                </Box>
                <Group gap="xs">
                  <Badge color="blue.6" variant="light" size="md">
                    P1: {dosen.p1Count} Mahasiswa
                  </Badge>
                  <Badge color="cyan.6" variant="light" size="md">
                    P2: {dosen.p2Count} Mahasiswa
                  </Badge>
                  <Badge color="indigo.7" variant="filled" size="md">
                    Total: {dosen.totalCount}
                  </Badge>
                </Group>
              </Group>
            </Accordion.Control>
            <Accordion.Panel pb="md">
              <DataTable
                data={dosen.bimbingan}
                columns={columns}
                loading={false}
                error={null}
                emptyState={
                  <Center py={40}>
                    <Stack align="center" gap="sm">
                      <IconUsers
                        size={32}
                        color="var(--mantine-color-slate-3)"
                        stroke={1.5}
                      />
                      <Text c="dimmed" size="sm" fw={500}>
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
            <Text c="dimmed">Tidak ada dosen ditemukan.</Text>
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
