"use client";

import {
  Table,
  Checkbox,
  Button,
  Group,
  Stack,
  Text,
  Alert,
  Badge,
} from "@mantine/core";
import { IconInfoCircle, IconCheck } from "@tabler/icons-react";
import { useState, useEffect } from "react";
import { notifications } from "@mantine/notifications";

const PERAN_MAP: Record<string, string> = {
  ketua_penguji: "Ketua Penguji",
  sekretaris_penguji: "Sekretaris Penguji",
  penguji_1: "Penguji 1",
  penguji_2: "Penguji 2",
};

interface AbsensiTabProps {
  ujian: any;
  onSubmit: (absensiList: any[]) => Promise<void>;
  isSubmitting: boolean;
}

export function AbsensiTab({ ujian, onSubmit, isSubmitting }: AbsensiTabProps) {
  const [absensi, setAbsensi] = useState<any[]>([]);
  const isAlreadySubmitted = ujian.pengujiUjians.some(
    (p: any) => p.tanggalAbsen,
  );

  useEffect(() => {
    if (ujian?.pengujiUjians) {
      setAbsensi(
        ujian.pengujiUjians.map((p: any) => ({
          pengujiUjianId: p.id,
          hadir: p.hadir || false,
          nama: p.dosen?.user?.nama || p.dosen?.nama || "Tanpa Nama",
          peran: p.peran,
        })),
      );
    }
  }, [ujian]);

  const handleToggle = (id: number) => {
    if (isAlreadySubmitted) return;
    setAbsensi((prev) =>
      prev.map((item) =>
        item.pengujiUjianId === id ? { ...item, hadir: !item.hadir } : item,
      ),
    );
  };

  const handleSubmit = async () => {
    try {
      const payload = absensi.map(({ pengujiUjianId, hadir }) => ({
        pengujiUjianId,
        hadir,
      }));
      await onSubmit(payload);
      notifications.show({
        title: "Berhasil",
        message: "Absensi telah disubmit.",
        color: "green",
      });
    } catch (error: any) {
      notifications.show({
        title: "Gagal",
        message:
          error.response?.data?.message ||
          "Terjadi kesalahan saat submit absensi.",
        color: "red",
      });
    }
  };

  return (
    <Stack gap="md">
      {isAlreadySubmitted && (
        <Alert
          icon={<IconInfoCircle size={16} />}
          title="Informasi"
          color="blue"
          variant="light"
        >
          Absensi sudah disubmit dan tidak dapat diubah lagi.
        </Alert>
      )}

      <Table
        highlightOnHover
        withTableBorder
        verticalSpacing="xs"
      >
        <Table.Thead bg="gray.0">
          <Table.Tr>
            <Table.Th style={{ fontSize: '12px' }}>Nama Penguji</Table.Th>
            <Table.Th style={{ fontSize: '12px' }}>Peran</Table.Th>
            <Table.Th ta="center" w={100} style={{ fontSize: '12px' }}>
              Kehadiran
            </Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {absensi.map((item) => (
            <Table.Tr key={item.pengujiUjianId}>
              <Table.Td>
                <Text fw={600} size="sm">{item.nama}</Text>
              </Table.Td>
              <Table.Td>
                <Badge variant="light" color="indigo" size="xs">
                  {PERAN_MAP[item.peran] || item.peran}
                </Badge>
              </Table.Td>
              <Table.Td ta="center">
                <Checkbox
                  checked={item.hadir}
                  onChange={() => handleToggle(item.pengujiUjianId)}
                  disabled={isAlreadySubmitted || isSubmitting}
                  size="sm"
                  color="teal"
                />
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>

      {!isAlreadySubmitted && (
        <Group justify="flex-end">
          <Button
            leftSection={<IconCheck size={16} />}
            color="teal"
            size="xs"
            px="lg"
            loading={isSubmitting}
            onClick={handleSubmit}
          >
            Submit Absensi
          </Button>
        </Group>
      )}
    </Stack>
  );
}
