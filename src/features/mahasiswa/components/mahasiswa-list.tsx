"use client";

import { useMahasiswa, useProdis, useDosens } from "../hooks/use-mahasiswa";
import {
  Text,
  Group,
  Stack,
  TextInput,
  NumberInput,
  Select,
  Modal,
  Button,
  Grid,
  rem,
  Tooltip,
} from "@mantine/core";
import { IconEdit, IconSearch } from "@tabler/icons-react";
import { useDisclosure } from "@mantine/hooks";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { Mahasiswa, StatusAkun } from "@/types/user.type";
import { useState, useMemo } from "react";
import { StudentProfileModal } from "./student-profile-modal";

import { DataTable, DataTableColumn } from "@/components/ui/data-table";
import { StatusBadge } from "@/components/ui/status-badge";
import { ActionIconButton } from "@/components/ui/action-icon-button";

export function MahasiswaList() {
  const { mahasiswaList, isLoading, isError, updateMahasiswa, isUpdating } =
    useMahasiswa();
  const { data: prodisData } = useProdis();
  const { data: dosensData } = useDosens();

  const [search, setSearch] = useState("");
  const [editingMahasiswa, setEditingMahasiswa] = useState<Mahasiswa | null>(
    null,
  );
  const [opened, { open, close }] = useDisclosure(false);

  const [profileOpened, { open: openProfile, close: closeProfile }] =
    useDisclosure(false);
  const [selectedStudent, setSelectedStudent] = useState<Mahasiswa | null>(
    null,
  );

  const handleShowStudentProfile = (student: Mahasiswa) => {
    setSelectedStudent(student);
    openProfile();
  };

  // Form for editing student
  const form = useForm({
    initialValues: {
      nama: "",
      nim: "",
      prodi_id: "",
      semester: 1,
      ipk: 0,
      angkatan: "",
      status: "aktif",
      dosen_pa: "",
    },
  });

  const handleEdit = (mhs: Mahasiswa) => {
    setEditingMahasiswa(mhs);
    form.setValues({
      nama: mhs.nama || "",
      nim: mhs.nim || "",
      prodi_id: (mhs.prodi_id || "")?.toString(),
      semester: Number(mhs.semester || 1),
      ipk: Number(mhs.ipk || 0),
      angkatan: mhs.angkatan || "",
      status: mhs.status || "aktif",
      dosen_pa:
        typeof mhs.dosen_pa === "object"
          ? String(mhs.dosen_pa?.id || "")
          : String(mhs.dosen_pa || ""),
    });
    open();
  };

  const onUpdate = async (values: typeof form.values) => {
    if (!editingMahasiswa) return;

    try {
      await updateMahasiswa({
        id: editingMahasiswa.id.toString(),
        data: {
          ...values,
          prodi_id: Number(values.prodi_id),
          dosen_pa: values.dosen_pa ? Number(values.dosen_pa) : null,
          status: values.status as StatusAkun,
        },
      });
      notifications.show({
        title: "Berhasil",
        message: "Data mahasiswa berhasil diupdate",
        color: "var(--gs-success)",
      });
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
    const list = Array.isArray(mahasiswaList)
      ? (mahasiswaList as Mahasiswa[])
      : [];
    return list.filter((item) => {
      const searchStr = (search || "").toLowerCase();
      const nama = item.nama || "";
      const nim = item.nim || "";
      return (
        (nama || "").toLowerCase().includes(searchStr) ||
        (nim || "").toLowerCase().includes(searchStr)
      );
    });
  }, [mahasiswaList, search]);

  const columns: DataTableColumn<Mahasiswa>[] = [
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
              {row.nama || "-"}
            </Text>
          </Tooltip>
          <Text size="xs" c="dimmed">
            {row.nim || "-"}
          </Text>
        </Stack>
      ),
    },
    {
      header: "Program Studi",
      render: (row) => (
        <Text size="sm" c="dimmed">
          {row.prodi?.namaProdi || row.prodi?.nama_prodi || "-"}
        </Text>
      ),
    },
    {
      header: "Angkatan",
      accessor: "angkatan",
      render: (row) => (
        <Text size="sm" c="dimmed">
          {row.angkatan || "-"}
        </Text>
      ),
    },
    {
      header: "Status",
      render: (row) => {
        const status = row.status || "aktif";
        return <StatusBadge status={status} />;
      },
    },
    {
      header: "Aksi",
      textAlign: "right",
      render: (row) => (
        <Group gap={4} justify="flex-end">
          <ActionIconButton
            icon={IconEdit}
            tooltip="Edit Bio Mahasiswa"
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
        error={isError ? "Gagal memuat data mahasiswa." : null}
        title="Daftar Mahasiswa"
        description="Manajemen data biodata dan statistik mahasiswa"
        rightSection={
          <TextInput
            placeholder="Cari Nama / NIM..."
            leftSection={<IconSearch size={16} />}
            value={search}
            onChange={(e) => setSearch(e.currentTarget.value)}
            style={{ width: 250 }}
            radius="md"
          />
        }
      />

      {/* Edit Modal */}
      <Modal
        opened={opened}
        onClose={close}
        title={
          <Stack gap={0}>
            <Text fw={600} fz="lg" className="">
              Edit Data Mahasiswa
            </Text>
            <Text size="xs" c="dimmed">
              Perbarui informasi biodata akademik mahasiswa
            </Text>
          </Stack>
        }
        size="lg"
        radius="lg"
        overlayProps={{
          backgroundOpacity: 0.5,
          blur: 4,
        }}
        styles={{
          header: { padding: "24px 24px 16px" },
          body: { padding: "0 24px 24px" },
          close: { color: "var(--mantine-color-slate-4)" },
        }}
      >
        <form onSubmit={form.onSubmit(onUpdate)}>
          <Stack gap="lg">
            <Grid gutter="md">
              <Grid.Col span={6}>
                <TextInput
                  label="Nama"
                  placeholder="Nama Mahasiswa"
                  radius="md"
                  {...form.getInputProps("nama")}
                  required
                />
              </Grid.Col>
              <Grid.Col span={6}>
                <TextInput
                  label="NIM"
                  placeholder="12345678"
                  radius="md"
                  {...form.getInputProps("nim")}
                  required
                />
              </Grid.Col>
              <Grid.Col span={6}>
                <Select
                  label="Program Studi"
                  placeholder="Pilih Prodi"
                  radius="md"
                  data={
                    prodisData?.data?.map((p) => ({
                      value: p.id.toString(),
                      label: p.namaProdi || p.nama_prodi || "-",
                    })) || []
                  }
                  {...form.getInputProps("prodi_id")}
                  required
                />
              </Grid.Col>
              <Grid.Col span={6}>
                <TextInput
                  label="Angkatan"
                  placeholder="2020"
                  radius="md"
                  {...form.getInputProps("angkatan")}
                  required
                />
              </Grid.Col>
              <Grid.Col span={4}>
                <NumberInput
                  label="Semester"
                  min={1}
                  max={14}
                  radius="md"
                  {...form.getInputProps("semester")}
                />
              </Grid.Col>
              <Grid.Col span={4}>
                <NumberInput
                  label="IPK"
                  decimalScale={2}
                  step={0.01}
                  min={0}
                  max={4}
                  radius="md"
                  {...form.getInputProps("ipk")}
                />
              </Grid.Col>
              <Grid.Col span={4}>
                <Select
                  label="Status"
                  radius="md"
                  data={["aktif", "cuti", "alumni", "drop out"]}
                  {...form.getInputProps("status")}
                />
              </Grid.Col>
              <Grid.Col span={12}>
                <Select
                  label="Dosen Pembimbing Akademik (PA)"
                  placeholder="Pilih Dosen PA"
                  searchable
                  clearable
                  radius="md"
                  data={
                    (dosensData as any[])?.map((d) => ({
                      value: d.id.toString(),
                      label: d.nama || "-",
                    })) || []
                  }
                  {...form.getInputProps("dosen_pa")}
                />
              </Grid.Col>
            </Grid>

            <Group justify="flex-end" mt="md" gap="md">
              <Button
                variant="subtle"
                color="var(--gs-text-secondary)"
                onClick={close}
                radius="md"
                fw={600}
              >
                Batal
              </Button>
              <Button
                className="bg-gs-primary hover:bg-gs-primary-hover"
                type="submit"
                loading={isUpdating}
                radius="md"
                px="xl"
                fw={700}
                h={rem(42)}
              >
                SIMPAN PERUBAHAN
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>

      <StudentProfileModal
        opened={profileOpened}
        onClose={closeProfile}
        student={selectedStudent}
      />
    </>
  );
}
