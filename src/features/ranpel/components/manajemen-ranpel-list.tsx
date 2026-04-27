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

  // Filter States
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>("menunggu");
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
      confirmProps: { color: statusKaprodi === "diterima" ? "green" : "red" },
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
            color: "green",
          });
        } catch (error) {
          notifications.show({
            title: "Gagal",
            message: (error as Error).message || "Terjadi kesalahan",
            color: "red",
          });
        }
      },
    });
  };

  const handleUndo = (id: string) => {
    modals.openConfirmModal({
      title: "Undo Keputusan",
      children: (
        <Text size="sm">
          Apakah Anda yakin ingin membatalkan keputusan ini? Status akan kembali
          menjadi TERVERIFIKASI.
        </Text>
      ),
      labels: { confirm: "Undo Keputusan", cancel: "Batal" },
      confirmProps: { color: "orange" },
      onConfirm: async () => {
        try {
          await updatePengajuan({
            id,
            data: { status_kaprodi: "menunggu" },
          });
          notifications.show({
            title: "Berhasil",
            message: "Keputusan berhasil dibatalkan",
            color: "green",
          });
        } catch (error) {
          notifications.show({
            title: "Gagal",
            message: (error as Error).message || "Terjadi kesalahan",
            color: "red",
          });
        }
      },
    });
  };

  const pengajuanArray: PengajuanRancanganPenelitian[] = useMemo(() => {
    return Array.isArray(pengajuanList)
      ? (pengajuanList as PengajuanRancanganPenelitian[])
      : [];
  }, [pengajuanList]);

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
        (row.statusKaprodi === "menunggu" &&
          row.statusDosenPa === "diterima") ||
        row.statusKaprodi === "diterima" ||
        row.statusKaprodi === "ditolak";

      if (!validKaprodiStatus) return false;

      // Filter Status
      if (statusFilter && statusFilter !== "semua") {
        if (statusFilter === "menunggu_pa") {
          if (row.statusDosenPa !== "menunggu") return false;
        } else if (statusFilter === "menunggu") {
          if (
            row.statusKaprodi !== "menunggu" ||
            row.statusDosenPa !== "diterima"
          )
            return false;
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
            <Text size="sm" fw={700} c="indigo.7">
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
              <Text size="10px" fw={800} c="dimmed" tt="uppercase" lts={0.5}>Verified PA</Text>
            </Group>
            <Text size="xs" fw={700} pl={12}>
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
                <Box w={6} h={6} style={{ borderRadius: "50%", backgroundColor: "var(--mantine-color-teal-5)" }} />
                <Text size="10px" fw={800} c="teal.7" tt="uppercase" lts={0.5}>Diterima KPR</Text>
              </Group>
              <Text size="xs" fw={800} c="teal.9" pl={12}>
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
          <Text size="sm" fw={700} lineClamp={2} style={{ lineHeight: 1.4 }}>
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
          row.statusDosenPa === "diterima" &&
          row.statusKaprodi === "menunggu"
        ) {
          status = "proses";
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
                  row.statusDosenPa === "diterima" && (
                    <>
                      <Menu.Divider />
                      <Menu.Label>Keputusan Kaprodi</Menu.Label>
                      <Menu.Item
                        color="teal"
                        leftSection={
                          <IconCheck
                            style={{ width: rem(16), height: rem(16) }}
                            stroke={1.5}
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
                        color="red"
                        leftSection={
                          <IconX
                            style={{ width: rem(16), height: rem(16) }}
                            stroke={1.5}
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

                {(row.statusKaprodi === "ditolak" ||
                  row.statusKaprodi === "diterima") && (
                  <>
                    <Menu.Divider />
                    <Menu.Item
                      color="orange"
                      leftSection={
                        <IconRotate2
                          style={{ width: rem(16), height: rem(16) }}
                          stroke={1.5}
                        />
                      }
                      onClick={() => handleUndo(row.id.toString())}
                    >
                      Undo Keputusan
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
      <Paper withBorder p="sm" radius="lg" shadow="xs">
        <Stack gap="md">
          <Group justify="space-between" align="center">
            <Tabs
              variant="pills"
              value={statusFilter || "semua"}
              onChange={setStatusFilter}
              radius="xl"
              styles={{
                tab: {
                  fontWeight: 700,
                  fontSize: rem(11),
                  padding: `${rem(6)} ${rem(12)}`,
                  transition: 'background-color 0.2s ease, color 0.2s ease',
                  textTransform: 'uppercase',
                  letterSpacing: rem(0.5),
                },
                list: {
                  gap: rem(4),
                }
              }}
            >
              <Tabs.List>
                <Tabs.Tab value="semua">SEMUA</Tabs.Tab>
                <Tabs.Tab
                  value="menunggu_pa"
                  color="orange"
                  leftSection={<IconRotate2 size={14} />}
                >
                  BELUM ACC PA
                </Tabs.Tab>
                <Tabs.Tab
                  value="menunggu"
                  color="indigo"
                  leftSection={<IconRotate2 size={14} />}
                >
                  MENUNGGU
                </Tabs.Tab>
                <Tabs.Tab
                  value="diterima"
                  color="teal"
                  leftSection={<IconCheck size={14} />}
                >
                  DITERIMA
                </Tabs.Tab>
                <Tabs.Tab
                  value="ditolak"
                  color="red"
                  leftSection={<IconX size={14} />}
                >
                  DITOLAK
                </Tabs.Tab>
              </Tabs.List>
            </Tabs>

            <Group gap="xs" style={{ flexGrow: 1 }} justify="flex-end">
              <Select
                size="sm"
                placeholder="Angkatan"
                data={[
                  { value: "semua", label: "Semua Angkatan" },
                  ...uniqueAngkatan.map((a) => ({ value: a, label: a })),
                ]}
                value={angkatanFilter || "semua"}
                onChange={setAngkatanFilter}
                radius="md"
                w={{ base: "100%", sm: 150 }}
                variant="filled"
                styles={{
                  input: {
                    fontWeight: 600,
                    fontSize: rem(12),
                  }
                }}
              />
              <TextInput
                size="sm"
                placeholder="Cari Nama / NIM..."
                leftSection={<IconSearch size={16} />}
                value={search}
                onChange={(e) => setSearch(e.currentTarget.value)}
                w={{ base: "100%", sm: 220 }}
                radius="md"
                variant="filled"
                styles={{
                  input: {
                    fontWeight: 600,
                    fontSize: rem(12),
                  }
                }}
              />
            </Group>
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
        currentP1={selectedPengajuan?.mahasiswa?.pembimbing1?.id || null}
        currentP2={selectedPengajuan?.mahasiswa?.pembimbing2?.id || null}
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
