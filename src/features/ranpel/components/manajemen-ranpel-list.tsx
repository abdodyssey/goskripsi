"use client";

import { useAllPengajuan } from "../hooks/use-ranpel";
import {
  Text,
  Badge,
  Group,
  Center,
  Stack,
  ActionIcon,
  Tooltip,
  Textarea,
  TextInput,
  Select,
  Menu,
  rem,
  Box,
  Divider,
  Paper,
  Tabs,
} from "@mantine/core";
import {
  IconEye,
  IconCheck,
  IconX,
  IconRotate2,
  IconUsers,
  IconSearch,
  IconDotsVertical,
  IconClipboardList,
} from "@tabler/icons-react";
import { useDisclosure } from "@mantine/hooks";
import { modals } from "@mantine/modals";
import { notifications } from "@mantine/notifications";
import { RanpelPreviewModal } from "./ranpel-preview-modal";
import { SetPembimbingModal } from "./set-pembimbing-modal";
import { AcceptRanpelModal } from "./accept-ranpel-modal";
import { StudentProfileModal } from "@/features/mahasiswa/components/student-profile-modal";
import { PengajuanRancanganPenelitian } from "../types/ranpel.type";
import { Mahasiswa } from "@/types/user.type";
import { useState, useMemo } from "react";
import { useAuth } from "@/features/auth/hooks/use-auth";

import { DataTable, DataTableColumn } from "@/components/ui/data-table";
import { StatusBadge } from "@/components/ui/status-badge";

export function ManajemenRanpelList() {
  const { pengajuanList, isLoading, isError, updatePengajuan, refetch } =
    useAllPengajuan();
  const [previewOpened, { open: openPreview, close: closePreview }] =
    useDisclosure(false);
  const [pembimbingOpened, { open: openPembimbing, close: closePembimbing }] =
    useDisclosure(false);
  const [acceptOpened, { open: openAccept, close: closeAccept }] =
    useDisclosure(false);
  const [selectedPengajuan, setSelectedPengajuan] =
    useState<PengajuanRancanganPenelitian | null>(null);
  const [profileOpened, { open: openProfile, close: closeProfile }] =
    useDisclosure(false);
  const [selectedStudent, setSelectedStudent] = useState<Mahasiswa | null>(
    null,
  );

  const { userResponse } = useAuth();
  const user = userResponse?.user;
  const roles = user?.roles || userResponse?.roles || [];
  const isSuperUser = roles.includes("superadmin") || roles.includes("admin");
  const userProdiId = user?.prodi_id;

  // Filter States
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>("diverifikasi");
  const [angkatanFilter, setAngkatanFilter] = useState<string | null>(null);

  const handlePreview = (item: PengajuanRancanganPenelitian) => {
    setSelectedPengajuan(item);
    openPreview();
  };

  const handleSetPembimbing = (item: PengajuanRancanganPenelitian) => {
    setSelectedPengajuan(item);
    openPembimbing();
  };

  const handleShowStudentProfile = (student: Mahasiswa) => {
    setSelectedStudent(student);
    openProfile();
  };

  const handleAction = (
    item: PengajuanRancanganPenelitian,
    statusKaprodi: "diterima" | "ditolak",
    label: string,
  ) => {
    const id = item.id.toString();
    const data = item.rancanganPenelitian;

    let comments = {
      note: "",
      masalah: "",
      solusi: "",
      hasil: "",
      data: "",
      metode: ""
    };

    modals.openConfirmModal({
      title: `${label} Pengajuan`,
      size: "md",
      children: (
        <Stack gap="md">
          <Text size="sm">
            Apakah Anda yakin ingin {label.toLowerCase()} pengajuan rancangan penelitian ini?
          </Text>

          <Textarea
            label={statusKaprodi === "ditolak" ? "Alasan Penolakan" : "Catatan / Pesan untuk Mahasiswa"}
            placeholder="Tambahkan alasan"
            onChange={(e) => (comments.note = e.target.value)}
            required={statusKaprodi === "ditolak"}
            minRows={4}
          />
        </Stack>
      ),
      labels: { confirm: label, cancel: "Batal" },
      confirmProps: { color: statusKaprodi === "diterima" ? "var(--gs-success)" : "var(--gs-danger)" },
      onConfirm: async () => {
        try {
          await updatePengajuan({
            id,
            data: {
              status_kaprodi: statusKaprodi,
              catatan_kaprodi: comments.note,
            },
          });
          notifications.show({
            title: "Berhasil",
            message: `Pengajuan berhasil di${statusKaprodi === "diterima" ? "setujui" : "tolak"}`,
            color: "var(--gs-success)",
          });
        } catch (error) {
          notifications.show({
            title: "Gagal",
            message: (error as Error).message || "Terjadi kesalahan",
            color: "var(--gs-danger)",
          });
        }
      },
    });
  };


  const pengajuanArray: PengajuanRancanganPenelitian[] = useMemo(() => {
    const list = Array.isArray(pengajuanList)
      ? (pengajuanList as PengajuanRancanganPenelitian[])
      : [];
    
    if (isSuperUser || !userProdiId) return list;

    return list.filter(p => {
      const mhsProdi = p.mahasiswa as any;
      const id = mhsProdi?.prodi_id || mhsProdi?.prodiId;
      return Number(id) === Number(userProdiId);
    });
  }, [pengajuanList, isSuperUser, userProdiId]);

  const uniqueAngkatan = useMemo(() => {
    const angkatanSet = new Set<string>();
    pengajuanArray.forEach((item) => {
      const bAngkatan =
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        item.mahasiswa?.angkatan || (item.mahasiswa as any)?.angkatan;
      if (bAngkatan) {
        angkatanSet.add(bAngkatan.toString());
      }
    });
    return Array.from(angkatanSet).sort();
  }, [pengajuanArray]);

  // Kaprodi primarily manages documents that are ALREADY verified by Dosen PA
  const filteredPengajuan = useMemo(() => {
    return pengajuanArray.filter((row) => {
      // Must be at least verified, accepted, rejected, or waiting for PA
      const validKaprodiStatus =
        row.statusDosenPa === "menunggu" ||
        row.statusDosenPa === "ditolak" ||
        (row.statusKaprodi === "menunggu" &&
          row.statusDosenPa === "diverifikasi") ||
        row.statusKaprodi === "diterima" ||
        row.statusKaprodi === "ditolak";

      if (!validKaprodiStatus) return false;

      // Filter Status
      if (statusFilter && statusFilter !== "semua") {
        if (statusFilter === "menunggu_pa") {
          if (row.statusDosenPa !== "menunggu") return false;
        } else if (statusFilter === "diverifikasi") {
          if (
            row.statusKaprodi !== "menunggu" ||
            row.statusDosenPa !== "diverifikasi"
          )
            return false;
        } else if (statusFilter === "ditolak") {
          if (row.statusKaprodi !== "ditolak" && row.statusDosenPa !== "ditolak") {
            return false;
          }
        } else if (row.statusKaprodi !== statusFilter) {
          return false;
        }
      }

      // Filter Angkatan
      const mhsAngkatan = row.mahasiswa?.angkatan;
      if (
        angkatanFilter &&
        angkatanFilter !== "semua" &&
        mhsAngkatan?.toString() !== angkatanFilter
      ) {
        return false;
      }

      // Filter Search (Name/NIM)
      if (search) {
        const searchLower = (search || "").toLowerCase();
        const nama = (row.mahasiswa?.user?.nama || "").toLowerCase();
        const nim = (row.mahasiswa?.nim || "").toLowerCase();
        if (!nama.includes(searchLower) && !nim.includes(searchLower)) {
          return false;
        }
      }

      return true;
    });
  }, [pengajuanArray, search, statusFilter, angkatanFilter]);

  const counts = useMemo(() => {
    const baseList = pengajuanArray.filter((row) => 
      row.statusDosenPa === "menunggu" ||
      row.statusDosenPa === "ditolak" ||
      (row.statusKaprodi === "menunggu" && row.statusDosenPa === "diverifikasi") ||
      row.statusKaprodi === "diterima" ||
      row.statusKaprodi === "ditolak"
    );

    return {
      semua: baseList.length,
      menunggu_pa: baseList.filter(r => r.statusDosenPa === "menunggu").length,
      diverifikasi: baseList.filter(r => r.statusKaprodi === "menunggu" && r.statusDosenPa === "diverifikasi").length,
      diterima: baseList.filter(r => r.statusKaprodi === "diterima").length,
      ditolak: baseList.filter(r => r.statusKaprodi === "ditolak" || r.statusDosenPa === "ditolak").length,
    };
  }, [pengajuanArray]);

  const columns: DataTableColumn<PengajuanRancanganPenelitian>[] = [
    {
      header: "Mahasiswa",
      render: (row) => (
        <Stack
          gap={0}
          onClick={() =>
            row.mahasiswa && handleShowStudentProfile(row.mahasiswa)
          }
        >
          <Tooltip label="Klik untuk lihat profil">
            <Text size="sm" fw={700} className="text-gs-primary">
              {row.mahasiswa?.user?.nama}
            </Text>
          </Tooltip>
          <Text size="xs" c="dimmed">
            {row.mahasiswa?.nim}
          </Text>
        </Stack>
      ),
    },
    {
      header: "Timeline",
      width: "180px",
      render: (row) => (
        <Stack gap={8}>
          <Box>
            <Group gap={6} mb={2}>
              <Box w={6} h={6} style={{ borderRadius: "50%", backgroundColor: "var(--mantine-color-gray-4)" }} />
              <Text size="10px" fw={600} c="dimmed" tt="uppercase" lts={0.5}>Verified PA</Text>
            </Group>
            <Text size="xs" fw={600} pl={12}>
              {row.tanggalReviewPa
                ? new Date(row.tanggalReviewPa).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })
                : "-"}
            </Text>
          </Box>
          {row.statusKaprodi === "diterima" && row.tanggalReviewKaprodi && (
            <Box>
              <Group gap={6} mb={2}>
                <Box w={6} h={6} style={{ borderRadius: "50%", backgroundColor: "var(--gs-success)" }} />
                <Text size="10px" fw={700} className="text-gs-success-text" tt="uppercase" lts={0.5}>Diterima KPR</Text>
              </Group>
              <Text size="xs" fw={700} className="text-gs-success-text" pl={12}>
                {new Date(row.tanggalReviewKaprodi).toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </Text>
            </Box>
          )}
        </Stack>
      ),
    },
    {
      header: "Judul Penelitian",
      render: (row) => (
        <Stack gap={4} py={4}>
          <Text size="sm" fw={600} lineClamp={2} style={{ lineHeight: 1.4 }}>
            {row.rancanganPenelitian?.judulPenelitian || "Tidak Ada Judul"}
          </Text>
          <Text size="10px" c="dimmed" fw={500}>
            ID: {row.id}
          </Text>
        </Stack>
      ),
    },
    {
      header: "Status",
      width: "140px",
      render: (row) => {
        let status = row.statusKaprodi;
        if (row.statusKaprodi === "ditolak" || row.statusDosenPa === "ditolak") {
          status = "ditolak";
        } else if (
          row.statusDosenPa === "diverifikasi" &&
          row.statusKaprodi === "menunggu"
        ) {
          status = "diverifikasi";
        } else if (row.statusDosenPa === "menunggu") {
          status = "menunggu";
        }

        return <StatusBadge status={status} size="md" />;
      },
    },
    {
      header: "Aksi",
      textAlign: "right",
      render: (row) => {
        const isPembimbingSet =
          !!row.mahasiswa?.pembimbing1 && !!row.mahasiswa?.pembimbing2;

        return (
          <Menu
            withArrow
            position="bottom-end"
            shadow="sm"
            width={200}
            transitionProps={{ transition: "pop-top-right" }}
            withinPortal
          >
            <Menu.Target>
              <ActionIcon
                variant="subtle"
                color="gray"
                size="lg"
                radius="md"
              >
                <IconDotsVertical size={18} stroke={1.5} />
              </ActionIcon>
            </Menu.Target>

            <Menu.Dropdown>
              <Menu.Label>Tindakan</Menu.Label>
              <Menu.Item
                leftSection={<IconEye size={16} stroke={1.5} />}
                onClick={() => handlePreview(row)}
              >
                Lihat Detail
              </Menu.Item>
              <Menu.Divider />
              <Menu.Label>Manajemen</Menu.Label>
                {row.statusKaprodi === "diterima" && (
                  <Menu.Item
                    leftSection={
                      <IconUsers
                        style={{ width: rem(16), height: rem(16) }}
                        stroke={1.5}
                      />
                    }
                    onClick={() => handleSetPembimbing(row)}
                  >
                    Edit Dosen Pembimbing
                  </Menu.Item>
                )}

                {row.statusKaprodi === "menunggu" &&
                  row.statusDosenPa === "diverifikasi" && (
                    <>
                      <Menu.Divider />
                      <Menu.Label>Keputusan Kaprodi</Menu.Label>
                      <Menu.Item
                        color="var(--gs-success)"
                        leftSection={
                          <IconCheck
                            style={{ width: rem(16), height: rem(16) }}
                            stroke={2}
                          />
                        }
                        onClick={() => {
                          setSelectedPengajuan(row);
                          openAccept();
                        }}
                      >
                        Setujui (Diterima)
                      </Menu.Item>
                      <Menu.Item
                        color="var(--gs-danger)"
                        leftSection={
                          <IconX
                            style={{ width: rem(16), height: rem(16) }}
                            stroke={2}
                          />
                        }
                        onClick={() =>
                          handleAction(row, "ditolak", "Tolak")
                        }
                      >
                        Tolak
                      </Menu.Item>
                    </>
                  )}

              </Menu.Dropdown>
            </Menu>
        );
      },
    },
  ];

  return (
    <Stack gap="lg">
      <Paper 
        withBorder 
        p="md" 
        radius="xl" 
        shadow="sm" 
        className="bg-white/50 backdrop-blur-md"
        style={{ border: '1px solid rgba(0,0,0,0.05)' }}
      >
        <Stack gap="lg">
          {/* Top Row: Tabs */}
          <Group justify="space-between" align="center">
            <Tabs
              variant="pills"
              value={statusFilter || "semua"}
              onChange={setStatusFilter}
              radius="xl"
              classNames={{
                tab: "data-[active]:shadow-md data-[active]:bg-white data-[active]:border-slate-100"
              }}
              styles={{
                tab: {
                  fontWeight: 800,
                  fontSize: rem(10),
                  padding: `${rem(8)} ${rem(16)}`,
                  transition: 'all 0.2s ease',
                  textTransform: 'uppercase',
                  letterSpacing: rem(1),
                  border: '1px solid transparent',
                },
                list: {
                  gap: rem(6),
                  backgroundColor: '#f8fafc',
                  padding: rem(4),
                  borderRadius: rem(100),
                  border: '1px solid #f1f5f9'
                }
              }}
            >
              <Tabs.List>
                <Tabs.Tab value="semua">SEMUA ({counts.semua})</Tabs.Tab>
                <Tabs.Tab
                  value="menunggu_pa"
                  color="var(--gs-warning)"
                  leftSection={<IconRotate2 size={14} stroke={2.5} />}
                >
                  MENUNGGU ({counts.menunggu_pa})
                </Tabs.Tab>
                <Tabs.Tab
                  value="diverifikasi"
                  color="var(--gs-primary)"
                  leftSection={<IconRotate2 size={14} stroke={2.5} />}
                >
                  DIVERIFIKASI ({counts.diverifikasi})
                </Tabs.Tab>
                <Tabs.Tab
                  value="diterima"
                  color="var(--gs-success)"
                  leftSection={<IconCheck size={14} stroke={2.5} />}
                >
                  DITERIMA ({counts.diterima})
                </Tabs.Tab>
                <Tabs.Tab
                  value="ditolak"
                  color="var(--gs-danger)"
                  leftSection={<IconX size={14} stroke={2.5} />}
                >
                  DITOLAK ({counts.ditolak})
                </Tabs.Tab>
              </Tabs.List>
            </Tabs>

            <Text size="xs" fw={700} c="dimmed" tt="uppercase" lts={1} visibleFrom="md">
              Filter Manajemen
            </Text>
          </Group>

          <Divider color="slate.1" variant="dashed" />

          {/* Bottom Row: Search & Filters */}
          <Group gap="md">
            <Select
              size="md"
              placeholder="Filter Angkatan"
              leftSection={<IconUsers size={18} className="text-gs-primary" />}
              data={[
                { value: "semua", label: "Semua Angkatan" },
                ...uniqueAngkatan.map((a) => ({ value: a, label: `Angkatan ${a}` })),
              ]}
              value={angkatanFilter || "semua"}
              onChange={setAngkatanFilter}
              radius="lg"
              w={{ base: "100%", sm: 220 }}
              variant="filled"
              styles={{
                input: {
                  fontWeight: 700,
                  fontSize: rem(13),
                  backgroundColor: 'white',
                  border: '1px solid #f1f5f9'
                }
              }}
            />
            
            <TextInput
              size="md"
              placeholder="Cari Mahasiswa berdasarkan Nama atau NIM..."
              leftSection={<IconSearch size={18} className="text-gs-primary" />}
              value={search}
              onChange={(e) => setSearch(e.currentTarget.value)}
              style={{ flexGrow: 1 }}
              radius="lg"
              variant="filled"
              styles={{
                input: {
                  fontWeight: 700,
                  fontSize: rem(13),
                  backgroundColor: 'white',
                  border: '1px solid #f1f5f9'
                }
              }}
            />
          </Group>
        </Stack>
      </Paper>

      <DataTable
        data={filteredPengajuan}
        columns={columns}
        loading={isLoading}
        error={
          isError ? "Gagal memuat data pengajuan rancanganPenelitian." : null
        }
        title="Daftar Pengajuan Mahasiswa"
        description="Kelola pengajuan yang telah diverifikasi oleh Dosen PA"
        emptyState={
          <Center py={60}>
            <Stack gap="xs" align="center">
              <IconClipboardList size={40} stroke={1.5} color="var(--mantine-color-gray-4)" />
              <Text c="dimmed" size="sm" fw={500}>
                Tidak ada data yang cocok dengan filter Anda.
              </Text>
            </Stack>
          </Center>
        }
      />

      <RanpelPreviewModal
        opened={previewOpened}
        onClose={closePreview}
        pengajuan={selectedPengajuan}
        studentName={selectedPengajuan?.mahasiswa?.user?.nama as string}
        studentNim={selectedPengajuan?.mahasiswa?.nim as string}
      />

      <SetPembimbingModal
        opened={pembimbingOpened}
        onClose={closePembimbing}
        mahasiswaId={selectedPengajuan?.mahasiswa?.id || null}
        currentP1={
          pengajuanList?.find(p => p.id === selectedPengajuan?.id)?.mahasiswa?.pembimbing1?.id || 
          selectedPengajuan?.mahasiswa?.pembimbing1?.id || null
        }
        currentP2={
          pengajuanList?.find(p => p.id === selectedPengajuan?.id)?.mahasiswa?.pembimbing2?.id || 
          selectedPengajuan?.mahasiswa?.pembimbing2?.id || null
        }
        onSuccess={refetch}
      />

      <AcceptRanpelModal
        opened={acceptOpened}
        onClose={closeAccept}
        pengajuan={selectedPengajuan}
        onSuccess={refetch}
        updatePengajuan={updatePengajuan}
      />

      <StudentProfileModal
        opened={profileOpened}
        onClose={closeProfile}
        student={selectedStudent}
      />
    </Stack>
  );
}
