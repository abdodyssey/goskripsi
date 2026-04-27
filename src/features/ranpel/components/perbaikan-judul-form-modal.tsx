"use client";

import {
  Modal,
  Button,
  Stack,
  TextInput,
  FileInput,
  Group,
  Text,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { IconUpload, IconFileText } from "@tabler/icons-react";
import { usePerbaikanJudul } from "../hooks/use-perbaikan-judul";
import { notifications } from "@mantine/notifications";
import { apiClient } from "@/lib/api-client";
import { useState } from "react";

interface PerbaikanJudulFormModalProps {
  opened: boolean;
  onClose: () => void;
  currentTitle: string;
}

export function PerbaikanJudulFormModal({
  opened,
  onClose,
  currentTitle,
}: PerbaikanJudulFormModalProps) {
  const { submitRequest, isSubmitting } = usePerbaikanJudul();
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const form = useForm({
    initialValues: {
      judulBaru: "",
    },
    validate: {
      judulBaru: (value) => (value.length < 10 ? "Judul terlalu pendek" : null),
    },
  });

  const handleSubmit = async (values: typeof form.values) => {
    if (!file) {
      notifications.show({
        title: "Gagal",
        message: "Silakan unggah surat perbaikan judul",
        color: "red",
      });
      return;
    }

    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", "perbaikan_judul");

      const uploadRes = await apiClient.post("/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const fileUrl = uploadRes.data.data.fullUrl;

      await submitRequest({
        judulLama: currentTitle,
        judulBaru: values.judulBaru,
        fileSurat: fileUrl,
      });

      notifications.show({
        title: "Berhasil",
        message: "Pengajuan perbaikan judul berhasil dikirim",
        color: "teal",
      });
      
      form.reset();
      setFile(null);
      onClose();
    } catch (error: any) {
      notifications.show({
        title: "Gagal",
        message: error.response?.data?.message || "Terjadi kesalahan",
        color: "red",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={<Text fw={700}>Pengajuan Perbaikan Judul</Text>}
      radius="lg"
      size="md"
    >
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="md">
          <TextInput
            label="Judul Saat Ini"
            value={currentTitle}
            disabled
            variant="filled"
          />
          <TextInput
            label="Judul Baru"
            placeholder="Masukkan judul penelitian terbaru"
            required
            {...form.getInputProps("judulBaru")}
          />
          <FileInput
            label="Surat Perbaikan Judul"
            placeholder="Pilih file PDF"
            required
            accept=".pdf"
            leftSection={<IconUpload size={16} />}
            value={file}
            onChange={setFile}
          />
          <Group justify="flex-end" mt="xl">
            <Button variant="subtle" onClick={onClose} color="gray">
              Batal
            </Button>
            <Button
              type="submit"
              loading={isSubmitting || isUploading}
              leftSection={<IconFileText size={18} />}
            >
              Kirim Pengajuan
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}
