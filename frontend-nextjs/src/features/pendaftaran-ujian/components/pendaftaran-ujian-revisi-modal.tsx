"use client";

import {
  Modal,
  Button,
  FileInput,
  Stack,
  Text,
  Badge,
  Group,
  Loader,
  Center,
  ThemeIcon,
  Divider,
  ScrollArea,
  useMantineColorScheme,
  Alert,
  Paper,
} from "@mantine/core";
import {
  IconCircleCheck,
  IconCircleDashed,
  IconFile,
  IconInfoCircle,
} from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";
import { PendaftaranUjian, Syarat } from "../types/pendaftaran-ujian.type";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { pendaftaranUjianService } from "../api/pendaftaran-ujian.service";

interface PendaftaranUjianRevisiModalProps {
  opened: boolean;
  onClose: () => void;
  pendaftaran: PendaftaranUjian | null;
  uploadRevisi: (data: { id: string; formData: FormData }) => Promise<unknown>;
  isUploading: boolean;
}

export function PendaftaranUjianRevisiModal({
  opened,
  onClose,
  pendaftaran,
  uploadRevisi,
  isUploading,
}: PendaftaranUjianRevisiModalProps) {
  const [syaratFiles, setSyaratFiles] = useState<Record<string, File | null>>(
    {},
  );

  const { colorScheme } = useMantineColorScheme();
  const isDark = colorScheme === "dark";

  const { data: syaratData, isLoading: isLoadingSyarat } = useQuery({
    queryKey: ["syarat-jenis-ujian", pendaftaran?.jenisUjianId],
    queryFn: () =>
      pendaftaranUjianService.getSyaratByJenisUjian(
        String(pendaftaran?.jenisUjianId),
      ),
    enabled: !!pendaftaran?.jenisUjianId && opened,
  });

  const syaratList: Syarat[] = syaratData?.data || [];
  const wajibSyarat = syaratList.filter((s) => s.wajib);
  const opsionalSyarat = syaratList.filter((s) => !s.wajib);

  const handleFileChange = (syaratId: string, file: File | null) => {
    setSyaratFiles((prev) => ({ ...prev, [syaratId]: file }));
  };

  const handleSubmit = async () => {
    if (!pendaftaran) return;

    const filesToUpload = Object.values(syaratFiles).filter(Boolean);
    if (filesToUpload.length === 0) {
      notifications.show({
        title: "Peringatan",
        message: "Silakan pilih setidaknya satu berkas untuk diunggah ulang",
        color: "orange",
      });
      return;
    }

    try {
      const formData = new FormData();
      // Append files with syarat name as the original filename
      syaratList.forEach((syarat) => {
        const file = syaratFiles[syarat.id];
        if (file) {
          const ext = file.name.split(".").pop() || "pdf";
          const renamedFile = new File([file], `${syarat.namaSyarat}.${ext}`, {
            type: file.type,
          });
          formData.append("berkas", renamedFile);
        }
      });

      await uploadRevisi({ id: String(pendaftaran.id), formData: formData });
      notifications.show({
        title: "Berhasil",
        message: "Berkas revisi berhasil diunggah dan status kembali menunggu.",
        color: "teal",
      });
      onClose();
    } catch (err: unknown) {
      const error = err as {
        response?: { data?: { message?: string } };
        message?: string;
      };
      notifications.show({
        title: "Gagal Mengunggah",
        message:
          error?.response?.data?.message ||
          error?.message ||
          "Terjadi kesalahan",
        color: "red",
      });
    }
  };

  const renderSyaratItem = (syarat: Syarat, idx: number, isWajib: boolean) => {
    const hasNewFile = !!syaratFiles[syarat.id];
    const hasExistingFile = pendaftaran?.pemenuhanSyarats?.some(
      (ps) => ps.syaratId === syarat.id && ps.fileBukti,
    );

    return (
      <Paper
        key={syarat.id}
        withBorder
        radius="sm"
        p="xs"
        bg={
          hasNewFile
            ? isDark
              ? "var(--mantine-color-teal-9)"
              : "var(--mantine-color-teal-0)"
            : isDark
              ? "var(--mantine-color-dark-7)"
              : "var(--mantine-color-white)"
        }
        style={{
          borderColor: hasNewFile
            ? isDark
              ? "var(--mantine-color-teal-8)"
              : "var(--mantine-color-teal-3)"
            : "var(--mantine-color-default-border)",
        }}
      >
        <Group gap="xs" align="flex-start" wrap="nowrap">
          <ThemeIcon
            variant="light"
            color={
              hasNewFile
                ? "teal"
                : hasExistingFile
                  ? "blue"
                  : isWajib
                    ? "orange"
                    : "gray"
            }
            size="xs"
            radius="xl"
            mt={3}
          >
            {hasNewFile ? (
              <IconCircleCheck size={10} />
            ) : hasExistingFile ? (
              <IconFile size={10} />
            ) : (
              <IconCircleDashed size={10} />
            )}
          </ThemeIcon>
          <div style={{ flex: 1 }}>
            <Group gap={6} align="center" mb={4}>
              <Text
                size="xs"
                fw={isWajib ? 500 : 400}
                c={isWajib ? undefined : "dimmed"}
              >
                {idx + 1}. {syarat.namaSyarat}
              </Text>

              {isWajib && (
                <Badge size="xs" variant="filled" color="red">
                  Wajib
                </Badge>
              )}
              {hasExistingFile && !hasNewFile && (
                <Badge size="xs" variant="light" color="blue">
                  Sudah ada
                </Badge>
              )}
            </Group>
            <FileInput
              size="xs"
              placeholder="Ganti Berkas / Upload Ulang"
              value={syaratFiles[syarat.id] || null}
              onChange={(file) => handleFileChange(String(syarat.id), file)}
              clearable
              leftSection={<IconFile size={16} />}
              accept=".pdf"
            />
          </div>
        </Group>
      </Paper>
    );
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Upload Revisi Berkas"
      size="lg"
      scrollAreaComponent={ScrollArea.Autosize}
    >
      <Stack gap="md">
        {pendaftaran?.keterangan && (
          <Alert
            icon={<IconInfoCircle size={16} />}
            title="Catatan Revisi"
            color="orange"
            variant="light"
          >
            {pendaftaran.keterangan}
          </Alert>
        )}

        <Paper withBorder p="md" radius="md">
          <Text fw={700} size="sm" mb="xs">
            📋 Berkas Pendaftaran
          </Text>
          <Text size="xs" c="dimmed" mb="md">
            Gunakan fitur ini untuk mengunggah ulang berkas yang perlu
            diperbaiki sesuai catatan di atas.
          </Text>

          {isLoadingSyarat ? (
            <Center py="xl">
              <Loader size="sm" />
            </Center>
          ) : (
            <Stack gap="xs">
              {wajibSyarat.map((syarat, idx) =>
                renderSyaratItem(syarat, idx, true),
              )}
              {opsionalSyarat.length > 0 && (
                <>
                  <Divider
                    my="xs"
                    label="Syarat Opsional"
                    labelPosition="center"
                  />
                  {opsionalSyarat.map((syarat, idx) =>
                    renderSyaratItem(syarat, idx, false),
                  )}
                </>
              )}
            </Stack>
          )}
        </Paper>

        <Button
          onClick={handleSubmit}
          color="orange"
          fullWidth
          loading={isUploading}
          leftSection={<IconCircleCheck size={18} />}
        >
          Kirim Berkas Revisi
        </Button>
      </Stack>
    </Modal>
  );
}
