"use client";

import {
  Modal,
  Button,
  Select,
  Stack,
  Text,
  Group,
  Textarea,
  LoadingOverlay,
  Box,
  Badge,
} from "@mantine/core";
import { useEffect, useState } from "react";
import { notifications } from "@mantine/notifications";
import { IconUser } from "@tabler/icons-react";
import { mahasiswaService } from "@/features/mahasiswa/api/mahasiswa.service";
import { PengajuanRancanganPenelitian } from "../types/ranpel.type";

interface DosenOption {
  id: string | number;
  nama: string;
  bimbinganCount?: number;
}

interface AcceptRanpelModalProps {
  opened: boolean;
  onClose: () => void;
  pengajuan: PengajuanRancanganPenelitian | null;
  onSuccess: () => void;
  updatePengajuan: (params: { id: string; data: any }) => Promise<any>;
}

export function AcceptRanpelModal({
  opened,
  onClose,
  pengajuan,
  onSuccess,
  updatePengajuan,
}: AcceptRanpelModalProps) {
  const [dosenList, setDosenList] = useState<DosenOption[]>([]);
  const [p1, setP1] = useState<string | null>(null);
  const [p2, setP2] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (opened && pengajuan) {
      fetchDosens();
      setP1(pengajuan.mahasiswa?.pembimbing1?.id?.toString() || null);
      setP2(pengajuan.mahasiswa?.pembimbing2?.id?.toString() || null);
      setNote("");
    }
  }, [opened, pengajuan]);

  const fetchDosens = async () => {
    setIsLoading(true);
    try {
      const data = await mahasiswaService.getDosens();
      setDosenList(data || []);
    } catch (error) {
      console.error("Fetch Dosen Error:", error);
      notifications.show({
        title: "Gagal",
        message: "Gagal mengambil data dosen",
        color: "var(--gs-danger)",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!pengajuan || !pengajuan.mahasiswa) return;

    if (!p1 || !p2) {
      notifications.show({
        title: "Peringatan",
        message: "Silakan pilih Dosen Pembimbing 1 dan 2",
        color: "var(--gs-warning)",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // 1. Update Student Advisors
      await mahasiswaService.update(pengajuan.mahasiswa.id.toString(), {
        pembimbing_1: Number(p1),
        pembimbing_2: Number(p2),
      });

      // 2. Update Pengajuan Status
      await updatePengajuan({
        id: pengajuan.id.toString(),
        data: {
          status_kaprodi: "diterima",
          catatan_kaprodi: note,
        },
      });

      onSuccess();
      onClose();
    } catch (error) {
      console.error("Accept Pengajuan Error:", error);
      notifications.show({
        title: "Gagal",
        message: (error as Error).message || "Terjadi kesalahan",
        color: "var(--gs-danger)",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const dosenOptions = (dosenList || []).map((d) => ({
    value: d.id.toString(),
    label: d.nama || "-",
    bimbinganCount: d.bimbinganCount || 0,
  }));

  const renderSelectOption = ({ option, checked }: any) => {
    const count = option.bimbinganCount || 0;
    const color = count >= 10 ? "var(--gs-danger)" : count >= 5 ? "var(--gs-warning)" : "var(--gs-success)";

    return (
      <Group justify="space-between" wrap="nowrap" w="100%">
        <Stack gap={0}>
          <Text size="sm" fw={500}>{option.label}</Text>
          {checked && <Text size="xs" c="dimmed">Terpilih</Text>}
        </Stack>
        <Badge variant="light" color={color} size="sm" radius="sm" fw={700}>
          {count} Mhs
        </Badge>
      </Group>
    );
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Setujui Pengajuan & Set Pembimbing"
      size="md"
      radius="md"
    >
      <Box style={{ position: "relative" }}>
        <LoadingOverlay visible={isLoading} />
        <Stack gap="md">
          <Text size="sm">
            Tentukan dosen pembimbing dan berikan catatan untuk mahasiswa sebelum menyetujui pengajuan ini.
          </Text>

          <Select
            label="Dosen Pembimbing 1"
            placeholder="Pilih Dosen"
            data={dosenOptions}
            searchable
            clearable
            renderOption={renderSelectOption}
            leftSection={<IconUser size={16} />}
            value={p1}
            onChange={setP1}
            required
            styles={{
              option: { padding: "8px 12px" }
            }}
          />

          <Select
            label="Dosen Pembimbing 2"
            placeholder="Pilih Dosen"
            data={dosenOptions}
            searchable
            clearable
            renderOption={renderSelectOption}
            leftSection={<IconUser size={16} />}
            value={p2}
            onChange={setP2}
            required
            styles={{
              option: { padding: "8px 12px" }
            }}
          />

          <Textarea
            label="Catatan / Pesan untuk Mahasiswa"
            placeholder="Tambahkan catatan (opsional)"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            minRows={3}
          />

          <Group justify="flex-end" mt="xl">
            <Button variant="outline" onClick={onClose} color="var(--gs-text-secondary)" radius="md" fw={700}>
              BATAL
            </Button>
            <Button
              onClick={handleSubmit}
              loading={isSubmitting}
              className="bg-gs-primary hover:bg-gs-primary-hover"
              radius="md"
              fw={700}
            >
              SETUJUI & SIMPAN
            </Button>
          </Group>
        </Stack>
      </Box>
    </Modal>
  );
}
