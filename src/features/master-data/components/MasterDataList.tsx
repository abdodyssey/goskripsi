import {
  Table,
  Button,
  Group,
  ActionIcon,
  Title,
  Paper,
  Stack,
  Modal,
  TextInput,
  Checkbox,
  Select,
} from "@mantine/core";
import { IconEdit, IconTrash, IconPlus } from "@tabler/icons-react";
import { useDisclosure } from "@mantine/hooks";
import { useForm } from "@mantine/form";
import { useMasterData } from "../hooks/use-master-data";
import { useState } from "react";

interface Field {
  name: string;
  label: string;
  type: "text" | "checkbox" | "select";
  options?: { value: string; label: string }[];
}

interface MasterDataListProps {
  entity: string;
  title: string;
  fields: Field[];
  columns: {
    key: string;
    label: string;
    render?: (val: any) => React.ReactNode;
  }[];
}

export function MasterDataList({
  entity,
  title,
  fields,
  columns,
}: MasterDataListProps) {
  const { data, isLoading, create, update, remove, isCreating, isUpdating } =
    useMasterData(entity);
  const [opened, { open, close }] = useDisclosure(false);
  const [selectedId, setSelectedId] = useState<string | number | null>(null);

  const form = useForm({
    initialValues: fields.reduce((acc, field) => {
      acc[field.name] = field.type === "checkbox" ? true : "";
      return acc;
    }, {} as any),
  });

  const handleAdd = () => {
    setSelectedId(null);
    form.reset();
    open();
  };

  const handleEdit = (item: any) => {
    setSelectedId(item.id);
    form.setValues(
      fields.reduce((acc, field) => {
        // Try snake_case (field.name) or camelCase version
        const camelName = field.name.replace(/_([a-z])/g, (g) =>
          g[1].toUpperCase(),
        );
        acc[field.name] =
          item[field.name] !== undefined ? item[field.name] : item[camelName];
        return acc;
      }, {} as any),
    );
    open();
  };

  const handleSubmit = async (values: any) => {
    try {
      if (selectedId) {
        await update({ id: selectedId, data: values });
      } else {
        await create(values);
      }
      close();
    } catch (error) {}
  };

  const handleDelete = async (id: string | number) => {
    if (confirm("Apakah Anda yakin ingin menghapus data ini?")) {
      await remove(id);
    }
  };

  return (
    <Stack>
      <Group justify="space-between">
        <Title order={3}>{title}</Title>
        <Button leftSection={<IconPlus size={16} />} onClick={handleAdd}>
          Tambah Data
        </Button>
      </Group>

      <Paper withBorder p="md" radius="md">
        <Table verticalSpacing="sm">
          <Table.Thead>
            <Table.Tr>
              {columns.map((col) => (
                <Table.Th key={col.key}>{col.label}</Table.Th>
              ))}
              <Table.Th style={{ width: rem(80) }}>Aksi</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {isLoading ? (
              <Table.Tr>
                <Table.Td colSpan={columns.length + 1} align="center">
                  Loading...
                </Table.Td>
              </Table.Tr>
            ) : data.length === 0 ? (
              <Table.Tr>
                <Table.Td colSpan={columns.length + 1} align="center">
                  Tidak ada data
                </Table.Td>
              </Table.Tr>
            ) : (
              data.map((item: any) => (
                <Table.Tr key={item.id}>
                  {columns.map((col) => (
                    <Table.Td key={col.key}>
                      {col.render
                        ? col.render(item[col.key])
                        : typeof item[col.key] === "boolean"
                          ? item[col.key]
                            ? "Ya"
                            : "Tidak"
                          : item[col.key]}
                    </Table.Td>
                  ))}
                  <Table.Td>
                    <Group gap="xs" wrap="nowrap">
                      <ActionIcon
                        variant="subtle"
                        color="blue"
                        onClick={() => handleEdit(item)}
                      >
                        <IconEdit size={16} />
                      </ActionIcon>
                      <ActionIcon
                        variant="subtle"
                        color="red"
                        onClick={() => handleDelete(item.id)}
                      >
                        <IconTrash size={16} />
                      </ActionIcon>
                    </Group>
                  </Table.Td>
                </Table.Tr>
              ))
            )}
          </Table.Tbody>
        </Table>
      </Paper>

      <Modal
        opened={opened}
        onClose={close}
        title={selectedId ? `Edit ${title}` : `Tambah ${title}`}
      >
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack>
            {fields.map((field) => {
              if (field.type === "checkbox") {
                return (
                  <Checkbox
                    key={field.name}
                    label={field.label}
                    {...form.getInputProps(field.name, { type: "checkbox" })}
                  />
                );
              }
              if (field.type === "select") {
                return (
                  <Select
                    key={field.name}
                    label={field.label}
                    data={field.options}
                    {...form.getInputProps(field.name)}
                  />
                );
              }
              return (
                <TextInput
                  key={field.name}
                  label={field.label}
                  {...form.getInputProps(field.name)}
                />
              );
            })}
            <Button type="submit" loading={isCreating || isUpdating}>
              Simpan
            </Button>
          </Stack>
        </form>
      </Modal>
    </Stack>
  );
}

const rem = (v: number) => `${v}px`;
