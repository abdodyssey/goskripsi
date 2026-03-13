"use client";

import { useState, useEffect } from "react";
import {
  Paper,
  Title,
  Text,
  Group,
  Stack,
  Divider,
  Button,
  Badge,
  ActionIcon,
  Tooltip,
  FileButton,
  Loader,
} from "@mantine/core";
import {
  IconFileText,
  IconUpload,
  IconDownload,
  IconTrash,
} from "@tabler/icons-react";
import { apiClient } from "@/lib/api-client";
import { notifications } from "@mantine/notifications";

const DOCUMENT_TYPES = [
  { key: "KTM", label: "KTM (Kartu Tanda Mahasiswa)" },
  { key: "TRANSKRIP_NILAI", label: "Transkrip Nilai" },
  { key: "SERTIFIKAT_BTA", label: "Sertifikat BTA" },
  { key: "SERTIFIKAT_KKN", label: "Sertifikat KKN" },
  { key: "SERTIFIKAT_TOEFL", label: "Sertifikat TOEFL" },
];

export function MyDocuments() {
  const [documents, setDocuments] = useState<
    { jenis: string; fileUrl: string }[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState<string | null>(null);

  const fetchDocuments = async () => {
    try {
      const response = await apiClient.get("/mahasiswa/my/documents");
      setDocuments(response.data?.data || []);
    } catch (error) {
      console.error("Error fetching documents:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleUpload = async (file: File | null, jenis: string) => {
    if (!file) return;

    setUploading(jenis);
    try {
      // 1. Upload to Supabase
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", "mahasiswa_doc");
      formData.append("jenis", jenis);

      const uploadRes = await apiClient.post("/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const fileUrl = uploadRes.data?.data?.fullUrl;

      // 2. Save to DB
      await apiClient.post("/mahasiswa/my/documents", {
        jenis,
        fileUrl,
      });

      notifications.show({
        title: "Berhasil",
        message: `${jenis.replace(/_/g, " ")} berhasil diunggah`,
        color: "green",
      });

      fetchDocuments();
    } catch (error) {
      console.error("Upload error:", error);
      notifications.show({
        title: "Gagal",
        message: "Terjadi kesalahan saat mengunggah dokumen",
        color: "red",
      });
    } finally {
      setUploading(null);
    }
  };

  const handleDelete = async (jenis: string) => {
    try {
      await apiClient.delete(`/mahasiswa/my/documents/${jenis}`);
      notifications.show({
        title: "Berhasil",
        message: `${jenis.replace(/_/g, " ")} berhasil dihapus`,
        color: "green",
      });
      fetchDocuments();
    } catch (error) {
      console.error("Delete error:", error);
      notifications.show({
        title: "Gagal",
        message: "Gagal menghapus dokumen",
        color: "red",
      });
    }
  };

  const getDocStatus = (jenis: string) => {
    const doc = documents.find((d) => d.jenis === jenis);
    if (!doc)
      return { status: "missing", label: "Belum Diunggah", color: "gray" };
    return {
      status: "uploaded",
      label: "Terunggah",
      color: "green",
      url: doc.fileUrl,
    };
  };

  if (loading) return <Loader size="sm" />;

  return (
    <Paper withBorder p="xl" radius="md">
      <Title order={3} mb="md">
        Dokumen Saya
      </Title>
      <Text size="sm" c="dimmed" mb="xl">
        Unggah dokumen wajib untuk persyaratan pendaftaran ujian. Format yang
        diperbolehkan: PDF, JPG, PNG (Maks 2MB).
      </Text>
      <Divider mb="xl" />

      <Stack gap="md">
        {DOCUMENT_TYPES.map((type) => {
          const status = getDocStatus(type.key);
          const isUploading = uploading === type.key;

          return (
            <Paper key={type.key} withBorder p="md" radius="sm" bg="gray.0">
              <Group justify="space-between" align="center">
                <Group>
                  <IconFileText
                    size={24}
                    color="var(--mantine-color-indigo-6)"
                  />
                  <Stack gap={0}>
                    <Text fw={600} size="sm">
                      {type.label}
                    </Text>
                    <Badge color={status.color} size="xs" variant="light">
                      {status.label}
                    </Badge>
                  </Stack>
                </Group>

                <Group gap="xs">
                  {status.status === "uploaded" && (
                    <>
                      <Tooltip label="Lihat Dokumen">
                        <ActionIcon
                          variant="light"
                          color="indigo"
                          component="a"
                          href={status.url}
                          target="_blank"
                        >
                          <IconDownload size={16} />
                        </ActionIcon>
                      </Tooltip>
                      <Tooltip label="Hapus">
                        <ActionIcon
                          variant="light"
                          color="red"
                          onClick={() => handleDelete(type.key)}
                        >
                          <IconTrash size={16} />
                        </ActionIcon>
                      </Tooltip>
                    </>
                  )}

                  <FileButton
                    onChange={(file) => handleUpload(file, type.key)}
                    accept="application/pdf,image/png,image/jpeg"
                  >
                    {(props) => (
                      <Button
                        {...props}
                        variant="subtle"
                        color="indigo"
                        size="xs"
                        leftSection={
                          isUploading ? (
                            <Loader size={12} />
                          ) : (
                            <IconUpload size={14} />
                          )
                        }
                        loading={isUploading}
                      >
                        {status.status === "uploaded" ? "Ganti" : "Unggah"}
                      </Button>
                    )}
                  </FileButton>
                </Group>
              </Group>
            </Paper>
          );
        })}
      </Stack>
    </Paper>
  );
}
