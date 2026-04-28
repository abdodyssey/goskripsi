"use client";

import {
  Select,
  Textarea,
  Button,
  Group,
  Stack,
  Text,
  Alert,
  Paper,
  Title,
} from "@mantine/core";
import { IconInfoCircle, IconCheck } from "@tabler/icons-react";
import { useState } from "react";
import { notifications } from "@mantine/notifications";

interface KeputusanTabProps {
  ujian: any;
  options: any[];
  onSubmit: (payload: any) => Promise<void>;
  isSubmitting: boolean;
}

export function KeputusanTab({
  ujian,
  options,
  onSubmit,
  isSubmitting,
}: KeputusanTabProps) {
  const [keputusanId, setKeputusanId] = useState<string | null>(
    ujian.keputusanId?.toString() || null,
  );
  const [catatan, setCatatan] = useState(ujian.catatanRevisi || "");
  const isSelesai = ujian.status === "selesai";

  const handleSubmit = async () => {
    if (!keputusanId) return;
    try {
      const selected = options.find((o) => o.id.toString() === keputusanId);
      await onSubmit({
        keputusanId: Number(keputusanId),
        hasil: selected?.kode === "L" ? "lulus" : "tidak_lulus",
        catatanRevisi: catatan,
      });
      notifications.show({
        title: "Berhasil",
        message: "Keputusan telah disubmit.",
        color: "teal",
      });
    } catch (error: any) {
      notifications.show({
        title: "Gagal",
        message: error.response?.data?.message || "Gagal submit keputusan.",
        color: "red",
      });
    }
  };

  return (
    <Stack gap="xl">
      <Paper withBorder p="xl" radius="md">
        <Title order={4} mb="lg">
          Input Keputusan Final
        </Title>
        <Stack gap="md">
          <Select
            label="Jenis Keputusan"
            placeholder="Pilih hasil keputusan"
            data={options.map((o) => ({
              value: o.id.toString(),
              label: o.namaKeputusan,
            }))}
            value={keputusanId}
            onChange={setKeputusanId}
            disabled={isSelesai || isSubmitting}
            required
          />

          <Textarea
            label="Catatan / Revisi"
            placeholder="Tuliskan catatan atau daftar revisi mahasiswa di sini..."
            minRows={5}
            value={catatan}
            onChange={(e) => setCatatan(e.currentTarget.value)}
            disabled={isSelesai || isSubmitting}
          />

          {!isSelesai && (
            <Group justify="flex-end">
              <Button
                size="md"
                color="teal"
                leftSection={<IconCheck size={18} />}
                loading={isSubmitting}
                onClick={handleSubmit}
                disabled={!keputusanId}
              >
                Submit Keputusan
              </Button>
            </Group>
          )}

          {isSelesai && (
            <Alert
              icon={<IconInfoCircle size={16} />}
              title="Sudah Selesai"
              color="green"
              variant="light"
            >
              Keputusan sudah disubmit dan status ujian adalah SELESAI.
            </Alert>
          )}
        </Stack>
      </Paper>

    </Stack>
  );
}
