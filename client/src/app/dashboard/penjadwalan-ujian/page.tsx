"use client";

import { useAuth } from "@/features/auth/hooks/use-auth";
import {
  Container,
  Text,
  Badge,
  Group,
  Button,
  Stack,
  Modal,
  ScrollArea,
  ActionIcon,
  Tooltip,
  Grid,
  Paper,
  Select,
  TextInput,
  Tabs,
  Center,
  Loader,
  Menu,
} from "@mantine/core";
import { PageHeader } from "@/components/PageHeader/PageHeader";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  IconCalendarPlus,
  IconCalendarEvent,
  IconPrinter,
  IconDotsVertical,
} from "@tabler/icons-react";
import { useDisclosure } from "@mantine/hooks";
import { useState } from "react";
import { notifications } from "@mantine/notifications";
import { useUjian } from "@/features/ujian/hooks/use-ujian";
import { pendaftaranUjianService } from "@/features/pendaftaran-ujian/api/pendaftaran-ujian.service";
import { ujianService } from "@/features/ujian/api/ujian.service";
import {
  PendaftaranUjian,
  PengujiUjian,
} from "@/features/pendaftaran-ujian/types/pendaftaran-ujian.type";

interface SchedulingFormData {
  pendaftaranUjian: PendaftaranUjian;
  nilaiDifinalisasi?: boolean;
  rooms: { id: number; namaRuangan: string }[];
  lecturers: { id: number; user: { nama: string }; nama?: string }[];
  defaultExaminers?: { dosenId: number | string; peran: string }[];
}

const HARI_NAMES = [
  "Minggu",
  "Senin",
  "Selasa",
  "Rabu",
  "Kamis",
  "Jumat",
  "Sabtu",
];

const TIME_OPTIONS = Array.from({ length: 23 }, (_, i) => {
  const totalMinutes = 7 * 60 + i * 30;
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  const time = `${hours.toString().padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")}`;
  return { value: time, label: time };
});

export default function PenjadwalanUjianPage() {
  const { userResponse, isLoadingProfile, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  const user = userResponse?.user;
  const roles = user?.roles || userResponse?.roles || [];
  const isSekprodi = roles.some((r) => r.toLowerCase() === "sekprodi");

  // ---- Modals ----
  const [formOpened, { open: openForm, close: closeForm }] =
    useDisclosure(false);
  const [selectedItem, setSelectedItem] = useState<PendaftaranUjian | null>(
    null,
  );

  // ---- Form state ----
  const [formTanggal, setFormTanggal] = useState("");
  const [formWaktuMulai, setFormWaktuMulai] = useState<string | null>(null);
  const [formWaktuSelesai, setFormWaktuSelesai] = useState<string | null>(null);
  const [formRuanganId, setFormRuanganId] = useState<string | null>(null);
  const [formKetuaPenguji, setFormKetuaPenguji] = useState<string | null>(null);
  const [formSekretaris, setFormSekretaris] = useState<string | null>(null);
  const [formPenguji1, setFormPenguji1] = useState<string | null>(null);
  const [formPenguji2, setFormPenguji2] = useState<string | null>(null);
  const [editingUjianId, setEditingUjianId] = useState<string | null>(null);

  const { createScheduling, isCreating, updateScheduling, isUpdating } =
    useUjian();

  const [activeTab, setActiveTab] = useState<string>("belum");

  // ---- Queries ----
  const { data: pendaftaranResponse, isLoading: isLoadingPendaftaran } =
    useQuery({
      queryKey: ["pendaftaran-all"],
      queryFn: () => pendaftaranUjianService.getAll(),
      enabled: isAuthenticated && isSekprodi,
    });

  const pendaftaranAll = Array.isArray(pendaftaranResponse?.data)
    ? pendaftaranResponse.data
    : [];

  // Filter for tabs
  const belumDijadwalkan = pendaftaranAll.filter(
    (p) =>
      p.status === "diterima" &&
      (!p.ujian || p.ujian.status === "belum_dijadwalkan"),
  );

  const sudahDijadwalkan = pendaftaranAll.filter(
    (p) => p.ujian?.status === "dijadwalkan",
  );

  const selesaiDijadwalkan = pendaftaranAll.filter(
    (p) => p.ujian?.status === "selesai",
  );

  // Scheduling Form Data
  const [schedulingFormData, setSchedulingFormData] =
    useState<SchedulingFormData | null>(null);
  const [isLoadingForm, setIsLoadingForm] = useState(false);

  const fetchSchedulingForm = async (pendaftaranId: string) => {
    setIsLoadingForm(true);
    try {
      const res = await ujianService.getSchedulingForm(pendaftaranId);
      setSchedulingFormData(res.data);

      if (!editingUjianId && res.data.defaultExaminers) {
        setFormKetuaPenguji(
          String(res.data.defaultExaminers[0]?.dosenId || ""),
        );
        setFormSekretaris(String(res.data.defaultExaminers[1]?.dosenId || ""));
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      notifications.show({
        title: "Gagal",
        message: error?.response?.data?.message || "Gagal memuat form data",
        color: "red",
      });
    } finally {
      setIsLoadingForm(false);
    }
  };

  const resetForm = () => {
    setFormTanggal("");
    setFormWaktuMulai(null);
    setFormWaktuSelesai(null);
    setFormRuanganId(null);
    setFormKetuaPenguji(null);
    setFormSekretaris(null);
    setFormPenguji1(null);
    setFormPenguji2(null);
    setEditingUjianId(null);
    setSchedulingFormData(null);
  };

  const handleOpenScheduleForm = (item: PendaftaranUjian) => {
    resetForm();
    setSelectedItem(item);
    fetchSchedulingForm(String(item.id));
    openForm();
  };

  const handleOpenEditForm = async (p: PendaftaranUjian) => {
    const ujian = p.ujian;
    if (!ujian) return;

    setSelectedItem(p);
    setEditingUjianId(String(ujian.id));
    setFormTanggal(ujian.jadwalUjian ? ujian.jadwalUjian.substring(0, 10) : "");
    setFormWaktuMulai(
      ujian.waktuMulai
        ? new Date(ujian.waktuMulai).toLocaleTimeString("en-GB", {
            hour: "2-digit",
            minute: "2-digit",
          })
        : "",
    );
    setFormWaktuSelesai(
      ujian.waktuSelesai
        ? new Date(ujian.waktuSelesai).toLocaleTimeString("en-GB", {
            hour: "2-digit",
            minute: "2-digit",
          })
        : "",
    );
    setFormRuanganId(String(ujian.ruanganId || ""));

    const penguji = (p.ujian?.pengujiUjians || []) as PengujiUjian[];
    setFormKetuaPenguji(
      String(penguji.find((px) => px.peran === "ketua_penguji")?.dosenId || ""),
    );
    setFormSekretaris(
      String(
        penguji.find((px) => px.peran === "sekretaris_penguji")?.dosenId || "",
      ),
    );
    setFormPenguji1(
      String(penguji.find((px) => px.peran === "penguji_1")?.dosenId || ""),
    );
    setFormPenguji2(
      String(penguji.find((px) => px.peran === "penguji_2")?.dosenId || ""),
    );

    await fetchSchedulingForm(String(p.id));
    openForm();
  };

  const handleSubmitSchedule = async () => {
    if (!selectedItem) return;

    if (
      !formTanggal ||
      !formWaktuMulai ||
      !formWaktuSelesai ||
      !formRuanganId
    ) {
      notifications.show({
        title: "Peringatan",
        message: "Semua field jadwal wajib diisi",
        color: "orange",
      });
      return;
    }

    const pengujiList = [
      { peran: "ketua_penguji", dosenId: formKetuaPenguji },
      { peran: "sekretaris_penguji", dosenId: formSekretaris },
      { peran: "penguji_1", dosenId: formPenguji1 },
      { peran: "penguji_2", dosenId: formPenguji2 },
    ];

    if (pengujiList.some((p) => !p.dosenId)) {
      notifications.show({
        title: "Peringatan",
        message: "Ke-4 penguji wajib dipilih",
        color: "orange",
      });
      return;
    }

    // Precise payload construction
    const dateStr = formTanggal; // YYYY-MM-DD

    // Construct local ISO-like strings that backend can parse
    const startIso = `${dateStr}T${formWaktuMulai}:00`;
    const endIso = `${dateStr}T${formWaktuSelesai}:00`;

    // Validate day of week for hari_ujian
    const dayIndex = new Date(dateStr).getDay();
    const dayName = HARI_NAMES[dayIndex];

    const payload = {
      pendaftaranUjianId: selectedItem.id,
      jadwalUjian: dateStr,
      waktuMulai: startIso,
      waktuSelesai: endIso,
      hariUjian: dayName,
      ruanganId: formRuanganId,
      pengujiList: pengujiList,
      catatan: "",
    };

    try {
      if (editingUjianId) {
        await updateScheduling({ id: editingUjianId, payload });
        notifications.show({
          title: "Berhasil",
          message: "Jadwal berhasil diperbarui",
          color: "teal",
        });
      } else {
        await createScheduling(payload);
        notifications.show({
          title: "Berhasil",
          message: "Jadwal berhasil dibuat",
          color: "teal",
        });
      }
      queryClient.invalidateQueries({ queryKey: ["pendaftaran-all"] });
      closeForm();
      resetForm();
    } catch (err: unknown) {
      console.error("Scheduling Error:", err);
      const error = err as {
        response?: { data?: { message?: string } };
        message?: string;
      };
      const msg =
        error?.response?.data?.message ||
        error?.message ||
        "Terjadi kesalahan pada server";
      notifications.show({
        title: "Gagal",
        message: msg,
        color: "red",
        autoClose: 5000,
      });
    }
  };

  const handleDownloadPdf = async () => {
    try {
      const blob = await ujianService.downloadJadwalPdf();
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "Jadwal_Ujian.pdf");
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch {
      notifications.show({
        title: "Gagal",
        message: "Terjadi kesalahan saat mendownload PDF",
        color: "red",
      });
    }
  };

  const dosenOptions = (schedulingFormData?.lecturers || []).map((d) => ({
    value: String(d.id),
    label: d.user?.nama || d.nama || "-",
  }));

  const ruanganOptions = (schedulingFormData?.rooms || []).map((r) => ({
    value: String(r.id),
    label: r.namaRuangan || "-",
  }));

  // ---- Table columns ----
  const pendaftaranColumns: DataTableColumn<PendaftaranUjian>[] = [
    {
      header: "Mahasiswa",
      render: (row) => (
        <Text size="sm" fw={500}>
          {row.mahasiswa?.user?.nama || "-"}
        </Text>
      ),
    },
    {
      header: "NIM",
      render: (row) => <Text size="sm">{row.mahasiswa?.nim || "-"}</Text>,
    },
    {
      header: "Jenis Ujian",
      render: (row) => (
        <Text size="sm">{row.jenisUjian?.namaJenis || "-"}</Text>
      ),
    },
    {
      header: "Judul Penelitian",
      render: (row) => (
        <Text size="sm" lineClamp={2} maw={280}>
          {row.rancanganPenelitian?.judulPenelitian || "-"}
        </Text>
      ),
    },
    {
      header: "Tgl. Disetujui",
      render: (row) => (
        <Text size="sm">
          {row.tanggalDisetujui
            ? new Date(row.tanggalDisetujui).toLocaleDateString("id-ID")
            : "-"}
        </Text>
      ),
    },
    {
      header: "Aksi",
      textAlign: "center",
      width: 80,
      render: (row) => (
        <Menu shadow="sm" width={200} position="bottom-end" transitionProps={{ transition: 'pop-top-right' }} withinPortal>
          <Menu.Target>
            <ActionIcon variant="subtle" color="gray" radius="md" size="lg">
              <IconDotsVertical size={18} stroke={1.5} />
            </ActionIcon>
          </Menu.Target>

          <Menu.Dropdown>
            <Menu.Label>Penjadwalan</Menu.Label>
            <Menu.Item 
              leftSection={<IconCalendarPlus size={16} stroke={1.5} />} 
              onClick={() => handleOpenScheduleForm(row)}
            >
              Jadwalkan Ujian
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
      ),
    },
  ];

  const ujianColumns: DataTableColumn<PendaftaranUjian>[] = [
    {
      header: "Mahasiswa",
      render: (row) => (
        <Text size="sm" fw={500}>
          {row.mahasiswa?.user?.nama || "-"}
        </Text>
      ),
    },
    {
      header: "Jenis Ujian",
      render: (row) => (
        <Text size="sm">{row.jenisUjian?.namaJenis || "-"}</Text>
      ),
    },
    {
      header: "Jadwal",
      render: (row) => {
        const u = row.ujian;
        if (!u?.jadwalUjian) return "-";
        return (
          <Stack gap={0}>
            <Text size="sm" fw={500}>
              {new Date(u.jadwalUjian).toLocaleDateString("id-ID", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </Text>
            <Text size="xs" c="dimmed">
              {u.waktuMulai
                ? new Date(u.waktuMulai).toLocaleTimeString("id-ID", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : ""}{" "}
              -{" "}
              {u.waktuSelesai
                ? new Date(u.waktuSelesai).toLocaleTimeString("id-ID", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : ""}
            </Text>
          </Stack>
        );
      },
    },
    {
      header: "Ruangan",
      render: (row) => (
        <Text size="sm">{row.ujian?.ruangan?.namaRuangan || "-"}</Text>
      ),
    },
    {
      header: "Aksi",
      textAlign: "center",
      width: 100,
      render: (row) => (
        <Menu shadow="sm" width={200} position="bottom-end" transitionProps={{ transition: 'pop-top-right' }} withinPortal>
          <Menu.Target>
            <ActionIcon variant="subtle" color="gray" radius="md" size="lg">
              <IconDotsVertical size={18} stroke={1.5} />
            </ActionIcon>
          </Menu.Target>

          <Menu.Dropdown>
            <Menu.Label>Penjadwalan</Menu.Label>
            <Menu.Item 
              leftSection={<IconCalendarEvent size={16} stroke={1.5} />} 
              onClick={() => handleOpenEditForm(row)}
            >
              Edit Jadwal
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
      ),
    },
  ];

  if (isLoadingProfile || !isAuthenticated) return null;
  if (!isSekprodi) {
    return (
      <Container size="xl" pt="md">
        <Text c="red">
          Hanya Sekretaris Prodi yang memiliki akses ke halaman ini.
        </Text>
      </Container>
    );
  }

  return (
    <Container size="xl" pt="md">
      <PageHeader
        title="Penjadwalan Ujian"
        items={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Penjadwalan Ujian" },
        ]}
        description="Atur dan kelola jadwal ujian skripsi serta seminar hasil mahasiswa"
        icon={IconCalendarPlus}
        rightSection={
          <Button
            variant="outline"
            color="indigo"
            leftSection={<IconPrinter size={16} />}
            onClick={handleDownloadPdf}
          >
            Cetak Jadwal PDF
          </Button>
        }
      />

      <Paper withBorder radius="lg" p={0} style={{ overflow: "hidden" }}>
        <Tabs
          value={activeTab}
          onChange={(val) => setActiveTab(val || "belum")}
        >
          <Tabs.List px="md" pt="md">
            <Tabs.Tab
              value="belum"
              rightSection={
                belumDijadwalkan.length > 0 && (
                  <Badge size="sm" color="orange" variant="light" radius="xl">
                    {belumDijadwalkan.length}
                  </Badge>
                )
              }
            >
              Belum Dijadwalkan
            </Tabs.Tab>
            <Tabs.Tab
              value="dijadwalkan"
              rightSection={
                sudahDijadwalkan.length > 0 && (
                  <Badge size="sm" color="teal" variant="light" radius="xl">
                    {sudahDijadwalkan.length}
                  </Badge>
                )
              }
            >
              Dijadwalkan
            </Tabs.Tab>
            <Tabs.Tab
              value="selesai"
              rightSection={
                selesaiDijadwalkan.length > 0 && (
                  <Badge size="sm" color="blue" variant="light" radius="xl">
                    {selesaiDijadwalkan.length}
                  </Badge>
                )
              }
            >
              Selesai
            </Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="belum">
            <DataTable<PendaftaranUjian>
              data={belumDijadwalkan}
              columns={pendaftaranColumns}
              loading={isLoadingPendaftaran}
              noCard
            />
          </Tabs.Panel>
          <Tabs.Panel value="dijadwalkan">
            <DataTable<PendaftaranUjian>
              data={sudahDijadwalkan}
              columns={ujianColumns}
              loading={isLoadingPendaftaran}
              noCard
            />
          </Tabs.Panel>
          <Tabs.Panel value="selesai">
            <DataTable<PendaftaranUjian>
              data={selesaiDijadwalkan}
              columns={ujianColumns}
              loading={isLoadingPendaftaran}
              noCard
            />
          </Tabs.Panel>
        </Tabs>
      </Paper>

      {/* ---- Schedule / Edit Form Modal ---- */}
      <Modal
        opened={formOpened}
        onClose={() => {
          closeForm();
          resetForm();
        }}
        title={
          <Text fw={700} size="lg">
            {editingUjianId ? "Edit Jadwal Ujian" : "Buat Jadwal Ujian"}
          </Text>
        }
        size="lg"
        centered
        scrollAreaComponent={ScrollArea.Autosize}
      >
        {isLoadingForm && (
          <Center py="xl">
            <Loader size="md" />
          </Center>
        )}

        {!isLoadingForm && selectedItem && (
          <Stack gap="md">
            <Paper
              p="md"
              radius="md"
              withBorder
              bg="var(--mantine-color-gray-0)"
            >
              <Grid gutter="xs">
                <Grid.Col span={6}>
                  <Text size="xs" tt="uppercase" fw={700} c="dimmed">
                    Mahasiswa
                  </Text>
                  <Text size="sm" fw={500}>
                    {selectedItem.mahasiswa?.user?.nama}
                  </Text>
                </Grid.Col>
                <Grid.Col span={6}>
                  <Text size="xs" tt="uppercase" fw={700} c="dimmed">
                    Jenis Ujian
                  </Text>
                  <Text size="sm" fw={500}>
                    {selectedItem.jenisUjian?.namaJenis}
                  </Text>
                </Grid.Col>
                <Grid.Col span={12}>
                  <Text size="xs" tt="uppercase" fw={700} c="dimmed">
                    Judul
                  </Text>
                  <Text size="sm" fw={500} lineClamp={2}>
                    {selectedItem.rancanganPenelitian?.judulPenelitian}
                  </Text>
                </Grid.Col>
              </Grid>
            </Paper>

            <Grid gutter="sm">
              <Grid.Col span={12}>
                <TextInput
                  label="Tanggal Ujian"
                  type="date"
                  value={formTanggal}
                  onChange={(e) => setFormTanggal(e.currentTarget.value)}
                  required
                />
              </Grid.Col>
              <Grid.Col span={6}>
                <Select
                  label="Waktu Mulai"
                  placeholder="HH:mm"
                  data={TIME_OPTIONS}
                  value={formWaktuMulai}
                  onChange={setFormWaktuMulai}
                  required
                />
              </Grid.Col>
              <Grid.Col span={6}>
                <Select
                  label="Waktu Selesai"
                  placeholder="HH:mm"
                  data={TIME_OPTIONS}
                  value={formWaktuSelesai}
                  onChange={setFormWaktuSelesai}
                  required
                />
              </Grid.Col>
              <Grid.Col span={12}>
                <Select
                  label="Ruangan"
                  placeholder="Pilih ruangan"
                  data={ruanganOptions}
                  value={formRuanganId}
                  onChange={setFormRuanganId}
                  searchable
                  required
                />
              </Grid.Col>
            </Grid>

            <Divider label="Dewan Penguji" />
            <Grid gutter="sm">
              <Grid.Col span={6}>
                <Select
                  label="Ketua Penguji"
                  placeholder="Pilih dosen"
                  data={dosenOptions}
                  value={formKetuaPenguji}
                  onChange={setFormKetuaPenguji}
                  searchable
                  required
                />
              </Grid.Col>
              <Grid.Col span={6}>
                <Select
                  label="Sekretaris Penguji"
                  placeholder="Pilih dosen"
                  data={dosenOptions}
                  value={formSekretaris}
                  onChange={setFormSekretaris}
                  searchable
                  required
                />
              </Grid.Col>
              <Grid.Col span={6}>
                <Select
                  label="Penguji 1"
                  placeholder="Pilih dosen"
                  data={dosenOptions}
                  value={formPenguji1}
                  onChange={setFormPenguji1}
                  searchable
                  required
                />
              </Grid.Col>
              <Grid.Col span={6}>
                <Select
                  label="Penguji 2"
                  placeholder="Pilih dosen"
                  data={dosenOptions}
                  value={formPenguji2}
                  onChange={setFormPenguji2}
                  searchable
                  required
                />
              </Grid.Col>
            </Grid>

            <Group justify="flex-end" mt="md">
              <Button variant="subtle" onClick={closeForm}>
                Batal
              </Button>
              <Button
                color="indigo"
                onClick={handleSubmitSchedule}
                loading={isCreating || isUpdating}
              >
                {editingUjianId ? "Simpan Perubahan" : "Jadwalkan Ujian"}
              </Button>
            </Group>
          </Stack>
        )}
      </Modal>
    </Container>
  );
}

function Divider({ label }: { label: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", margin: "10px 0" }}>
      <div
        style={{
          flex: 1,
          height: 1,
          backgroundColor: "var(--mantine-color-gray-3)",
        }}
      />
      <Text size="xs" fw={700} c="dimmed" px="sm">
        {label}
      </Text>
      <div
        style={{
          flex: 1,
          height: 1,
          backgroundColor: "var(--mantine-color-gray-3)",
        }}
      />
    </div>
  );
}
