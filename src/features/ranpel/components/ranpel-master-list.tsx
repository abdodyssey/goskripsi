"use client";

import { useAllPengajuan } from "../hooks/use-ranpel";
import { useMahasiswa } from "@/features/mahasiswa/hooks/use-mahasiswa";
import {
  Text,
  Group,
  Stack,
  TextInput,
  Textarea,
  Modal,
  Button,
  Grid,
  rem,
  Tooltip,
  Select,
  ScrollArea,
} from "@mantine/core";
import { 
  IconEdit, 
  IconSearch, 
  IconTrash, 
  IconFileDescription, 
  IconTarget, 
  IconBulb, 
  IconAnalyze, 
  IconDatabase, 
  IconBook,
  IconUserCircle
} from "@tabler/icons-react";
import { useDisclosure } from "@mantine/hooks";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { RancanganPenelitian } from "../types/ranpel.type";
import { useState, useMemo } from "react";
import { DataTable, DataTableColumn } from "@/components/ui/data-table";
import { ActionIconButton } from "@/components/ui/action-icon-button";
import { modals } from "@mantine/modals";

export function RanpelMasterList() {
  const { 
    pengajuanList, 
    isLoading, 
    isError, 
    updateRanpel, 
    isUpdating,
    createPengajuan
  } = useAllPengajuan();
  const { mahasiswaList, isLoading: mhsLoading } = useMahasiswa();

  const [search, setSearch] = useState("");
  const [editingRanpel, setEditingRanpel] = useState<RancanganPenelitian | null>(null);
  const [opened, { open, close }] = useDisclosure(false);

  // Derive unique Ranpel list from Pengajuan list
  const ranpelList = useMemo(() => {
    const list: RancanganPenelitian[] = [];
    const seenIds = new Set<number>();

    (pengajuanList || []).forEach(p => {
      if (p.rancanganPenelitian && !seenIds.has(p.rancanganPenelitian.id)) {
        // Attach student info from pengajuan to the ranpel object for easier rendering
        const ranpelWithMhs = {
          ...p.rancanganPenelitian,
          mahasiswa: p.rancanganPenelitian.mahasiswa || p.mahasiswa
        };
        list.push(ranpelWithMhs);
        seenIds.add(p.rancanganPenelitian.id);
      }
    });

    return list;
  }, [pengajuanList]);

  const form = useForm({
    initialValues: {
      mahasiswaId: "",
      judulPenelitian: "",
      masalahDanPenyebab: "",
      alternatifSolusi: "",
      metodePenelitian: "",
      hasilYangDiharapkan: "",
      kebutuhanData: "",
      jurnalReferensi: "",
    },
  });

  const handleAdd = () => {
    setEditingRanpel(null);
    form.reset();
    open();
  };

  const handleEdit = (ranpel: RancanganPenelitian) => {
    setEditingRanpel(ranpel);
    form.setValues({
      judulPenelitian: ranpel.judulPenelitian || "",
      masalahDanPenyebab: ranpel.masalahDanPenyebab || "",
      alternatifSolusi: ranpel.alternatifSolusi || "",
      metodePenelitian: ranpel.metodePenelitian || "",
      hasilYangDiharapkan: ranpel.hasilYangDiharapkan || "",
      kebutuhanData: ranpel.kebutuhanData || "",
      jurnalReferensi: ranpel.jurnalReferensi || "",
    });
    open();
  };

  const onSave = async (values: typeof form.values) => {
    try {
      if (editingRanpel) {
        await updateRanpel({
          ranpelId: editingRanpel.id.toString(),
          data: values as any,
        });
        notifications.show({
          title: "Berhasil",
          message: "Data rancangan penelitian berhasil diupdate",
          color: "var(--gs-success)",
        });
      } else {
        if (!values.mahasiswaId) {
          notifications.show({
            title: "Peringatan",
            message: "Mahasiswa wajib dipilih",
            color: "var(--gs-warning)",
          });
          return;
        }
        await createPengajuan(values as any);
        notifications.show({
          title: "Berhasil",
          message: "Data rancangan penelitian baru berhasil ditambahkan",
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

  const filteredData = useMemo(() => {
    return ranpelList.filter((item) => {
      const searchStr = search.toLowerCase();
      return (
        item.judulPenelitian.toLowerCase().includes(searchStr) ||
        item.mahasiswa?.nama?.toLowerCase().includes(searchStr) ||
        item.mahasiswa?.nim?.toLowerCase().includes(searchStr)
      );
    });
  }, [ranpelList, search]);

  const columns: DataTableColumn<RancanganPenelitian>[] = [
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
      header: "Judul Penelitian",
      render: (row) => (
        <Text size="sm" lineClamp={2} title={row.judulPenelitian}>
          {row.judulPenelitian}
        </Text>
      ),
    },
    {
      header: "Metode",
      render: (row) => (
        <Text size="xs" c="dimmed" lineClamp={1}>
          {row.metodePenelitian || "-"}
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
            tooltip="Edit Detail Ranpel"
            onClick={() => handleEdit(row)}
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
        error={isError ? "Gagal memuat data rancangan penelitian." : null}
        title="Master Data Rancangan Penelitian"
        description="Manajemen detail konten judul dan deskripsi penelitian mahasiswa"
        rightSection={
          <Group gap="sm">
            <TextInput
              placeholder="Cari Judul / Nama / NIM..."
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
              <IconFileDescription size={24} className="text-gs-primary" />
            </div>
            <Stack gap={0}>
              <Text fw={700} fz="xl" className="text-gs-primary-text">
                {editingRanpel ? "Edit Rancangan Penelitian" : "Tambah Rancangan Baru"}
              </Text>
              <Text size="xs" c="dimmed" fw={500}>
                {editingRanpel ? "Perbarui detail substansi usulan skripsi" : "Inisialisasi usulan penelitian mahasiswa"}
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
            {!editingRanpel && (
                  <Select
                    label="Mahasiswa Terkait"
                    description="Pilih mahasiswa untuk inisialisasi data ranpel"
                    placeholder="Cari berdasarkan Nama atau NIM..."
                    leftSection={<IconUserCircle size={20} stroke={1.5} />}
                    data={(mahasiswaList as any[]).map(m => ({ value: m.id.toString(), label: `${m.nim} - ${m.nama}` }))}
                    searchable
                    radius="md"
                    size="md"
                    {...form.getInputProps("mahasiswaId")}
                    required
                    className="max-w-md"
                  />
                )}

                <div className="bg-gs-primary/5 p-6 rounded-2xl border border-gs-primary/10">
                   <Textarea
                      label="Judul Utama Penelitian"
                      placeholder="Masukkan judul lengkap penelitian..."
                      radius="md"
                      size="lg"
                      fw={800}
                      autosize
                      minRows={1}
                      {...form.getInputProps("judulPenelitian")}
                      required
                      styles={{
                        input: {
                            fontSize: rem(22),
                            border: 'none',
                            backgroundColor: 'transparent',
                            padding: 0,
                            lineHeight: 1.4,
                            '&:focus': {
                                backgroundColor: 'transparent'
                            }
                        },
                        label: {
                          marginBottom: rem(8)
                        }
                      }}
                    />
                </div>
                <Stack gap="xl">
                  {/* Research Substance Section */}
                  <div className="bg-white rounded-3xl border border-gs-primary/20 shadow-sm overflow-hidden">
                    <div className="bg-gs-primary/5 p-6 border-b border-gs-primary/10">
                      <Group gap="md">
                        <div className="bg-gs-primary/20 p-3 rounded-2xl">
                          <IconFileDescription size={28} className="text-gs-primary" />
                        </div>
                        <Stack gap={0}>
                          <Text fw={800} fz="lg" className="text-gs-primary-text tracking-tight">SUBSTANSI PENELITIAN</Text>
                          <Text size="xs" c="dimmed" fw={600}>Uraikan detail latar belakang, metode, dan target penelitian</Text>
                        </Stack>
                      </Group>
                    </div>

                    <div className="p-8">
                      <Stack gap="xl">
                        <Textarea
                          label={
                            <Group gap="xs">
                              <IconTarget size={18} stroke={2} className="text-gs-primary" />
                              <Text fw={700}>Masalah & Latar Belakang</Text>
                            </Group>
                          }
                          description="Jelaskan gap analisis atau urgensi penelitian ini"
                          placeholder="Deskripsikan masalah secara mendetail..."
                          autosize
                          minRows={4}
                          radius="md"
                          size="md"
                          {...form.getInputProps("masalahDanPenyebab")}
                          styles={{
                              input: { lineHeight: 1.6 }
                          }}
                        />
                        
                        <Textarea
                          label={
                            <Group gap="xs">
                              <IconBulb size={18} stroke={2} className="text-gs-primary" />
                              <Text fw={700}>Solusi & Inovasi</Text>
                            </Group>
                          }
                          description="Uraikan kebaruan atau rencana penyelesaian"
                          placeholder="Apa solusi konkret yang ditawarkan?"
                          autosize
                          minRows={4}
                          radius="md"
                          size="md"
                          {...form.getInputProps("alternatifSolusi")}
                          styles={{
                              input: { lineHeight: 1.6 }
                          }}
                        />

                        <Textarea
                          label={
                            <Group gap="xs">
                              <IconAnalyze size={18} stroke={2} className="text-gs-primary" />
                              <Text fw={700}>Metode & Pendekatan</Text>
                            </Group>
                          }
                          description="Alur penyelesaian, algoritma, atau framework yang digunakan"
                          placeholder="Bagaimana langkah-langkah teknis penelitian Anda?"
                          autosize
                          minRows={4}
                          radius="md"
                          size="md"
                          {...form.getInputProps("metodePenelitian")}
                          styles={{
                              input: { lineHeight: 1.6 }
                          }}
                        />

                        <Textarea
                          label={
                            <Group gap="xs">
                              <IconDatabase size={18} stroke={2} className="text-gs-primary" />
                              <Text fw={700}>Target & Kontribusi</Text>
                            </Group>
                          }
                          description="Dampak penelitian bagi institusi atau ilmu pengetahuan"
                          placeholder="Apa yang ingin dicapai dari hasil penelitian ini?"
                          autosize
                          minRows={4}
                          radius="md"
                          size="md"
                          {...form.getInputProps("hasilYangDiharapkan")}
                          styles={{
                              input: { lineHeight: 1.6 }
                          }}
                        />

                        <Textarea
                          label={
                            <Group gap="xs">
                              <IconBook size={18} stroke={2} className="text-gs-primary" />
                              <Text fw={700}>Daftar Referensi Utama</Text>
                            </Group>
                          }
                          description="Cantumkan sumber literatur primer (Jurnal/Buku)"
                          placeholder="Gunakan format sitasi standar..."
                          autosize
                          minRows={3}
                          radius="md"
                          size="md"
                          {...form.getInputProps("jurnalReferensi")}
                          styles={{
                              input: { lineHeight: 1.6 }
                          }}
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
                    {editingRanpel ? "SIMPAN PERUBAHAN DATA" : "KONFIRMASI INISIALISASI"}
                  </Button>
                </Group>
              </Stack>
            </form>
      </Modal>
    </>
  );
}
