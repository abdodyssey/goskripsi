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
} from "@mantine/core";
import {
  IconEye,
  IconCheck,
  IconX,
  IconRotate2,
  IconUsers,
  IconSearch,
  IconDotsVertical,
} from "@tabler/icons-react";
import { useDisclosure } from "@mantine/hooks";
import { modals } from "@mantine/modals";
import { notifications } from "@mantine/notifications";
import { RanpelPreviewModal } from "./ranpel-preview-modal";
import { SetPembimbingModal } from "./set-pembimbing-modal";
import { StudentProfileModal } from "@/features/mahasiswa/components/student-profile-modal";
import { PengajuanRancanganPenelitian } from "../types/ranpel.type";
import { Mahasiswa } from "@/types/user.type";
import { useState, useMemo } from "react";

import { DataTable, DataTableColumn } from "@/components/ui/data-table";

export function ManajemenRanpelList() {
  const { pengajuanList, isLoading, isError, updatePengajuan, refetch } =
    useAllPengajuan();
  const [previewOpened, { open: openPreview, close: closePreview }] =
    useDisclosure(false);
  const [pembimbingOpened, { open: openPembimbing, close: closePembimbing }] =
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
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
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
    id: string,
    statusKaprodi: "diterima" | "ditolak",
    label: string,
  ) => {
    let catatan = "";

    modals.openConfirmModal({
      title: `${label} Pengajuan`,
      children: (
        <Stack gap="md">
          <Text size="sm">
            Apakah Anda yakin ingin {label.toLowerCase()} pengajuan ini?
          </Text>
          <Textarea
            label={
              statusKaprodi === "ditolak"
                ? "Alasan Ditolak (Kaprodi)"
                : "Catatan Kaprodi"
            }
            placeholder={
              statusKaprodi === "ditolak"
                ? "Berikan alasan mengapa pengajuan ditolak..."
                : "Tambahkan catatan jika diperlukan..."
            }
            onChange={(e) => (catatan = e.target.value)}
            required={statusKaprodi === "ditolak"}
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
              catatan_kaprodi: catatan,
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
      // Must be at least verified, accepted, or rejected
      const validKaprodiStatus =
        (row.statusKaprodi === "menunggu" &&
          row.statusDosenPa === "diterima") ||
        row.statusKaprodi === "diterima" ||
        row.statusKaprodi === "ditolak";

      if (!validKaprodiStatus) return false;

      // Filter Status
      if (
        statusFilter &&
        statusFilter !== "semua" &&
        row.statusKaprodi !== statusFilter
      ) {
        return false;
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
      header: "Tgl Verified PA",
      render: (row) => (
        <Text size="xs" fw={500} c="dimmed">
          {row.tanggalReviewPa
            ? new Date(row.tanggalReviewPa).toLocaleDateString("id-ID", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })
            : "-"}
        </Text>
      ),
    },
    {
      header: "Tgl Diterima",
      render: (row) => (
        <Text
          size="xs"
          fw={700}
          c={row.tanggalReviewKaprodi ? "indigo.7" : "dimmed"}
        >
          {row.tanggalReviewKaprodi
            ? new Date(row.tanggalReviewKaprodi).toLocaleDateString("id-ID", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })
            : "-"}
        </Text>
      ),
    },
    {
      header: "Judul Penelitian",
      width: "200px",
      render: (row) => (
        <Tooltip
          label={row.rancanganPenelitian?.judulPenelitian}
          multiline
          w={300}
          withArrow
        >
          <Text size="sm" fw={500} lineClamp={2}>
            {row.rancanganPenelitian?.judulPenelitian || "Tidak Ada Judul"}
          </Text>
        </Tooltip>
      ),
    },
    {
      header: "Status",
      render: (row) => {
        let badgeColor = "gray";
        if (row.statusKaprodi === "diterima") badgeColor = "teal";
        if (row.statusKaprodi === "ditolak") badgeColor = "red";
        if (
          row.statusKaprodi === "menunggu" &&
          row.statusDosenPa === "diterima"
        )
          badgeColor = "indigo";
        if (row.statusKaprodi === "menunggu") badgeColor = "blue";
        return (
          <Badge
            color={badgeColor}
            variant="light"
            radius="xl"
            tt="uppercase"
            fz={10}
            fw={800}
            px={10}
            h={22}
          >
            {row.statusKaprodi}
          </Badge>
        );
      },
    },
    {
      header: "Aksi",
      textAlign: "right",
      render: (row) => {
        const isPembimbingSet =
          !!row.mahasiswa?.pembimbing1 && !!row.mahasiswa?.pembimbing2;

        return (
          <Group gap={4} justify="flex-end" wrap="nowrap">
            <Tooltip label="Lihat Detail">
              <ActionIcon
                variant="subtle"
                color="indigo"
                onClick={() => handlePreview(row)}
                size="lg"
                radius="md"
              >
                <IconEye size={18} stroke={1.5} />
              </ActionIcon>
            </Tooltip>

            <Menu
              withArrow
              position="bottom-end"
              shadow="sm"
              width={200}
              transitionProps={{ transition: "pop-top-right" }}
              withinPortal
            >
              <Menu.Target>
                <Tooltip label="Aksi Lainnya">
                  <ActionIcon
                    variant="subtle"
                    color="gray"
                    size="lg"
                    radius="md"
                  >
                    <IconDotsVertical size={18} stroke={1.5} />
                  </ActionIcon>
                </Tooltip>
              </Menu.Target>

              <Menu.Dropdown>
                <Menu.Label>Manajemen</Menu.Label>
                <Menu.Item
                  leftSection={
                    <IconUsers
                      style={{ width: rem(16), height: rem(16) }}
                      stroke={1.5}
                    />
                  }
                  onClick={() => handleSetPembimbing(row)}
                >
                  {row.statusKaprodi === "diterima"
                    ? "Edit Dosen Pembimbing"
                    : "Set Dosen Pembimbing"}
                </Menu.Item>

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
                          if (!isPembimbingSet) {
                            notifications.show({
                              title: "Pembimbing Belum Ditentukan",
                              message:
                                "Silakan tentukan dosen pembimbing 1 & 2 terlebih dahulu sebelum menyetujui.",
                              color: "orange",
                            });
                            handleSetPembimbing(row);
                          } else {
                            handleAction(
                              row.id.toString(),
                              "diterima",
                              "Setujui",
                            );
                          }
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
                          handleAction(row.id.toString(), "ditolak", "Tolak")
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
          </Group>
        );
      },
    },
  ];

  return (
    <Stack gap="md">
      <DataTable
        data={filteredPengajuan}
        columns={columns}
        loading={isLoading}
        error={
          isError ? "Gagal memuat data pengajuan rancanganPenelitian." : null
        }
        title="Manajemen Pengajuan Ranpel (Kaprodi)"
        description="Pantau dan ambil keputusan atas rancangan penelitian mahasiswa yang telah diverifikasi Dosen PA"
        rightSection={
          <Group gap="xs">
            <Select
              placeholder="Filter Angkatan"
              data={[
                { value: "semua", label: "Semua Angkatan" },
                ...uniqueAngkatan.map((a) => ({ value: a, label: a })),
              ]}
              value={angkatanFilter || "semua"}
              onChange={setAngkatanFilter}
              clearable={false}
              radius="md"
              w={140}
            />
            <Select
              placeholder="Filter Status"
              data={[
                { value: "semua", label: "Semua Status" },
                {
                  value: "menunggu",
                  label: "Menunggu Kaprodi",
                },
                { value: "diterima", label: "Diterima" },
                { value: "ditolak", label: "Ditolak" },
              ]}
              value={statusFilter || "semua"}
              onChange={setStatusFilter}
              clearable={false}
              radius="md"
              w={160}
            />
            <TextInput
              placeholder="Cari Nama / NIM..."
              leftSection={<IconSearch size={16} />}
              value={search}
              onChange={(e) => setSearch(e.currentTarget.value)}
              w={220}
              radius="md"
            />
          </Group>
        }
        emptyState={
          <Center py={60}>
            <Text c="dimmed" size="sm" fw={500}>
              Tidak ada pengajuan rancanganPenelitian yang perlu dikelola.
            </Text>
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

      <StudentProfileModal
        opened={profileOpened}
        onClose={closeProfile}
        student={selectedStudent}
      />
    </Stack>
  );
}
