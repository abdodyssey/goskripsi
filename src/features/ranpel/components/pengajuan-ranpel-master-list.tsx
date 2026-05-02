"use client";

import { useAllPengajuan } from "../hooks/use-ranpel";
import { useMahasiswa } from "@/features/mahasiswa/hooks/use-mahasiswa";
import {
  Text,
  Group,
  Stack,
  TextInput,
  Select,
  Modal,
  Button,
  Grid,
  rem,
  Tooltip,
  Badge,
  Textarea,
  ScrollArea,
} from "@mantine/core";
import { 
  IconEdit, 
  IconSearch, 
  IconTrash, 
  IconClipboardList, 
  IconUserCircle, 
  IconShieldCheck, 
  IconHistory, 
  IconMessageDots 
} from "@tabler/icons-react";
import { useDisclosure } from "@mantine/hooks";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { PengajuanRancanganPenelitian, StatusPengajuan } from "../types/ranpel.type";
import { useState, useMemo } from "react";
import { DataTable, DataTableColumn } from "@/components/ui/data-table";
import { ActionIconButton } from "@/components/ui/action-icon-button";
import { modals } from "@mantine/modals";

export function PengajuanRanpelMasterList() {
  const { 
    pengajuanList, 
    isLoading, 
    isError, 
    updatePengajuan, 
    isUpdating,
    deletePengajuan,
    isDeleting,
    createPengajuan,
    isCreating
  } = useAllPengajuan();

  const { mahasiswaList } = useMahasiswa();

  const [search, setSearch] = useState("");
  const [editingPengajuan, setEditingPengajuan] = useState<PengajuanRancanganPenelitian | null>(null);
  const [opened, { open, close }] = useDisclosure(false);

  const form = useForm({
    initialValues: {
      mahasiswaId: "",
      judulPenelitian: "",
      status_dosen_pa: "menunggu",
      status_kaprodi: "menunggu",
      catatan_dosen_pa: "",
      catatan_kaprodi: "",
    },
  });

  const handleAdd = () => {
    setEditingPengajuan(null);
    form.reset();
    open();
  };

  const handleEdit = (p: PengajuanRancanganPenelitian) => {
    setEditingPengajuan(p);
    form.setValues({
      status_dosen_pa: p.statusDosenPa || "menunggu",
      status_kaprodi: p.statusKaprodi || "menunggu",
      catatan_dosen_pa: p.catatanDosenPa || "",
      catatan_kaprodi: p.catatanKaprodi || "",
    });
    open();
  };

  const onSave = async (values: typeof form.values) => {
    try {
      if (editingPengajuan) {
        await updatePengajuan({
          id: editingPengajuan.id.toString(),
          data: values as any,
        });
        notifications.show({
          title: "Berhasil",
          message: "Status pengajuan berhasil diupdate",
          color: "var(--gs-success)",
        });
      } else {
        if (!values.mahasiswaId || !values.judulPenelitian) {
          notifications.show({
            title: "Peringatan",
            message: "Mahasiswa dan Judul wajib diisi",
            color: "var(--gs-warning)",
          });
          return;
        }
        await createPengajuan(values as any);
        notifications.show({
          title: "Berhasil",
          message: "Pengajuan baru berhasil dibuat",
          color: "var(--gs-success)",
        });
      }
      close();
    } catch (error) {
      notifications.show({
        title: "Gagal",
        message: (error as Error).message || "Terjadi kesalahan",
        color: "var(--gs-danger)",
      });
    }
  };

  const handleDelete = (id: number) => {
    modals.openConfirmModal({
      title: "Hapus Pengajuan",
      centered: true,
      children: (
        <Text size="sm">
          Apakah Anda yakin ingin menghapus data pengajuan ini? Tindakan ini tidak dapat dibatalkan.
        </Text>
      ),
      labels: { confirm: "Hapus", cancel: "Batal" },
      confirmProps: { color: "red" },
      onConfirm: async () => {
        try {
          await deletePengajuan(id.toString());
          notifications.show({
            title: "Berhasil",
            message: "Pengajuan berhasil dihapus",
            color: "var(--gs-success)",
          });
        } catch (error) {
          notifications.show({
            title: "Gagal",
            message: (error as Error).message || "Gagal menghapus data",
            color: "var(--gs-danger)",
          });
        }
      },
    });
  };

  const filteredData = useMemo(() => {
    const list = Array.isArray(pengajuanList) ? pengajuanList : [];
    return list.filter((item) => {
      const searchStr = search.toLowerCase();
      return (
        item.mahasiswa?.nama?.toLowerCase().includes(searchStr) ||
        item.mahasiswa?.nim?.toLowerCase().includes(searchStr) ||
        item.rancanganPenelitian?.judulPenelitian.toLowerCase().includes(searchStr)
      );
    });
  }, [pengajuanList, search]);

  const getStatusBadge = (status: string) => {
    const map: Record<string, string> = {
      menunggu: "var(--gs-info)",
      diverifikasi: "var(--gs-primary)",
      diterima: "var(--gs-success)",
      ditolak: "var(--gs-danger)",
      proses: "var(--gs-warning)",
    };
    return (
      <Badge color={map[status] || "gray"} variant="filled" radius="sm" fw={700}>
        {status.toUpperCase()}
      </Badge>
    );
  };

  const columns: DataTableColumn<PengajuanRancanganPenelitian>[] = [
    {
      header: "Mahasiswa",
      width: "250px",
      render: (row) => {
        const name = row.mahasiswa?.nama || row.mahasiswa?.user?.nama || "Unknown";
        const nim = row.mahasiswa?.nim || "-";
        return (
          <Group gap="sm" wrap="nowrap">
            <div className="w-8 h-8 rounded-full bg-gs-primary/10 flex items-center justify-center">
              <IconUserCircle size={20} className="text-gs-primary" />
            </div>
            <Stack gap={0}>
              <Text size="sm" fw={700} className="text-gs-primary-text">
                {name}
              </Text>
              <Text size="xs" c="dimmed" fw={500}>
                {nim}
              </Text>
            </Stack>
          </Group>
        );
      },
    },
    {
      header: "Status Dosen PA",
      render: (row) => getStatusBadge(row.statusDosenPa),
    },
    {
      header: "Status Kaprodi",
      render: (row) => getStatusBadge(row.statusKaprodi),
    },
    {
      header: "Tgl Pengajuan",
      render: (row) => (
        <Text size="sm" c="dimmed">
          {new Date(row.tanggalPengajuan).toLocaleDateString("id-ID")}
        </Text>
      ),
    },
    {
      header: "Aksi",
      textAlign: "right",
      render: (row) => (
        <Group gap={4} justify="flex-end">
          <ActionIconButton
            icon={IconEdit}
            tooltip="Edit Status Pengajuan"
            onClick={() => handleEdit(row)}
          />
          <ActionIconButton
            icon={IconTrash}
            color="red"
            tooltip="Hapus Pengajuan"
            onClick={() => handleDelete(row.id)}
          />
        </Group>
      ),
    },
  ];

  return (
    <>
      <DataTable
        data={filteredData}
        columns={columns}
        loading={isLoading}
        error={isError ? "Gagal memuat data pengajuan." : null}
        title="Master Data Pengajuan Ranpel"
        description="Kelola seluruh riwayat dan status persetujuan usulan skripsi mahasiswa"
        rightSection={
          <Group gap="sm">
            <TextInput
              placeholder="Cari Nama / NIM / Judul..."
              leftSection={<IconSearch size={16} />}
              value={search}
              onChange={(e) => setSearch(e.currentTarget.value)}
              style={{ width: 250 }}
              radius="md"
            />
            <Button
              className="bg-gs-primary hover:bg-gs-primary-hover"
              onClick={handleAdd}
              radius="md"
              fw={700}
            >
              TAMBAH BARU
            </Button>
          </Group>
        }
      />

      <Modal
        opened={opened}
        onClose={close}
        title={
          <Group gap="sm">
            <div className="bg-gs-primary/10 p-2 rounded-lg">
              <IconClipboardList size={24} className="text-gs-primary" />
            </div>
            <Stack gap={0}>
              <Text fw={700} fz="xl" className="text-gs-primary-text">
                {editingPengajuan ? "Update Status Pengajuan" : "Tambah Pengajuan Baru"}
              </Text>
              <Text size="xs" c="dimmed" fw={500}>
                {editingPengajuan ? "Override status persetujuan dari PA atau Kaprodi" : "Inisialisasi riwayat pengajuan secara manual"}
              </Text>
            </Stack>
          </Group>
        }
        size="xl"
        radius="lg"
        overlayProps={{
          backgroundOpacity: 0.6,
          blur: 4,
        }}
        scrollAreaComponent={ScrollArea.Autosize}
        styles={{
          header: { padding: "28px 32px 12px" },
          body: { padding: "0 32px 32px" },
          close: { color: "var(--mantine-color-slate-4)" },
          content: { 
            borderRadius: '16px',
          }
        }}
      >
        <form onSubmit={form.onSubmit(onSave)}>
          <Stack gap="xl">
            {!editingPengajuan && (
                  <div className="bg-gs-primary/5 p-6 rounded-2xl border border-gs-primary/10">
                    <Stack gap="md">
                      <Select
                        label="Pilih Mahasiswa"
                        placeholder="Cari Nama atau NIM..."
                        leftSection={<IconUserCircle size={18} stroke={1.5} />}
                        data={(mahasiswaList as any[]).map(m => ({ value: m.id.toString(), label: `${m.nim} - ${m.nama}` }))}
                        searchable
                        radius="md"
                        size="md"
                        {...form.getInputProps("mahasiswaId")}
                        required
                        className="max-w-md"
                      />
                      <Textarea
                        label="Judul Rancangan Penelitian"
                        placeholder="Masukkan judul awal penelitian..."
                        radius="md"
                        size="md"
                        autosize
                        minRows={1}
                        {...form.getInputProps("judulPenelitian")}
                        required
                        fw={800}
                        styles={{
                          input: {
                            fontSize: rem(18),
                            lineHeight: 1.4,
                          }
                        }}
                      />
                    </Stack>
                  </div>
                )}

                <Stack gap="xl">
                  {/* Dosen PA Section */}
                  <div className="bg-white rounded-3xl border border-gs-success/20 shadow-sm overflow-hidden">
                    <div className="bg-gs-success/5 p-6 border-b border-gs-success/10">
                      <Group gap="md">
                        <div className="bg-gs-success/20 p-3 rounded-2xl">
                          <IconShieldCheck size={28} className="text-gs-success" />
                        </div>
                        <Stack gap={0}>
                          <Text fw={800} fz="lg" className="text-gs-success-text tracking-tight">DOSEN PA</Text>
                          <Text size="xs" c="dimmed" fw={600}>Verifikasi substansi & kelayakan usulan</Text>
                        </Stack>
                      </Group>
                    </div>
                    
                    <div className="p-8">
                      <Stack gap="xl">
                        <Select
                          label="Status Verifikasi"
                          data={[
                            { value: "menunggu", label: "⏳ MENUNGGU" },
                            { value: "diverifikasi", label: "✅ DIVERIFIKASI" },
                            { value: "ditolak", label: "❌ DITOLAK" },
                            { value: "proses", label: "⚙️ DALAM PROSES" }
                          ]}
                          radius="md"
                          size="md"
                          {...form.getInputProps("status_dosen_pa")}
                          className="max-w-xs"
                          styles={{
                            input: { fontWeight: 700 }
                          }}
                        />
                        <Textarea
                          label={
                            <Group gap="xs">
                              <IconMessageDots size={18} stroke={2} className="text-gs-success" />
                              <Text fw={700}>Catatan Verifikasi</Text>
                            </Group>
                          }
                          placeholder="Masukkan catatan detail hasil verifikasi..."
                          autosize
                          minRows={4}
                          radius="md"
                          size="md"
                          {...form.getInputProps("catatan_dosen_pa")}
                        />
                      </Stack>
                    </div>
                  </div>

                  {/* Kaprodi Section */}
                  <div className="bg-white rounded-3xl border border-gs-primary/20 shadow-sm overflow-hidden">
                    <div className="bg-gs-primary/5 p-6 border-b border-gs-primary/10">
                      <Group gap="md">
                        <div className="bg-gs-primary/20 p-3 rounded-2xl">
                          <IconShieldCheck size={28} className="text-gs-primary" />
                        </div>
                        <Stack gap={0}>
                          <Text fw={800} fz="lg" className="text-gs-primary-text tracking-tight">KAPRODI</Text>
                          <Text size="xs" c="dimmed" fw={600}>Persetujuan akhir & penetapan status</Text>
                        </Stack>
                      </Group>
                    </div>

                    <div className="p-8">
                      <Stack gap="xl">
                        <Select
                          label="Status Persetujuan Akhir"
                          data={[
                            { value: "menunggu", label: "⏳ MENUNGGU" },
                            { value: "diterima", label: "✅ DITERIMA" },
                            { value: "ditolak", label: "❌ DITOLAK" },
                            { value: "proses", label: "⚙️ DALAM PROSES" }
                          ]}
                          radius="md"
                          size="md"
                          {...form.getInputProps("status_kaprodi")}
                          className="max-w-xs"
                          styles={{
                            input: { fontWeight: 700 }
                          }}
                        />
                        <Textarea
                          label={
                            <Group gap="xs">
                              <IconMessageDots size={18} stroke={2} className="text-gs-primary" />
                              <Text fw={700}>Catatan Persetujuan</Text>
                            </Group>
                          }
                          placeholder="Masukkan catatan detail hasil persetujuan..."
                          autosize
                          minRows={4}
                          radius="md"
                          size="md"
                          {...form.getInputProps("catatan_kaprodi")}
                        />
                      </Stack>
                    </div>
                  </div>
                </Stack>

                <Group justify="flex-end" pt="xl" className="border-t border-slate-100 dark:border-slate-800 pb-2">
                  <Button variant="subtle" color="gray" onClick={close} radius="md" fw={600} size="md">
                    Batal
                  </Button>
                  <Button
                    className="bg-gs-primary hover:bg-gs-primary-hover"
                    type="submit"
                    loading={isUpdating}
                    radius="md"
                    px={40}
                    size="md"
                    fw={800}
                    h={rem(52)}
                  >
                    {editingPengajuan ? "KONFIRMASI UPDATE STATUS" : "SIMPAN PENGAJUAN BARU"}
                  </Button>
                </Group>
              </Stack>
            </form>
      </Modal>
    </>
  );
}
