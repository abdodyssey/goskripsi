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
  ActionIcon,
  Paper,
  TextInput,
  Select,
  PasswordInput,
  Menu,
  rem,
  Center,
  ThemeIcon,
} from "@mantine/core";
import { PageHeader } from "@/components/PageHeader/PageHeader";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  IconUsers,
  IconUserPlus,
  IconEdit,
  IconTrash,
  IconDotsVertical,
  IconSearch,
  IconLock,
  IconMail,
  IconUser,
  IconShieldLock,
  IconCheck,
  IconX,
} from "@tabler/icons-react";
import { useDisclosure } from "@mantine/hooks";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { modals } from "@mantine/modals";
import { apiClient } from "@/lib/api-client";
import { useState } from "react";
import { ActionIconButton } from "@/components/ui/action-icon-button";
import { StatusBadge } from "@/components/ui/status-badge";

interface User {
  id: number;
  username: string;
  nama: string;
  email: string;
  role: string;
  roleId: number;
  status?: string;
  prodiId?: number;
  prodiName?: string;
}

export default function UserManagementPage() {
  const { userResponse, isLoadingProfile, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const [opened, { open, close }] = useDisclosure(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [search, setSearch] = useState("");

  const user = userResponse?.user;
  const roles = user?.roles || userResponse?.roles || [];
  const isSuperAdmin = roles.includes("superadmin");
  const isAdmin = roles.includes("admin");
  const isKaprodi = roles.includes("kaprodi");
  const isSekprodi = roles.includes("sekprodi");
  const canManageUsers = isSuperAdmin || isAdmin || isKaprodi || isSekprodi;
  const lockedProdiId = !isSuperAdmin ? user?.prodiId : null;

  // ---- Queries ----
  const { data: usersResponse, isLoading } = useQuery({
    queryKey: ["users-list", search],
    queryFn: async () => {
      const res = await apiClient.get(`/users?search=${search}&limit=5000`);
      return res.data;
    },
    enabled: isAuthenticated && canManageUsers,
  });

  const { data: rolesResponse } = useQuery({
    queryKey: ["roles-list"],
    queryFn: async () => {
      const res = await apiClient.get("/roles");
      return res.data;
    },
    enabled: isAuthenticated && canManageUsers,
  });

  const { data: prodiResponse } = useQuery({
    queryKey: ["prodi-list"],
    queryFn: async () => {
      const res = await apiClient.get("/prodi");
      return res.data;
    },
    enabled: isAuthenticated && canManageUsers,
  });

  // ---- Mutations ----
  const saveMutation = useMutation({
    mutationFn: async (payload: any) => {
      if (editingUser) {
        return await apiClient.put(`/users/${editingUser.id}`, payload);
      }
      return await apiClient.post("/users", payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users-list"] });
      notifications.show({
        title: "Berhasil",
        message: `User berhasil ${editingUser ? "diperbarui" : "dibuat"}`,
        color: "var(--gs-success)",
      });
      close();
    },
    onError: (error: any) => {
      notifications.show({
        title: "Gagal",
        message: error.response?.data?.message || "Terjadi kesalahan",
        color: "var(--gs-danger)",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiClient.delete(`/users/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users-list"] });
      notifications.show({
        title: "Berhasil",
        message: "User berhasil dihapus",
        color: "var(--gs-success)",
      });
    },
  });

  // ---- Form ----
  const form = useForm({
    initialValues: {
      username: "",
      nama: "",
      email: "",
      password: "",
      role_id: "",
      status: "aktif",
      prodi_id: "",
    },
    validate: {
      username: (val) => (val.length < 3 ? "Username terlalu pendek" : null),
      nama: (val) => (val.length < 3 ? "Nama terlalu pendek" : null),
      email: (val) => (/^\S+@\S+$/.test(val) ? null : "Email tidak valid"),
      role_id: (val) => (!val ? "Role wajib dipilih" : null),
    },
  });

  const handleOpenCreate = () => {
    setEditingUser(null);
    form.reset();
    if (lockedProdiId) {
      form.setFieldValue("prodi_id", String(lockedProdiId));
    }
    open();
  };

  const handleOpenEdit = (u: User) => {
    setEditingUser(u);
    form.setValues({
      username: u.username,
      nama: u.nama,
      email: u.email,
      role_id: String(u.roleId),
      status: u.status || "aktif",
      prodi_id: u.prodiId ? String(u.prodiId) : "",
      password: "", // Reset password only if provided
    });
    if (lockedProdiId) {
      form.setFieldValue("prodi_id", String(lockedProdiId));
    }
    open();
  };

  const handleDelete = (u: User) => {
    modals.openConfirmModal({
      title: "Hapus User",
      children: (
        <Text size="sm">
          Apakah Anda yakin ingin menghapus user <b>{u.nama}</b>? Tindakan ini
          akan menghapus data terkait mahasiswa/dosen jika ada.
        </Text>
      ),
      labels: { confirm: "Hapus", cancel: "Batal" },
      confirmProps: { color: "var(--gs-danger)" },
      onConfirm: () => deleteMutation.mutate(u.id),
    });
  };

  const roleOptions = (rolesResponse?.data || [])
    .filter((r: any) =>
      isSuperAdmin
        ? true
        : ["mahasiswa", "dosen"].includes(String(r.name).toLowerCase()),
    )
    .map((r: any) => ({
      value: String(r.id),
      label: r.name.toUpperCase(),
    }));

  const statusOptions = [
    { value: "aktif", label: "AKTIF" },
    { value: "tidak_aktif", label: "TIDAK AKTIF" },
  ];

  const prodiOptions = (prodiResponse?.data || []).map((p: any) => ({
    value: String(p.id),
    label: p.namaProdi || p.nama || p.namaProdi || p.name,
  }));

  const columns: DataTableColumn<User>[] = [
    {
      header: "Nama & Username",
      render: (row) => (
        <Stack gap={0}>
          <Text size="sm" fw={700} className="text-gs-text-primary">
            {row.nama || "-"}
          </Text>
          <Text size="xs" className="text-gs-text-muted">
            @{row.username}
          </Text>
        </Stack>
      ),
    },
    {
      header: "Email",
      render: (row) => (
        <Text size="sm" className="text-gs-text-secondary" fw={500}>
          {row.email}
        </Text>
      ),
    },
    {
      header: "Role",
      render: (row) => {
        return (
          <Badge
            variant="light"
            color="dark"
            radius="sm"
            fw={700}
            size="xs"
            className="text-gs-text-primary"
          >
            {row.role.toUpperCase()}
          </Badge>
        );
      },
    },
    {
      header: "Status",
      render: (row) => <StatusBadge status={row.status || "aktif"} />,
    },
    {
      header: "Aksi",
      textAlign: "right",
      width: 100,
      render: (row) => (
        <Group gap={4} justify="flex-end">
          <ActionIconButton
            icon={IconEdit}
            tooltip="Edit Akun User"
            onClick={() => handleOpenEdit(row)}
          />
          <ActionIconButton
            icon={IconTrash}
            tooltip="Hapus User"
            color="var(--gs-danger)"
            onClick={() => handleDelete(row)}
          />
        </Group>
      ),
    },
  ];

  if (isLoadingProfile || !isAuthenticated) return null;
  if (!canManageUsers) {
    return (
      <Container size="xl" pt="xl">
        <Alert
          color="var(--gs-danger)"
          title="Akses Ditolak"
          icon={<IconShieldLock size={24} />}
        >
          Hanya Admin, Kaprodi, Sekprodi, atau Super Admin yang dapat mengakses
          halaman manajemen user.
        </Alert>
      </Container>
    );
  }

  return (
    <Container size="xl" pt="md">
      <PageHeader
        title="Manajemen User"
        description="Kelola seluruh pengguna sistem, hak akses, dan kredensial login"
        icon={IconUsers}
        items={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "User Management" },
        ]}
        rightSection={
          <Button
            leftSection={<IconUserPlus size={18} stroke={1.5} />}
            onClick={handleOpenCreate}
            className="bg-gs-primary hover:bg-gs-primary-hover"
            radius="md"
            fw={700}
          >
            TAMBAH USER BARU
          </Button>
        }
      />

      <DataTable<User>
        data={usersResponse?.data || []}
        columns={columns}
        loading={isLoading}
        title="Daftar Pengguna Sistem"
        description="Manajemen seluruh akun pengguna, hak akses, dan kredensial login"
        rightSection={
          <TextInput
            placeholder="Cari nama, username, atau email..."
            leftSection={
              <IconSearch
                size={18}
                stroke={1.5}
                className="text-gs-text-muted"
              />
            }
            value={search}
            onChange={(e) => setSearch(e.currentTarget.value)}
            w={350}
            radius="md"
            variant="filled"
            styles={{
              input: {
                backgroundColor: "var(--gs-bg-overlay)",
                border: "1px solid var(--gs-border)",
              },
            }}
          />
        }
      />

      {/* ---- Form Modal ---- */}
      <Modal
        opened={opened}
        onClose={close}
        title={
          <Text
            fw={800}
            size="lg"
            className="text-gs-text-primary tracking-tight"
          >
            {editingUser ? "EDIT USER" : "TAMBAH USER BARU"}
          </Text>
        }
        radius="lg"
        size="md"
        centered
      >
        <form onSubmit={form.onSubmit((values) => saveMutation.mutate(values))}>
          <Stack gap="md">
            <TextInput
              label="Nama Lengkap"
              placeholder="Masukkan nama lengkap"
              required
              leftSection={<IconUser size={16} />}
              {...form.getInputProps("nama")}
            />
            <TextInput
              label="Username"
              placeholder="Masukkan username"
              required
              // allow editing username
              leftSection={<IconLock size={16} />}
              {...form.getInputProps("username")}
            />
            <TextInput
              label="Email"
              placeholder="user@email.com"
              required
              leftSection={<IconMail size={16} />}
              {...form.getInputProps("email")}
            />
            <Select
              label="Role"
              placeholder="Pilih role"
              data={roleOptions}
              required
              {...form.getInputProps("role_id")}
            />
            <Select
              label="Program Studi"
              placeholder="Pilih program studi (opsional)"
              data={prodiOptions}
              disabled={!isSuperAdmin}
              description={
                !isSuperAdmin
                  ? "Program studi dikunci sesuai akun login."
                  : undefined
              }
              {...form.getInputProps("prodi_id")}
            />
            <Select
              label="Status Akun"
              placeholder="Pilih status"
              data={statusOptions}
              required
              {...form.getInputProps("status")}
            />
            <PasswordInput
              label={
                editingUser
                  ? "Ganti Password (Kosongkan jika tidak diubah)"
                  : "Password"
              }
              placeholder="Masukkan password"
              required={!editingUser}
              leftSection={<IconShieldLock size={16} />}
              {...form.getInputProps("password")}
            />

            <Group justify="flex-end" mt="xl">
              <Button
                variant="subtle"
                onClick={close}
                color="var(--gs-text-muted)"
                radius="md"
                fw={700}
              >
                BATAL
              </Button>
              <Button
                type="submit"
                loading={saveMutation.isPending}
                className="bg-gs-primary hover:bg-gs-primary-hover"
                radius="md"
                fw={700}
              >
                {editingUser ? "SIMPAN PERUBAHAN" : "BUAT USER"}
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>
    </Container>
  );
}

function Alert({ children, title, color, icon }: any) {
  const isDanger = color.includes("danger") || color === "red";
  const bgColor = isDanger ? "var(--gs-danger-bg)" : "var(--gs-bg-overlay)";
  const borderColor = isDanger ? "var(--gs-danger-border)" : "var(--gs-border)";
  const textColor = isDanger
    ? "var(--gs-danger-text)"
    : "var(--gs-text-primary)";
  return (
    <Paper withBorder p="xl" radius="lg" bg={bgColor} style={{ borderColor }}>
      <Group>
        <ThemeIcon
          size={48}
          radius="md"
          className={isDanger ? "bg-gs-danger" : "bg-gs-primary"}
          variant="filled"
        >
          {icon}
        </ThemeIcon>
        <Stack gap={2}>
          <Text
            fw={800}
            className="text-gs-text-primary"
            style={{ color: textColor }}
          >
            {title}
          </Text>
          <Text size="sm" className="text-gs-text-secondary">
            {children}
          </Text>
        </Stack>
      </Group>
    </Paper>
  );
}
