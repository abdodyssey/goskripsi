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
  Divider,
} from "@mantine/core";
import { modals } from "@mantine/modals";
import { PageHeader } from "@/components/PageHeader/PageHeader";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  IconCalendarPlus,
  IconCalendarEvent,
  IconPrinter,
  IconDotsVertical,
  IconRotate2,
} from "@tabler/icons-react";
import { useDisclosure } from "@mantine/hooks";
import { useState, useMemo } from "react";
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
  const isSuperUser = roles.some(r => ["superadmin", "admin"].includes(r.toLowerCase()));
  const userProdiId = user?.prodi_id;

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
  const { deleteScheduling, isDeleting } = useUjian();

  const [activeTab, setActiveTab] = useState<string>("belum");

  // ---- Queries ----
  const { data: pendaftaranResponse, isLoading: isLoadingPendaftaran } =
    useQuery({
      queryKey: ["pendaftaran-all"],
      queryFn: () => pendaftaranUjianService.getAll(),
      enabled: isAuthenticated && isSekprodi,
    });

  const pendaftaranAll = useMemo(() => {
    const list = Array.isArray(pendaftaranResponse?.data)
      ? pendaftaranResponse.data
      : [];
    if (isSuperUser || !userProdiId) return list;
    return list.filter(p => {
      const mhsProdi = p.mahasiswa as any;
      const id = mhsProdi?.prodi_id || mhsProdi?.prodiId;
      return Number(id) === Number(userProdiId);
    });
  }, [pendaftaranResponse?.data, isSuperUser, userProdiId]);

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

  const filteredJadwal = useMemo(() => {
    if (!formTanggal) return [];
    return sudahDijadwalkan.filter(p => {
      if (!p.ujian?.jadwalUjian) return false;
      const dateStr = new Date(p.ujian.jadwalUjian).toISOString().split('T')[0];
      return dateStr === formTanggal;
    }).sort((a, b) => {
      if (!a.ujian?.waktuMulai || !b.ujian?.waktuMulai) return 0;
      return new Date(a.ujian.waktuMulai).getTime() - new Date(b.ujian.waktuMulai).getTime();
    });
  }, [sudahDijadwalkan, formTanggal]);

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
        const defaults = res.data.defaultExaminers as {
          dosenId: any;
          peran: string;
        }[];
        const ketua = defaults.find(
          (d) => d.peran === "ketua_penguji",
        )?.dosenId;
        const sekretaris = defaults.find(
          (d) => d.peran === "sekretaris_penguji",
        )?.dosenId;

        if (ketua) setFormKetuaPenguji(String(ketua));
        if (sekretaris) setFormSekretaris(String(sekretaris));
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
        notifications.show({
          title: "Gagal",
          message: error?.response?.data?.message || "Gagal memuat form data",
          color: "var(--gs-danger)",
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
        color: "var(--gs-warning)",
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
        color: "var(--gs-warning)",
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
          color: "var(--gs-success)",
        });
      } else {
        await createScheduling(payload);
        notifications.show({
          title: "Berhasil",
          message: "Jadwal berhasil dibuat",
          color: "var(--gs-success)",
        });
      }
      queryClient.invalidateQueries({ queryKey: ["pendaftaran-all"] });
      closeForm();
      resetForm();
    } catch (err: unknown) {
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
        color: "var(--gs-danger)",
        autoClose: 5000,
      });
    }
  };

  const handleUndoSchedule = (p: PendaftaranUjian) => {
    const ujianId = p.ujian?.id;
    if (!ujianId) return;

    modals.openConfirmModal({
      title: "Batalkan Penjadwalan",
      centered: true,
      children: (
        <Text size="sm">
          Apakah Anda yakin ingin membatalkan penjadwalan ujian untuk mahasiswa{" "}
          <b>{p.mahasiswa?.user?.nama}</b>? Data jadwal dan penguji akan
          dihapus, dan pendaftaran akan kembali ke status "Belum Dijadwalkan".
        </Text>
      ),
      labels: { confirm: "Ya, Batalkan", cancel: "Batal" },
      confirmProps: { className: "bg-gs-danger hover:bg-gs-danger-hover", radius: "md" },
      onConfirm: async () => {
        try {
          await deleteScheduling(String(ujianId));
          notifications.show({
            title: "Berhasil",
            message: "Penjadwalan berhasil dibatalkan",
            color: "var(--gs-success)",
          });
        } catch (err: any) {
          notifications.show({
            title: "Gagal",
            message:
              err?.response?.data?.message || "Gagal membatalkan penjadwalan",
            color: "var(--gs-danger)",
          });
        }
      },
    });
  };

  const handleDownloadPdf = async () => {
    try {
      const blob = await ujianService.downloadJadwalPdf();
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "Jadwal_Jadwal.pdf");
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch {
      notifications.show({
        title: "Gagal",
        message: "Terjadi kesalahan saat mendownload PDF",
        color: "var(--gs-danger)",
      });
    }
  };

  const handleDownloadUndangan = async (
    pendaftaranId: number | string,
    nim: string,
  ) => {
    try {
      const blob = await ujianService.downloadUndanganPdf(pendaftaranId);
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `Undangan_Ujian_${nim}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch {
      notifications.show({
        title: "Gagal",
        message: "Terjadi kesalahan saat mendownload Undangan",
        color: "var(--gs-danger)",
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
        <Text size="sm" lineClamp={2} maw={320} style={{ lineHeight: 1.5 }}>
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
        <Menu
          shadow="sm"
          width={200}
          position="bottom-end"
          transitionProps={{ transition: "pop-top-right" }}
          withinPortal
        >
          <Menu.Target>
            <ActionIcon variant="subtle" color="var(--gs-text-muted)" radius="md" size="lg">
              <IconDotsVertical size={18} stroke={1.5} />
            </ActionIcon>
          </Menu.Target>

          <Menu.Dropdown>
            <Menu.Label>Penjadwalan</Menu.Label>
            <Menu.Item
              leftSection={<IconCalendarPlus size={16} stroke={1.5} />}
              onClick={() => handleOpenScheduleForm(row)}
            >
              JADWALKAN UJIAN
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
            <Text size="xs" c="dimmed" style={{ lineHeight: 1.4 }}>
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
        <Menu
          shadow="sm"
          width={200}
          position="bottom-end"
          transitionProps={{ transition: "pop-top-right" }}
          withinPortal
        >
          <Menu.Target>
            <ActionIcon variant="subtle" color="var(--gs-text-muted)" radius="md" size="lg">
              <IconDotsVertical size={18} stroke={1.5} />
            </ActionIcon>
          </Menu.Target>

          <Menu.Dropdown>
            <Menu.Label>Penjadwalan</Menu.Label>
            <Menu.Item
              leftSection={<IconCalendarEvent size={16} stroke={1.5} />}
              onClick={() => handleOpenEditForm(row)}
            >
              EDIT JADWAL
            </Menu.Item>
            <Menu.Item
              leftSection={<IconPrinter size={16} stroke={1.5} />}
              onClick={() =>
                handleDownloadUndangan(row.id, row.mahasiswa?.nim || "MHS")
              }
            >
              CETAK UNDANGAN
            </Menu.Item>
            <Menu.Item
              leftSection={<IconRotate2 size={16} stroke={2} />}
              color="var(--gs-danger)"
              onClick={() => handleUndoSchedule(row)}
            >
              BATALKAN PENJADWALAN
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
        <Text className="text-gs-danger" fw={700}>
          Hanya Sekretaris Prodi yang memiliki akses ke halaman ini.
        </Text>
      </Container>
    );
  }

  return (
    <Container size="xl" py="xl">
      <PageHeader
        title="Penjadwalan Ujian"
        items={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Penjadwalan Ujian" },
        ]}
        description="Atur dan kelola jadwal ujian skripsi serta seminar hasil mahasiswa secara efisien"
        icon={IconCalendarPlus}
        rightSection={
          <Button
            variant="filled"
            className="bg-gs-primary hover:bg-gs-primary-hover"
            radius="md"
            fw={700}
            leftSection={<IconPrinter size={18} stroke={2} />}
            onClick={handleDownloadPdf}
          >
            CETAK JADWAL PDF
          </Button>
        }
      />

      <Stack gap="xl">
        <Tabs
          value={activeTab}
          onChange={(val) => setActiveTab(val || "belum")}
          variant="pills"
          radius="xl"
          color="var(--gs-primary)"
          styles={{
            tab: {
              border: '1px solid var(--gs-border)',
              fontWeight: 700,
              fontSize: '11px',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }
          }}
        >
          <Tabs.List mb="xl">
            <Tabs.Tab
              value="belum"
              px="md"
              leftSection={
                <Badge size="xs" circle color="var(--gs-warning)" fw={700}>
                  {belumDijadwalkan.length}
                </Badge>
              }
            >
              Belum Dijadwalkan
            </Tabs.Tab>
            <Tabs.Tab
              value="dijadwalkan"
              px="md"
              leftSection={
                <Badge size="xs" circle color="var(--gs-success)" fw={700}>
                  {sudahDijadwalkan.length}
                </Badge>
              }
            >
              Dijadwalkan
            </Tabs.Tab>
            <Tabs.Tab
              value="selesai"
              px="md"
              leftSection={
                <Badge size="xs" circle color="var(--gs-primary)" fw={700}>
                  {selesaiDijadwalkan.length}
                </Badge>
              }
            >
              Selesai
            </Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="belum">
            <DataTable<PendaftaranUjian>
              title="Daftar Mahasiswa (Belum Dijadwalkan)"
              data={belumDijadwalkan}
              columns={pendaftaranColumns}
              loading={isLoadingPendaftaran}
            />
          </Tabs.Panel>
          <Tabs.Panel value="dijadwalkan">
            <DataTable<PendaftaranUjian>
              title="Daftar Jadwal Ujian (Dijadwalkan)"
              data={sudahDijadwalkan}
              columns={ujianColumns}
              loading={isLoadingPendaftaran}
            />
          </Tabs.Panel>
          <Tabs.Panel value="selesai">
            <DataTable<PendaftaranUjian>
              title="Daftar Ujian (Selesai)"
              data={selesaiDijadwalkan}
              columns={ujianColumns}
              loading={isLoadingPendaftaran}
            />
          </Tabs.Panel>
        </Tabs>
      </Stack>

      {/* ---- Schedule / Edit Form Modal ---- */}
      <Modal
        opened={formOpened}
        onClose={() => {
          closeForm();
          resetForm();
        }}
        title={
          <Stack gap={4}>
            <Text fw={800} size="xl" lts={-0.5} className="text-gs-text-primary tracking-tight">
              {editingUjianId ? "EDIT JADWAL UJIAN" : "BUAT JADWAL UJIAN"}
            </Text>
            <Text size="xs" c="dimmed" fw={700}>
              Lengkapi informasi jadwal dan dewan penguji
            </Text>
          </Stack>
        }
        size="1100px"
        centered
        radius="lg"
        scrollAreaComponent={ScrollArea.Autosize}
        styles={{
          header: {
            borderBottom: "1px solid var(--gs-border)",
            paddingBottom: "var(--mantine-spacing-md)",
            marginBottom: "var(--mantine-spacing-md)",
          },
          body: {
            paddingTop: 0,
          },
        }}
      >
        {isLoadingForm && (
          <Center py="xl">
            <Loader size="md" />
          </Center>
        )}

        {!isLoadingForm && selectedItem && (
          <Grid gutter="xl" align="flex-start">
            <Grid.Col span={{ base: 12, lg: 7 }}>
              <Stack gap="md">
                <Paper
              withBorder
              radius="md"
              p="md"
              mb="sm"
              bg="var(--gs-bg-overlay)"
              className="border-gs-border"
            >
              <Grid gutter="lg">
                <Grid.Col span={{ base: 12, sm: 6 }}>
                  <Stack gap={4}>
                    <Text size="xs" tt="uppercase" fw={700} c="dimmed" lts={0.5}>
                      Mahasiswa
                    </Text>
                    <Text size="sm" fw={700} className="text-gs-text-primary">
                      {selectedItem.mahasiswa?.user?.nama || selectedItem.mahasiswa?.nama || "-"}
                    </Text>
                  </Stack>
                </Grid.Col>
                <Grid.Col span={{ base: 12, sm: 6 }}>
                  <Stack gap={4}>
                    <Text size="xs" tt="uppercase" fw={700} c="dimmed" lts={0.5}>
                      Jenis Ujian
                    </Text>
                    <Text size="sm" fw={700} className="text-gs-text-primary">
                      {selectedItem.jenisUjian?.namaJenis || "-"}
                    </Text>
                  </Stack>
                </Grid.Col>
                <Grid.Col span={12}>
                  <Stack gap={4}>
                    <Text size="xs" tt="uppercase" fw={700} c="dimmed" lts={0.5}>
                      Judul Penelitian
                    </Text>
                    <Text size="sm" fw={700} className="text-gs-text-primary" style={{ fontStyle: "italic", lineHeight: 1.5 }}>
                      &quot;{selectedItem.rancanganPenelitian?.judulPenelitian || "-"}&quot;
                    </Text>
                  </Stack>
                </Grid.Col>
              </Grid>
            </Paper>

            <Divider 
              label={<Text size="xs" fw={800} tt="uppercase" className="text-gs-primary" lts={1}>Informasi Jadwal</Text>} 
              labelPosition="left" 
            />

            <Grid gutter="sm">
              <Grid.Col span={12}>
                <TextInput
                  label="Tanggal Ujian"
                  type="date"
                  value={formTanggal}
                  onChange={(e) => setFormTanggal(e.currentTarget.value)}
                  radius="md"
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
                  radius="md"
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
                  radius="md"
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
                  radius="md"
                  required
                />
              </Grid.Col>
            </Grid>

            <Divider 
              label={<Text size="xs" fw={800} tt="uppercase" className="text-gs-primary" lts={1}>Dewan Penguji</Text>} 
              labelPosition="left" 
            />
            <Grid gutter="sm">
              <Grid.Col span={6}>
                <Select
                  label="Ketua Penguji"
                  placeholder="Pilih dosen"
                  data={dosenOptions}
                  value={formKetuaPenguji}
                  onChange={setFormKetuaPenguji}
                  searchable
                  radius="md"
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
                  radius="md"
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
                  radius="md"
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
                  radius="md"
                  required
                />
              </Grid.Col>
            </Grid>

            <Group justify="flex-end" mt="md" pt="md" style={{ borderTop: "1px solid var(--gs-border)" }}>
              <Button variant="subtle" color="var(--gs-text-muted)" onClick={closeForm} radius="md" fw={700}>
                BATAL
              </Button>
              <Button
                className="bg-gs-primary hover:bg-gs-primary-hover"
                onClick={handleSubmitSchedule}
                loading={isCreating || isUpdating}
                radius="md"
                px="xl"
                fw={700}
              >
                {editingUjianId ? "SIMPAN PERUBAHAN" : "JADWALKAN UJIAN"}
              </Button>
            </Group>
          </Stack>
        </Grid.Col>

        <Grid.Col span={{ base: 12, lg: 5 }}>
          <Stack gap="sm">
            <Text size="xs" fw={800} tt="uppercase" className="text-gs-primary" lts={1}>
              Jadwal Terdaftar pada {formTanggal ? new Date(formTanggal).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'short' }) : "Hari Ini"}
            </Text>
            
            {!formTanggal ? (
              <Paper p="xl" withBorder radius="md" ta="center" bg="var(--gs-bg-overlay)" className="border-gs-border border-dashed">
                <Text size="xs" c="dimmed">Pilih tanggal terlebih dahulu untuk melihat jadwal yang sudah terdaftar.</Text>
              </Paper>
            ) : filteredJadwal.length === 0 ? (
              <Paper p="xl" withBorder radius="md" ta="center" bg="var(--gs-bg-overlay)" className="border-gs-border border-dashed">
                <Text size="xs" c="dimmed">Tidak ada jadwal ujian lain pada hari ini. Anda bebas menentukan waktu.</Text>
              </Paper>
            ) : (
              <ScrollArea h={560} offsetScrollbars>
                <Stack gap="xs" pr="sm">
                  {filteredJadwal.map(p => (
                    <Paper key={p.id} p="sm" withBorder radius="md" bg="var(--gs-bg-overlay)" className="border-gs-border">
                      <Group justify="space-between" mb={4} wrap="nowrap">
                        <Text size="xs" fw={800} className="text-gs-text-primary">
                          {p.ujian?.waktuMulai ? new Date(p.ujian.waktuMulai).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) : "-"} 
                          {" - "} 
                          {p.ujian?.waktuSelesai ? new Date(p.ujian.waktuSelesai).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) : "-"}
                        </Text>
                        <Badge size="xs" color="gray" variant="light" radius="sm">
                          {p.ujian?.ruangan?.namaRuangan || "Tanpa Ruang"}
                        </Badge>
                      </Group>
                      <Text size="xs" fw={700} lineClamp={1} className="text-gs-text-primary">{p.mahasiswa?.user?.nama}</Text>
                      <Text size="10px" c="dimmed" lineClamp={1}>{p.jenisUjian?.namaJenis}</Text>
                      
                      {p.ujian?.pengujiUjians && p.ujian.pengujiUjians.length > 0 && (
                        <Group gap={4} mt={6}>
                          {(p.ujian.pengujiUjians as PengujiUjian[]).map(penguji => (
                            <Tooltip key={penguji.id} label={`${penguji.dosen?.user?.nama} (${penguji.peran})`}>
                              <Badge size="xs" variant="dot" color="dark" style={{ textTransform: 'none', paddingLeft: 4, paddingRight: 4 }}>
                                {penguji.dosen?.user?.nama?.split(' ')[0]}
                              </Badge>
                            </Tooltip>
                          ))}
                        </Group>
                      )}
                    </Paper>
                  ))}
                </Stack>
              </ScrollArea>
            )}
          </Stack>
        </Grid.Col>
      </Grid>
    )}
      </Modal>
    </Container>
  );
}

