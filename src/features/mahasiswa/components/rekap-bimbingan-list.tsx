"use client";

import { useMahasiswa, useDosens } from "../hooks/use-mahasiswa";
import { useAllPengajuan } from "../../ranpel/hooks/use-ranpel";
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
  RingProgress,
} from "@mantine/core";
import { IconSearch, IconUser, IconUsers } from "@tabler/icons-react";
import { useDisclosure } from "@mantine/hooks";
import { Mahasiswa, Dosen } from "@/types/user.type";
import { useState, useMemo } from "react";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { StudentProfileModal } from "./student-profile-modal";
import { DataTable, DataTableColumn } from "@/components/ui/data-table";

export function RekapBimbinganList() {
  const {
    mahasiswaList,
    isLoading: mhsLoading,
    isError: mhsError,
  } = useMahasiswa();
  const {
    pengajuanList,
    isLoading: pengajuanLoading,
  } = useAllPengajuan();
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

  const { userResponse } = useAuth();
  const user = userResponse?.user;
  const roles = user?.roles || userResponse?.roles || [];
  const isSuperUser = roles.includes("superadmin") || roles.includes("admin");
  const userProdiId = user?.prodi_id;

  const { colorScheme } = useMantineColorScheme();
  const isDark = colorScheme === "dark";

  const dosensWithMahasiswa = useMemo(() => {
    const listMhsBasic = (mahasiswaList as Mahasiswa[]) || [];
    const listPengajuan = (pengajuanList || []) as any[];
    
    // Extract mahasiswas from pengajuan and merge with basic list
    const mhsFromPengajuan = listPengajuan.map(p => p.mahasiswa).filter(Boolean);
    
    // Combine and deduplicate by NIM
    const combinedMhs = [...listMhsBasic];
    mhsFromPengajuan.forEach(m => {
      if (!combinedMhs.find(existing => existing.nim === m.nim)) {
        combinedMhs.push(m);
      } else {
        // If already exists, update with possibly newer data from pengajuan
        const idx = combinedMhs.findIndex(existing => existing.nim === m.nim);
        combinedMhs[idx] = { ...combinedMhs[idx], ...m };
      }
    });

    const listMhs = combinedMhs.filter(m => {
      if (isSuperUser || !userProdiId) return true;
      const id = (m as any).prodi_id || (m as any).prodiId;
      return Number(id) === Number(userProdiId);
    });

    const listDosen = ((dosensData as Dosen[]) || []).filter(d => {
      if (isSuperUser || !userProdiId) return true;
      const id = (d as any).prodi_id || (d as any).prodiId;
      return Number(id) === Number(userProdiId);
    });
    const searchStr = (search || "").toLowerCase();

    return listDosen
      .map((dosen) => {
        // First, check if the lecturer matches the search
        const lecturerMatches = dosen.nama.toLowerCase().includes(searchStr);

        // Then filter students
        const bimbingan = listMhs
          .filter((item) => {
            // Get all possible IDs for Pembimbing 1
            const p1Val = item.pembimbing_1 || (item as any).pembimbing1 || (item as any).pembimbing1Rel;
            const p1Id = typeof p1Val === "object" ? p1Val?.id : p1Val;
            const p1AltId = (item as any).pembimbing1_id || (item as any).pembimbing1Id || (item as any).pembimbing_1Id;

            // Get all possible IDs for Pembimbing 2
            const p2Val = item.pembimbing_2 || (item as any).pembimbing2 || (item as any).pembimbing2Rel;
            const p2Id = typeof p2Val === "object" ? p2Val?.id : p2Val;
            const p2AltId = (item as any).pembimbing2_id || (item as any).pembimbing2Id || (item as any).pembimbing_2Id;

            // Get all possible IDs for this Dosen
            const dosenId = dosen.id?.toString();
            const userId = dosen.user?.id?.toString() || (dosen as any).user_id?.toString() || (dosen as any).userId?.toString();

            const isP1 = [p1Id, p1AltId].some(id => {
              if (!id) return false;
              const idStr = id.toString();
              return idStr === dosenId || (userId && idStr === userId);
            }) || (typeof p1Val === "object" && (
              (p1Val?.nama && p1Val.nama.toLowerCase().trim() === dosen.nama.toLowerCase().trim()) ||
              (p1Val?.nip && p1Val.nip === dosen.nip) ||
              (p1Val?.nidn && p1Val.nidn === dosen.nidn)
            )) || ((item as any).pembimbing1?.nama?.toLowerCase().trim() === dosen.nama.toLowerCase().trim());

            const isP2 = [p2Id, p2AltId].some(id => {
              if (!id) return false;
              const idStr = id.toString();
              return idStr === dosenId || (userId && idStr === userId);
            }) || (typeof p2Val === "object" && (
              (p2Val?.nama && p2Val.nama.toLowerCase().trim() === dosen.nama.toLowerCase().trim()) ||
              (p2Val?.nip && p2Val.nip === dosen.nip) ||
              (p2Val?.nidn && p2Val.nidn === dosen.nidn)
            )) || ((item as any).pembimbing2?.nama?.toLowerCase().trim() === dosen.nama.toLowerCase().trim());

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
            const dosenId = dosen.id?.toString();
            const userId = dosen.user?.id?.toString() || (dosen as any).user_id?.toString() || (dosen as any).userId?.toString();
            
            const p1Val = item.pembimbing_1 || (item as any).pembimbing1 || (item as any).pembimbing1Rel;
            const p1Id = typeof p1Val === "object" ? p1Val?.id : p1Val;
            const p1AltId = (item as any).pembimbing1_id || (item as any).pembimbing1Id || (item as any).pembimbing_1Id;

            const p2Val = item.pembimbing_2 || (item as any).pembimbing2 || (item as any).pembimbing2Rel;
            const p2Id = typeof p2Val === "object" ? p2Val?.id : p2Val;
            const p2AltId = (item as any).pembimbing2_id || (item as any).pembimbing2Id || (item as any).pembimbing_2Id;

            const isP1 = [p1Id, p1AltId].some(id => {
              if (!id) return false;
              const idStr = id.toString();
              return idStr === dosenId || (userId && idStr === userId);
            }) || (typeof p1Val === "object" && (
              (p1Val?.nama && p1Val.nama.toLowerCase().trim() === dosen.nama.toLowerCase().trim()) ||
              (p1Val?.nip && p1Val.nip === dosen.nip) ||
              (p1Val?.nidn && p1Val.nidn === dosen.nidn)
            )) || ((item as any).pembimbing1?.nama?.toLowerCase().trim() === dosen.nama.toLowerCase().trim());

            const isP2 = [p2Id, p2AltId].some(id => {
              if (!id) return false;
              const idStr = id.toString();
              return idStr === dosenId || (userId && idStr === userId);
            }) || (typeof p2Val === "object" && (
              (p2Val?.nama && p2Val.nama.toLowerCase().trim() === dosen.nama.toLowerCase().trim()) ||
              (p2Val?.nip && p2Val.nip === dosen.nip) ||
              (p2Val?.nidn && p2Val.nidn === dosen.nidn)
            )) || ((item as any).pembimbing2?.nama?.toLowerCase().trim() === dosen.nama.toLowerCase().trim());

            return {
              ...item,
              peran: isP1 ? "Pembimbing 1" : isP2 ? "Pembimbing 2" : "Pembimbing",
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
  }, [mahasiswaList, pengajuanList, dosensData, search]);

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
            <Text size="sm" fw={700} className="text-gs-primary">
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
          color="var(--gs-primary)"
          radius="sm"
          tt="uppercase"
          fz={10}
          fw={700}
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
            color={status === "aktif" ? "var(--gs-success)" : "var(--gs-text-muted)"}
            radius="xl"
            tt="uppercase"
            fz={10}
            fw={700}
          >
            {status}
          </Badge>
        );
      },
    },
  ];

  if (mhsLoading || dosenLoading || pengajuanLoading) {
    return (
      <Center py={100}>
        <Text c="dimmed">Memuat data rekapitulasi bimbingan...</Text>
      </Center>
    );
  }

  if (mhsError || dosenError) {
    return (
      <Center py={100}>
        <Text className="text-gs-danger" fw={700}>Terjadi kesalahan saat memuat data.</Text>
      </Center>
    );
  }

  return (
    <Stack gap="md">
      <Paper withBorder p="xs" radius="xl" shadow="sm">
        <Group justify="space-between" px="xs" wrap="wrap">
          <Group gap="xs">
            <IconUsers size={20} className="text-gs-primary" stroke={1.5} />
            <Text fw={800} size="sm" tt="uppercase" lts={1} className="text-gs-text-primary">Rekapitulasi Pembimbing</Text>
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
                  <Avatar size="sm" className="bg-gs-bg-overlay text-gs-primary" radius="xl" variant="light">
                    <IconUser size={16} />
                  </Avatar>
                  <Box style={{ flex: 1 }}>
                    <Text fw={600} size="sm" lineClamp={1}>
                      {dosen.nama}
                    </Text>
                    <Text size="10px" c="dimmed" fw={500}>
                      NIP: {dosen.nip || dosen.nidn || "-"}
                    </Text>
                  </Box>
                </Group>
                <Group gap="xl" wrap="nowrap">
                  <Group gap={6} visibleFrom="sm">
                    <Badge color="var(--gs-primary)" variant="light" size="xs" radius="sm" fw={700}>
                      P1: {dosen.p1Count}
                    </Badge>
                    <Badge color="var(--gs-text-muted)" variant="light" size="xs" radius="sm" fw={700}>
                      P2: {dosen.p2Count}
                    </Badge>
                  </Group>
                  <RingProgress
                    size={45}
                    thickness={4}
                    roundCaps
                    sections={[
                      { value: (dosen.p1Count / 15) * 100, color: "var(--gs-primary)" },
                      { value: (dosen.p2Count / 15) * 100, color: "var(--gs-text-muted)" },
                    ]}
                    label={
                      <Center>
                        <Text size="xs" fw={600} style={{ fontSize: "10px" }}>
                          {dosen.totalCount}
                        </Text>
                      </Center>
                    }
                  />
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
                      <IconUsers size={24} color="var(--gs-border-strong)" />
                      <Text c="dimmed" size="xs" fw={700}>
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
