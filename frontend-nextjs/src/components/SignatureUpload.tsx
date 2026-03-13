"use client";

import React, { useState } from "react";
import {
  FileButton,
  Button,
  Group,
  Text,
  Stack,
  Paper,
  ActionIcon,
  Tooltip,
  Image,
} from "@mantine/core";
import {
  IconUpload,
  IconX,
  IconCheck,
  IconExternalLink,
} from "@tabler/icons-react";
import axios from "axios";
import { apiClient } from "@/lib/api-client";
import { notifications } from "@mantine/notifications";
import { SignaturePreview } from "./SignaturePreview";

interface SignatureUploadProps {
  currentUrl?: string | null;
  onUploadSuccess: (url: string) => void;
  nip: string;
}

/**
 * SignatureUpload: Specialized component for Dosen/Kaprodi/Mahasiswa to upload their digital signature.
 */
export function SignatureUpload({
  currentUrl,
  onUploadSuccess,
  nip,
}: SignatureUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [localPreview, setLocalPreview] = useState<string | null>(null);

  const handleFileChange = (payload: File | null) => {
    setFile(payload);
    if (payload) {
      const reader = new FileReader();
      reader.onload = (e) => setLocalPreview(e.target?.result as string);
      reader.readAsDataURL(payload);
    } else {
      setLocalPreview(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", "signature");
      formData.append("owner_id", nip);

      const response = await apiClient.post("/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.data.success) {
        notifications.show({
          title: "Berhasil",
          message: "Tanda tangan berhasil diunggah",
          color: "green",
        });
        onUploadSuccess(response.data.data.fullUrl);
        setFile(null);
      }
    } catch (error: unknown) {
      let message = "Terjadi kesalahan saat mengunggah";
      if (axios.isAxiosError(error)) {
        message = error.response?.data?.message || error.message;
      }
      notifications.show({
        title: "Gagal Mengunggah",
        message: message,
        color: "red",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Paper withBorder p="md" radius="md">
      <Stack gap="sm">
        <Text fw={600} size="sm">
          Tanda Tangan Digital (TTD)
        </Text>
        <Text size="xs" c="dimmed">
          Format yang disarankan: PNG transparan. TTD ini akan digunakan pada
          dokumen resmi.
        </Text>

        {localPreview || currentUrl ? (
          <Group align="flex-end">
            <Paper
              withBorder
              p="xs"
              radius="sm"
              style={{ backgroundColor: "#fafafa" }}
            >
              {localPreview ? (
                <Image
                  src={localPreview}
                  alt="New Signature Preview"
                  h={100}
                  w="auto"
                  fit="contain"
                />
              ) : (
                <SignaturePreview url={currentUrl} height={100} />
              )}
            </Paper>
            <Stack gap="xs">
              {currentUrl && !file && (
                <Tooltip label="Lihat File Asli">
                  <ActionIcon
                    variant="light"
                    color="indigo"
                    component="a"
                    href={currentUrl}
                    target="_blank"
                  >
                    <IconExternalLink size={16} />
                  </ActionIcon>
                </Tooltip>
              )}
              {file && (
                <ActionIcon
                  variant="light"
                  color="red"
                  onClick={() => {
                    setFile(null);
                    setLocalPreview(null);
                  }}
                >
                  <IconX size={16} />
                </ActionIcon>
              )}
            </Stack>
          </Group>
        ) : (
          <Text size="sm" c="dimmed" fs="italic">
            Belum ada tanda tangan yang diunggah.
          </Text>
        )}

        <Group>
          <FileButton onChange={handleFileChange} accept="image/png,image/jpeg">
            {(props) => (
              <Button
                {...props}
                variant="light"
                leftSection={<IconUpload size={16} />}
              >
                Pilih File TTD
              </Button>
            )}
          </FileButton>

          {file && (
            <Button
              onClick={handleUpload}
              loading={uploading}
              leftSection={<IconCheck size={16} />}
              color="green"
            >
              Simpan TTD
            </Button>
          )}
        </Group>

        {file && <Text size="xs">File terpilih: {file.name}</Text>}
      </Stack>
    </Paper>
  );
}
