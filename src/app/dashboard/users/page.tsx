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
  Paper,
  TextInput,
  Select,
  PasswordInput,
  Menu,
  rem,
  Center,
  Loader,
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
} from "@tabler/icons-react";
import { useDisclosure } from "@mantine/hooks";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { modals } from "@mantine/modals";
import { apiClient } from "@/lib/api-client";
import { useState } from "react";

interface User {
  id: number;
  username: string;
  nama: string;
  email: string;
  role: string;
  roleId: number;
  createdAt: string;
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

  // ---- Queries ----
  const { data: usersResponse, isLoading } = useQuery({
    queryKey: ["users-list", search],
    queryFn: async () => {
      const res = await apiClient.get(`/users?search=${search}`);
      return res.data;
    },
    enabled: isAuthenticated && isSuperAdmin,
  });

  const { data: rolesResponse } = useQuery({
    queryKey: ["roles-list"],
    queryFn: async () => {
      const res = await apiClient.get("/roles");
      return res.data;
    },
    enabled: isAuthenticated && isSuperAdmin,
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
        color: "teal",
      });
      close();
    },
    onError: (error: any) => {
      notifications.show({
        title: "Gagal",
        message: error.response?.data?.message || "Terjadi kesalahan",
        color: "red",
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
        color: "teal",
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
    open();
  };

  const handleOpenEdit = (u: User) => {
    setEditingUser(u);
    form.setValues({
      username: u.username,
      nama: u.nama,
      email: u.email,
      role_id: String(u.roleId),
      password: "", // Reset password only if provided
    });
    open();
  };

  const handleDelete = (u: User) => {
    modals.openConfirmModal({
      title: "Hapus User",
      children: (
        <Text size="sm">
          Apakah Anda yakin ingin menghapus user <b>{u.nama}</b>? Tindakan ini akan menghapus data terkait mahasiswa/dosen jika ada.
        </Text>
      ),
      labels: { confirm: "Hapus", cancel: "Batal" },
      confirmProps: { color: "red" },
      onConfirm: () => deleteMutation.mutate(u.id),
    });
  };

  const roleOptions = (rolesResponse?.data || []).map((r: any) => ({
    value: String(r.id),
    label: r.name.toUpperCase(),
  }));

  const columns: DataTableColumn<User>[] = [
    {
      header: "User",
      render: (row) => (
        <Group gap="sm">
          <Paper withBorder radius="xl" w={40} h={40}>
            <Center h="100%">
              <IconUser size={20} stroke={1.5} color="var(--mantine-color-indigo-6)" />
            </Center>
          </Paper>
          <Stack gap={0}>
            <Text size="sm" fw={700}>{row.nama}</Text>
            <Text size="xs" c="dimmed">@{row.username}</Text>
          </Stack>
        </Group>
      ),
    },
    {
      header: "Email",
      render: (row) => (
        <Group gap={4}>
          <IconMail size={14} color="gray" />
          <Text size="sm">{row.email}</Text>
        </Group>
      ),
    },
    {
      header: "Role",
      render: (row) => {
        const colors: Record<string, string> = {
          superadmin: "red",
          admin: "orange",
          sekprodi: "indigo",
          kaprodi: "blue",
          dosen: "teal",
          mahasiswa: "slate",
        };
        return (
          <Badge variant="light" color={colors[row.role.toLowerCase()] || "gray"} radius="sm">
            {row.role.toUpperCase()}
          </Badge>
        );
      },
    },
    {
      header: "Aksi",
      textAlign: "right",
      width: 80,
      render: (row) => (
        <Menu shadow="md" width={200} position="bottom-end">
          <Menu.Target>
            <ActionIcon variant="subtle" color="gray">
              <IconDotsVertical size={18} />
            </ActionIcon>
          </Menu.Target>

          <Menu.Dropdown>
            <Menu.Label>Manajemen</Menu.Label>
            <Menu.Item
              leftSection={<IconEdit style={{ width: rem(14), height: rem(14) }} />}
              onClick={() => handleOpenEdit(row)}
            >
              Edit User
            </Menu.Item>
            <Menu.Divider />
            <Menu.Label color="red">Bahaya</Menu.Label>
            <Menu.Item
              color="red"
              leftSection={<IconTrash style={{ width: rem(14), height: rem(14) }} />}
              onClick={() => handleDelete(row)}
            >
              Hapus User
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
      ),
    },
  ];

  if (isLoadingProfile || !isAuthenticated) return null;
  if (!isSuperAdmin) {
    return (
      <Container size="xl" pt="xl">
        <Alert color="red" title="Akses Ditolak" icon={<IconShieldLock />}>
          Hanya Super Admin yang dapat mengakses halaman manajemen user.
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
            leftSection={<IconUserPlus size={18} />}
            onClick={handleOpenCreate}
            color="indigo"
            radius="md"
          >
            Tambah User Baru
          </Button>
        }
      />

      <Paper withBorder radius="lg" p="md" mt="xl" bg="gray.0" className="dark:bg-dark-7">
        <Group justify="space-between" mb="md">
          <TextInput
            placeholder="Cari nama, username, atau email..."
            leftSection={<IconSearch size={16} stroke={1.5} />}
            value={search}
            onChange={(e) => setSearch(e.currentTarget.value)}
            w={350}
            radius="md"
          />
        </Group>

        <DataTable<User>
          data={usersResponse?.data || []}
          columns={columns}
          loading={isLoading}
          noCard
        />
      </Paper>

      {/* ---- Form Modal ---- */}
      <Modal
        opened={opened}
        onClose={close}
        title={
          <Text fw={700} size="lg">
            {editingUser ? "Edit User" : "Tambah User Baru"}
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
              disabled={!!editingUser}
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
            <PasswordInput
              label={editingUser ? "Ganti Password (Kosongkan jika tidak diubah)" : "Password"}
              placeholder="Masukkan password"
              required={!editingUser}
              leftSection={<IconShieldLock size={16} />}
              {...form.getInputProps("password")}
            />

            <Group justify="flex-end" mt="xl">
              <Button variant="subtle" onClick={close} color="gray">
                Batal
              </Button>
              <Button
                type="submit"
                loading={saveMutation.isPending}
                color="indigo"
                radius="md"
              >
                {editingUser ? "Simpan Perubahan" : "Buat User"}
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>
    </Container>
  );
}

function Alert({ children, title, color, icon }: any) {
  return (
    <Paper withBorder p="xl" radius="lg" bg={`${color}.0`}>
      <Group>
        <ThemeIcon size={40} radius="md" color={color} variant="light">
          {icon}
        </ThemeIcon>
        <Stack gap={2}>
          <Text fw={700} c={`${color}.9`}>{title}</Text>
          <Text size="sm">{children}</Text>
        </Stack>
      </Group>
    </Paper>
  );
}
