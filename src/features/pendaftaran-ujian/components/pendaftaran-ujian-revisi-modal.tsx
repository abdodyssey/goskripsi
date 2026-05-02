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
  Alert,
  Paper,
  Box,
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
          color: "var(--gs-warning)",
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
        message: pendaftaran.status === "revisi" 
          ? "Berkas revisi berhasil diunggah dan status kembali menunggu."
          : "Berkas pendaftaran berhasil diperbarui.",
        color: "var(--gs-success)",
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
        color: "var(--gs-danger)",
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
        radius="lg"
        p="md"
        className="transition-all duration-200"
        bg={hasNewFile ? "var(--gs-bg-overlay)" : "var(--gs-bg-raised)"}
        style={{
          borderColor: hasNewFile 
            ? "var(--gs-success)" 
            : "var(--gs-border)",
          borderWidth: hasNewFile ? "2px" : "1px",
        }}
      >
        <Stack gap="xs">
          <Group justify="space-between" align="flex-start" wrap="nowrap">
            <Group gap="sm" align="flex-start" wrap="nowrap" style={{ flex: 1 }}>
              <ThemeIcon
                variant="light"
                color={hasNewFile ? "var(--gs-success)" : "var(--gs-text-muted)"}
                size="md"
                radius="md"
                className={hasNewFile ? "" : "bg-gs-bg-overlay"}
              >
                {hasNewFile ? (
                  <IconCircleCheck size={18} stroke={2} />
                ) : hasExistingFile ? (
                  <IconFile size={18} stroke={1.5} />
                ) : (
                  <IconCircleDashed size={18} stroke={1.5} />
                )}
              </ThemeIcon>
              
              <Stack gap={4}>
                <Text
                  size="sm"
                  fw={700}
                  className="leading-snug text-gs-text-primary"
                >
                  {syarat.namaSyarat}
                </Text>
                
                <Group gap="xs" mt={2}>
                  {isWajib && (
                    <Badge size="xs" variant="filled" color="var(--gs-danger)" radius="xs" h={18}>
                      WAJIB
                    </Badge>
                  )}
                  {hasExistingFile && (
                    <Button 
                      size="compact-xs" 
                      variant="subtle" 
                      color="var(--gs-primary)" 
                      radius="xs"
                      h={18}
                      leftSection={<IconFile size={12} stroke={1.5} />}
                      className="px-1.5 hover:bg-gs-bg-overlay"
                      onClick={() => {
                        const existing = pendaftaran?.pemenuhanSyarats?.find(ps => ps.syaratId === syarat.id);
                        if (existing?.fileBukti) window.open(existing.fileBukti, '_blank');
                      }}
                      styles={{
                        section: { marginRight: 4 }
                      }}
                    >
                      <Text size="10px" fw={700} lts={0.5} className="text-gs-text-secondary">LIHAT BERKAS</Text>
                    </Button>
                  )}
                </Group>
              </Stack>
            </Group>

            {hasNewFile && (
              <Badge color="var(--gs-success)" variant="light" radius="sm">Berkas Baru Disiapkan</Badge>
            )}
          </Group>

          <FileInput
            size="sm"
            placeholder="Ganti Berkas / Upload Baru (PDF)"
            value={syaratFiles[syarat.id] || null}
            onChange={(file) => handleFileChange(String(syarat.id), file)}
            clearable
            leftSection={<IconFile size={18} stroke={1.5} className="text-gs-text-muted" />}
            accept=".pdf"
            variant="filled"
            radius="md"
            styles={{
              input: {
                backgroundColor: 'var(--gs-bg-overlay)',
                border: '1px solid var(--gs-border)',
                fontWeight: 500,
                fontSize: 'var(--fs-caption)',
                color: 'var(--gs-text-primary)',
              }
            }}
          />
        </Stack>
      </Paper>
    );
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Stack gap={4}>
          <Text className="gs-page-title" size="lg">
            {pendaftaran?.status === "revisi" ? "Unggah Revisi Dokumen" : "Kelola Berkas Pendaftaran"}
          </Text>
          <Text size="xs" className="text-gs-text-secondary" fw={500}>
            Pastikan berkas yang diunggah dalam format PDF yang jelas dan terbaca.
          </Text>
        </Stack>
      }
      size="lg"
      radius="xl"
      scrollAreaComponent={ScrollArea.Autosize}
      padding="xl"
    >
      <Stack gap="lg">
        {pendaftaran?.status === "revisi" && pendaftaran?.keterangan && (
          <Alert
            icon={<IconInfoCircle size={20} stroke={1.5} />}
            title="Instruksi Revisi"
            color="var(--gs-warning)"
            variant="light"
            radius="lg"
          >
            <Text size="xs" fw={500} className="text-gs-warning-text">{pendaftaran.keterangan}</Text>
          </Alert>
        )}

        <Box>
          {isLoadingSyarat ? (
            <Center py={60}>
              <Loader size="md" />
            </Center>
          ) : (
            <Stack gap="md">
              <Group justify="space-between">
                <Text size="sm" fw={700} tt="uppercase" lts={1} className="text-gs-text-secondary">
                  📋 Daftar Persyaratan
                </Text>
                <Badge variant="outline" color="var(--gs-primary)">Total {syaratList.length} Berkas</Badge>
              </Group>

              <Stack gap="sm">
                {wajibSyarat.map((syarat, idx) =>
                  renderSyaratItem(syarat, idx, true),
                )}
                
                {opsionalSyarat.length > 0 && (
                  <>
                    <Divider
                      my="md"
                      label={
                        <Text size="xs" fw={700} tt="uppercase" lts={1} px="sm" className="text-gs-text-muted">
                          Dokumen Pendukung
                        </Text>
                      }
                      labelPosition="center"
                    />
                    {opsionalSyarat.map((syarat, idx) =>
                      renderSyaratItem(syarat, idx, false),
                    )}
                  </>
                )}
              </Stack>
            </Stack>
          )}
        </Box>

        <Group justify="flex-end" pt="md" style={{ borderTop: '1px solid var(--gs-border)' }}>
          <Button variant="subtle" color="var(--gs-text-secondary)" onClick={onClose} radius="md">
            Tutup
          </Button>
          <Button
            onClick={handleSubmit}
            variant="filled"
            className={pendaftaran?.status === "revisi" ? "bg-gs-warning hover:bg-gs-warning-hover" : "bg-gs-primary hover:bg-gs-primary-hover"}
            radius="md"
            h={42}
            fw={700}
            loading={isUploading}
            leftSection={<IconCircleCheck size={18} stroke={2} />}
            px="xl"
          >
            {pendaftaran?.status === "revisi" ? "KIRIM PERBAIKAN" : "SIMPAN PERUBAHAN"}
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
