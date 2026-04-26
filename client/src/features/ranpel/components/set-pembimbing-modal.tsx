"use client";

import {
  Modal,
  Button,
  Select,
  Stack,
  Text,
  Group,
  LoadingOverlay,
  Box,
} from "@mantine/core";
import { useEffect, useState } from "react";
import { notifications } from "@mantine/notifications";
import { mahasiswaService } from "@/features/mahasiswa/api/mahasiswa.service";

interface DosenOption {
  id: string | number;
  nama: string;
}

interface SetPembimbingModalProps {
  opened: boolean;
  onClose: () => void;
  mahasiswaId: string | number | null;
  currentP1: string | number | null;
  currentP2: string | number | null;
  onSuccess: () => void;
}

export function SetPembimbingModal({
  opened,
  onClose,
  mahasiswaId,
  currentP1,
  currentP2,
  onSuccess,
}: SetPembimbingModalProps) {
  const [dosenList, setDosenList] = useState<DosenOption[]>([]);
  const [p1, setP1] = useState<string | null>(null);
  const [p2, setP2] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (opened) {
      fetchDosens();
      setP1(currentP1 ? currentP1.toString() : null);
      setP2(currentP2 ? currentP2.toString() : null);
    }
  }, [opened, currentP1, currentP2]);

  const fetchDosens = async () => {
    setIsLoading(true);
    try {
      const response = await mahasiswaService.getDosens();
      setDosenList(response.data);
    } catch (error) {
      console.error("Fetch Dosen Error:", error);
      notifications.show({
        title: "Gagal",
        message: "Gagal mengambil data dosen",
        color: "red",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!mahasiswaId) return;

    setIsSubmitting(true);
    try {
      await mahasiswaService.update(mahasiswaId.toString(), {
        pembimbing_1: p1 ? Number(p1) : null,
        pembimbing_2: p2 ? Number(p2) : null,
      });

      notifications.show({
        title: "Berhasil",
        message: "Dosen Pembimbing berhasil diperbarui",
        color: "green",
      });
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Update Pembimbing Error:", error);
      notifications.show({
        title: "Gagal",
        message: "Gagal memperbarui dosen pembimbing",
        color: "red",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const dosenOptions = dosenList.map((d) => ({
    value: d.id.toString(),
    label: d.nama || "-",
  }));

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Set Dosen Pembimbing"
      size="md"
      radius="md"
    >
      <Box style={{ position: "relative" }}>
        <LoadingOverlay visible={isLoading} />
        <Stack gap="md">
          <Text size="sm" c="dimmed">
            Pilih Dosen Pembimbing 1 dan 2 untuk mahasiswa ini.
          </Text>

          <Select
            label="Dosen Pembimbing 1"
            placeholder="Pilih Dosen"
            data={dosenOptions}
            searchable
            clearable
            value={p1}
            onChange={setP1}
          />

          <Select
            label="Dosen Pembimbing 2"
            placeholder="Pilih Dosen"
            data={dosenOptions}
            searchable
            clearable
            value={p2}
            onChange={setP2}
          />

          <Group justify="flex-end" mt="xl">
            <Button variant="outline" onClick={onClose} color="gray">
              Batal
            </Button>
            <Button
              onClick={handleSubmit}
              loading={isSubmitting}
              color="indigo"
            >
              Simpan Perubahan
            </Button>
          </Group>
        </Stack>
      </Box>
    </Modal>
  );
}
