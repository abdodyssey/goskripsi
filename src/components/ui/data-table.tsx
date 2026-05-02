"use client";

import {
  Table,
  Text,
  Group,
  Stack,
  Box,
  Center,
  Loader,
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

  const totalPages = Math.ceil(data.length / recordsPerPage);
  const currentRecords = useMemo(() => {
    return data.slice((page - 1) * recordsPerPage, page * recordsPerPage);
  }, [data, page, recordsPerPage]);

  const Wrapper = noCard ? Box : Paper;
  const wrapperProps = noCard
    ? { p: "md" }
    : {
        radius: "lg" as const,
        p: "xl",
        withBorder: true,
        shadow: "sm",
        bg: "var(--gs-bg-raised)",
      };

  if (loading) {
    return (
      <Wrapper {...wrapperProps}>
        <Center py={40}>
          <Loader size="md" />
        </Center>
      </Wrapper>
    );
  }

  if (error) {
    return (
      <Wrapper {...wrapperProps}>
        <Center py={40}>
          <Stack align="center" gap="xs">
            <Text c="var(--gs-danger)" fw={600} size="sm">
              Terjadi Kesalahan
            </Text>
            <Text c="dimmed" size="xs">
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
        <Group justify="space-between" mb="xl" align="center">
          <Stack gap={2}>
            {title && (
              <Text size="md" fw={700} className="text-gs-text-primary">
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
          <Center py={40}>
            <Text c="dimmed" size="xs" fs="italic">
              Tidak ada data untuk ditampilkan.
            </Text>
          </Center>
        )
      ) : (
        <Stack gap="md">
          <Box style={{ overflowX: "auto" }}>
            <Table
              verticalSpacing="md"
              horizontalSpacing="md"
              highlightOnHover
              withTableBorder={false}
              withColumnBorders={false}
              styles={{
                thead: { borderBottom: "1px solid var(--gs-border-strong)" },
                tr: { borderBottom: "1px solid var(--gs-border)" },
              }}
            >
              <Table.Thead>
                <Table.Tr>
                  <Table.Th
                    c="var(--gs-text-muted)"
                    fw={700}
                    fz={10}
                    tt="uppercase"
                    lts={1}
                    py={12}
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
                      c="var(--gs-text-muted)"
                      fw={700}
                      fz={10}
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
                    }}
                    className="hover:bg-gs-bg-hover transition-colors"
                    onClick={() => onRowClick?.(row)}
                  >
                    <Table.Td
                      c="var(--gs-text-secondary)"
                      style={{
                        textAlign: "center",
                        fontSize: "13px",
                        fontWeight: 600,
                      }}
                    >
                      {(page - 1) * recordsPerPage + index + 1}
                    </Table.Td>
                    {columns.map((col, colIndex) => (
                      <Table.Td
                        key={colIndex}
                        style={{
                          textAlign: col.textAlign || "left",
                          fontSize: "13px",
                          color: "var(--gs-text-primary)",
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
          <Group
            justify="space-between"
            align="center"
            mt="lg"
            pt="md"
            style={{ borderTop: "1px solid var(--gs-border)" }}
          >
            <Text size="xs" c="dimmed" fw={500}>
              Menampilkan{" "}
              <span
                style={{ fontWeight: 700, color: "var(--gs-text-primary)" }}
              >
                {(page - 1) * recordsPerPage + 1} -{" "}
                {Math.min(page * recordsPerPage, data.length)}
              </span>{" "}
              dari <span style={{ fontWeight: 700 }}>{data.length}</span> data
            </Text>
            <Pagination
              total={totalPages}
              value={page}
              onChange={setPage}
              size="sm"
              radius="md"
              withEdges
              color="dark"
            />
          </Group>
        </Stack>
      )}
    </Wrapper>
  );
}
