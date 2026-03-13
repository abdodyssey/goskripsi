"use client";

import {
  Table,
  Text,
  Group,
  Stack,
  Box,
  Center,
  Loader,
  Card,
  Pagination,
  Paper,
} from "@mantine/core";
import { ReactNode, useState, useMemo } from "react";

export interface DataTableColumn<T> {
  header: string;
  accessor?: keyof T;
  render?: (row: T) => ReactNode;
  textAlign?: "left" | "right" | "center";
  width?: string | number;
}

interface DataTableProps<T> {
  data: T[];
  columns: DataTableColumn<T>[];
  loading?: boolean;
  error?: string | null;
  title?: string;
  description?: string;
  rightSection?: ReactNode;
  emptyState?: ReactNode;
  rowKey?: keyof T | ((row: T) => string);
  onRowClick?: (row: T) => void;
  noCard?: boolean;
}

export function DataTable<T>({
  data,
  columns,
  loading,
  error,
  title,
  description,
  rightSection,
  emptyState,
  rowKey = "id" as keyof T,
  onRowClick,
  noCard = false,
}: DataTableProps<T>) {
  const [page, setPage] = useState(1);
  const recordsPerPage = 10;

  // Calculate derived records state
  const totalPages = Math.ceil(data.length / recordsPerPage);
  const currentRecords = useMemo(() => {
    return data.slice((page - 1) * recordsPerPage, page * recordsPerPage);
  }, [data, page, recordsPerPage]);

  const Wrapper = noCard ? Box : Paper;
  const wrapperProps = noCard
    ? { p: 24 }
    : { radius: "lg" as const, p: 24, withBorder: true };

  if (loading) {
    return (
      <Wrapper {...wrapperProps}>
        <Center py={60}>
          <Loader color="indigo" size="lg" />
        </Center>
      </Wrapper>
    );
  }

  if (error) {
    return (
      <Wrapper {...wrapperProps}>
        <Center py={60}>
          <Stack align="center" gap="sm">
            <Text c="red.6" fw={600}>
              Terjadi Kesalahan
            </Text>
            <Text c="dimmed" size="sm">
              {error}
            </Text>
          </Stack>
        </Center>
      </Wrapper>
    );
  }

  const getRowKey = (row: T): string => {
    if (typeof rowKey === "function") {
      return rowKey(row);
    }
    return String(row[rowKey]);
  };

  return (
    <Wrapper {...wrapperProps}>
      {(title || description || rightSection) && (
        <Group justify="space-between" mb={24} align="flex-start">
          <Stack gap={4}>
            {title && (
              <Text size="lg" fw={700}>
                {title}
              </Text>
            )}
            {description && (
              <Text size="xs" c="dimmed">
                {description}
              </Text>
            )}
          </Stack>
          {rightSection}
        </Group>
      )}

      {data.length === 0 ? (
        emptyState || (
          <Center py={60}>
            <Text c="dimmed" size="sm" fs="italic">
              Tidak ada data untuk ditampilkan.
            </Text>
          </Center>
        )
      ) : (
        <Stack gap="md">
          <Box style={{ overflowX: "auto" }}>
            <Table
              verticalSpacing="lg"
              horizontalSpacing="md"
              highlightOnHover
              withTableBorder={false}
              withColumnBorders={false}
              styles={{
                thead: { borderBottom: "1px solid var(--color-border)" },
                tr: { borderBottom: "1px solid var(--color-border)" },
              }}
            >
              <Table.Thead>
                <Table.Tr>
                  <Table.Th
                    c="dimmed"
                    fw={700}
                    fz={11}
                    tt="uppercase"
                    lts={1}
                    py={16}
                    style={{
                      textAlign: "center",
                      width: "60px",
                    }}
                  >
                    No
                  </Table.Th>
                  {columns.map((col, index) => (
                    <Table.Th
                      key={index}
                      c="dimmed"
                      fw={700}
                      fz={11}
                      tt="uppercase"
                      lts={1}
                      py={16}
                      style={{
                        textAlign: col.textAlign || "left",
                        width: col.width,
                      }}
                    >
                      {col.header}
                    </Table.Th>
                  ))}
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {currentRecords.map((row, index) => (
                  <Table.Tr
                    key={getRowKey(row)}
                    style={{
                      cursor: onRowClick ? "pointer" : "default",
                      transition: "background-color 0.2s ease",
                    }}
                    onClick={() => onRowClick?.(row)}
                  >
                    <Table.Td
                      c="dimmed"
                      style={{
                        textAlign: "center",
                        fontSize: "14px",
                        fontWeight: 500,
                      }}
                    >
                      {(page - 1) * recordsPerPage + index + 1}
                    </Table.Td>
                    {columns.map((col, colIndex) => (
                      <Table.Td
                        key={colIndex}
                        style={{
                          textAlign: col.textAlign || "left",
                          fontSize: "14px",
                        }}
                      >
                        {col.render
                          ? col.render(row)
                          : col.accessor
                            ? String(row[col.accessor] || "-")
                            : "-"}
                      </Table.Td>
                    ))}
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </Box>
          <Group justify="space-between" align="center" mt="md">
            <Text size="sm" c="dimmed">
              Menampilkan {(page - 1) * recordsPerPage + 1} -{" "}
              {Math.min(page * recordsPerPage, data.length)} dari {data.length}{" "}
              data
            </Text>
            <Pagination
              total={totalPages}
              value={page}
              onChange={setPage}
              size="sm"
              radius="md"
              withEdges
            />
          </Group>
        </Stack>
      )}
    </Wrapper>
  );
}
